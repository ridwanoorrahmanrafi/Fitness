"use client";

import React, { useState } from "react";
import {
  Trophy,
  Calendar,
  Hourglass,
  ChevronsUp,
  MapPin,
  Flame,
  Activity,
  Heart,
  ChevronRight,
  TrendingUp,
  Clock,
  Lock,
  Route,
  Zap,
} from "lucide-react";
import { playSound } from "@/lib/audio";
import type { Language } from "@/lib/i18n";
import type { HistoryEntry, Profile } from "@/lib/types";

interface Props {
  lang?: Language;
  history: HistoryEntry[];
  profile: Profile;
  onOpenAchievements: () => void;
  workoutDurationMinutes?: number;
  xpEarnedToday?: number;
  distanceKmToday?: number;
  caloriesBurnedToday?: number;
}

export function LevelingStatisticsView({
  lang = "bn",
  history,
  profile,
  onOpenAchievements,
  workoutDurationMinutes = 0,
  xpEarnedToday = 0,
  distanceKmToday = 0,
  caloriesBurnedToday = 0,
}: Props) {
  const isBn = lang === "bn";
  const [filterPeriod, setFilterPeriod] = useState<"day" | "week" | "month">("day");
  const [measuringBpm, setMeasuringBpm] = useState(false);
  const [bpmBefore, setBpmBefore] = useState<number | null>(null);
  const [bpmAfter, setBpmAfter] = useState<number | null>(null);

  // Format today's date
  const now = new Date();
  const dateFormatted = now.toLocaleDateString(isBn ? "bn-BD" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const shortDate = now.toLocaleDateString(isBn ? "bn-BD" : "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  // Calculate totals from history if present
  const totalVolume = history.reduce((sum, h) => sum + (h.volumeKg || 0), 0);
  const totalReps = history.reduce((sum, h) => {
    const fromEx = h.exercises?.reduce((eSum, ex) => {
      return eSum + (ex.sets?.reduce((sSum, s) => sSum + (s.done && s.reps ? s.reps : 0), 0) || 0);
    }, 0) || 0;
    return sum + (fromEx || (h.setsDone ? h.setsDone * 10 : 0));
  }, 0);
  const displayDistance = distanceKmToday > 0 ? distanceKmToday.toFixed(1) : "0";
  const displayCalories = caloriesBurnedToday > 0 ? Math.round(caloriesBurnedToday) : Math.round(totalVolume * 0.05);

  const handleMeasureBpm = () => {
    playSound("system-click");
    setMeasuringBpm(true);
    setTimeout(() => {
      setMeasuringBpm(false);
      const fakeBpm = 72 + Math.floor(Math.random() * 15);
      if (!bpmBefore) {
        setBpmBefore(fakeBpm);
      } else {
        setBpmAfter(fakeBpm + 25);
      }
    }, 1500);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Header: Date, Heading & Achievements Button */}
      <div className="flex flex-col items-center text-center">
        <span className="text-xs font-semibold text-zinc-400">
          {dateFormatted}
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
          {isBn ? "দৈনিক কার্যকলাপ" : "Daily Activities"}
        </h2>

        {/* Achievements Golden Badge (DaisyUI Button) */}
        <button
          type="button"
          onClick={() => {
            playSound("system-click");
            onOpenAchievements();
          }}
          className="btn btn-sm btn-outline btn-warning gap-1.5 rounded-full mt-2.5 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
        >
          <Trophy className="h-3.5 w-3.5" />
          <span>{isBn ? "অ্যাচিভমেন্টস" : "Achievements"}</span>
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      {/* Main Container Card */}
      <div className="leveling-card p-5 relative">
        {/* Corner Rune Pins */}
        <div className="absolute top-2 left-2 text-cyan-400 text-xs font-mono select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>
        <div className="absolute top-2 right-2 text-cyan-400 text-xs font-mono select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>
        <div className="absolute bottom-2 left-2 text-cyan-400 text-xs font-mono select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>
        <div className="absolute bottom-2 right-2 text-cyan-400 text-xs font-mono select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>

        {/* Header Box: [ STATISTICS ] */}
        <div className="flex flex-col items-center justify-center mb-5">
          <div className="leveling-header-box">
            {isBn ? "পরিসংখ্যান" : "STATISTICS"}
          </div>
        </div>

        {/* Segmented Control: Day / Week / Month / Calendar (DaisyUI Tabs) */}
        <div className="tabs tabs-boxed bg-[#081226] p-1 border border-cyan-500/20 mb-5">
          <button
            type="button"
            onClick={() => {
              playSound("system-click");
              setFilterPeriod("day");
            }}
            className={`tab flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              filterPeriod === "day"
                ? "tab-active bg-primary text-black font-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {isBn ? "দিন" : "Day"}
          </button>
          <button
            type="button"
            onClick={() => {
              playSound("system-click");
              setFilterPeriod("week");
            }}
            className={`tab flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              filterPeriod === "week"
                ? "tab-active bg-primary text-black font-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {isBn ? "সপ্তাহ" : "Week"}
          </button>
          <button
            type="button"
            onClick={() => {
              playSound("system-click");
              setFilterPeriod("month");
            }}
            className={`tab flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              filterPeriod === "month"
                ? "tab-active bg-primary text-black font-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {isBn ? "মাস" : "Month"}
          </button>
          <div className="px-3 text-zinc-500 flex items-center">
            <Calendar className="h-4 w-4" />
          </div>
        </div>

        {/* Distance Progression Card */}
        <div className="rounded-2xl border border-cyan-500/20 bg-[#091326] p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-400">
                <Route className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {isBn ? "দূরত্ব ও অগ্রগতির ধারা" : "Distance Progression"}
                </h4>
                <span className="text-[11px] text-zinc-400">{shortDate}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-lg font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">
                {displayDistance}{" "}
                <span className="text-xs font-medium text-zinc-400">km</span>
              </span>
              <span className="block text-[9px] font-bold text-blue-300 bg-blue-950/80 border border-blue-500/40 px-2 py-0.5 rounded-full mt-0.5 text-center">
                Total
              </span>
            </div>
          </div>

          {/* Metric graph preview or empty state */}
          <div className="mt-4 flex flex-col items-center justify-center py-6 text-center border-t border-cyan-500/10">
            <TrendingUp className="h-6 w-6 text-cyan-400/60 mb-1.5 animate-pulse" />
            <h5 className="text-xs font-bold text-white">
              {history.length > 0 ? (isBn ? "অগ্রগতি সক্রিয় রয়েছে" : "Progression Active") : (isBn ? "এখনো কোনো মেট্রিক নেই" : "No metrics yet")}
            </h5>
            <p className="text-[11px] text-zinc-400 max-w-xs mt-0.5">
              {isBn
                ? "এখানে আপনার ওয়ার্কআউট ট্র্যাক করতে কোয়েস্ট সম্পন্ন করুন।"
                : "Complete a quest to start tracking your activity here."}
            </p>
          </div>
        </div>

        {/* 2x2 Metric Cards Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* 1. TIME SPENT (Purple) */}
          <div className="leveling-metric-purple rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-300">
              {isBn ? "সময় ব্যয়" : "TIME SPENT"}
            </span>
            <div className="my-3 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-950/60 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <Hourglass className="h-7 w-7 text-purple-300 animate-pulse" />
              </div>
            </div>
            <div className="text-left">
              <span className="text-xl font-black text-white">
                {workoutDurationMinutes}{" "}
                <span className="text-xs font-medium text-zinc-400">m</span>
              </span>
            </div>
          </div>

          {/* 2. XP GAIN (Gold) */}
          <div className="leveling-metric-gold rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
              {isBn ? "এক্সপি লাভ" : "XP GAIN"}
            </span>
            <div className="my-3 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-950/60 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <ChevronsUp className="h-7 w-7 text-amber-300 animate-pulse" />
              </div>
            </div>
            <div className="text-left">
              <span className="text-xl font-black text-white">
                {xpEarnedToday}{" "}
                <span className="text-xs font-medium text-zinc-400">XP</span>
              </span>
            </div>
          </div>

          {/* 3. DISTANCE (Cyan) */}
          <div className="leveling-metric-cyan rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
              {isBn ? "দূরত্ব" : "DISTANCE"}
            </span>
            <div className="my-3 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-950/60 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Route className="h-7 w-7 text-cyan-300" />
              </div>
            </div>
            <div className="text-left">
              <span className="text-xl font-black text-white">
                {displayDistance}{" "}
                <span className="text-xs font-medium text-zinc-400">km</span>
              </span>
            </div>
          </div>

          {/* 4. CALORIES (Orange) */}
          <div className="leveling-metric-orange rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-300">
              {isBn ? "ক্যালোরি" : "CALORIES"}
            </span>
            <div className="my-3 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-950/60 border border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                <Flame className="h-7 w-7 text-orange-400" />
              </div>
            </div>
            <div className="text-left">
              <span className="text-xl font-black text-white">
                {displayCalories}{" "}
                <span className="text-xs font-medium text-zinc-400">kcal</span>
              </span>
            </div>
          </div>
        </div>

        {/* Heart Rate / BPM Tracker Card */}
        <div className="rounded-2xl border border-pink-500/25 bg-gradient-to-r from-pink-950/20 via-[#0a1226] to-purple-950/20 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handleMeasureBpm}
              disabled={measuringBpm}
              className="btn btn-sm btn-outline btn-secondary gap-1.5 rounded-full"
            >
              <Heart className={`h-3.5 w-3.5 text-pink-400 ${measuringBpm ? "animate-ping" : ""}`} />
              <span>{measuringBpm ? (isBn ? "পরিমাপ হচ্ছে..." : "Measuring...") : (isBn ? "এখনই পরিমাপ করুন" : "Measure now")}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 divide-x divide-zinc-800 text-center">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                {isBn ? "কোয়েস্টের পূর্বে" : "Before Quest"}
              </span>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <Heart className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-lg font-black text-white">
                  {bpmBefore ? bpmBefore : "--"}
                </span>
                <span className="text-[10px] text-zinc-500">bpm</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                {isBn ? "কোয়েস্টের পরে" : "After Quest"}
              </span>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <Heart className="h-3.5 w-3.5 text-red-400" />
                <span className="text-lg font-black text-white">
                  {bpmAfter ? bpmAfter : "--"}
                </span>
                <span className="text-[10px] text-zinc-500">bpm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Analytics Locked Teaser (Matches WhatsApp Image 2026-10-20 at 11.28.36 PM (2).jpeg) */}
        <div className="rounded-2xl border border-amber-500/30 bg-[#0d1624] p-4 text-center">
          <div className="flex justify-center mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <Trophy className="h-5 w-5" />
            </div>
          </div>
          <h4 className="text-sm font-black text-amber-300 uppercase tracking-wider">
            {isBn ? "উন্নত বিশ্লেষণ ও প্রজেকশন" : "Advanced Analytics"}
          </h4>
          <p className="text-[11px] text-zinc-400 max-w-xs mx-auto mt-1 leading-relaxed">
            {isBn
              ? "আপনার সম্পূর্ণ অগ্রগতির ইতিহাস আনলক করুন: এক্সপি, র‍্যাঙ্ক, বিপিএম ও ব্যায়ামের ভলিউম।"
              : "Unlock your full progression history: XP, ranks, BPM, exercise volume and body metrics."}
          </p>

          <div className="mt-3 space-y-1.5 text-left text-xs font-medium text-zinc-300">
            {[
              isBn ? "লাইফটাইম এক্সপি ও লেভেল কার্ভ" : "Lifetime XP and level curve",
              isBn ? "র‍্যাঙ্ক অগ্রগতির টাইমলাইন" : "Rank progression timeline",
              isBn ? "লেভেল ও র‍্যাঙ্ক প্রজেকশন" : "Level and rank projection",
              isBn ? "ব্যক্তিগত সেরা রেকর্ড (PRs)" : "Personal records per exercise",
            ].map((feature, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-zinc-800">
                <span>{feature}</span>
                <Lock className="h-3.5 w-3.5 text-amber-400/80" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
