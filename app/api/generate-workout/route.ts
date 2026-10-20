import { NextRequest, NextResponse } from "next/server";
import { GenerateRequestSchema } from "@/lib/schemas";
import { generatePlan, type GenerateOutput } from "@/lib/server/generate";
import { createGeminiCaller, getModelChain } from "@/lib/server/gemini";
import { createOpenAICaller, getOpenAIModelChain } from "@/lib/server/openai";
import { crossCheckWorkout } from "@/lib/server/consensus";
import { clientKey, codesMatch, rateLimited } from "@/lib/server/guard";
import type { GenerateResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function json(body: GenerateResponse, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  // Optional shared secret so a public deployment cannot burn your free quota.
  const expected = process.env.ACCESS_CODE;
  if (expected && !codesMatch(req.headers.get("x-access-code"), expected)) {
    return json({ ok: false, code: "unauthorized", error: "Access code required." }, 401);
  }

  if (rateLimited(clientKey(req.headers))) {
    return json({ ok: false, code: "rate_limited", error: "Too many requests. Try again in a few minutes." }, 429);
  }

  let parsed;
  try {
    parsed = GenerateRequestSchema.safeParse(await req.json());
  } catch {
    return json({ ok: false, code: "bad_request", error: "Request body must be JSON." }, 400);
  }
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return json(
      { ok: false, code: "bad_request", error: `Invalid ${first.path.join(".") || "request"}: ${first.message}` },
      400,
    );
  }

  try {
    const clientGeminiKey = req.headers.get("x-gemini-api-key")?.trim();
    const geminiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY ||
      clientGeminiKey;

    const clientOpenAiKey = req.headers.get("x-openai-api-key")?.trim();
    const openaiKey = clientOpenAiKey || process.env.OPENAI_API_KEY;

    const geminiCaller = createGeminiCaller(geminiKey);
    const openaiCaller = createOpenAICaller(openaiKey);

    let out: GenerateOutput | null = null;
    let primaryName = "Google Gemini";
    let reviewerName = "ChatGPT (OpenAI)";
    let reviewerCaller = openaiCaller;
    let reviewerModel = getOpenAIModelChain()[0];

    // 1. Primary AI attempt: Google Gemini
    if (geminiCaller) {
      try {
        const geminiOut = await generatePlan(parsed.data, {
          callModel: geminiCaller,
          models: getModelChain(),
        });
        if (geminiOut.plan.source === "ai") {
          out = geminiOut;
        }
      } catch (err) {
        console.warn("Primary Gemini generation error:", err);
      }
    }

    // 2. Secondary AI fallback: OpenAI ChatGPT
    if ((!out || out.plan.source === "offline") && openaiCaller) {
      try {
        const openaiOut = await generatePlan(parsed.data, {
          callModel: openaiCaller,
          models: getOpenAIModelChain(),
        });
        if (openaiOut.plan.source === "ai") {
          out = openaiOut;
          primaryName = "ChatGPT (OpenAI)";
          reviewerName = "Google Gemini";
          reviewerCaller = geminiCaller;
          reviewerModel = getModelChain()[0];
        }
      } catch (err) {
        console.warn("Secondary OpenAI fallback generation error:", err);
      }
    }

    // 3. Fallback to deterministic sports science engine if all AI generation failed
    if (!out) {
      out = await generatePlan(parsed.data, {
        models: [],
      });
      primaryName = "Local Sports Science Engine";
    }

    // 4. Cross-Verification: Peer review by the secondary AI
    const consensus = await crossCheckWorkout(
      out.plan,
      parsed.data.profile,
      parsed.data.feedback,
      {
        primaryName,
        reviewerName,
        reviewerModel,
        reviewerCaller,
      }
    );

    out.plan.consensus = consensus;

    return json({
      ok: true,
      plan: out.plan,
      meta: out.meta,
      warning: out.warning,
      consensus,
    });
  } catch (err) {
    console.error("Workout generation error:", err);
    return json({ ok: false, code: "server", error: "Failed to generate a workout." }, 500);
  }
}
