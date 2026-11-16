"use client";

import { useMemo } from "react";
import { Trophy, Award, Flame, Zap, TrendingUp, Dumbbell, ShieldCheck } from "lucide-react";
import type { AthleteStats } from "@/lib/athleteStats";
import type { HistoryEntry } from "@/lib/types";
import type { Language } from "@/lib/i18n";
import { kgToLbs } from "@/lib/calc";
import { EXERCISE_MAP } from "@/lib/exercises";

interface Props {
  athleteStats?: AthleteStats;
  history: HistoryEntry[];
  lang?: Language;
  unitSystem?: "metric" | "imperial";
}

interface MilestoneBadge {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  icon: string;
  unlocked: boolean;
  progress: number; // 0 to 1
}

export function PersonalRecordsCard({
  athleteStats,
  history,
  lang = "bn",
  unitSystem = "metric",
}: Props) {
  const isBn = lang === "bn";
  const isImperial = unitSystem === "imperial";
  const weightUnit = isImperial ? "lbs" : "kg";

  // Aggregate personal records from history if athleteStats PRs are sparse
  const records = useMemo(() => {
    const prMap = athleteStats?.personalRecords ? { ...athleteStats.personalRecords } : {};
    for (const h of history) {
      const hDate = new Date(h.finishedAt).toISOString().split("T")[0];
      for (const ex of h.exercises) {
        for (const s of ex.sets) {
          if (!s.done || !s.weightKg || !s.reps) continue;
          const est1Rm = s.weightKg * (1 + s.reps / 30);
          const cur = prMap[ex.exerciseId];
          if (!cur || est1Rm > cur.estimated1Rm) {
            prMap[ex.exerciseId] = {
              exerciseId: ex.exerciseId,
              exerciseName: EXERCISE_MAP[ex.exerciseId]?.name || ex.exerciseId,
              weightKg: s.weightKg,
              reps: s.reps,
              estimated1Rm: Math.round(est1Rm * 10) / 10,
              date: hDate,
            };
          }
        }
      }
    }
    return Object.values(prMap).sort((a, b) => b.estimated1Rm - a.estimated1Rm);
  }, [athleteStats, history]);

  // Total Lifetime Volume & Workouts
  const totalVolumeKg = useMemo(() => {
    return athleteStats?.totalVolumeKg || history.reduce((sum, h) => sum + (h.volumeKg || 0), 0);
  }, [athleteStats, history]);

  const totalWorkouts = athleteStats?.totalWorkouts || history.length;
  const currentStreak = athleteStats?.currentStreak || (history.length > 0 ? 1 : 0);

  // Milestones
  const badges: MilestoneBadge[] = useMemo(() => {
    return [
      {
        id: "first_workout",
        title: "First Step",
        titleBn: "প্রথম ওয়ার্কআউট",
        description: "Complete your first workout session.",
        descriptionBn: "আপনার প্রথম ওয়ার্কআউট সেশন সম্পন্ন করুন।",
        icon: "🏆",
        unlocked: totalWorkouts >= 1,
        progress: Math.min(1, totalWorkouts / 1),
      },
      {
        id: "consistency_7",
        title: "7-Day Streak",
        titleBn: "৭ দিনের ধারাবাহিকতা",
        description: "Maintain a 7-day workout streak.",
        descriptionBn: "৭ দিনের সক্রিয় ওয়ার্কআউট ধারাবাহিকতা বজায় রাখুন।",
        icon: "🔥",
        unlocked: currentStreak >= 7,
        progress: Math.min(1, currentStreak / 7),
      },
      {
        id: "volume_10k",
        title: "10,000 kg Volume",
        titleBn: "১০,০০০ কেজি ভলিউম",
        description: "Lift over 10 metric tons of total volume.",
        descriptionBn: "মোট ১০,০০০ কেজি বা ১০ টন ওজন লিফট করুন।",
        icon: "⚡",
        unlocked: totalVolumeKg >= 10000,
        progress: Math.min(1, totalVolumeKg / 10000),
      },
      {
        id: "volume_50k",
        title: "50,000 kg Heavyweight",
        titleBn: "৫০,০০০ কেজি হেভিওয়েট",
        description: "Accumulate 50,000 kg of lifetime training volume.",
        descriptionBn: "মোট ৫০,০০০ কেজি ট্রেইনিং ভলিউম অর্জন করুন।",
        icon: "🥇",
        unlocked: totalVolumeKg >= 50000,
        progress: Math.min(1, totalVolumeKg / 50000),
      },
      {
        id: "workouts_25",
        title: "Quarter Century",
        titleBn: "২৫টি সেশন সম্পন্ন",
        description: "Log 25 completed training workouts.",
        descriptionBn: "২৫টি পূর্ণাঙ্গ ট্রেইনিং সেশন সম্পন্ন করুন।",
        icon: "💎",
        unlocked: totalWorkouts >= 25,
        progress: Math.min(1, totalWorkouts / 25),
      },
    ];
  }, [totalWorkouts, currentStreak, totalVolumeKg]);

  return (
    <div className="space-y-6">
      {/* 1. Personal Records (1RM Hall of Fame) */}
      <div className="rounded-2xl border border-zinc-800 bg-[#111726] p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Trophy className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">
                {isBn ? "পার্সোনাল রেকর্ড (PR) বোর্ড" : "Personal Records (PR) Board"}
              </h3>
              <p className="text-xs text-zinc-400">
                {isBn
                  ? "আপনার সর্বকালের সেরা লিফট এবং আনুমানিক 1RM"
                  : "All-time personal bests & estimated 1-Rep Maxes"}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300">
            {records.length} {isBn ? "টি রেকর্ড" : "records"}
          </span>
        </div>

        {records.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
            {isBn
              ? "এখনও কোনো রেকর্ড লগ করা হয়নি। ওয়ার্কআউট সম্পন্ন করলে আপনার সেরা লিফট এখানে প্রদর্শিত হবে!"
              : "No personal records logged yet. Complete a weighted workout to establish your baseline!"}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {records.slice(0, 9).map((pr) => {
              const displayWeight = isImperial ? kgToLbs(pr.weightKg) : pr.weightKg;
              const display1Rm = isImperial ? kgToLbs(pr.estimated1Rm) : pr.estimated1Rm;

              return (
                <div
                  key={pr.exerciseId}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 hover:border-zinc-700 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-white leading-tight line-clamp-1">
                      {pr.exerciseName}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 shrink-0">{pr.date}</span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-zinc-400 block font-medium">Best Set</span>
                      <span className="text-sm font-extrabold text-emerald-400 font-mono">
                        {displayWeight} {weightUnit} × {pr.reps}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-zinc-400 block font-medium">Est. 1RM</span>
                      <span className="text-base font-extrabold text-amber-400 font-mono">
                        {display1Rm} {weightUnit}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Athletic Milestones */}
      <div className="rounded-2xl border border-zinc-800 bg-[#111726] p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Award className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-white">
              {isBn ? "অ্যাথলেটিক অর্জন ও মাইলফলক" : "Athletic Milestones & Badges"}
            </h3>
            <p className="text-xs text-zinc-400">
              {isBn
                ? "ধারাবাহিকতা ও পরিশ্রমের স্বীকৃতি"
                : "Milestones earned through discipline and progressive overload"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`rounded-xl border p-4 transition-all duration-200 flex items-start gap-3.5 ${
                b.unlocked
                  ? "border-emerald-500/40 bg-emerald-950/20 shadow-md"
                  : "border-zinc-800/80 bg-zinc-900/40 opacity-70"
              }`}
            >
              <span className="text-3xl select-none shrink-0">{b.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-sm font-bold text-white truncate">
                    {isBn ? b.titleBn : b.title}
                  </h4>
                  {b.unlocked ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                      {isBn ? "আনলকড" : "Unlocked"}
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-zinc-400 shrink-0">
                      {Math.round(b.progress * 100)}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-1 leading-snug line-clamp-2">
                  {isBn ? b.descriptionBn : b.description}
                </p>
                {/* Progress bar */}
                {!b.unlocked && (
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.round(b.progress * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
