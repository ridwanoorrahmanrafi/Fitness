"use client";

import React, { useState } from "react";
import {
  X,
  ChevronLeft,
  SlidersHorizontal,
  Trophy,
  Calendar,
  Target,
  Compass,
  Users,
  Sparkles,
  Shield,
  RotateCcw,
  CheckCircle2,
  Coins,
  Zap,
  Gem,
} from "lucide-react";
import { playSound, vibrate } from "@/lib/audio";
import type { Language } from "@/lib/i18n";

export interface AchievementItem {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  rarity: "COMMON" | "UNCOMMON" | "RARE" | "LEGENDARY";
  current: number;
  target: number;
  unit?: string;
  xpReward: number;
  coinReward: number;
  gemReward?: number;
  icon: "calendar" | "target" | "compass" | "users" | "trophy" | "shield";
  claimed?: boolean;
}

const DEFAULT_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: "daily_discipline",
    title: "Daily Discipline",
    titleBn: "দৈনিক নিয়মানুবর্তিতা",
    description: "Complete 30 daily quests.",
    descriptionBn: "৩০টি দৈনিক কোয়েস্ট সম্পন্ন করুন।",
    rarity: "UNCOMMON",
    current: 0,
    target: 30,
    xpReward: 500,
    coinReward: 250,
    icon: "calendar",
  },
  {
    id: "into_focus",
    title: "Into Focus",
    titleBn: "মনোযোগের গভীরে",
    description: "Complete your first focus quest.",
    descriptionBn: "আপনার প্রথম ফোকাস কোয়েস্ট সম্পন্ন করুন।",
    rarity: "COMMON",
    current: 0,
    target: 1,
    xpReward: 120,
    coinReward: 60,
    icon: "target",
  },
  {
    id: "arsenal_master",
    title: "Arsenal",
    titleBn: "হান্টার আর্সেনাল",
    description: "Perform 25 different exercises.",
    descriptionBn: "২৫টি ভিন্ন ভিন্ন ব্যায়াম সম্পাদন করুন।",
    rarity: "RARE",
    current: 4,
    target: 25,
    xpReward: 900,
    coinReward: 450,
    gemReward: 3,
    icon: "compass",
  },
  {
    id: "sworn_in",
    title: "Sworn In",
    titleBn: "শপথ গ্রহণ",
    description: "Join or create a hunter guild.",
    descriptionBn: "একটি গিল্ডে যোগ দিন বা তৈরি করুন।",
    rarity: "COMMON",
    current: 0,
    target: 1,
    xpReward: 120,
    coinReward: 60,
    icon: "users",
  },
  {
    id: "party_formed",
    title: "Party Formed",
    titleBn: "দল গঠন",
    description: "Connect with 5 fellow hunters.",
    descriptionBn: "৫ জন সহযোদ্ধা হান্টারের সাথে যুক্ত হোন।",
    rarity: "UNCOMMON",
    current: 1,
    target: 5,
    xpReward: 500,
    coinReward: 250,
    icon: "users",
  },
  {
    id: "monarch_ascension",
    title: "Monarch Ascension",
    titleBn: "শ্যাডো মনার্ক আরোহণ",
    description: "Reach S-Rank and awaken the Monarch within.",
    descriptionBn: "এস-র‍্যাঙ্কে পৌঁছান এবং শ্যাডো মনার্কে উন্নীত হোন।",
    rarity: "LEGENDARY",
    current: 1,
    target: 1,
    xpReward: 5000,
    coinReward: 2500,
    gemReward: 10,
    icon: "trophy",
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
  lang?: Language;
  questsCompletedCount?: number;
  totalRepsCount?: number;
  totalTimeHours?: number;
  onClaim?: (reward: { xp: number; coins: number; gems?: number }) => void;
}

