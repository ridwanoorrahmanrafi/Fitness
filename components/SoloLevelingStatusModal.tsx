"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Shield, Zap, Sparkles, Award, Plus, ChevronRight, Activity, Flame, Swords, HeartPulse } from "lucide-react";
import { PlayerStats, ShadowSoldier, INITIAL_SHADOW_SOLDIERS, allocateStatPoint } from "@/lib/systemStats";
import { playSound, vibrate } from "@/lib/audio";
import type { Language } from "@/lib/i18n";

interface SoloLevelingStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  onTriggerArise?: () => void;
  onOpenCalibration?: () => void;
  lang?: Language;
}

export default function SoloLevelingStatusModal({
  isOpen,
  onClose,
  stats,
  onUpdateStats,
  onTriggerArise,
  onOpenCalibration,
  lang = "bn",
}: SoloLevelingStatusModalProps) {
  const isBn = lang === "bn";
  const [activeTab, setActiveTab] = useState<"status" | "skills" | "shadows">("status");

  if (!isOpen) return null;

  const handleAllocate = (attr: keyof PlayerStats["attributes"]) => {
    if (stats.unallocatedPoints <= 0) return;
    playSound("system-click");
    vibrate(20);
    const updated = allocateStatPoint(stats, attr);
    onUpdateStats(updated);
  };

  const rankBadgeColors: Record<string, string> = {
    E: "border-zinc-500 text-zinc-300 bg-zinc-900/90 shadow-zinc-800",
    D: "border-amber-700 text-amber-300 bg-amber-950/90 shadow-amber-900/50",
    C: "border-emerald-500 text-emerald-300 bg-emerald-950/90 shadow-emerald-800/50",
    B: "border-blue-500 text-blue-300 bg-blue-950/90 shadow-blue-800/50",
    A: "border-purple-500 text-purple-300 bg-purple-950/90 shadow-purple-800/50",
    S: "border-cyan-400 text-cyan-200 bg-cyan-950/90 shadow-[0_0_20px_rgba(34,211,238,0.7)] text-glow-cyan",
    "Shadow Monarch": "border-violet-500 text-violet-200 bg-black/95 shadow-[0_0_25px_rgba(139,92,246,0.8)] text-glow-purple",
  };

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

  const skillsList = isBn
    ? [
        { name: "স্প্রিন্ট (Sprint)", level: "Lv. 2", type: "সক্রিয় (Active)", mana: "20 MP", desc: "ওয়ার্কআউটের মুভমেন্ট স্পিড ও সেটের গতি ৩০% বৃদ্ধি পায়।", icon: "⚡" },
        { name: "স্টেলথ ফোকাস (Stealth)", level: "Lv. 1", type: "সক্রিয় (Active)", mana: "50 MP", desc: "ব্যায়ামের সময় চারপাশের মনোযোগ বিভ্রান্তি দূর করে সম্পূর্ণ একাগ্রতা আনে।", icon: "👁️" },
        { name: "ব্লাডলাস্ট (Bloodlust)", level: "Lv. 1", type: "সক্রিয় (Active)", mana: "35 MP", desc: "মাসল ফেইলিউরের পরেও অতিরিক্ত ২টি এক্সপ্লোসিভ রেপস দেওয়ার শক্তি তৈরি করে।", icon: "🩸" },
        { name: "ফর্ম মাস্টারি (Biomechanics)", level: "Lv. MAX", type: "প্যাসিভ (Passive)", mana: "কোনো খরচ নেই", desc: "ব্যায়ামের ভঙ্গি নির্ভুল রাখে এবং লিগামেন্ট ও জয়েন্টের ইনজুরি ঝুঁকি কমায়।", icon: "🗡️" },
        { name: "লঞ্জিভিটি রিকভারি (Longevity)", level: "Lv. MAX", type: "প্যাসিভ (Passive)", mana: "কোনো খরচ নেই", desc: "পেশীর ক্লান্তি ও মাংসপেশির ব্যথা ২০০% দ্রুত স্বাভাবিক করে তোলে।", icon: "❤️‍🔥" },
        { name: "অ্যারাইজ (Arise / Awakening)", level: "Lv. 3", type: "আল্টিমেট (Ultimate)", mana: "100 MP", desc: "ক্লান্তি ও ধকলকে স্থায়ী পেশী শক্তিতে রূপান্তরিত করে।", icon: "👑" },
      ]
    : [
        { name: "Sprint", level: "Lv. 2", type: "Active", mana: "20 MP", desc: "Increases movement speed and set cadence by 30%.", icon: "⚡" },
        { name: "Stealth Focus", level: "Lv. 1", type: "Active", mana: "50 MP", desc: "Hides presence from workout distractions. Full focus zone.", icon: "👁️" },
        { name: "Bloodlust", level: "Lv. 1", type: "Active", mana: "35 MP", desc: "Pushes past muscular failure for +2 explosive reps.", icon: "🩸" },
        { name: "Movement Mastery", level: "Lv. MAX", type: "Passive", mana: "None", desc: "Form accuracy +40%. Reduces joint and tendon injury risk.", icon: "🗡️" },
        { name: "Longevity", level: "Lv. MAX", type: "Passive", mana: "None", desc: "Immune to training slump; DOMS recovery speed +200%.", icon: "❤️‍🔥" },
        { name: "Arise / Shadow Extraction", level: "Lv. 3", type: "Ultimate", mana: "100 MP", desc: "Extracts physical fatigue into permanent shadow power.", icon: "👑" },
      ];

  return (
    <div className="modal modal-open backdrop-blur-xl z-50 p-2.5 sm:p-4">
      {/* Background Anime Ambience */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-25">
        <Image
          src="/images/solo-leveling/system-monarch-banner.jpg"
          alt="System Backdrop"
          fill
          className="object-cover blur-[3px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-[#020614]/80" />
      </div>

      {/* Solo Leveling Chamfered Holographic Window */}
      <div className="modal-box relative w-full max-w-2xl max-h-[94vh] flex flex-col bg-[#03081a]/95 border-2 border-cyan-400/80 shadow-[0_0_45px_rgba(6,182,212,0.45)] text-zinc-100 overflow-hidden rounded-2xl system-scanlines system-grid-bg p-0">
        
        {/* Luminous Diamond Corner Pins */}
        <div className="absolute top-1.5 left-1.5 text-cyan-400 text-xs font-mono select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>
        <div className="absolute top-1.5 right-1.5 text-cyan-400 text-xs font-mono select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>
        <div className="absolute bottom-1.5 left-1.5 text-cyan-400 text-xs font-mono select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>
        <div className="absolute bottom-1.5 right-1.5 text-cyan-400 text-xs font-mono select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>

        {/* Holographic Header Bar */}
        <div className="relative flex items-center justify-between px-5 py-3 border-b-2 border-cyan-400/50 bg-gradient-to-r from-cyan-950/80 via-[#061435]/90 to-purple-950/70">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-400 shadow-md shadow-cyan-400"></span>
            </span>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-cyan-300/90 uppercase font-black">
                {isBn ? "[ THE SYSTEM : হান্টার স্ট্যাটাস ]" : "[ THE SYSTEM : HUNTER STATUS ]"}
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-widest text-white uppercase text-glow-cyan">
                {isBn ? "STATUS : স্ট্যাটাস উইন্ডো" : "STATUS : HUNTER ATTRIBUTES"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onTriggerArise && (
              <button
                type="button"
                onClick={() => {
                  playSound("arise");
                  vibrate([40, 60, 40]);
                  onTriggerArise();
                }}
                className="btn btn-sm btn-secondary text-white font-black tracking-wider shadow-[0_0_18px_rgba(168,85,247,0.6)]"
              >
                ⚡ ARISE
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-circle btn-ghost text-cyan-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* System 3-Tab Navigator (DaisyUI Tabs) */}
        <div className="tabs tabs-boxed bg-black/60 p-1 border-b border-cyan-500/40 rounded-none font-mono text-xs font-black grid grid-cols-3">
          <button
            type="button"
            onClick={() => {
              playSound("system-click");
              setActiveTab("status");
            }}
            className={`tab flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "status"
                ? "tab-active bg-primary text-black font-black"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>{isBn ? "[ ১. স্ট্যাটাস ]" : "[ 1. STATUS ]"}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playSound("system-click");
              setActiveTab("skills");
            }}
            className={`tab flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "skills"
                ? "tab-active bg-primary text-black font-black"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Swords className="h-4 w-4" />
            <span>{isBn ? "[ ২. স্কিল ]" : "[ 2. SKILLS ]"}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playSound("system-click");
              setActiveTab("shadows");
            }}
            className={`tab flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "shadows"
                ? "tab-active bg-secondary text-white font-black"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>{isBn ? "[ ৩. শ্যাডো আর্মি ]" : "[ 3. ARMY ]"}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === "status" && (
            <>
              {/* Character Identity Box */}
              <div className="relative rounded-xl p-4 bg-gradient-to-b from-[#05112e]/80 via-black/80 to-[#0a0520]/80 border-2 border-cyan-500/40 shadow-inner">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  {/* Portrait Avatar */}
                  <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-xl overflow-hidden border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.5)] shrink-0">
                    <Image
                      src="/images/solo-leveling/monarch-player-avatar.jpg"
                      alt="Player Portrait"
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-black bg-cyan-400 text-black shadow-sm">
                      Lv.{stats.level}
                    </div>
                  </div>

                  {/* Character Stats Info */}
                  <div className="flex-1 text-center sm:text-left space-y-1.5 w-full font-mono">
                    <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 border-b border-cyan-500/30 pb-2">
                      <div>
                        <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                          {isBn ? "প্লেয়ার নাম" : "PLAYER NAME"}
                        </div>
                        <h3 className="text-xl font-black text-white tracking-wide">
                          {stats.name} <span className="text-xs text-zinc-400 font-normal">({isBn ? "শ্যাডো হান্টার" : "Shadow Monarch"})</span>
                        </h3>
                      </div>
                      <span className={`px-3 py-1 rounded text-xs font-black border ${rankBadgeColors[stats.rank] || rankBadgeColors.E}`}>
                        {isBn ? "র‍্যাংক" : "RANK"} : {stats.rank}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs pt-1">
                      <div>
                        <span className="text-cyan-400 font-bold">{isBn ? "পেশা / ক্লাস : " : "JOB : "}</span>
                        <span className="font-black text-white">{stats.job}</span>
                      </div>
                      <div>
                        <span className="text-purple-400 font-bold">{isBn ? "টাইটেল : " : "TITLE : "}</span>
                        <span className="font-semibold text-purple-200">{stats.title}</span>
                      </div>
                    </div>

                    {/* EXP Progress Bar */}
                    {/* EXP Progress Bar (DaisyUI Progress) */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                        <span className="text-cyan-400 font-bold">{isBn ? "এক্সপি অগ্রগতি (EXP)" : "EXP PROGRESS"}</span>
                        <span className="text-white font-black font-mono">
                          {stats.exp} / {stats.expToNext} ({Math.round((stats.exp / stats.expToNext) * 100)}%)
                        </span>
                      </div>
                      <progress
                        className="progress progress-primary w-full h-2"
                        value={stats.exp}
                        max={stats.expToNext}
                      />
                    </div>
                  </div>
                </div>

                {/* HP / MP / Fatigue Segmented Gauges (DaisyUI Progress) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t-2 border-cyan-500/30 text-xs font-mono">
                  {/* HP Gauge */}
                  <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.2)]">
                    <div className="flex justify-between text-red-400 font-black mb-1">
                      <span>HP ({isBn ? "স্বাস্থ্য" : "HEALTH"})</span>
                      <span>{stats.hp.current} / {stats.hp.max}</span>
                    </div>
                    <progress
                      className="progress progress-error w-full h-2"
                      value={stats.hp.current}
                      max={stats.hp.max}
                    />
                  </div>

                  {/* MP Gauge */}
                  <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.2)]">
                    <div className="flex justify-between text-cyan-400 font-black mb-1">
                      <span>MP ({isBn ? "শক্তি" : "MANA"})</span>
                      <span>{stats.mp.current} / {stats.mp.max}</span>
                    </div>
                    <progress
                      className="progress progress-info w-full h-2"
                      value={stats.mp.current}
                      max={stats.mp.max}
                    />
                  </div>

                  {/* Fatigue Status */}
                  <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                    <div className="flex justify-between text-amber-400 font-black mb-1">
                      <span>{isBn ? "ক্লান্তি (FATIGUE)" : "FATIGUE"}</span>
                      <span className="text-white font-bold">{stats.fatigue}%</span>
                    </div>
                    <progress
                      className="progress progress-warning w-full h-2"
                      value={stats.fatigue}
                      max={100}
                    />
                  </div>
                </div>
              </div>

              {/* Attributes Table */}
              <div className="rounded-xl p-4 bg-[#040c24]/90 border-2 border-cyan-500/40 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
                  <div>
                    <h4 className="text-sm font-black tracking-widest text-cyan-300 uppercase text-glow-cyan">
                      {isBn ? "[ কমব্যাট অ্যাট্রিবিউটস : ATTRIBUTES ]" : "[ COMBAT ATTRIBUTES ]"}
                    </h4>
                    <p className="text-[11px] font-mono text-zinc-400">
                      {isBn ? "শারীরিক সক্ষমতা বাড়াতে অবশিষ্ট স্ট্যাট পয়েন্ট বরাদ্দ করুন।" : "Distribute available stat points to upgrade physical capabilities."}
                    </p>
                  </div>
                  <div className="badge badge-primary font-mono font-black text-xs p-3">
                    {isBn ? "অবশিষ্ট পয়েন্ট : " : "REMAINING AP : "}<span className="text-white text-sm ml-1">{stats.unallocatedPoints}</span>
                  </div>
                </div>

                {/* Attributes Grid */}
                <div className="space-y-2 font-mono text-sm">
                  {attributesList.map((attr) => (
                    <div
                      key={attr.key}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-black/60 border border-cyan-500/25 hover:border-cyan-400/60 transition-all"
                    >
                      <div>
                        <div className={`font-black tracking-wide ${attr.color}`}>{attr.name}</div>
                        <div className="text-[10px] text-zinc-400">{attr.desc}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-white w-10 text-right font-mono text-glow-cyan">
                          {attr.val}
                        </span>
                        <button
                          type="button"
                          disabled={stats.unallocatedPoints <= 0}
                          onClick={() => handleAllocate(attr.key)}
                          className="btn btn-xs btn-circle btn-primary text-black font-black disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-3.5 w-3.5 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Tab 2: Skills & Abilities */}
          {activeTab === "skills" && (
            <div className="space-y-3 font-mono">
              <div className="rounded-xl p-3.5 bg-gradient-to-r from-cyan-950/70 via-black to-purple-950/60 border border-cyan-500/40">
                <h4 className="text-sm font-black text-cyan-300 uppercase">
                  {isBn ? "[ সক্রিয় ও প্যাসিভ স্কিল : SKILLS ]" : "[ ACTIVE & PASSIVE SKILLS ]"}
                </h4>
                <p className="text-[11px] text-zinc-400">
                  {isBn ? "কঠোর প্রশিক্ষণ ও ওয়ার্কআউটের মাধ্যমে অর্জিত শারীরিক সক্ষমতা।" : "Hunter abilities acquired through rigorous training and physical trials."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {skillsList.map((skill, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-black/60 border border-cyan-500/30 space-y-1.5 hover:border-cyan-400 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{skill.icon}</span>
                        <span className="text-xs font-black text-white">{skill.name}</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                        {skill.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug">{skill.desc}</p>
                    <div className="flex justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-800">
                      <span>{isBn ? "ধরণ : " : "TYPE : "}<strong className="text-zinc-300">{skill.type}</strong></span>
                      <span>{isBn ? "খরচ : " : "COST : "}<strong className="text-cyan-400">{skill.mana}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Shadow Army Tab */}
          {activeTab === "shadows" && (
            <div className="space-y-3 font-mono">
              <div className="rounded-xl p-4 bg-gradient-to-r from-purple-950/70 via-black to-indigo-950/50 border border-purple-500/40">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black tracking-wide text-purple-200">
                      {isBn ? "শ্যাডো আর্মি (SHADOW ARMY)" : "SHADOW ARMY : EXTRACTIONS"}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {isBn ? "শারীরিক লেভেল বৃদ্ধির সাথে সাথে আনলক হওয়া বিশেষ ছায়া সৈন্য।" : "Commanders and soldiers bound to the Shadow Monarch."}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-950 border border-purple-400/50 text-purple-300">
                    {isBn ? "আনলক মোড সক্রিয়" : "EXTRACTION : ACTIVE"}
                  </span>
                </div>
              </div>

              {/* Soldiers List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INITIAL_SHADOW_SOLDIERS.map((soldier) => {
                  const isUnlocked = stats.level >= soldier.unlockedLevel;
                  return (
                    <div
                      key={soldier.id}
                      className={`relative rounded-xl overflow-hidden border p-3 flex flex-col justify-between transition-all ${
                        isUnlocked
                          ? "bg-purple-950/30 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.25)]"
                          : "bg-zinc-900/40 border-zinc-800 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-14 rounded-xl overflow-hidden border-2 border-purple-400/60 shrink-0">
                          <Image
                            src={soldier.image}
                            alt={soldier.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white tracking-wide">
                            {isBn && soldier.bengaliName ? `${soldier.bengaliName} (${soldier.name})` : soldier.name}
                          </div>
                          <div className="text-[10px] text-purple-300/80">
                            {isBn ? `লেভেল আনলক: Lv.${soldier.unlockedLevel}` : `Rank: ${soldier.rank}`}
                          </div>
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-purple-900/80 border border-purple-400/40 text-purple-200">
                            {soldier.rank}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-purple-500/20 flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400">{soldier.bonus}</span>
                        {isUnlocked ? (
                          <span className="text-emerald-400 font-bold">{isBn ? "প্রস্তুত (READY)" : "READY"}</span>
                        ) : (
                          <span className="text-amber-400 font-bold">{isBn ? `লক (Lv.${soldier.unlockedLevel})` : `LOCKED (Lv.${soldier.unlockedLevel})`}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Chamfered Button */}
        <div className="p-3.5 border-t border-cyan-500/40 bg-black/80 flex items-center justify-between text-xs font-mono text-zinc-400 gap-2">
          <div className="flex items-center gap-3">
            <div>
              {isBn ? "মোট জয়ী রেইড : " : "TOTAL CLEARS : "}<span className="text-cyan-300 font-bold text-glow-cyan">{stats.totalWorkoutsCleared}</span>
            </div>
            {onOpenCalibration && (
              <button
                type="button"
                onClick={() => {
                  playSound("system-click");
                  onOpenCalibration();
                }}
                className="text-[11px] text-cyan-400 hover:text-cyan-200 underline underline-offset-2 transition-colors cursor-pointer"
              >
                {isBn ? "[ রিক্যালিগ্রেশন ]" : "[ RE-CALIBRATE ]"}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              playSound("system-click");
              onClose();
            }}
            className="btn btn-sm btn-primary font-black uppercase tracking-wider"
          >
            {isBn ? "নিশ্চিত ও বন্ধ করুন (CONFIRM)" : "CONFIRM & CLOSE"}
          </button>
        </div>

      </div>
    </div>
  );
}
