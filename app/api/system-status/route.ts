import { NextResponse } from "next/server";
import { getModelChain } from "@/lib/server/gemini";
import { isMongoConfigured, connectToMongoDB } from "@/lib/server/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const geminiConfigured = Boolean(
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY
  );

  const openaiConfigured = Boolean(process.env.OPENAI_API_KEY);
  const mongodbConfigured = isMongoConfigured();
  let mongodbConnected = false;
  let mongodbPingMs: number | null = null;

  if (mongodbConfigured) {
    try {
      const start = Date.now();
      await connectToMongoDB();
      mongodbPingMs = Date.now() - start;
      mongodbConnected = true;
    } catch {
      mongodbConnected = false;
    }
  }

  const supabaseConfigured = Boolean(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  );

  return NextResponse.json({
    ok: true,
    geminiConfigured,
    openaiConfigured,
    mongodbConfigured,
    mongodbConnected,
    mongodbPingMs,
    supabaseConfigured,
    activeModelChain: getModelChain(),
    accessCodeRequired: Boolean(process.env.ACCESS_CODE),
    serverRuntime: "nodejs",
    timestamp: Date.now(),
  });
}