export function AchievementsModal({
  open,
  onClose,
  lang = "bn",
  questsCompletedCount = 0,
  totalRepsCount = 0,
  totalTimeHours = 0,
  onClaim,
}: Props) {
  const isBn = lang === "bn";
  const [tab, setTab] = useState<"in_progress" | "completed">("in_progress");
  const [achievements, setAchievements] = useState<AchievementItem[]>(() => {
    try {
      const stored = localStorage.getItem("leveling_achievements");
      return stored ? JSON.parse(stored) : DEFAULT_ACHIEVEMENTS;
    } catch {
      return DEFAULT_ACHIEVEMENTS;
    }
  });

  if (!open) return null;

  const inProgressList = achievements.filter((a) => (a.current < a.target) || (!a.claimed && a.current >= a.target));
  const completedList = achievements.filter((a) => a.current >= a.target && a.claimed);

  const getRarityBadge = (rarity: AchievementItem["rarity"]) => {
    switch (rarity) {
      case "LEGENDARY":
        return "bg-amber-500/20 text-amber-300 border-amber-400/60 shadow-[0_0_10px_rgba(245,158,11,0.5)]";
      case "RARE":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.4)]";
      case "UNCOMMON":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.4)]";
      case "COMMON":
      default:
        return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  const getIcon = (icon: AchievementItem["icon"]) => {
    switch (icon) {
      case "calendar":
        return <Calendar className="h-5 w-5 text-purple-400" />;
      case "target":
        return <Target className="h-5 w-5 text-purple-400" />;
      case "compass":
        return <Compass className="h-5 w-5 text-emerald-400" />;
      case "users":
        return <Users className="h-5 w-5 text-teal-400" />;
      case "shield":
        return <Shield className="h-5 w-5 text-blue-400" />;
      case "trophy":
      default:
        return <Trophy className="h-5 w-5 text-amber-400" />;
    }
  };

  const handleClaim = (ach: AchievementItem) => {
    playSound("quest-complete");
    vibrate([40, 80, 40]);
    const updated = achievements.map((item) =>
      item.id === ach.id ? { ...item, claimed: true } : item
    );
    setAchievements(updated);
    try {
      localStorage.setItem("leveling_achievements", JSON.stringify(updated));
    } catch {
      // ignore
    }
    if (onClaim) {
      onClaim({
        xp: ach.xpReward,
        coins: ach.coinReward,
        gems: ach.gemReward,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-5 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg min-h-[580px] max-h-[92vh] flex flex-col rounded-3xl bg-[#070e1c] border border-cyan-500/40 p-5 shadow-[0_0_40px_rgba(0,140,255,0.25)] text-zinc-100 overflow-hidden my-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between pb-3">
          <button
            type="button"
            onClick={() => {
              playSound("system-click");
              onClose();
            }}
            className="leveling-circle-btn"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <h2 className="text-lg font-bold text-white tracking-wide">
            {isBn ? "অ্যাচিভমেন্টস" : "Achievements"}
          </h2>

          <div className="leveling-circle-btn">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
        </div>

        {/* Segmented Control: In Progress vs Completed */}
        <div className="my-3 flex rounded-2xl bg-[#0c162b] p-1 border border-cyan-500/20">
          <button
            type="button"
            onClick={() => {
              playSound("system-click");
              setTab("in_progress");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === "in_progress"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {isBn ? "চলমান" : "In Progress"}
          </button>
          <button
            type="button"
            onClick={() => {
              playSound("system-click");
              setTab("completed");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === "completed"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {isBn ? "সম্পন্ন" : "Completed"}
          </button>
        </div>

        {/* Stats Summary Box (3 columns: Quests, Repetitions, Time) */}
        <div className="my-2 rounded-2xl border border-cyan-500/40 bg-[#0a1428]/90 p-4 shadow-[0_0_20px_rgba(0,140,255,0.15)]">
          <div className="grid grid-cols-3 divide-x divide-cyan-500/20 text-center">
            <div>
              <span className="block text-2xl font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]">
                {questsCompletedCount}
              </span>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                {isBn ? "কোয়েস্ট" : "Quests"}
              </span>
            </div>
            <div>
              <span className="block text-2xl font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]">
                {totalRepsCount}
              </span>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                {isBn ? "রেপস" : "Repetitions"}
              </span>
            </div>
            <div>
              <span className="block text-2xl font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]">
                {totalTimeHours}h
              </span>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                {isBn ? "সময়" : "Time"}
              </span>
            </div>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 mt-2">
          {tab === "in_progress" ? (
            inProgressList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400">
                <Trophy className="h-12 w-12 text-cyan-500/40 mb-3" />
                <p className="text-sm font-bold text-zinc-200">
                  {isBn ? "সকল অ্যাচিভমেন্ট আনলক হয়েছে!" : "All available achievements unlocked!"}
                </p>
              </div>
            ) : (
              inProgressList.map((ach) => {
                const canClaim = ach.current >= ach.target && !ach.claimed;
                const pct = Math.min(100, Math.round((ach.current / ach.target) * 100));

                return (
                  <div
                    key={ach.id}
                    className="rounded-2xl border border-cyan-500/20 bg-[#091224] p-4 shadow-sm hover:border-cyan-500/40 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-950/40 border border-purple-500/30">
                          {getIcon(ach.icon)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">
                            {isBn ? ach.titleBn : ach.title}
                          </h4>
                          <p className="text-[11px] text-zinc-400 leading-tight">
                            {isBn ? ach.descriptionBn : ach.description}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRarityBadge(
                          ach.rarity
                        )}`}
                      >
                        {ach.rarity}
                      </span>
                    </div>

                    {/* Progress Bar & Value */}
                    <div className="mt-3">
                      <div className="flex justify-between items-center text-[11px] font-bold text-zinc-300 mb-1">
                        <span>{ach.current} / {ach.target} {ach.unit ?? ""}</span>
                        <span className="text-cyan-400">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Rewards & Claim Button */}
                    <div className="mt-3 flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {ach.coinReward > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border border-amber-500/40 bg-amber-950/30 text-amber-300 text-[10px] font-bold">
                            <Coins className="h-3 w-3 text-amber-400" />
                            +{ach.coinReward} Coins
                          </span>
                        )}
                        {ach.xpReward > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border border-cyan-500/40 bg-cyan-950/30 text-cyan-300 text-[10px] font-bold">
                            <Zap className="h-3 w-3 text-cyan-400" />
                            +{ach.xpReward} XP
                          </span>
                        )}
                        {ach.gemReward && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border border-purple-500/40 bg-purple-950/30 text-purple-300 text-[10px] font-bold">
                            <Gem className="h-3 w-3 text-purple-400" />
                            +{ach.gemReward} Gems
                          </span>
                        )}
                      </div>

                      {canClaim && (
                        <button
                          type="button"
                          onClick={() => handleClaim(ach)}
                          className="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-xs font-black shadow-[0_0_15px_rgba(16,185,129,0.5)] active:scale-95 transition-all"
                        >
                          {isBn ? "পুরস্কার নিন" : "Claim"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )
          ) : (
            // Completed Tab
            completedList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-950/40 border border-blue-500/30 shadow-[0_0_25px_rgba(0,140,255,0.2)]">
                  <Trophy className="h-10 w-10 text-blue-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  {isBn ? "কোনো সম্পন্ন অ্যাচিভমেন্ট নেই" : "No completed achievements"}
                </h3>
                <p className="text-xs text-zinc-400 max-w-xs mb-6">
                  {isBn
                    ? "এখানে দেখতে কোয়েস্ট ও অ্যাচিভমেন্ট সম্পন্ন করুন।"
                    : "Complete achievements to see them here."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    playSound("system-click");
                    setTab("in_progress");
                  }}
                  className="w-full max-w-xs py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-95 transition-all"
                >
                  {isBn ? "রিফ্রেশ" : "Refresh"}
                </button>
              </div>
            ) : (
              completedList.map((ach) => (
                <div
                  key={ach.id}
                  className="rounded-2xl border border-emerald-500/30 bg-[#081820]/80 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {isBn ? ach.titleBn : ach.title}
                        </h4>
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                          {isBn ? "সম্পন্ন ও পুরস্কার সংগৃহীত" : "Completed & Claimed"}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRarityBadge(
                        ach.rarity
                      )}`}
                    >
                      {ach.rarity}
                    </span>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}
