import { NextRequest, NextResponse } from "next/server";
import { GenerateDietRequestSchema } from "@/lib/schemas";
import { generateDietPlan, type GenerateDietPlanOutput } from "@/lib/server/diet-generate";
import { createGeminiCaller, getModelChain } from "@/lib/server/gemini";
import { createOpenAICaller, getOpenAIModelChain } from "@/lib/server/openai";
import { crossCheckDiet } from "@/lib/server/consensus";
import { clientKey, codesMatch, rateLimited } from "@/lib/server/guard";
import type { GenerateDietResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function json(body: GenerateDietResponse, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const expected = process.env.ACCESS_CODE;
  if (expected && !codesMatch(req.headers.get("x-access-code"), expected)) {
    return json({ ok: false, code: "unauthorized", error: "Access code required." }, 401);
  }

  if (rateLimited(clientKey(req.headers))) {
    return json({ ok: false, code: "rate_limited", error: "Too many requests. Try again in a few minutes." }, 429);
  }

  let parsed;
  try {
    parsed = GenerateDietRequestSchema.safeParse(await req.json());
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
    const geminiKey = clientGeminiKey || process.env.GEMINI_API_KEY;

    const clientOpenAiKey = req.headers.get("x-openai-api-key")?.trim();
    const openaiKey = clientOpenAiKey || process.env.OPENAI_API_KEY;

    const geminiCaller = createGeminiCaller(geminiKey);
    const openaiCaller = createOpenAICaller(openaiKey);

    let out: GenerateDietPlanOutput | null = null;
    let primaryName = "Google Gemini";
    let reviewerName = "ChatGPT (OpenAI)";
    let reviewerCaller = openaiCaller;
    let reviewerModel = getOpenAIModelChain()[0];

    // 1. Primary AI attempt: Google Gemini
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

    // 2. Secondary AI fallback: OpenAI ChatGPT
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

    // 3. Fallback to deterministic local plan if all AI calls fail
    if (!out) {
      out = await generateDietPlan(parsed.data);
      primaryName = "Local Bangladeshi Nutrition Engine";
    }

    // 4. Cross-Verification: Peer review by the secondary AI
    const consensus = await crossCheckDiet(out.diet, parsed.data, {
      primaryName,
      reviewerName,
      reviewerModel,
      reviewerCaller,
    });

    out.diet.consensus = consensus;

    return json({
      ok: true,
      diet: out.diet,
      source: (out.source === "gemini" && consensus.status === "verified" ? "dual_ai" : out.source),
      warning: out.warning,
      consensus,
    });
  } catch (err) {
    console.error("Diet generation error:", err);
    return json({ ok: false, code: "server", error: "Failed to generate a custom diet." }, 500);
  }
}
