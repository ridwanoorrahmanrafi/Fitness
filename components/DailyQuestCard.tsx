"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, Gift, Dumbbell, Zap, Flame, Clock, ShieldAlert } from "lucide-react";
import { DailySystemQuest, saveTodaySystemQuest } from "@/lib/systemStats";
import { playSound, vibrate } from "@/lib/audio";
import type { Language } from "@/lib/i18n";

interface DailyQuestCardProps {
  quest: DailySystemQuest;
  onUpdateQuest: (updated: DailySystemQuest) => void;
  onClaimReward: () => void;
  lang?: Language;
}

export default function DailyQuestCard({
  quest,
  onUpdateQuest,
  onClaimReward,
  lang = "bn",
}: DailyQuestCardProps) {
  const isBn = lang === "bn";
  const { objectives, completed, rewards, warning } = quest;
  const [timeLeft, setTimeLeft] = useState("");

  // Countdown timer until midnight
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft("00:00:00");
        return;
      }
      const hrs = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, "0");
      const mins = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, "0");
      const secs = Math.floor((diff / 1000) % 60).toString().padStart(2, "0");
      setTimeLeft(`${hrs}:${mins}:${secs}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleIncrement = (
    key: keyof DailySystemQuest["objectives"],
    delta: number
  ) => {
    playSound("system-click");
    vibrate(15);
    const target = objectives[key].target;
    const current = Math.min(target, Math.max(0, objectives[key].current + delta));
    const updated: DailySystemQuest = {
      ...quest,
      objectives: {
        ...objectives,
        [key]: {
          ...objectives[key],
          current,
        },
      },
    };

    // Check if all objectives are completed
    const allDone =
      updated.objectives.pushups.current >= updated.objectives.pushups.target &&
      updated.objectives.situps.current >= updated.objectives.situps.target &&
      updated.objectives.squats.current >= updated.objectives.squats.target &&
      updated.objectives.runKm.current >= updated.objectives.runKm.target;

    updated.completed = allDone;
    saveTodaySystemQuest(updated);
    onUpdateQuest(updated);

    if (allDone && !completed) {
      playSound("quest-complete");
      vibrate([50, 100, 50]);
    }
  };

  const totalCurrent =
    objectives.pushups.current +
    objectives.situps.current +
    objectives.squats.current +
    objectives.runKm.current * 10;
  const totalTarget =
    objectives.pushups.target +
    objectives.situps.target +
    objectives.squats.target +
    objectives.runKm.target * 10;
  const overallPercent = Math.min(100, Math.round((totalCurrent / totalTarget) * 100));

  const questTitle = isBn
    ? "ডেইলি কোয়েস্ট : অনাহুতদের প্রস্তুতি"
    : "DAILY QUEST : PREPARATION TO BECOME STRONG";

  const questSubtitle = isBn
    ? "[লক্ষ্য : দৈনিক ফিটনেস লক্ষ্য পূরণ করুন। ব্যর্থ হলে পেনাল্টি জোন সক্রিয় হবে]"
    : "[Goal : Complete daily physical conditioning. Failure will trigger Penalty Zone]";

  const items = [
    {
      key: "pushups" as const,
      label: isBn ? "পুশ-আপ (PUSH-UPS)" : "PUSH-UPS",
      current: objectives.pushups.current,
      target: objectives.pushups.target,
      unit: isBn ? "বার" : "reps",
      step: 10,
    },
    {
      key: "situps" as const,
      label: isBn ? "সিট-আপ (SIT-UPS)" : "SIT-UPS",
      current: objectives.situps.current,
      target: objectives.situps.target,
      unit: isBn ? "বার" : "reps",
      step: 10,
    },
    {
      key: "squats" as const,
      label: isBn ? "স্কোয়াট (SQUATS)" : "SQUATS",
      current: objectives.squats.current,
      target: objectives.squats.target,
      unit: isBn ? "বার" : "reps",
      step: 10,
    },
    {
      key: "runKm" as const,
      label: isBn ? "দৌড় (RUNNING)" : "RUNNING",
      current: objectives.runKm.current,
      target: objectives.runKm.target,
      unit: "km",
      step: 1,
    },
  ];

  return (
    <div id="daily-quest-card" className="relative rounded-2xl bg-gradient-to-b from-[#05112e]/95 via-[#07153a]/90 to-[#030818]/95 border-2 border-cyan-400/70 shadow-[0_0_35px_rgba(6,182,212,0.35)] p-4 sm:p-5 overflow-hidden transition-all hover:border-cyan-400 system-scanlines system-grid-bg">
      {/* Corner Luminous Diamonds */}
      <div className="absolute top-1.5 left-1.5 text-cyan-400 text-xs font-mono select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>
      <div className="absolute top-1.5 right-1.5 text-cyan-400 text-xs font-mono select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>
      <div className="absolute bottom-1.5 left-1.5 text-cyan-400 text-xs font-mono select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>
      <div className="absolute bottom-1.5 right-1.5 text-cyan-400 text-xs font-mono select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>

      {/* Quest Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-cyan-500/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black tracking-widest uppercase bg-cyan-400 text-black shadow-md">
              {isBn ? "QUEST INFO : কোয়েস্ট তথ্য" : "QUEST INFO : DAILY ASSIGNMENT"}
            </span>
            <span className="text-xs font-mono text-cyan-300 font-black text-glow-cyan">
              {overallPercent}% {isBn ? "সম্পন্ন" : "COMPLETE"}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black tracking-wider text-white mt-1 uppercase text-glow-cyan">
            {questTitle}
          </h3>
          <p className="text-[11px] font-mono text-cyan-300/90 font-semibold">
            {questSubtitle}
          </p>
        </div>

        {/* Live Countdown & Status Pill */}
        <div className="flex items-center gap-2">
          {timeLeft && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/70 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]">
              <Clock className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span>{isBn ? "বাকি সময়" : "TIME"} : {timeLeft}</span>
            </div>
          )}

          {completed ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              <CheckCircle2 className="h-4 w-4" /> {isBn ? "সম্পন্ন" : "CLEARED"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-cyan-500/15 text-cyan-300 border border-cyan-400/50">
              <Zap className="h-3.5 w-3.5 animate-pulse text-cyan-400" /> {isBn ? "চলমান" : "ACTIVE"}
            </span>
          )}
        </div>
      </div>

      {/* 4 Objectives Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4 font-mono">
        {items.map((item) => {
          const isDone = item.current >= item.target;
          const pct = Math.min(100, Math.round((item.current / item.target) * 100));
          return (
            <div
              key={item.key}
              className={`p-3 rounded-xl border-2 transition-all ${
                isDone
                  ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                  : "bg-black/60 border-cyan-500/30 text-zinc-200 hover:border-cyan-400/60"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold tracking-tight truncate pr-1 flex items-center gap-1.5">
                  <span className={`inline-block h-3.5 w-3.5 rounded border text-[10px] leading-none text-center font-black ${isDone ? "bg-emerald-400 border-emerald-400 text-black" : "border-cyan-400 text-transparent"}`}>
                    ✓
                  </span>
                  {item.label}
                </span>
                <span className={`font-black ${isDone ? "text-emerald-400" : "text-cyan-300 text-glow-cyan"}`}>
                  [{item.current} / {item.target} {item.unit}]
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full rounded-full bg-zinc-950 border border-cyan-500/30 overflow-hidden mb-2">
                <div
                  className={`h-full transition-all duration-300 ${
                    isDone
                      ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                      : "bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-zinc-500">{pct}%</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleIncrement(item.key, -item.step)}
                    disabled={item.current <= 0}
                    className="system-btn-chamfer px-2 py-0.5 text-[11px] font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-400 disabled:opacity-30 active:scale-95 transition-all cursor-pointer"
                  >
                    -{item.step}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleIncrement(item.key, item.step)}
                    disabled={isDone}
                    className="system-btn-chamfer px-3 py-0.5 text-[11px] font-bold bg-cyan-400/25 hover:bg-cyan-400/40 text-cyan-200 border border-cyan-400/60 active:scale-95 transition-all disabled:opacity-30 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                  >
                    +{item.step} {item.unit}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Penalty Warning Box */}
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-950/40 border-2 border-red-500/50 text-xs font-mono text-red-200 mb-3 shadow-[0_0_15px_rgba(239,68,68,0.25)]">
        <ShieldAlert className="h-5 w-5 text-red-400 shrink-0 animate-pulse" />
        <div className="leading-snug">
          <strong className="text-red-400 block font-black uppercase">
            {isBn ? "[ পেনাল্টি কোয়েস্ট সতর্কতা : PENALTY WARNING ]" : "[ PENALTY QUEST WARNING : PENALTY ZONE ]"}
          </strong>
          <span className="text-[11px] text-zinc-300">
            {isBn
              ? "সতর্কতা: নির্ধারিত সময়ের মধ্যে দৈনিক কোয়েস্ট সম্পন্ন করতে ব্যর্থ হলে শাস্তিমূলক পেনাল্টি জোন সক্রিয় হবে।"
              : warning}
          </span>
        </div>
      </div>

      {/* Rewards & Claim Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t-2 border-cyan-500/30 font-mono">
        <div className="text-xs text-zinc-300 flex items-center gap-2">
          <Gift className="h-4 w-4 text-amber-400 shrink-0" />
          <div>
            <span className="text-[10px] text-zinc-500 block uppercase font-bold">
              {isBn ? "কোয়েস্ট পুরস্কার (REWARDS)" : "QUEST REWARDS"}
            </span>
            <span className="text-cyan-300 font-bold text-[11px]">
              {isBn
                ? `১. ক্লান্তি নিরাময় · ২. +${rewards.statPoints} স্ট্যাট পয়েন্ট · ৩. সিস্টেম লুট বক্স`
                : `1. Fatigue Recovery · 2. +${rewards.statPoints} Stat Points · 3. System Loot Box`}
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={!completed}
          onClick={() => {
            playSound("level-up");
            vibrate([100, 50, 100]);
            onClaimReward();
          }}
          className={`system-btn-chamfer w-full sm:w-auto px-6 py-3 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
            completed
              ? "bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 hover:brightness-110 text-black shadow-[0_0_25px_rgba(6,182,212,0.8)] active:scale-95 cursor-pointer text-glow-cyan"
              : "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed opacity-50"
          }`}
        >
          <Flame className="h-4 w-4" />
          {completed
            ? isBn ? "পুরস্কার গ্রহণ করুন (CLAIM REWARD)" : "CLAIM SYSTEM REWARD"
            : isBn ? "সব লক্ষ্য সম্পন্ন করুন" : "COMPLETE ALL OBJECTIVES"}
        </button>
      </div>
    </div>
  );
}
