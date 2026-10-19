import { NextRequest, NextResponse } from "next/server";
import { GenerateRequestSchema } from "@/lib/schemas";
import { generatePlan } from "@/lib/server/generate";
import { createGeminiCaller, getModelChain } from "@/lib/server/gemini";
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
    const clientApiKey = req.headers.get("x-gemini-api-key")?.trim();
    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

    const out = await generatePlan(parsed.data, {
      callModel: createGeminiCaller(apiKey),
      models: getModelChain(),
    });
    return json({ ok: true, plan: out.plan, meta: out.meta, warning: out.warning });
  } catch (err) {
    console.error("Workout generation error:", err);
    return json({ ok: false, code: "server", error: "Failed to generate a workout." }, 500);
  }
}
