"use client";

import { useState } from "react";
import {
  Flame,
  Sparkles,
  Utensils,
  Play,
  Dumbbell,
  Calendar,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  User,
  HeartPulse,
  Activity,
  Zap,
} from "lucide-react";
import { playSound } from "@/lib/audio";
import { type Language, TRANSLATIONS, GOAL_LABELS_I18N } from "@/lib/i18n";
import { type Goal, type Gender } from "@/lib/types";
import {
  profileStats,
  macroTargets,
  AGE_OPTIONS,
  HEIGHT_CM_OPTIONS,
  WEIGHT_KG_OPTIONS,
  formatAgeOption,
  formatHeightCmOption,
  formatWeightKgOption,
} from "@/lib/calc";
import { BmiGauge } from "./BmiGauge";
import { CyberDropdown } from "./CyberDropdown";

interface Props {
  lang: Language;
  onLanguageToggle: () => void;
  onLaunchApp: () => void;
  onOpenAuth: () => void;
  onOpenDiet: () => void;
  onOpenExercises?: () => void;
  userName?: string;
}

export function LandingPage({
  lang,
  onLanguageToggle,
  onLaunchApp,
  onOpenAuth,
  onOpenDiet,
  onOpenExercises,
  userName,
}: Props) {
  const t = TRANSLATIONS[lang] ?? TRANSLATIONS.bn;
  const isBn = lang === "bn";

  // Interactive Quick Calculator state on the Landing page
  const [calcGender, setCalcGender] = useState<Gender>("male");
  const [calcAge, setCalcAge] = useState(25);
  const [calcHeight, setCalcHeight] = useState(172);
  const [calcWeight, setCalcWeight] = useState(68);
  const [calcGoal, setCalcGoal] = useState<Goal>("muscle");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const previewStats = profileStats({
    gender: calcGender,
    age: calcAge,
    heightCm: calcHeight,
    weightKg: calcWeight,
    activity: "moderate",
  });

  const previewMacros = macroTargets(previewStats.tdee, calcWeight, calcGoal);

  const faqs = [
    {
      q: isBn ? "এটি কি সম্পূর্ণ বিনামূল্যে ব্যবহার করা যায়?" : "Is Arise Fitness Coach completely free?",
      a: isBn
        ? "হ্যাঁ! এটি কোনো সাবস্ক্রিপশন ফি বা লুকানো খরচ ছাড়াই সম্পূর্ণ বিনামূল্যে ব্যবহার করা যায়। কোনো ইন্টারনেট সংযোগ ছাড়াই অফলাইনেও এটি পূর্ণাঙ্গভাবে কাজ করে।"
        : "Yes! Arise Fitness operates with zero subscription paywalls, no ads, and no premium tiers. It runs locally and functions fully offline.",
    },
    {
      q: isBn ? "এআই কোচ কীভাবে আমার ওয়ার্কআউট এবং ডায়েট নির্ধারণ করে?" : "How does the AI Coach tailor my workouts and nutrition?",
      a: isBn
        ? "গুগলের Gemini AI আপনার শারীরিক মাপ, উপলব্ধ সরঞ্জাম এবং আগের সেশনের ক্লান্তি বিশ্লেষণ করে সঠিক ব্যায়াম সাজায় এবং দেশীয় সহজলভ্য খাবারের পুষ্টি তালিকা দেয়।"
        : "Gemini AI analyzes your equipment, recovery feedback, and body biometrics to construct tailored training sessions and personalized Bangladeshi meal schedules.",
    },
    {
      q: isBn ? "বাঙালি ডায়েট চার্টে কী ধরনের দেশীয় খাবার অন্তর্ভুক্ত থাকে?" : "What foods are included in the localized nutrition guide?",
      a: isBn
        ? "সহজলভ্য দেশি রুই ও কাতলা মাছ, দেশি মুরগি, ডিম, লাল চালের ভাত, আটার রুটি, মুগ ও মসুর ডাল, ছোলা, বাদাম, শাকসবজি ও টকদই — প্রতিটি আপনার ওজন ও লক্ষ্য অনুযায়ী পরিমাপকৃত।"
        : "Realistic, affordable powerfoods: Rui and Katla fish, eggs, chicken, whole wheat ruti, brown rice, lentils (dal), chana, seasonal vegetables, and sour yogurt.",
    },
    {
      q: isBn ? "আমার শারীরিক তথ্য ও প্রগ্রেস কি নিরাপদ?" : "Is my fitness and biometric data private?",
      a: isBn
        ? "সম্পূর্ণ নিরাপদ। আপনার শারীরিক মাপ ও ওয়ার্কআউট হিস্ট্রি আপনার ডিভাইসের ব্রাউজারে সুরক্ষিতভাবে সংরক্ষিত থাকে। চাইলে আপনি ক্লাউড ব্যাকআপ সিঙ্ক করতে পারেন।"
        : "100% private. All biometrics and workout logs remain secured on your device or in your personal cloud database.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 flex flex-col selection:bg-lime-400 selection:text-black relative overflow-x-hidden">
      {/* Subtle Ambient Glows */}
      <div className="pointer-events-none fixed -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-lime-500/10 blur-[150px] -z-10" />
      <div className="pointer-events-none fixed top-1/3 -right-40 h-[400px] w-[500px] rounded-full bg-emerald-600/10 blur-[150px] -z-10" />

      {/* Sticky Top Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050507]/90 px-4 py-3.5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              playSound("click");
              onLaunchApp();
            }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-lime-400 to-emerald-500 text-black shadow-md shadow-lime-400/20 group-hover:scale-105 transition-transform shrink-0">
              <Activity className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-white uppercase">
                  ARISE
                </span>
                <span className="rounded bg-lime-400/15 border border-lime-400/30 px-1.5 py-0.5 text-[10px] font-bold text-lime-400">
                  FITNESS
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                {isBn ? "স্মার্ট এআই ওয়ার্কআউট কোচ ও পুষ্টি" : "Smart AI Workout & Nutrition Coach"}
              </p>
            </div>
          </div>

          {/* Action Header Controls */}
          <div className="flex items-center gap-2.5">
            {/* Language Switcher */}
            <div
              id="landing-lang-toggle"
              role="group"
              aria-label="Language selection"
              className="flex items-center rounded-xl border border-white/10 bg-black/50 p-0.5 text-xs"
            >
              <button
                type="button"
                id="landing-lang-bn"
                onClick={() => {
                  if (lang !== "bn") {
                    playSound("click");
                    onLanguageToggle();
                  }
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  lang === "bn"
                    ? "bg-lime-400 text-black font-bold shadow-sm shadow-lime-400/25"
                    : "text-zinc-400 hover:text-white"
                }`}
                aria-pressed={lang === "bn"}
              >
                বাংলা
              </button>
              <button
                type="button"
                id="landing-lang-en"
                onClick={() => {
                  if (lang !== "en") {
                    playSound("click");
                    onLanguageToggle();
                  }
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  lang === "en"
                    ? "bg-lime-400 text-black font-bold shadow-sm shadow-lime-400/25"
                    : "text-zinc-400 hover:text-white"
                }`}
                aria-pressed={lang === "en"}
              >
                EN
              </button>
            </div>

            {/* Auth Button */}
            <button
              onClick={onOpenAuth}
              type="button"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/50 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              <User className="h-3.5 w-3.5 text-zinc-400" />
              <span className="hidden sm:inline">{userName ? userName : t.navLogin}</span>
            </button>

            {/* Launch App Primary CTA */}
            <button
              id="btn-landing-launch-header"
              onClick={() => {
                playSound("click");
                onLaunchApp();
              }}
              type="button"
              className="flex items-center gap-1.5 rounded-xl bg-lime-400 px-3.5 py-1.5 text-xs font-bold text-black shadow-md shadow-lime-400/20 hover:bg-lime-300 active:scale-95 transition-all cursor-pointer"
            >
              <span>{t.landingLaunchApp}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 md:pt-20 md:pb-24">
        <div className="mx-auto max-w-4xl text-center relative z-10 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-300 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>{isBn ? "স্মার্ট এআই ওয়ার্কআউট ও দেশীয় পুষ্টিবিজ্ঞান" : "Adaptive AI Fitness & Localized Sports Nutrition"}</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl md:leading-[1.15]">
            {isBn ? (
              <>
                আপনার ব্যক্তিগত <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
                  স্মার্ট এআই ওয়ার্কআউট ও পুষ্টি কোচ
                </span>
              </>
            ) : (
              <>
                YOUR PERSONAL <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
                  SMART AI WORKOUT & NUTRITION COACH
                </span>
              </>
            )}
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-zinc-300 leading-relaxed">
            {isBn
              ? "অভিযোজিত ওয়ার্কআউট প্ল্যান, সম্পূর্ণ ব্যায়ামের অ্যানিমেটেড গাইড, পাওয়ারলিফটিং ক্যালকুলেটর এবং দেশীয় সুষম পুষ্টি। ১০০% ফ্রি এবং অফলাইনেও সম্পূর্ণ কার্যকর।"
              : "Intelligent workout splits tailored to your equipment, animated exercise form guides, strength & powerlifting calculators, and localized nutrition. 100% free with offline capabilities."}
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              id="btn-landing-cta"
              onClick={() => {
                playSound("click");
                onLaunchApp();
              }}
              type="button"
              className="flex min-h-[50px] items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-8 text-sm font-bold text-black shadow-lg shadow-emerald-500/25 hover:brightness-105 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{isBn ? "ওয়ার্কআউট শুরু করুন" : "Start Working Out"}</span>
            </button>

            <button
              onClick={() => {
                playSound("click");
                onOpenDiet();
              }}
              type="button"
              className="flex min-h-[50px] items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-6 text-sm font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <Utensils className="h-4 w-4 text-emerald-400" />
              <span>{isBn ? "বাঙালি ডায়েট প্ল্যান" : "Bangladeshi Nutrition"}</span>
            </button>

            {onOpenExercises && (
              <button
                onClick={() => {
                  playSound("click");
                  onOpenExercises();
                }}
                type="button"
                className="flex min-h-[50px] items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-6 text-sm font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
              >
                <Dumbbell className="h-4 w-4 text-sky-400" />
                <span>{isBn ? "ব্যায়াম লাইব্রেরি (১০০+ মুভ)" : "Exercise Library (93+ Moves)"}</span>
              </button>
            )}
          </div>

          {/* 4 Feature Highlights */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="rounded-3xl border border-white/10 glass-surface p-4 shadow-sm">
              <div className="text-lime-400 text-xs font-semibold mb-1 flex items-center gap-1.5 uppercase">
                <Zap className="h-3.5 w-3.5" /> AI Adaptive
              </div>
              <div className="text-xs text-zinc-400 leading-snug">
                {isBn ? "ক্লান্তি ও সরঞ্জাম অনুযায়ী স্বয়ংক্রিয় ওয়ার্কআউট তৈরি।" : "Custom workouts adapting to your fatigue and equipment."}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 glass-surface p-4 shadow-sm">
              <div className="text-emerald-400 text-xs font-semibold mb-1 flex items-center gap-1.5 uppercase">
                <Utensils className="h-3.5 w-3.5" /> Local Nutrition
              </div>
              <div className="text-xs text-zinc-400 leading-snug">
                {isBn ? "রুই মাছ, ডিম, মুরগি ও ডাল দিয়ে সুষম পুষ্টি তালিকা।" : "Balanced macros with affordable local fish, eggs, and chicken."}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 glass-surface p-4 shadow-sm">
              <div className="text-sky-400 text-xs font-semibold mb-1 flex items-center gap-1.5 uppercase">
                <Play className="h-3.5 w-3.5" /> Form Guides
              </div>
              <div className="text-xs text-zinc-400 leading-snug">
                {isBn ? "সঠিক ফর্ম, বায়োমেকানিক্স ও অ্যানিমেটেড গাইড।" : "Biomechanical tempo cues and animated demonstration guides."}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 glass-surface p-4 shadow-sm">
              <div className="text-lime-400 text-xs font-semibold mb-1 flex items-center gap-1.5 uppercase">
                <ShieldCheck className="h-3.5 w-3.5" /> 100% Private
              </div>
              <div className="text-xs text-zinc-400 leading-snug">
                {isBn ? "ডাটা ডিভাইসে সুরক্ষিত থাকে। কোনো বিজ্ঞাপন নেই।" : "All metrics stored securely on device. Zero tracking."}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Biometric Calculator Section */}
      <section className="px-4 py-16 border-y border-white/10 bg-[#050507]">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-xs font-bold tracking-wider text-lime-400 uppercase">
              {isBn ? "তাৎক্ষণিক ক্যালকুলেটর" : "Instant Calorie & Macro Calculator"}
            </span>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              {t.landingCalculatorTitle}
            </h2>
            <p className="text-xs text-zinc-400 max-w-xl mx-auto">
              {t.landingCalculatorSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-center rounded-3xl border border-white/10 glass-surface p-6 shadow-md">
            {/* Input Controls */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <CyberDropdown
                  id="calc-gender"
                  label={t.sexLabel}
                  value={calcGender}
                  options={[
                    { value: "male", label: t.maleOption },
                    { value: "female", label: t.femaleOption },
                  ]}
                  onChange={(val) => setCalcGender(val as Gender)}
                  searchable={false}
                />
                <CyberDropdown
                  id="calc-age"
                  label={t.ageLabel}
                  value={calcAge}
                  options={
                    !AGE_OPTIONS.includes(calcAge)
                      ? [
                          { value: calcAge, label: `${calcAge} (Custom)` },
                          ...AGE_OPTIONS.map((a) => ({ value: a, label: formatAgeOption(a, lang) })),
                        ]
                      : AGE_OPTIONS.map((a) => ({ value: a, label: formatAgeOption(a, lang) }))
                  }
                  onChange={(val) => setCalcAge(Number(val) || 20)}
                  searchable
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <CyberDropdown
                  id="calc-height"
                  label={t.heightLabelMetric}
                  value={calcHeight}
                  options={
                    !HEIGHT_CM_OPTIONS.includes(calcHeight)
                      ? [
                          { value: calcHeight, label: `${calcHeight} cm (Custom)` },
                          ...HEIGHT_CM_OPTIONS.map((c) => ({ value: c, label: formatHeightCmOption(c, lang) })),
                        ]
                      : HEIGHT_CM_OPTIONS.map((c) => ({ value: c, label: formatHeightCmOption(c, lang) }))
                  }
                  onChange={(val) => setCalcHeight(Number(val) || 160)}
                  searchable
                />
                <CyberDropdown
                  id="calc-weight"
                  label={t.weightLabelMetric}
                  value={calcWeight}
                  options={
                    !WEIGHT_KG_OPTIONS.includes(calcWeight)
                      ? [
                          { value: calcWeight, label: `${calcWeight} kg (Custom)` },
                          ...WEIGHT_KG_OPTIONS.map((k) => ({ value: k, label: formatWeightKgOption(k, lang) })),
                        ]
                      : WEIGHT_KG_OPTIONS.map((k) => ({ value: k, label: formatWeightKgOption(k, lang) }))
                  }
                  onChange={(val) => setCalcWeight(Number(val) || 60)}
                  searchable
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                  {t.goalLabel}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["endurance", "muscle", "strength"] as Goal[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setCalcGoal(g)}
                      className={`min-h-[40px] rounded-lg border px-2 text-xs font-bold transition-all ${
                        calcGoal === g
                          ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
                          : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-white"
                      }`}
                    >
                      {g === "muscle"
                        ? isBn
                          ? "মাসল বৃদ্ধি"
                          : "Muscle"
                        : g === "endurance"
                          ? isBn
                            ? "ওজন কমানো"
                            : "Fat Loss"
                          : isBn
                            ? "শক্তি"
                            : "Strength"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Calculation Output Card */}
            <div className="space-y-4 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4">
              <BmiGauge bmi={previewStats.bmi} category={previewStats.bmiCategory} />

              <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-zinc-800">
                <div className="rounded-lg bg-zinc-900 p-2.5 border border-zinc-800/80">
                  <div className="text-[10px] text-zinc-400 uppercase">Basal BMR</div>
                  <div className="text-base font-bold text-white font-mono">
                    {previewStats.bmr} <span className="text-[10px] text-zinc-500 font-normal">kcal</span>
                  </div>
                </div>
                <div className="rounded-lg bg-zinc-900 p-2.5 border border-zinc-800/80">
                  <div className="text-[10px] text-zinc-400 uppercase">Daily TDEE</div>
                  <div className="text-base font-bold text-emerald-400 font-mono">
                    {previewStats.tdee} <span className="text-[10px] text-zinc-500 font-normal">kcal</span>
                  </div>
                </div>
              </div>

              {previewMacros && (
                <div className="rounded-lg bg-zinc-900 p-3 border border-zinc-800 space-y-2 text-center">
                  <div className="flex items-center justify-between text-xs text-zinc-300 font-medium">
                    <span>{t.targetCalories(calcGoal)}</span>
                    <strong className="text-emerald-400 font-bold font-mono">
                      {previewMacros.targetCalories} kcal/day
                    </strong>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
                    <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                      <span className="text-emerald-400 font-semibold block text-[10px]">PROTEIN</span>
                      <strong className="text-white">{previewMacros.proteinGrams}g</strong>
                    </div>
                    <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                      <span className="text-sky-400 font-semibold block text-[10px]">CARBS</span>
                      <strong className="text-white">{previewMacros.carbGrams}g</strong>
                    </div>
                    <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                      <span className="text-amber-400 font-semibold block text-[10px]">FATS</span>
                      <strong className="text-white">{previewMacros.fatGrams}g</strong>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  playSound("click");
                  onLaunchApp();
                }}
                className="w-full flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-xs font-bold text-black shadow hover:brightness-105 active:scale-95 transition-all"
              >
                <span>{isBn ? "এই লক্ষ্য নিয়ে ওয়ার্কআউট শুরু করুন" : "Start Workout With These Goals"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="px-4 py-16 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
            {isBn ? "ফিচারসমূহ" : "Core Capabilities"}
          </span>
          <h2 className="text-2xl font-bold text-white sm:text-4xl">
            {t.landingFeaturesTitle}
          </h2>
          <p className="text-xs text-zinc-400 max-w-2xl mx-auto">
            {t.landingFeaturesSubtitle}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-3xl border border-white/10 glass-surface p-5 space-y-3 hover:border-lime-400/50 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-400/15 text-lime-400 border border-lime-400/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {isBn ? "স্মার্ট এআই কোচ" : "Adaptive AI Coach"}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {isBn
                ? "ব্যায়ামের ক্লান্তি ও সেশনের অনুভূতির ওপর ভিত্তি করে প্রতি সেশনে লোড নিয়ন্ত্রণ করে। সম্পূর্ণ অফলাইনেও নিখুঁত প্ল্যান তৈরি করতে পারে।"
                : "Intelligent programming that accounts for your fatigue and recovery. Uses Gemini AI or instant offline fallback."}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 glass-surface p-5 space-y-3 hover:border-lime-400/50 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Utensils className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {isBn ? "বাঙালি ডায়েট ও পুষ্টি" : "100% Localized Nutrition"}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {isBn
                ? "বিদেশি দামি উপকরণের প্রয়োজন নেই। দেশি রুই মাছ, ডিম, মুরগি, ডাল, ছোলা ও ভাত দিয়ে তৈরি বৈজ্ঞানিক পুষ্টি তালিকা।"
                : "Practical, culturally authentic meal plans with real local foods: Rui/Katla fish, eggs, chicken, lentils, and seasonal vegetables."}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 glass-surface p-5 space-y-3 hover:border-lime-400/50 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
              <Play className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {isBn ? "বায়োমেকানিক্যাল ফর্ম গাইড" : "Animated Form Guides"}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {isBn
                ? "৩-সেকেন্ড নামা, ১-সেকেন্ড বিরতি ও ওঠার অ্যানিমেটেড গাইড। সাথে কী করবেন ও কী এড়িয়ে চলবেন তার সুস্পষ্ট নির্দেশনা।"
                : "Detailed motion guides with cadence tempo, highlighted target muscles, and key Do's & Don'ts for injury prevention."}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 glass-surface p-5 space-y-3 hover:border-lime-400/50 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-400/15 text-lime-400 border border-lime-400/30">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {isBn ? "সাপ্তাহিক রুটিন ও স্প্লিট" : "Weekly Workout Schedule"}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {isBn
                ? "সপ্তাহে ৩ দিন (PPL), ৪ দিন বা ৫ দিন স্প্লিট বেছে নিন। আজকের টার্গেট বা বিশ্রামের দিন অ্যাপ স্বয়ংক্রিয়ভাবে দেখায়।"
                : "Customize your training days (3-day PPL, 4-day upper/lower, 5-day split). Active workouts and rest days adapt automatically."}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 glass-surface p-5 space-y-3 hover:border-lime-400/50 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {isBn ? "বাংলা ও ইংরেজি ভাষা" : "Bilingual (English & বাংলা)"}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {isBn
                ? "অ্যাপের প্রতিটি ফিচার ১ ক্লিকেই সম্পূর্ণ বাংলায় বা ইংরেজিতে পরিবর্তন করা যায়। কোনো ডাটা নষ্ট হয় না।"
                : "Instant 1-click toggle between full English and authentic Bengali with zero page reload or data loss."}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 glass-surface p-5 space-y-3 hover:border-lime-400/50 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {isBn ? "নিরাপদ ও অফলাইন" : "Offline & Private"}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {isBn
                ? "আপনার বায়োমেট্রিক তথ্য ডিভাইসেই থাকে। ইন্টারনেট ছাড়াই সম্পূর্ণ অ্যাপ কাজ করে এবং কোনো পে-ওয়াল নেই।"
                : "All metrics remain encrypted on your device. Works completely offline with optional cloud database sync."}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-16 border-t border-white/10 max-w-4xl mx-auto w-full space-y-6">
        <div className="text-center space-y-1.5">
          <span className="text-xs font-bold tracking-wider text-lime-400 uppercase">
            FAQ
          </span>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            {t.landingFaqTitle}
          </h2>
          <p className="text-xs text-zinc-400">
            {isBn ? "সাধারণ প্রশ্নের পরিষ্কার উত্তর" : "Answers to common questions about training and nutrition"}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 glass-surface text-zinc-200 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => {
                  playSound("click");
                  setOpenFaqIndex(openFaqIndex === idx ? null : idx);
                }}
                className="flex w-full items-center justify-between p-4 text-left text-sm font-semibold text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                {openFaqIndex === idx ? (
                  <ChevronUp className="h-4 w-4 text-lime-400 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />
                )}
              </button>
              {openFaqIndex === idx && (
                <div className="border-t border-white/10 bg-black/40 p-4 text-xs text-zinc-300 leading-relaxed">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="px-4 py-16 border-t border-white/10 bg-gradient-to-b from-[#050507] to-black text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          {isBn ? "আজ থেকেই শুরু করুন আপনার ফিটনেস যাত্রা" : "Start Your Fitness Journey Today"}
        </h2>

        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
          {isBn
            ? "কোনো সাবস্ক্রিপশন নেই, কোনো বিজ্ঞাপন নেই। এখনই আপনার সরঞ্জাম ও লক্ষ্য অনুযায়ী ওয়ার্কআউট শুরু করুন।"
            : "No subscriptions, no hidden fees. Build sustainable strength and healthy nutrition habits today."}
        </p>

        <button
          onClick={() => {
            playSound("click");
            onLaunchApp();
          }}
          type="button"
          className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-8 text-sm font-bold text-black shadow-lg shadow-emerald-500/20 hover:brightness-105 active:scale-95 transition-all cursor-pointer"
        >
          <Play className="h-4 w-4 fill-current" />
          <span>{isBn ? "অ্যাপে প্রবেশ করুন" : "Launch Arise Coach"}</span>
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-6 px-4 text-center text-xs text-zinc-500 space-y-1.5 bg-[#090d16]">
        <div className="font-semibold text-zinc-400">
          ARISE FITNESS · Smart AI Workout Coach & Nutrition
        </div>
        <p className="text-[11px]">Free & Open-Source Fitness Architecture</p>
      </footer>
    </div>
  );
}
