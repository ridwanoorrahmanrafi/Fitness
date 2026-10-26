"use client";

import React from "react";
import Image from "next/image";
import {
  Sparkles,
  Crown,
  Flame,
  Swords,
  Radio,
  CheckCircle2,
  X,
  ArrowRight,
  Activity,
  Moon,
} from "lucide-react";
import type { Language } from "@/lib/i18n";
import type { PlayerStats, DailySystemQuest } from "@/lib/systemStats";
import { playSound, vibrate } from "@/lib/audio";

interface Props {
  open: boolean;
  stats: PlayerStats;
  quest: DailySystemQuest;
  isWorkoutDay: boolean;
  focusTitle: string;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onStartWorkout: () => void;
  onOpenQuest: () => void;
  onOpenStatus: () => void;
  onClose: () => void;
}

export function SoloLevelingWelcomeBackModal({
  open,
  stats,
  quest,
  isWorkoutDay,
  focusTitle,
  lang,
  onLanguageChange,
  onStartWorkout,
  onOpenQuest,
  onOpenStatus,
  onClose,
}: Props) {
  if (!open) return null;
  const isBn = lang === "bn";

  return (
    <div className="modal modal-open backdrop-blur-xl font-mono text-zinc-100 system-scanlines">
      {/* Outer Holographic System Window */}
      <div className="modal-box relative w-full max-w-lg rounded-2xl border-2 border-cyan-400 bg-gradient-to-b from-[#05112e]/98 via-[#07153a]/95 to-[#020510]/98 p-5 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.4)] text-zinc-100 my-auto animate-in zoom-in-95 duration-200">
        {/* Corner Luminous Diamonds */}
        <div className="absolute top-2 left-2 text-cyan-400 text-xs select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>
        <div className="absolute top-2 right-2 text-cyan-400 text-xs select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>
        <div className="absolute bottom-2 left-2 text-cyan-400 text-xs select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>
        <div className="absolute bottom-2 right-2 text-cyan-400 text-xs select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>

        {/* Header Bar */}
        <div className="flex items-center justify-between border-b-2 border-cyan-500/40 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="relative h-9 w-9 rounded-xl overflow-hidden border border-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.5)] shrink-0">
              <Image
                src="/images/solo-leveling/system-crest-icon.jpg"
                alt="System Crest"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase block">
                {isBn ? "[ সিস্টেম সম্ভাষণ : খেলোয়াড় রিকনেক্ট ]" : "[ SYSTEM GREETING : PLAYER RECONNECTED ]"}
              </span>
              <h2 className="text-base sm:text-lg font-black text-white uppercase text-glow-cyan">
                {isBn ? `স্বাগতম, হান্টার ${stats.name}!` : `WELCOME BACK, HUNTER ${stats.name}!`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playSound("system-click");
                onLanguageChange(isBn ? "en" : "bn");
              }}
              className="btn btn-xs btn-outline btn-primary gap-1 font-mono font-black"
            >
              <Radio className="h-3 w-3 animate-pulse" />
              <span>{isBn ? "EN" : "বাংলা"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playSound("system-click");
                onClose();
              }}
              className="btn btn-xs btn-circle btn-ghost text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Hunter Status Banner */}
        <div className="rounded-xl border border-cyan-500/40 bg-[#020512]/90 p-3.5 shadow-inner space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-black text-white uppercase">
                {stats.rank}-RANK • {stats.title}
              </span>
            </div>
            <span className="badge badge-primary font-mono font-black text-[10px] uppercase">
              Lv.{stats.level}
            </span>
          </div>

          {/* Gauges (DaisyUI Stats) */}
          <div className="stats stats-horizontal shadow bg-[#020512]/90 border border-cyan-500/20 w-full text-xs font-mono">
            <div className="stat place-items-center py-2 px-1">
              <div className="stat-title text-[10px] text-red-400 font-bold">HP</div>
              <div className="stat-value text-sm font-black text-white">{stats.hp.current}/{stats.hp.max}</div>
            </div>
            <div className="stat place-items-center py-2 px-1">
              <div className="stat-title text-[10px] text-cyan-400 font-bold">MP</div>
              <div className="stat-value text-sm font-black text-white">{stats.mp.current}/{stats.mp.max}</div>
            </div>
            <div className="stat place-items-center py-2 px-1">
              <div className="stat-title text-[10px] text-amber-400 font-bold">FATIGUE</div>
              <div className="stat-value text-sm font-black text-white">{stats.fatigue}%</div>
            </div>
          </div>
        </div>

        {/* Today's Deployment Brief */}
        <div className="mt-3.5 space-y-2.5">
          {/* Dungeon Raid Status */}
          <div className="rounded-xl border border-cyan-500/30 bg-black/60 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${
                isWorkoutDay
                  ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                  : "border-purple-500/40 bg-purple-950/40 text-purple-300"
              }`}>
                {isWorkoutDay ? <Swords className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </div>
              <div>
                <span className="text-xs font-black text-white uppercase block text-glow-cyan">
                  {isWorkoutDay
                    ? (isBn ? `আজকের রেইড: ${focusTitle}` : `Today's Raid: ${focusTitle}`)
                    : (isBn ? "আজকের দিন: শারীরিক বিশ্রাম ও রিকভারি" : "Today: Rest & Recovery")}
                </span>
                <span className="text-[10px] text-zinc-400">
                  {isWorkoutDay
                    ? (isBn ? "ডানজন বস অপেক্ষমাণ। এখনই ট্রেনিং শুরু করুন।" : "Dungeon gates are primed. Engage your scheduled session.")
                    : (isBn ? "পেশী পুনরুদ্ধার চলছে। হালকা স্ট্রেচ বা পুষ্টি নিশ্চিত করুন।" : "Muscles recovering. Hydrate and follow nutrition guide.")}
                </span>
              </div>
            </div>
          </div>

          {/* Daily Quest Status */}
          <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <Flame className="h-5 w-5 text-purple-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-purple-200 block">
                  {isBn ? "দৈনিক কোয়েস্ট: সক্রিয়" : "Daily Quest: Active"}
                </span>
                <span className="text-[10px] text-zinc-400">
                  {quest.completed
                    ? (isBn ? "✓ আজকের সব কোয়েস্ট সম্পন্ন হয়েছে!" : "✓ All objectives completed for today!")
                    : (isBn ? "পুশ-আপ, সিট-আপ, স্কোয়াট ও দৌড় সম্পন্ন করুন" : "Push-ups, Sit-ups, Squats & Running")}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                playSound("system-click");
                onOpenQuest();
                onClose();
              }}
              className="btn btn-xs btn-outline btn-secondary font-bold shrink-0"
            >
              {isBn ? "কোয়েস্ট দেখুন" : "View Quest"}
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-5 space-y-2 pt-2 border-t border-cyan-500/30">
          {isWorkoutDay ? (
            <button
              type="button"
              onClick={() => {
                playSound("system-alert");
                vibrate([40, 80, 40]);
                onStartWorkout();
                onClose();
              }}
              className="btn btn-primary w-full py-3 text-black font-black uppercase text-xs tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.6)] flex items-center justify-center gap-2"
            >
              <Swords className="h-4 w-4 stroke-[2.5]" />
              <span>{isBn ? "আজকের ডানজন রেইড শুরু করুন (ENGAGE RAID)" : "ENGAGE TODAY'S DUNGEON RAID"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                playSound("system-click");
                onClose();
              }}
              className="btn btn-primary w-full py-3 text-black font-black uppercase text-xs tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
            >
              <span>{isBn ? "ড্যাশবোর্ডে প্রবেশ করুন (ENTER DASHBOARD)" : "ENTER SYSTEM DASHBOARD"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                playSound("system-alert");
                onOpenStatus();
                onClose();
              }}
              className="btn btn-sm btn-outline btn-info flex-1 gap-1.5 text-xs font-bold"
            >
              <Activity className="h-3.5 w-3.5" />
              <span>{isBn ? "স্ট্যাটাস উইন্ডো" : "Player Status"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playSound("system-click");
                onClose();
              }}
              className="btn btn-sm btn-ghost text-xs font-bold text-zinc-400 hover:text-white"
            >
              {isBn ? "বন্ধ করুন" : "Dismiss"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
