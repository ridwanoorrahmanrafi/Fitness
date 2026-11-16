import { NextRequest, NextResponse } from "next/server";
import { GenerateDietRequestSchema } from "@/lib/schemas";
import { generateDietPlan, type GenerateDietPlanOutput } from "@/lib/server/diet-generate";
import { createGeminiCaller, getModelChain } from "@/lib/server/gemini";
import { createOpenAICaller, getOpenAIModelChain } from "@/lib/server/openai";
import { crossCheckDiet } from "@/lib/server/consensus";
import { clientKey, codesMatch, rateLimitCheck, withTimeout } from "@/lib/server/guard";
import { auth } from "@/lib/auth";
import type { GenerateDietResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function json(body: GenerateDietResponse, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  // 1. Guard against oversized payloads (max 16 KB)
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > 16384) {
    return json({ ok: false, code: "bad_request", error: "Request payload exceeds maximum allowed size (16KB)." }, 413);
  }

  // 2. Authentication check: Determine session & apply tiered rate limiting
  let session = null;
  try {
    session = await auth.api.getSession({ headers: req.headers });
  } catch {
    // Unauthenticated or auth service offline; proceed with guest tier
  }

  const expectedAccessCode = process.env.ACCESS_CODE;
  const providedAccessCode = req.headers.get("x-access-code");
  const hasValidAccessCode = expectedAccessCode ? codesMatch(providedAccessCode, expectedAccessCode) : false;

  if (session?.user) {
    // Authenticated Member tier: 20 generations per hour
    const limit = rateLimitCheck(`user:${session.user.id}`, 20, 60 * 60 * 1000);
    if (!limit.allowed) {
      return json(
        { ok: false, code: "rate_limited", error: "Member hourly quota reached (20/hour). Please wait before generating another diet plan." },
        429
      );
    }
  } else if (hasValidAccessCode) {
    // Verified Access Code tier: 15 generations per hour
    const limit = rateLimitCheck(`access:${clientKey(req.headers)}`, 15, 60 * 60 * 1000);
    if (!limit.allowed) {
      return json(
        { ok: false, code: "rate_limited", error: "Too many requests with this access code. Try again in a few minutes." },
        429
      );
    }
  } else {
    // Guest tier: max 3 generations per 24 hours per IP
    const guestLimit = rateLimitCheck(`guest:${clientKey(req.headers)}`, 3, 24 * 60 * 60 * 1000);
    if (!guestLimit.allowed) {
      return json(
        {
          ok: false,
          code: "rate_limited",
          error: "Guest daily limit reached (3 plans / 24h). Please log in or sign up to unlock unlimited access!",
        },
        429
      );
    }
  }

  // 3. Parse and validate JSON body
  let rawBody: unknown;
  try {
    const text = await req.text();
    if (text.length > 16384) {
      return json({ ok: false, code: "bad_request", error: "Payload exceeds 16KB limit." }, 413);
    }
    rawBody = JSON.parse(text);
  } catch {
    return json({ ok: false, code: "bad_request", error: "Request body must be valid JSON." }, 400);
  }

  const parsed = GenerateDietRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return json(
      { ok: false, code: "bad_request", error: `Invalid ${first.path.join(".") || "request"}: ${first.message}` },
      400
    );
  }

  // 4. Generate nutrition plan with 25s timeout and deterministic fallback
  try {
    const geminiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY;

    const openaiKey = process.env.OPENAI_API_KEY;

    const geminiCaller = createGeminiCaller(geminiKey);
    const openaiCaller = createOpenAICaller(openaiKey);

    const result = await withTimeout(
      (async () => {
        let out: GenerateDietPlanOutput | null = null;
        let primaryName = "Google Gemini";
        let reviewerName = "ChatGPT (OpenAI)";
        let reviewerCaller = openaiCaller;
        let reviewerModel = getOpenAIModelChain()[0];

        // Primary AI attempt: Google Gemini
        if (geminiCaller) {
          try {
            const geminiOut = await generateDietPlan(parsed.data, {
              callModel: geminiCaller,
              models: getModelChain(),
            });
            if (geminiOut.source === "gemini") {
              out = geminiOut;
            }
          } catch (err) {
            console.warn("Primary Gemini diet generation error:", err);
          }
        }

        // Secondary AI fallback: OpenAI ChatGPT
        if ((!out || out.source === "local") && openaiCaller) {
          try {
            const openaiOut = await generateDietPlan(parsed.data, {
              callModel: openaiCaller,
              models: getOpenAIModelChain(),
            });
            if (openaiOut.source === "gemini") {
              out = { ...openaiOut, source: "openai" as const };
              primaryName = "ChatGPT (OpenAI)";
              reviewerName = "Google Gemini";
              reviewerCaller = geminiCaller;
              reviewerModel = getModelChain()[0];
            }
          } catch (err) {
            console.warn("Secondary OpenAI diet fallback generation error:", err);
          }
        }

        // Fallback to deterministic local sports nutrition engine if AI calls fail
        if (!out) {
          out = await generateDietPlan(parsed.data);
          primaryName = "Local Bangladeshi Nutrition Engine";
        }

        // Cross-Verification: Peer review by the secondary AI
        const consensus = await crossCheckDiet(out.diet, parsed.data, {
          primaryName,
          reviewerName,
          reviewerModel,
          reviewerCaller,
        });

        out.diet.consensus = consensus;

        return {
          ok: true as const,
          diet: out.diet,
          source: (out.source === "gemini" && consensus.status === "verified" ? "dual_ai" : out.source),
          warning: out.warning,
          consensus,
        };
      })(),
      25000,
      "Diet generation timed out after 25s."
    );

    return json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Diet generation error:", errorMsg);
    const isTimeout = errorMsg.includes("timed out");
    return json(
      {
        ok: false,
        code: "server",
        error: isTimeout
          ? "Nutrition calculation timed out. Please try again or switch to deterministic calculation."
          : "Failed to generate custom diet plan. Please try again.",
      },
      isTimeout ? 504 : 500
    );
  }
}
