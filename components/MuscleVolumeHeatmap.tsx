"use client";

import { useMemo } from "react";
import { Activity, Layers, Info } from "lucide-react";
import type { HistoryEntry, Muscle } from "@/lib/types";
import { EXERCISE_MAP } from "@/lib/exercises";
import type { Language } from "@/lib/i18n";

interface Props {
  history: HistoryEntry[];
  lang?: Language;
}

interface MuscleVolume {
  id: string;
  name: string;
  nameBn: string;
  sets: number;
  targetSets: number;
  status: "low" | "optimal" | "high";
}

export function MuscleVolumeHeatmap({ history, lang = "bn" }: Props) {
  const isBn = lang === "bn";

  // Calculate working sets per muscle group in the last 7 days
  const muscleVolumes: MuscleVolume[] = useMemo(() => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentWorkouts = history.filter((h) => h.finishedAt >= oneWeekAgo);

    const counts: Record<string, number> = {
      chest: 0,
      back: 0,
      legs: 0,
      shoulders: 0,
      arms: 0,
      core: 0,
    };

    for (const h of recentWorkouts) {
      for (const ex of h.exercises) {
        const completedSets = ex.sets.filter((s) => s.done).length;
        if (completedSets === 0) continue;

        const catalogEx = EXERCISE_MAP[ex.exerciseId];
        const muscles: Muscle[] = catalogEx?.muscles || [];

        for (const m of muscles) {
          if (m === "chest") counts.chest += completedSets;
          else if (m === "back") counts.back += completedSets;
          else if (["quads", "hamstrings", "glutes", "calves"].includes(m)) counts.legs += completedSets;
          else if (m === "shoulders") counts.shoulders += completedSets;
          else if (["biceps", "triceps"].includes(m)) counts.arms += completedSets;
          else if (m === "core") counts.core += completedSets;
        }
      }
    }

    const groups = [
      { id: "chest", name: "Chest", nameBn: "বুক (চেস্ট)", sets: counts.chest, target: 12 },
      { id: "back", name: "Back", nameBn: "পিঠ (ব্যাক)", sets: counts.back, target: 14 },
      { id: "legs", name: "Legs", nameBn: "পা (কোয়াডস/হ্যামস্ট্রিং)", sets: counts.legs, target: 16 },
      { id: "shoulders", name: "Shoulders", nameBn: "কাঁধ (শোল্ডার)", sets: counts.shoulders, target: 10 },
      { id: "arms", name: "Arms", nameBn: "হাত (বাইসেপ/ট্রাইসেপ)", sets: counts.arms, target: 10 },
      { id: "core", name: "Core", nameBn: "কোর ও অ্যাবস", sets: counts.core, target: 8 },
    ];

    return groups.map((g) => {
      let status: "low" | "optimal" | "high" = "low";
      if (g.sets >= g.target * 0.75 && g.sets <= g.target * 1.5) {
        status = "optimal";
      } else if (g.sets > g.target * 1.5) {
        status = "high";
      }
      return {
        id: g.id,
        name: g.name,
        nameBn: g.nameBn,
        sets: g.sets,
        targetSets: g.target,
        status,
      };
    });
  }, [history]);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#111726] p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
            <Layers className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-white">
              {isBn ? "সাপ্তাহিক মাসল ভলিউম বিশ্লেষণ" : "Weekly Muscle Group Volume"}
            </h3>
            <p className="text-xs text-zinc-400">
              {isBn
                ? "গত ৭ দিনে প্রতিটি মাসল গ্রুপে সম্পন্ন সেট সংখ্যা (বিজ্ঞানসম্মত লক্ষ্যমাত্রা: ১০-২০ সেট)"
                : "Sets completed per muscle group over the last 7 days"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {muscleVolumes.map((mv) => {
          const percent = Math.min(100, Math.round((mv.sets / mv.targetSets) * 100));

          return (
            <div
              key={mv.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3.5 hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-white">
                  {isBn ? mv.nameBn : mv.name}
                </span>
                <span className="text-xs font-mono font-extrabold text-emerald-400">
                  {mv.sets} <span className="text-zinc-500 font-normal">/ {mv.targetSets} {isBn ? "সেট" : "sets"}</span>
                </span>
              </div>

              {/* Volume Progress Bar */}
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    mv.status === "optimal"
                      ? "bg-emerald-500"
                      : mv.status === "high"
                      ? "bg-amber-400"
                      : "bg-teal-600"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span
                  className={`font-semibold ${
                    mv.status === "optimal"
                      ? "text-emerald-400"
                      : mv.status === "high"
                      ? "text-amber-400"
                      : "text-zinc-500"
                  }`}
                >
                  {mv.status === "optimal"
                    ? isBn ? "সঠিক অগ্রগতি" : "Optimal Hypertrophy"
                    : mv.status === "high"
                    ? isBn ? "উচ্চ ভলিউম" : "High Volume"
                    : isBn ? "মেইনটেনেন্স" : "Maintenance"}
                </span>
                <span className="text-zinc-500 font-mono">{percent}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

