import { NextResponse } from "next/server";
import { getExercisesCollection, isMongoConfigured } from "@/lib/server/mongodb";
import { EXERCISES } from "@/lib/exercises";
import { getExerciseMedia } from "@/lib/exerciseMedia";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    if (!isMongoConfigured()) {
      return NextResponse.json(
        { ok: false, error: "MongoDB is not configured on server (check MONGODB_URI)." },
        { status: 503 }
      );
    }

    const col = getExercisesCollection();
    let count = 0;

    for (const ex of EXERCISES) {
      const media = getExerciseMedia(ex.id);
      await col.updateOne(
        { _id: ex.id },
        {
          $set: {
            id: ex.id,
            name: ex.name,
            muscles: ex.muscles,
            pattern: ex.pattern,
            requires: ex.requires,
            level: ex.level,
            lowImpact: ex.lowImpact,
            timed: Boolean(ex.timed),
            perSide: Boolean(ex.perSide),
            loaded: Boolean(ex.loaded),
            cues: ex.cues,
            easierId: ex.easier ?? null,
            harderId: ex.harder ?? null,
            gifUrl: media.localGif,
            updatedAt: new Date().toISOString(),
          },
        },
        { upsert: true }
      );
      count++;
    }

    return NextResponse.json({ ok: true, count });
  } catch (err) {
    console.error("MongoDB seed error:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
