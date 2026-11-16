"use client";

import React, { useState, useMemo } from "react";
import { Dumbbell, Trophy, Info, Zap, Flame, Award, ChevronRight } from "lucide-react";
import { oneRepMax, dotsScore, strengthClassification, kgToLbs, lbsToKg } from "@/lib/calc";
import { playSound } from "@/lib/audio";
import type { Gender } from "@/lib/types";
import type { Language } from "@/lib/i18n";

interface StrengthCalculatorProps {
  lang?: Language;
  defaultGender?: Gender;
  defaultBodyweightKg?: number;
  className?: string;
  compact?: boolean;
}

export function StrengthCalculatorCard({
  lang = "bn",
  defaultGender = "male",
  defaultBodyweightKg = 70,
  className = "",
  compact = false,
}: StrengthCalculatorProps) {
  const isBn = lang === "bn";
  const [activeTab, setActiveTab] = useState<"1rm" | "dots">("1rm");
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");

  // 1RM States
  const [weightInput, setWeightInput] = useState<string>("80");
  const [repsInput, setRepsInput] = useState<number>(5);

  // DOTS States
  const [dotsGender, setDotsGender] = useState<Gender>(defaultGender);
  const [bodyweightInput, setBodyweightInput] = useState<string>(String(defaultBodyweightKg));
  const [totalLiftInput, setTotalLiftInput] = useState<string>("350");

  // Convert weights to kg for calculations
  const weightKg = useMemo(() => {
    const val = parseFloat(weightInput) || 0;
    return unit === "lbs" ? lbsToKg(val) : val;
  }, [weightInput, unit]);

  const bodyweightKg = useMemo(() => {
    const val = parseFloat(bodyweightInput) || 0;
    return unit === "lbs" ? lbsToKg(val) : val;
  }, [bodyweightInput, unit]);

  const totalLiftKg = useMemo(() => {
    const val = parseFloat(totalLiftInput) || 0;
    return unit === "lbs" ? lbsToKg(val) : val;
  }, [totalLiftInput, unit]);

  // 1RM Calculations
  const orm = useMemo(() => {
    return oneRepMax(weightKg, repsInput);
  }, [weightKg, repsInput]);

  const displayOrm = useMemo(() => {
    const val = unit === "lbs" ? kgToLbs(orm.average) : orm.average;
    return Math.round(val * 10) / 10;
  }, [orm.average, unit]);

  // Percentage table
  const percentageTable = useMemo(() => {
    const base = unit === "lbs" ? kgToLbs(orm.average) : orm.average;
    return [
      { percent: 95, reps: "1-2 reps", weight: Math.round(base * 0.95 * 10) / 10, label: isBn ? "ম্যাক্স শক্তি" : "Max Strength" },
      { percent: 90, reps: "3-4 reps", weight: Math.round(base * 0.90 * 10) / 10, label: isBn ? "পাওয়ার" : "Power" },
      { percent: 85, reps: "5-6 reps", weight: Math.round(base * 0.85 * 10) / 10, label: isBn ? "ভারী হাইপারট্রফি" : "Heavy Hypertrophy" },
      { percent: 80, reps: "7-8 reps", weight: Math.round(base * 0.80 * 10) / 10, label: isBn ? "স্ট্যান্ডার্ড মাসল" : "Hypertrophy" },
      { percent: 75, reps: "9-10 reps", weight: Math.round(base * 0.75 * 10) / 10, label: isBn ? "ভলিউম" : "Volume" },
      { percent: 70, reps: "11-12 reps", weight: Math.round(base * 0.70 * 10) / 10, label: isBn ? "সহনশীলতা" : "Endurance" },
    ];
  }, [orm.average, unit, isBn]);

  // DOTS Calculations
  const dots = useMemo(() => {
    return dotsScore(dotsGender, bodyweightKg, totalLiftKg);
  }, [dotsGender, bodyweightKg, totalLiftKg]);

  const classification = useMemo(() => {
    return strengthClassification(dots);
  }, [dots]);

  // Rank Badge Styles
  const getRankBadge = (tier: string) => {
    switch (tier) {
      case "International / S-Rank Elite":
        return { color: "text-amber-400 border-amber-500/50 bg-amber-950/40 shadow-[0_0_15px_rgba(245,158,11,0.4)]", rank: "S-RANK" };
      case "Master / Elite":
        return { color: "text-purple-400 border-purple-500/50 bg-purple-950/40 shadow-[0_0_15px_rgba(168,85,247,0.4)]", rank: "A-RANK" };
      case "Advanced":
        return { color: "text-cyan-400 border-cyan-500/50 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.4)]", rank: "B-RANK" };
      case "Intermediate":
        return { color: "text-blue-400 border-blue-500/50 bg-blue-950/40 shadow-[0_0_15px_rgba(59,130,246,0.3)]", rank: "C-RANK" };
      default:
        return { color: "text-zinc-400 border-zinc-600/50 bg-zinc-900/60", rank: "D/E-RANK" };
    }
  };

  const rankInfo = getRankBadge(classification);

  return (
    <div className={`rounded-3xl glass-surface border border-white/10 p-4 sm:p-5 relative overflow-hidden shadow-xl ${className}`}>
      {/* Header & Unit Switcher */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-emerald-400" />
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            {isBn ? "স্ট্রেন্থ ও পারফরম্যান্স ক্যালকুলেটর" : "Strength & 1RM Calculator"}
          </h3>
        </div>

        {/* Unit Toggle */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-[10px]">
          <button
            type="button"
            onClick={() => {
              playSound("click");
              setUnit("kg");
            }}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${unit === "kg" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"}`}
          >
            KG
          </button>
          <button
            type="button"
            onClick={() => {
              playSound("click");
              setUnit("lbs");
            }}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${unit === "lbs" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"}`}
          >
            LBS
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900/80 p-1 border border-slate-800 mb-4 rounded-xl gap-1">
        <button
          type="button"
          onClick={() => {
            playSound("click");
            setActiveTab("1rm");
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "1rm" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
          }`}
        >
          {isBn ? "১-রেপ ম্যাক্স (1RM)" : "1-Rep Max (1RM)"}
        </button>
        <button
          type="button"
          onClick={() => {
            playSound("click");
            setActiveTab("dots");
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "dots" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
          }`}
        >
          {isBn ? "আইপিএফ ডটস স্কোর (DOTS)" : "IPF DOTS Score"}
        </button>
      </div>

      {/* TAB 1: 1RM ESTIMATOR */}
      {activeTab === "1rm" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                {isBn ? `উত্তোলিত ওজন (${unit.toUpperCase()})` : `Lifted Weight (${unit.toUpperCase()})`}
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="input input-sm input-bordered w-full bg-black/70 border-cyan-500/30 text-white font-mono font-bold focus:border-cyan-400"
                placeholder="e.g. 80"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                {isBn ? "পুনরাবৃত্তি (Reps 1-30)" : "Reps (1-30)"}
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={repsInput}
                onChange={(e) => setRepsInput(Math.min(30, Math.max(1, parseInt(e.target.value) || 1)))}
                className="input input-sm input-bordered w-full bg-black/70 border-cyan-500/30 text-white font-mono font-bold focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Rep Slider */}
          <div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1">
              <span>{isBn ? "রেপ অ্যাডজাস্ট" : "Adjust Reps"}</span>
              <span className="text-cyan-400 font-bold">{repsInput} Reps</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={repsInput}
              onChange={(e) => setRepsInput(parseInt(e.target.value))}
              className="range range-xs range-info"
            />
          </div>

          {/* 1RM Result Banner */}
          <div className="rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/40 p-3.5 text-center shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold block mb-0.5">
              {isBn ? "আনুমানিক ১-রেপেশন ম্যাক্সিমাম (1RM)" : "ESTIMATED 1-REP MAXIMUM (1RM)"}
            </span>
            <div className="flex items-baseline justify-center gap-1.5 my-1">
              <span className="text-3xl font-black text-white font-mono drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">
                {displayOrm}
              </span>
              <span className="text-sm font-bold text-cyan-400 font-mono">{unit}</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-[10px] text-zinc-400 font-mono mt-1">
              <span>Epley: <strong className="text-zinc-200">{unit === "lbs" ? kgToLbs(orm.epley) : orm.epley}</strong></span>
              <span>•</span>
              <span>Brzycki: <strong className="text-zinc-200">{unit === "lbs" ? kgToLbs(orm.brzycki) : orm.brzycki}</strong></span>
            </div>
          </div>

          {/* Percentage Target Loads */}
          {!compact && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">
                {isBn ? "প্রশিক্ষণের লোড শতাংশ (Training Loads)" : "Training Load Percentages"}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {percentageTable.map((item) => (
                  <div key={item.percent} className="rounded-lg bg-black/60 border border-cyan-500/20 p-2 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-cyan-400 font-bold">{item.percent}%</span>
                      <span className="text-zinc-400 text-[9px]">{item.reps}</span>
                    </div>
                    <div className="text-sm font-black text-white font-mono mt-0.5">
                      {item.weight} <span className="text-[9px] font-normal text-zinc-500">{unit}</span>
                    </div>
                    <span className="text-[9px] text-zinc-400 truncate mt-0.5">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: IPF DOTS POWERLIFTING SCORE */}
      {activeTab === "dots" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                {isBn ? "লিঙ্গ" : "Gender"}
              </label>
              <select
                value={dotsGender}
                onChange={(e) => setDotsGender(e.target.value as Gender)}
                className="select select-sm select-bordered w-full bg-black/70 border-cyan-500/30 text-white font-mono text-xs focus:border-cyan-400"
              >
                <option value="male">{isBn ? "পুরুষ" : "Male"}</option>
                <option value="female">{isBn ? "নারী" : "Female"}</option>
                <option value="other">{isBn ? "অন্যান্য" : "Other"}</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                {isBn ? `শরীরের ওজন (${unit})` : `Bodyweight (${unit})`}
              </label>
              <input
                type="number"
                min="30"
                max="250"
                value={bodyweightInput}
                onChange={(e) => setBodyweightInput(e.target.value)}
                className="input input-sm input-bordered w-full bg-black/70 border-cyan-500/30 text-white font-mono font-bold focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                {isBn ? `মোট উত্তোলন (${unit})` : `Total Lifted (${unit})`}
              </label>
              <input
                type="number"
                min="0"
                max="1200"
                value={totalLiftInput}
                onChange={(e) => setTotalLiftInput(e.target.value)}
                className="input input-sm input-bordered w-full bg-black/70 border-cyan-500/30 text-white font-mono font-bold focus:border-cyan-400"
                placeholder="Squat+Bench+Deadlift"
              />
            </div>
          </div>

          {/* DOTS Score Display */}
          <div className="rounded-xl border border-cyan-500/40 bg-gradient-to-r from-blue-950/40 via-[#0a1428] to-purple-950/40 p-4 text-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                {isBn ? "আইপিএফ ডটস শক্তি সূচক" : "IPF DOTS COEFFICIENT"}
              </span>
              <div className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black font-mono tracking-wider ${rankInfo.color}`}>
                {rankInfo.rank}
              </div>
            </div>

            <div className="flex items-baseline justify-center gap-2 my-1">
              <span className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">
                {dots.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-zinc-400 font-mono">DOTS</span>
            </div>

            <div className="text-xs font-bold text-white font-mono mt-1">
              {isBn ? `শক্তি শ্রেণী: ${classification}` : `Athletic Tier: ${classification}`}
            </div>

            {/* Scale Gauge */}
            <div className="mt-3">
              <div className="flex justify-between text-[9px] font-mono text-zinc-500 mb-1">
                <span>Novice (&lt;200)</span>
                <span>Inter (200)</span>
                <span>Adv (300)</span>
                <span>Master (380)</span>
                <span>S-Rank (450+)</span>
              </div>
              <progress
                className="progress progress-info w-full bg-black/60 h-2 border border-cyan-500/20"
                value={Math.min(500, Math.max(0, dots))}
                max="500"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-cyan-500/15 text-[11px] text-zinc-400 flex items-start gap-2">
            <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              {isBn
                ? "আন্তর্জাতিক পাওয়ারলিফটিং ফেডারেশন (IPF) অনুমোদিত DOTS সমীকরণ শরীরের ওজন নির্বিশেষে নিরপেক্ষ পরম শক্তি পরিমাপ করে।"
                : "The International Powerlifting Federation (IPF) official DOTS polynomial normalizes strength across all bodyweight categories."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
