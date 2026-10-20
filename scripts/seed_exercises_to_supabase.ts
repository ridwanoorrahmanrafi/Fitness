import { createClient } from "@supabase/supabase-js";
import { EXERCISES } from "../lib/exercises";
import { getExerciseMedia } from "../lib/exerciseMedia";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log(`Seeding ${EXERCISES.length} exercises to Supabase: ${supabaseUrl}`);

  const rows = EXERCISES.map((ex) => {
    const media = getExerciseMedia(ex.id);
    return {
      id: ex.id,
      name: ex.name,
      muscles: ex.muscles,
      pattern: ex.pattern,
      requires: ex.requires,
      level: ex.level,
      low_impact: ex.lowImpact,
      timed: Boolean(ex.timed),
      per_side: Boolean(ex.perSide),
      loaded: Boolean(ex.loaded),
      cues: ex.cues,
      easier_id: ex.easier ?? null,
      harder_id: ex.harder ?? null,
      gif_url: media.localGif,
    };
  });

  const { error } = await supabase.from("exercises").upsert(rows, { onConflict: "id" });
  if (error) {
    console.error("Error upserting exercises to Supabase:", error.message);
    process.exit(1);
  }

  console.log(`Successfully synced ${rows.length} exercises to Supabase database!`);

  const { count } = await supabase.from("exercises").select("*", { count: "exact", head: true });
  console.log("Verified total exercise rows in Supabase:", count);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
