"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Crown,
  Dumbbell,
  Scale,
  Flame,
  Zap,
  Activity,
  Heart,
  Shield,
  Clock,
  Swords,
  Radio,
  CheckCircle2,
  X,
} from "lucide-react";
import type { Language } from "@/lib/i18n";
import {
  type Profile,
  type Level,
  type Goal,
  type Gender,
  type Activity as ActivityType,
  type Equipment,
  EQUIPMENT,
  EQUIPMENT_PRESETS,
  DEFAULT_PROFILE,
} from "@/lib/types";
import {
  profileStats,
  cmToFtIn,
  ftInToCm,
  kgToLbs,
  lbsToKg,
} from "@/lib/calc";
import { playSound, vibrate } from "@/lib/audio";
import {
  getDefaultPlayerStats,
  savePlayerStats,
  loadPlayerStats,
  type PlayerStats,
} from "@/lib/systemStats";

interface Props {
  open: boolean;
  initialProfile?: Profile | null;
  initialName?: string;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onComplete: (profile: Profile, hunterName: string) => void;
  onClose?: () => void;
}

export function SoloLevelingWelcomeOnboarding({
  open,
  initialProfile,
  initialName = "Sung Jin-woo",
  lang,
  onLanguageChange,
  onComplete,
  onClose,
}: Props) {
  const isBn = lang === "bn";

  // Stepper: 1: Invitation & Name, 2: Biometrics, 3: Goal & Split, 4: Equipment, 5: Awakening
  const [step, setStep] = useState<number>(1);

  // Form State
  const [hunterName, setHunterName] = useState<string>(initialName);
  const [gender, setGender] = useState<Gender>(initialProfile?.gender ?? "male");
  const [age, setAge] = useState<number>(initialProfile?.age ?? 24);
  const [heightCm, setHeightCm] = useState<number>(initialProfile?.heightCm ?? 175);
  const [weightKg, setWeightKg] = useState<number>(initialProfile?.weightKg ?? 70);
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric");

  // Imperial helper state
  const initFtIn = cmToFtIn(initialProfile?.heightCm ?? 175);
  const [feet, setFeet] = useState<number>(initFtIn.feet);
  const [inches, setInches] = useState<number>(initFtIn.inches);
  const [weightLbs, setWeightLbs] = useState<number>(Math.round(kgToLbs(initialProfile?.weightKg ?? 70)));

  const [goal, setGoal] = useState<Goal>(initialProfile?.goal ?? "muscle");
  const [level, setLevel] = useState<Level>(initialProfile?.level ?? "intermediate");
  const [activity, setActivity] = useState<ActivityType>(initialProfile?.activity ?? "moderate");
  const [workoutDays, setWorkoutDays] = useState<number[]>(initialProfile?.workoutDays ?? [1, 3, 5]);
  const [minutes, setMinutes] = useState<20 | 30 | 45 | 60>(initialProfile?.minutes ?? 45);
  const [equipment, setEquipment] = useState<Equipment[]>(initialProfile?.equipment ?? ["dumbbells", "pullup_bar"]);
  const [lowImpact, setLowImpact] = useState<boolean>(initialProfile?.lowImpact ?? false);

  if (!open) return null;

  // Real-time computed biometrics
  const stats = profileStats({
    gender,
    age,
    heightCm,
    weightKg,
    activity,
  });

  const nextStep = () => {
    playSound("system-click");
    vibrate(20);
    setStep((prev) => Math.min(5, prev + 1));
  };

  const prevStep = () => {
    playSound("system-click");
    vibrate(15);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinish = () => {
    playSound("arise");
    vibrate([80, 120, 80, 200]);

    const finalProfile: Profile = {
      gender,
      age: Number(age) || 24,
      heightCm: Number(heightCm) || 175,
      weightKg: Number(weightKg) || 70,
      activity,
      level,
      goal,
      dietGoal: goal === "muscle" ? "muscle" : goal === "endurance" ? "endurance" : "recomp",
      equipment,
      focus: "full",
      minutes,
      lowImpact,
      limitations: "",
      workoutDays,
    };

    // Update Player Stats with Hunter Name
    const currentStats = loadPlayerStats();
    const updatedStats: PlayerStats = {
      ...currentStats,
      name: hunterName.trim() || (isBn ? "সুং জিন-উ" : "Sung Jin-woo"),
    };
    savePlayerStats(updatedStats);

    onComplete(finalProfile, updatedStats.name);
  };

  const toggleEquipment = (eqId: Equipment) => {
    playSound("system-click");
    setEquipment((prev) =>
      prev.includes(eqId) ? prev.filter((x) => x !== eqId) : [...prev, eqId]
    );
  };

  const applyEquipmentPreset = (presetEq: Equipment[]) => {
    playSound("system-click");
    setEquipment(presetEq);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-5 backdrop-blur-2xl overflow-y-auto font-mono text-zinc-100 system-scanlines">
      {/* Outer Holographic System Window */}
      <div className="relative w-full max-w-2xl rounded-2xl border-2 border-cyan-400 bg-gradient-to-b from-[#05112e]/98 via-[#07153a]/95 to-[#020510]/98 p-5 sm:p-7 shadow-[0_0_60px_rgba(6,182,212,0.45)] text-zinc-100 my-auto">
        {/* Manhwa Luminous Corner Diamonds */}
        <div className="absolute top-2 left-2 text-cyan-400 text-xs select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>
        <div className="absolute top-2 right-2 text-cyan-400 text-xs select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>
        <div className="absolute bottom-2 left-2 text-cyan-400 text-xs select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>
        <div className="absolute bottom-2 right-2 text-cyan-400 text-xs select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>

        {/* Top Header Bar: System Title & Language Toggle */}
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
                {isBn ? "[ সিস্টেম জাগরণ ও খেলোয়াড় রেজিস্ট্রি ]" : "[ SYSTEM AWAKENING & PLAYER REGISTRY ]"}
              </span>
              <h2 className="text-base sm:text-lg font-black text-white uppercase text-glow-cyan">
                {isBn ? "হান্টার ক্যালিব্রেশন প্রোটোকল" : "HUNTER CALIBRATION PROTOCOL"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              type="button"
              id="onboarding-lang-toggle"
              onClick={() => {
                playSound("system-click");
                onLanguageChange(isBn ? "en" : "bn");
              }}
              className="system-btn-chamfer flex h-9 items-center gap-1.5 border border-cyan-400/60 bg-[#03081a] px-2.5 text-xs font-bold text-cyan-300 hover:border-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)] cursor-pointer"
            >
              <Radio className="h-3 w-3 text-cyan-400 animate-pulse" />
              <span className="font-black">{isBn ? "EN" : "বাংলা"}</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={() => {
                  playSound("system-click");
                  onClose();
                }}
                className="system-btn-chamfer h-9 w-9 flex items-center justify-center border border-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Step Progress Indicators */}
        <div className="mb-5">
          <div className="flex justify-between items-center text-[10px] text-cyan-400/80 mb-1.5 uppercase font-bold tracking-wider">
            <span>
              {isBn ? `ধাপ ${step} / ৫ : ` : `PHASE ${step} OF 5 : `}
              {step === 1 && (isBn ? "খেলোয়াড় পরিচিতি" : "HUNTER IDENTIFICATION")}
              {step === 2 && (isBn ? "শারীরিক পরিমাপ" : "BIOMETRIC SCAN")}
              {step === 3 && (isBn ? "ফিটনেস লক্ষ্য" : "COMBAT AMBITION")}
              {step === 4 && (isBn ? "প্রশিক্ষণ সরঞ্জাম" : "ARSENAL CALIBRATION")}
              {step === 5 && (isBn ? "সিস্টেম জাগরণ" : "SYSTEM ASCENSION")}
            </span>
            <span className="text-white font-mono font-black">{step * 20}%</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s <= step
                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                    : "bg-zinc-800"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ============================================================== */}
        {/* STEP 1: SYSTEM INVITATION & HUNTER ALIAS */}
        {/* ============================================================== */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="rounded-xl border border-cyan-500/40 bg-[#020512]/90 p-4 shadow-inner space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-black uppercase tracking-wider">
                <Sparkles className="h-4 w-4 text-cyan-400 animate-spin" />
                <span>
                  {isBn
                    ? "[ জরুরি নোটিফিকেশন : আপনি নির্বাচিত হয়েছেন ]"
                    : "[ SYSTEM NOTIFICATION : YOU HAVE BEEN CHOSEN ]"}
                </span>
              </div>
              <p className="text-xs text-cyan-200/80 leading-relaxed">
                {isBn
                  ? "স্বাগতম, হান্টার! সোলো লেভেলিং সিস্টেম আপনার শারীরিক সামর্থ্য পর্যবেক্ষণ করছে। আপনি কি একজন সক্রিয় খেলোয়াড় হিসেবে জেগে উঠতে প্রস্তুত?"
                  : "Welcome, Hunter. The System has recognized your latent potential. Prepare your physical vessel to embark on daily quests, conquer dungeon raids, and ascend from E-Rank to the Monarch of Shadows."}
              </p>
            </div>

            {/* Cinematic Solo Leveling Banner Frame */}
            <div className="relative h-40 sm:h-48 w-full rounded-xl overflow-hidden border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Image
                src="/images/solo-leveling/system-monarch-banner.jpg"
                alt="Solo Leveling Awakening"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020510] via-[#020510]/40 to-transparent flex flex-col justify-end p-3.5">
                <span className="text-[10px] text-cyan-400 uppercase font-black tracking-widest">
                  {isBn ? "খেলোয়াড় স্ট্যাটাস : ই-র‍্যাঙ্ক ক্যান্ডিডেট" : "PLAYER STATUS : E-RANK CANDIDATE"}
                </span>
                <span className="text-sm font-black text-white text-glow-cyan uppercase">
                  {isBn ? "দৈনিক কোয়েস্ট: শক্তিশালী হওয়ার প্রস্তুতি" : "DAILY QUEST: PREPARATIONS TO BECOME STRONG"}
                </span>
              </div>
            </div>

            {/* Hunter Name Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-cyan-300">
                {isBn ? "আপনার হান্টার নাম / ছদ্মনাম" : "YOUR HUNTER NAME / ALIAS"}
              </label>
              <input
                type="text"
                value={hunterName}
                onChange={(e) => setHunterName(e.target.value)}
                placeholder={isBn ? "যেমন: সুং জিন-উ / আপনার নাম" : "e.g. Sung Jin-woo / Your Name"}
                className="w-full rounded-xl border border-cyan-500/40 bg-black/80 p-3 text-sm font-bold text-white placeholder:text-zinc-600 focus:border-cyan-400 focus:outline-none focus:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
              />

              {/* Quick Preset Names */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                <span className="text-[10px] text-zinc-500 uppercase">{isBn ? "দ্রুত নির্বাচন:" : "Quick Picks:"}</span>
                {["Sung Jin-woo", "Shadow Hunter", "Monarch Candidate"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      playSound("system-click");
                      setHunterName(preset);
                    }}
                    className="system-btn-chamfer px-2 py-0.5 text-[10px] border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 hover:border-cyan-400 cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 2: BIOMETRIC SCAN & METRICS */}
        {/* ============================================================== */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">
                {isBn ? "[ বায়োমেট্রিক স্ক্যান ও হিসাব ]" : "[ BIOMETRIC SCAN & VITALS ]"}
              </span>

              {/* Unit Switcher */}
              <div className="flex gap-1 rounded-lg border border-cyan-500/30 bg-black/70 p-0.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => {
                    playSound("system-click");
                    setUnitSystem("metric");
                  }}
                  className={`rounded px-2 py-0.5 font-bold transition-all ${
                    unitSystem === "metric"
                      ? "bg-cyan-500 text-black shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Metric (kg/cm)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound("system-click");
                    setUnitSystem("imperial");
                  }}
                  className={`rounded px-2 py-0.5 font-bold transition-all ${
                    unitSystem === "imperial"
                      ? "bg-cyan-500 text-black shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Imperial (lbs/ft)
                </button>
              </div>
            </div>

            {/* Gender & Age */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  {isBn ? "লিঙ্গ (Gender)" : "Gender"}
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full rounded-xl border border-cyan-500/30 bg-black/80 p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="male">{isBn ? "পুরুষ (Male)" : "Male"}</option>
                  <option value="female">{isBn ? "নারী (Female)" : "Female"}</option>
                  <option value="other">{isBn ? "অন্যান্য (Other)" : "Other"}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  {isBn ? "বয়স (Age)" : "Age"}
                </label>
                <input
                  type="number"
                  min="12"
                  max="99"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value) || 24)}
                  className="w-full rounded-xl border border-cyan-500/30 bg-black/80 p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Height & Weight */}
            {unitSystem === "metric" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                    {isBn ? "উচ্চতা (Height - cm)" : "Height (cm)"}
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={heightCm}
                    onChange={(e) => {
                      const cm = Number(e.target.value);
                      setHeightCm(cm);
                      const fi = cmToFtIn(cm);
                      setFeet(fi.feet);
                      setInches(fi.inches);
                    }}
                    className="w-full rounded-xl border border-cyan-500/30 bg-black/80 p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                    {isBn ? "ওজন (Weight - kg)" : "Weight (kg)"}
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="250"
                    step="0.5"
                    value={weightKg}
                    onChange={(e) => {
                      const kg = Number(e.target.value);
                      setWeightKg(kg);
                      setWeightLbs(Math.round(kgToLbs(kg)));
                    }}
                    className="w-full rounded-xl border border-cyan-500/30 bg-black/80 p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none font-mono"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                    {isBn ? "ফুট (Feet)" : "Feet"}
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="8"
                    value={feet}
                    onChange={(e) => {
                      const ft = Number(e.target.value);
                      setFeet(ft);
                      setHeightCm(ftInToCm(ft, inches));
                    }}
                    className="w-full rounded-xl border border-cyan-500/30 bg-black/80 p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                    {isBn ? "ইঞ্চি (Inches)" : "Inches"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={inches}
                    onChange={(e) => {
                      const inc = Number(e.target.value);
                      setInches(inc);
                      setHeightCm(ftInToCm(feet, inc));
                    }}
                    className="w-full rounded-xl border border-cyan-500/30 bg-black/80 p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                    {isBn ? "ওজন (lbs)" : "Weight (lbs)"}
                  </label>
                  <input
                    type="number"
                    min="60"
                    max="500"
                    value={weightLbs}
                    onChange={(e) => {
                      const lbs = Number(e.target.value);
                      setWeightLbs(lbs);
                      setWeightKg(Math.round(lbsToKg(lbs) * 10) / 10);
                    }}
                    className="w-full rounded-xl border border-cyan-500/30 bg-black/80 p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none font-mono"
                  />
                </div>
              </div>
            )}

            {/* Daily Physical Activity Factor */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                {isBn ? "দৈনিক শারীরিক পরিশ্রমের মাত্রা" : "Daily Activity Level"}
              </label>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value as ActivityType)}
                className="w-full rounded-xl border border-cyan-500/30 bg-black/80 p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="sedentary">{isBn ? "বসে থাকা জীবন (ডেস্ক কাজ, কম নড়াচড়া)" : "Sedentary (desk job, low movement)"}</option>
                <option value="light">{isBn ? "হালকা সক্রিয় (সপ্তাহে ১-৩ দিন ব্যায়াম)" : "Light (1-3 workout sessions / week)"}</option>
                <option value="moderate">{isBn ? "মাঝারি সক্রিয় (সপ্তাহে ৩-৫ দিন ব্যায়াম)" : "Moderate (3-5 sessions / week)"}</option>
                <option value="active">{isBn ? "বেশ সক্রিয় (সপ্তাহে ৬-৭ দিন ব্যায়াম)" : "Active (6-7 sessions / week)"}</option>
                <option value="very_active">{isBn ? "অতিরিক্ত সক্রিয় (শারীরিক কাজ ও ভারী ট্রেনিং)" : "Very Active (physical work & heavy training)"}</option>
              </select>
            </div>

            {/* Real-time Telemetry Cards */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="system-btn-chamfer border border-cyan-500/30 bg-[#020512] p-2.5 text-center">
                <span className="text-[10px] text-cyan-400 block font-bold">BMI</span>
                <span className="text-sm font-black text-white">{stats.bmi}</span>
                <span className="text-[9px] text-zinc-400 block truncate">{stats.bmiCategory}</span>
              </div>
              <div className="system-btn-chamfer border border-cyan-500/30 bg-[#020512] p-2.5 text-center">
                <span className="text-[10px] text-cyan-400 block font-bold">BMR</span>
                <span className="text-sm font-black text-white">{stats.bmr}</span>
                <span className="text-[9px] text-zinc-400 block">kcal/day</span>
              </div>
              <div className="system-btn-chamfer border border-cyan-500/30 bg-[#020512] p-2.5 text-center">
                <span className="text-[10px] text-cyan-400 block font-bold">TDEE</span>
                <span className="text-sm font-black text-white">{stats.tdee}</span>
                <span className="text-[9px] text-zinc-400 block">kcal/day</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 3: COMBAT AMBITION & ROUTINE */}
        {/* ============================================================== */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <span className="text-xs font-black text-cyan-400 uppercase tracking-wider block mb-2">
                {isBn ? "[ প্রধান ফিটনেস লক্ষ্য নির্বাচন করুন ]" : "[ PRIMARY FITNESS GOAL ]"}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: "muscle" as Goal,
                    title: isBn ? "মাসল বৃদ্ধি" : "Build Muscle",
                    desc: isBn ? "পেশীবহুল শরীর (+৩০০ ক্যালোরি)" : "Hypertrophy (+300 kcal)",
                    icon: Dumbbell,
                  },
                  {
                    id: "strength" as Goal,
                    title: isBn ? "শক্তি বৃদ্ধি" : "Pure Strength",
                    desc: isBn ? "ভারোত্তোলন শক্তি (ক্যালোরি ব্যালেন্স)" : "Peak power (Maintenance)",
                    icon: Zap,
                  },
                  {
                    id: "endurance" as Goal,
                    title: isBn ? "ওজন ও চর্বি কমানো" : "Fat Loss",
                    desc: isBn ? "ক্ষিপ্রতা ও ফ্যাট বার্ন (-৩৫০ ক্যালোরি)" : "Agility & deficit (-350 kcal)",
                    icon: Flame,
                  },
                ].map((item) => {
                  const isSelected = goal === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        playSound("system-click");
                        setGoal(item.id);
                      }}
                      className={`system-btn-chamfer p-3 text-left border transition-all cursor-pointer ${
                        isSelected
                          ? "border-cyan-400 bg-cyan-950/60 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                          : "border-zinc-800 bg-black/60 hover:border-cyan-500/40 opacity-80"
                      }`}
                    >
                      <Icon className={`h-5 w-5 mb-1.5 ${isSelected ? "text-cyan-400" : "text-zinc-500"}`} />
                      <div className="text-xs font-black text-white uppercase">{item.title}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5 leading-snug">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Weekly Workout Days Preset */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                {isBn ? "সাপ্তাহিক রেইড সময়সূচী (Workout Days)" : "Weekly Raid Schedule"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { days: [1, 3, 5], label: isBn ? "৩ দিন (PPL)" : "3 Days (PPL)" },
                  { days: [1, 2, 4, 5], label: isBn ? "৪ দিন (Upper/Lower)" : "4 Days (Upper/Lower)" },
                  { days: [1, 2, 3, 4, 5], label: isBn ? "৫ দিন (হাইপারট্রফি)" : "5 Days (Hypertrophy)" },
                ].map((p, idx) => {
                  const isMatch =
                    workoutDays.length === p.days.length &&
                    p.days.every((d) => workoutDays.includes(d));
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        playSound("system-click");
                        setWorkoutDays(p.days);
                      }}
                      className={`system-btn-chamfer p-2.5 text-center text-xs font-black border transition-all cursor-pointer ${
                        isMatch
                          ? "border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-sm"
                          : "border-zinc-800 bg-black/60 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Experience Level & Session Length */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  {isBn ? "দক্ষতার মাত্রা (Level)" : "Experience Level"}
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as Level)}
                  className="w-full rounded-xl border border-cyan-500/30 bg-black/80 p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="beginner">{isBn ? "বিগিনার (Beginner)" : "Beginner"}</option>
                  <option value="intermediate">{isBn ? "মাঝারি (Intermediate)" : "Intermediate"}</option>
                  <option value="advanced">{isBn ? "অ্যাডভান্সড (Advanced)" : "Advanced"}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  {isBn ? "প্রতি সেশনের দৈর্ঘ্য" : "Session Duration"}
                </label>
                <select
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value) as any)}
                  className="w-full rounded-xl border border-cyan-500/30 bg-black/80 p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none font-mono"
                >
                  <option value={20}>20 {isBn ? "মিনিট" : "Minutes"}</option>
                  <option value={30}>30 {isBn ? "মিনিট" : "Minutes"}</option>
                  <option value={45}>45 {isBn ? "মিনিট" : "Minutes"}</option>
                  <option value={60}>60 {isBn ? "মিনিট" : "Minutes"}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 4: ARSENAL & EQUIPMENT */}
        {/* ============================================================== */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">
                {isBn ? "[ প্রশিক্ষণ সরঞ্জাম নির্বাচন করুন ]" : "[ COMBAT EQUIPMENT ARSENAL ]"}
              </span>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 text-xs">
                {EQUIPMENT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyEquipmentPreset(preset.equipment)}
                    className="system-btn-chamfer px-2 py-0.5 text-[10px] font-bold border border-cyan-500/30 bg-black/60 text-zinc-300 hover:text-cyan-300 hover:border-cyan-400 cursor-pointer"
                  >
                    {preset.id === "bodyweight"
                      ? isBn ? "বডিওয়েট" : "Bodyweight"
                      : preset.id === "home"
                      ? isBn ? "হোম জিম" : "Home"
                      : isBn ? "ফুল জিম" : "Full Gym"}
                  </button>
                ))}
              </div>
            </div>

            {/* Equipment Chips Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {EQUIPMENT.map((item) => {
                const isSelected = equipment.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleEquipment(item.id)}
                    className={`system-btn-chamfer p-2.5 text-left border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-950/60 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                        : "border-zinc-800 bg-black/60 text-zinc-400 hover:border-cyan-500/40"
                    }`}
                  >
                    <span className="text-xs font-bold leading-tight">{item.label}</span>
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 ml-1.5 ${
                        isSelected ? "text-cyan-400 opacity-100" : "opacity-0"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Joint-Friendly / Low-Impact Safety Check */}
            <label className="flex items-start gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-3 text-xs text-zinc-200 cursor-pointer">
              <input
                type="checkbox"
                checked={lowImpact}
                onChange={(e) => setLowImpact(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-emerald-400 shrink-0"
              />
              <div>
                <span className="font-bold text-emerald-300 block">
                  {isBn ? "জয়েন্ট-ফ্রেন্ডলি সেফটি মোড (Joint-Friendly)" : "Joint-Friendly Safety Mode"}
                </span>
                <span className="text-[11px] text-zinc-400 leading-snug">
                  {isBn
                    ? "হাঁটু বা কোমরে অতিরিক্ত চাপ সৃষ্টিকারী ভারী লাফঝাঁপ এড়িয়ে চলা হবে।"
                    : "Eliminates high-impact plyometrics and ballistic knee stress movements."}
                </span>
              </div>
            </label>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 5: FINAL SYSTEM AWAKENING & HUNTER LICENSE */}
        {/* ============================================================== */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Holographic Hunter ID Card */}
            <div className="relative rounded-2xl border-2 border-cyan-400 bg-gradient-to-br from-[#061845] via-[#091538] to-[#030818] p-4 sm:p-5 shadow-[0_0_35px_rgba(6,182,212,0.5)] overflow-hidden">
              <div className="flex items-center justify-between border-b border-cyan-400/40 pb-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-14 rounded-xl overflow-hidden border-2 border-cyan-400 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.6)]">
                    <Image
                      src="/images/solo-leveling/monarch-player-avatar.jpg"
                      alt="Player Avatar"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-cyan-400 font-mono font-black uppercase tracking-widest block">
                      HUNTER LICENSE #00492-SL
                    </span>
                    <h3 className="text-lg font-black text-white uppercase text-glow-cyan">
                      {hunterName || "Sung Jin-woo"}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-purple-300 font-bold">
                      <Crown className="h-3.5 w-3.5 text-purple-400" />
                      <span>{isBn ? "ই-র‍্যাঙ্ক ক্যান্ডিডেট (E-Rank)" : "E-Rank Candidate"}</span>
                      <span className="text-zinc-500">·</span>
                      <span className="text-cyan-300">Lv.1</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded text-xs font-black bg-cyan-400 text-black shadow-md uppercase">
                    AWAKENED
                  </span>
                </div>
              </div>

              {/* Status Gauges */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-2 text-xs font-mono">
                <div className="bg-red-950/40 border border-red-500/40 rounded-lg p-2">
                  <span className="text-[10px] text-red-400 font-black block">HP</span>
                  <span className="font-bold text-white">100 / 100</span>
                </div>
                <div className="bg-blue-950/40 border border-blue-500/40 rounded-lg p-2">
                  <span className="text-[10px] text-cyan-400 font-black block">MP</span>
                  <span className="font-bold text-white">50 / 50</span>
                </div>
                <div className="bg-amber-950/40 border border-amber-500/40 rounded-lg p-2">
                  <span className="text-[10px] text-amber-400 font-black block">FATIGUE</span>
                  <span className="font-bold text-white">0%</span>
                </div>
              </div>

              {/* Unlocked Daily Quest Banner */}
              <div className="mt-3 rounded-xl border border-purple-500/40 bg-purple-950/30 p-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-purple-400 shrink-0" />
                  <span className="font-bold text-purple-200">
                    {isBn
                      ? "দৈনিক কোয়েস্ট আনলক হয়েছে: ১০০ পুশ-আপ, ১০০ সিট-আপ, ১০০ স্কোয়াট, ১০ কিমি রান"
                      : "Daily Quest Unlocked: 100 Push-ups, 100 Sit-ups, 100 Squats, 10km Run"}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-black uppercase shrink-0">
                  +3 STAT PTS
                </span>
              </div>
            </div>

            {/* Motivational Awakening Speech */}
            <p className="text-xs text-center text-cyan-200/80 leading-relaxed font-mono px-2">
              {isBn
                ? "সিস্টেম সক্রিয় করার সাথে সাথেই আপনার প্রথম ওয়ার্কআউট সেশন ও দৈনিক রুটিন লোড হবে। আপনি কি সিস্টেমে প্রবেশ করতে চান?"
                : "Upon activating The System, your calibrated workout deployment and first dungeon raid will be initialized. Will you Arise?"}
            </p>
          </div>
        )}

        {/* Bottom Stepper Navigation Controls */}
        <div className="flex items-center justify-between border-t border-cyan-500/30 pt-4 mt-5">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="system-btn-chamfer flex min-h-[42px] items-center gap-1.5 border border-zinc-700 bg-black/60 px-4 text-xs font-bold text-zinc-300 hover:text-white hover:border-cyan-400 transition-all cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>{isBn ? "পূর্ববর্তী" : "Back"}</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="system-btn-chamfer flex min-h-[42px] items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 px-6 text-xs font-black uppercase text-black hover:brightness-110 shadow-[0_0_15px_rgba(6,182,212,0.5)] active:scale-95 transition-all cursor-pointer"
            >
              <span>{isBn ? "পরবর্তী ধাপ" : "Proceed"}</span>
              <ChevronRight className="h-4 w-4 stroke-[3]" />
            </button>
          ) : (
            <button
              type="button"
              id="btn-confirm-arise"
              onClick={handleFinish}
              className="system-btn-chamfer flex min-h-[48px] items-center gap-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 px-8 text-sm font-black uppercase text-black hover:brightness-110 shadow-[0_0_30px_rgba(6,182,212,0.8)] active:scale-95 transition-all cursor-pointer tracking-wider"
            >
              <Sparkles className="h-4 w-4 text-black animate-spin" />
              <span>{isBn ? "◆ ARISE : জাগ্রত হও ◆" : "◆ ARISE : ACCEPT SYSTEM ◆"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
