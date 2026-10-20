"use client";

import React, { useState } from "react";
import {
  Shield,
  Zap,
  Sparkles,
  Coins,
  Key,
  Flame,
  Award,
  Plus,
  ChevronRight,
  Activity,
  HeartPulse,
  User,
  Crown,
} from "lucide-react";
import { playSound, vibrate } from "@/lib/audio";
import type { Language } from "@/lib/i18n";
import { PlayerStats, allocateStatPoint, INITIAL_SHADOW_SOLDIERS } from "@/lib/systemStats";

interface Props {
  lang?: Language;
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  onTriggerArise?: () => void;
  onOpenCalibration?: () => void;
  goldCount?: number;
  keysCount?: number;
}

export function LevelingStatusView({
  lang = "bn",
  stats,
  onUpdateStats,
  onTriggerArise,
  onOpenCalibration,
  goldCount = 0,
  keysCount = 0,
}: Props) {
  const isBn = lang === "bn";
  const [activeTab, setActiveTab] = useState<"status" | "skills" | "shadows">("status");

  const handleAllocate = (attr: keyof PlayerStats["attributes"]) => {
    if (stats.unallocatedPoints <= 0) return;
    playSound("system-click");
    vibrate(20);
    const updated = allocateStatPoint(stats, attr);
    onUpdateStats(updated);
  };

  const hunterInitial = (stats.name || "Sung Jin-woo").charAt(0).toUpperCase();

  const attributesList = [
    {
      key: "str" as const,
      name: isBn ? "শক্তি (STRENGTH)" : "STRENGTH",
      desc: isBn ? "পেশীর শক্তি বৃদ্ধি ও ওভারলোড সক্ষমতা বাড়ায়" : "Increases muscular power & progressive overload resistance",
      val: stats.attributes.str,
      color: "text-red-400",
    },
    {
      key: "agi" as const,
      name: isBn ? "গতি ও চটপটে ভাব (AGILITY)" : "AGILITY",
      desc: isBn ? "মুভমেন্ট স্পিড, কার্ডিও গতি ও রিকভারি দ্রুত করে" : "Increases movement tempo, cardio speed & recovery speed",
      val: stats.attributes.agi,
      color: "text-emerald-400",
    },
    {
      key: "vit" as const,
      name: isBn ? "স্ট্যামিনা ও জীবনীশক্তি (VITALITY)" : "VITALITY",
      desc: isBn ? "সর্বোচ্চ এইচপি (+১০) এবং দীর্ঘ সেটের সহনশীলতা বাড়ায়" : "Increases maximum HP (+10) and stamina against heavy loads",
      val: stats.attributes.vit,
      color: "text-amber-400",
    },
    {
      key: "int" as const,
      name: isBn ? "বুদ্ধিমত্তা ও ফোকাস (INTELLIGENCE)" : "INTELLIGENCE",
      desc: isBn ? "সর্বোচ্চ এমপি (+৮) এবং মাইন্ড-মাসল সংযোগ বাড়ায়" : "Increases maximum MP (+8) and routine AI adaptation",
      val: stats.attributes.int,
      color: "text-blue-400",
    },
    {
      key: "per" as const,
      name: isBn ? "একাগ্রতা ও নির্ভুল ফর্ম (PERCEPTION)" : "PERCEPTION",
      desc: isBn ? "ব্যায়ামের সঠিক ভঙ্গি ও কাইনেম্যাটিক স্কোর বাড়ায়" : "Increases mind-muscle connection & kinematic form score",
      val: stats.attributes.per,
      color: "text-purple-400",
    },
  ];

  const expTarget = stats.expToNext || 150;
  const xpPercent = Math.min(100, Math.round((stats.exp / expTarget) * 100));

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Title: Player: <name> */}
      <div className="text-center">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
          {isBn ? "খেলোয়াড়: " : "Player: "}
          <span className="text-cyan-400 text-glow-cyan font-black">
            {stats.name || "Sung Jin-woo"}
          </span>
        </h2>
      </div>

      {/* Main Container Card */}
      <div className="leveling-card p-5 relative">
        {/* Header Box: [ STATUS ] */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="leveling-header-box">
            {isBn ? "স্ট্যাটাস" : "STATUS"}
          </div>
        </div>

        {/* Circular Avatar overlapping card */}
        <div className="flex justify-center -mt-3 mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-[#0a1836] to-[#122b5e] border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(0,140,255,0.4)] text-2xl font-black text-white">
            {hunterInitial}
          </div>
        </div>

        {/* Top Stats Block */}
        <div className="rounded-2xl border border-cyan-500/25 bg-[#091326] p-5 mb-4">
          <div className="grid grid-cols-2 gap-4 items-center">
            {/* Left: Level Number */}
            <div className="text-center border-r border-cyan-500/20 pr-3">
              <span className="block text-5xl sm:text-6xl font-black text-white tracking-tight drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
                {stats.level}
              </span>
              <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                LEVEL
              </span>
            </div>

            {/* Right: Rank, Class, Title */}
            <div className="space-y-2 text-xs font-bold pl-2">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 uppercase tracking-wider text-[11px]">
                  RANK:
                </span>
                <span className="rounded-md border border-cyan-500/40 bg-cyan-950/70 px-2 py-0.5 text-xs font-black text-cyan-300">
                  {stats.rank}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-zinc-400 uppercase tracking-wider text-[11px]">
                  CLASS:
                </span>
                <span className="text-white font-bold">
                  {stats.hunterClass || "Awakened"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-zinc-400 uppercase tracking-wider text-[11px]">
                  TITLE:
                </span>
                <span className="text-purple-300 font-bold truncate">
                  {stats.title || (isBn ? "অনুপস্থিত" : "None")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Stats Block: Gold & Keys */}
        <div className="rounded-2xl border border-cyan-500/20 bg-[#091326] p-3.5 mb-4">
          <div className="grid grid-cols-2 divide-x divide-cyan-500/20 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                GOLD
              </span>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <Coins className="h-4 w-4 text-amber-400" />
                <span className="text-lg font-black text-white">
                  {goldCount}
                </span>
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                KEYS
              </span>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <Key className="h-4 w-4 text-blue-400" />
                <span className="text-lg font-black text-white">
                  {keysCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="rounded-2xl border border-cyan-500/20 bg-[#091326] p-4 mb-5">
          <p className="text-center text-[11px] text-zinc-400 font-medium mb-3">
            {isBn
              ? "এক্সপি অর্জন করতে কোয়েস্ট ও অ্যাচিভমেন্ট সম্পন্ন করুন!"
              : "Complete quests and achievements to earn XP!"}
          </p>

          <div className="flex items-center justify-between text-xs font-black mb-1.5">
            <span className="text-cyan-400">XP</span>
            <span className="text-white">LV {stats.level + 1}</span>
          </div>

          <div className="h-2 w-full rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_12px_rgba(0,140,255,0.7)] transition-all duration-300"
              style={{ width: `${xpPercent}%` }}
            />
          </div>

          <div className="text-right mt-1">
            <span className="text-[10px] font-mono text-zinc-500">
              {stats.exp} / {stats.expToNextLevel}
            </span>
          </div>
        </div>

        {/* Tab Controls: Attributes vs Shadows */}
        <div className="flex rounded-2xl bg-[#081226] p-1 border border-cyan-500/20 mb-4">
          <button
            type="button"
            onClick={() => {
              playSound("system-click");
              setActiveTab("status");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "status"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {isBn ? "অ্যাট্রিবিউটস" : "Attributes"}
          </button>
          <button
            type="button"
            onClick={() => {
              playSound("system-click");
              setActiveTab("shadows");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "shadows"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {isBn ? "শ্যাডো আর্মি" : "Shadow Army"}
          </button>
        </div>

        {/* Attributes List */}
        {activeTab === "status" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-zinc-400">
                {isBn ? "বণ্টনযোগ্য পয়েন্ট:" : "Unallocated Points:"}
              </span>
              <span className="font-black text-cyan-400 text-glow-cyan">
                {stats.unallocatedPoints} PTS
              </span>
            </div>

            {attributesList.map((attr) => (
              <div
                key={attr.key}
                className="flex items-center justify-between p-3 rounded-2xl border border-cyan-500/15 bg-[#081328] hover:border-cyan-500/30 transition-all"
              >
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className={attr.color}>●</span>
                    {attr.name}
                  </h4>
                  <p className="text-[10px] text-zinc-400 max-w-xs leading-tight mt-0.5">
                    {attr.desc}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white font-mono w-7 text-right">
                    {attr.val}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAllocate(attr.key)}
                    disabled={stats.unallocatedPoints <= 0}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Shadow Army / Soldiers */
          <div className="space-y-3">
            <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 text-center">
              <Sparkles className="h-6 w-6 text-purple-400 mx-auto mb-2 animate-pulse" />
              <h4 className="text-sm font-bold text-purple-200">
                {isBn ? "শ্যাডো এক্সট্রাকশন ও কমান্ড" : "Shadow Extraction & Command"}
              </h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                {isBn
                  ? "কঠোর ওয়ার্কআউট সম্পন্ন করে শ্যাডো সৈনিক আনলক করুন।"
                  : "Conquer intense workouts to extract and command loyal shadow soldiers."}
              </p>

              {onTriggerArise && (
                <button
                  type="button"
                  onClick={onTriggerArise}
                  className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black shadow-[0_0_15px_rgba(168,85,247,0.4)] active:scale-95 transition-all"
                >
                  ARISE (জাগরণ)
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {INITIAL_SHADOW_SOLDIERS.map((soldier) => {
                const isUnlocked = stats.level >= soldier.unlockedLevel;
                return (
                  <div
                    key={soldier.id}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isUnlocked
                        ? "border-purple-500/40 bg-purple-950/30 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                        : "border-zinc-800 bg-[#060d1c] text-zinc-600 opacity-60"
                    }`}
                  >
                    <span className="text-2xl block mb-1">
                      {soldier.name.includes("Igris")
                        ? "⚔️"
                        : soldier.name.includes("Iron")
                        ? "🛡️"
                        : soldier.name.includes("Tank")
                        ? "🐻"
                        : "🐜"}
                    </span>
                    <span className="text-xs font-bold text-white block">
                      {isBn ? soldier.bengaliName : soldier.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {isUnlocked ? soldier.rank : `Lv.${soldier.unlockedLevel}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
