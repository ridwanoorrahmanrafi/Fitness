"use client";

import { useState } from "react";
import Image from "next/image";
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
  Sword,
  Crown,
  Terminal,
  Radio,
} from "lucide-react";
import { playSound } from "@/lib/audio";
import { type Language, TRANSLATIONS, GOAL_LABELS_I18N } from "@/lib/i18n";
import { type Goal, type Gender } from "@/lib/types";
import { bmiCategory, profileStats, macroTargets } from "@/lib/calc";
import { BmiGauge } from "./BmiGauge";

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
      q: isBn ? "[ QUEST COST ] এটি কি সত্যিই আজীবন সম্পূর্ণ বিনামূল্যে?" : "[ QUEST COST ] Is ARISE System genuinely 100% free?",
      a: isBn
        ? "হ্যাঁ! এটি কোনো সাবস্ক্রিপশন, লুকানো ফি বা বিজ্ঞাপন ছাড়া একটি ওপেন সোর্স হান্টার ট্রেনিং সিস্টেম। কোনো ইন্টারনেট ছাড়াই সম্পূর্ণ অফলাইনেও কাজ করে।"
        : "Yes! The System operates with zero subscription paywalls, no ads, and no premium gates. It runs locally and functions fully offline.",
    },
    {
      q: isBn ? "[ AI ARCHITECT ] জেমিনাই এআই কীভাবে আমার ট্রেনিং ও ডায়েট ক্যালিব্রেট করে?" : "[ AI ARCHITECT ] How does the Dual-AI System adapt my raids and nutrition?",
      a: isBn
        ? "গুগলের Gemini 2.5 Flash ও ChatGPT আপনার সরঞ্জাম, ক্লান্তি ও রিকভারি ডাটা বিশ্লেষণ করে অভিযোজিত ব্যায়াম তৈরি করে এবং দেশীয় রুই, কাতলা, ডিম ও মুরগির নিখুঁত পুষ্টি তালিকা দেয়।"
        : "Gemini 2.5 Flash and ChatGPT analyze your recovery fatigue, available equipment, and biometrics to generate tailored dungeon workouts and local Bangladeshi nutrition.",
    },
    {
      q: isBn ? "[ RATIONS ] বাঙালি ডায়েট চার্টে কী ধরনের দেশীয় খাবার অন্তর্ভুক্ত থাকে?" : "[ RATIONS ] What rations are prescribed in the Bangladeshi nutrition archives?",
      a: isBn
        ? "সহজলভ্য দেশি রুই/কাতলা মাছ, দেশি মুরগি, ডিম, লাল চালের ভাত, আটার রুটি, মুগ ও মসুর ডাল, ছোলা, বাদাম, শাকসবজি ও টকদই — প্রতিটি আপনার BMI ও ওজন অনুযায়ী পরিমাপকৃত।"
        : "Affordable local powerfoods: Rui/Katla fish, eggs, chicken breast/thighs, brown rice, whole wheat ruti, lentils (dal), chana, seasonal vegetables, and sour yogurt.",
    },
    {
      q: isBn ? "[ DATA SECURITY ] আমার শারীরিক বায়োমেট্রিক ও প্রগ্রেস ডাটা কি সম্পূর্ণ নিরাপদ?" : "[ DATA SECURITY ] Is my biometric hunter telemetry private and secure?",
      a: isBn
        ? "১০০% নিরাপদ। আপনার শারীরিক মাপ, ওয়ার্কআউট ইতিহাস ও নোটস আপনার ব্রাউজারের স্থানীয় মেমরিতে বা আপনার ব্যক্তিগত Supabase ডাটাবেসে এনক্রিপ্ট হয়ে থাকে।"
        : "100% private. All biometrics, quest logs, and personal statistics remain encrypted on your device or in your personal Supabase cloud instance.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#020510] text-cyan-100 flex flex-col selection:bg-cyan-500 selection:text-black system-grid-bg relative overflow-x-hidden font-sans">
      {/* Ambient Cybernetic Neon Orbs */}
      <div className="pointer-events-none fixed -top-40 left-1/2 -translate-x-1/2 h-[550px] w-[900px] rounded-full bg-cyan-600/15 blur-[160px] -z-10" />
      <div className="pointer-events-none fixed top-1/3 -right-40 h-[450px] w-[550px] rounded-full bg-purple-700/15 blur-[160px] -z-10" />
      <div className="pointer-events-none fixed bottom-10 -left-40 h-[450px] w-[550px] rounded-full bg-blue-800/15 blur-[160px] -z-10" />

      {/* Sticky Top System HUD Header */}
      <header className="sticky top-0 z-40 border-b border-cyan-500/30 bg-[#03081a]/90 px-4 py-3 backdrop-blur-xl shadow-[0_4px_30px_rgba(3,8,24,0.85)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          {/* Logo & System Title */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              playSound("system-click");
              onLaunchApp();
            }}
          >
            <div className="relative h-11 w-11 system-btn-chamfer overflow-hidden border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.55)] group-hover:scale-105 transition-transform shrink-0">
              <Image
                src="/images/solo-leveling/system-crest-icon.jpg"
                alt="System Crest"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base sm:text-lg font-black tracking-wider text-white text-glow-cyan uppercase">
                  ARISE
                </span>
                <span className="system-btn-chamfer border border-cyan-400/50 bg-cyan-950/80 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                  SYSTEM
                </span>
              </div>
              <p className="font-mono text-[10px] text-cyan-400/80 hidden sm:block tracking-wide">
                {isBn ? "[ THE SYSTEM : সোলো লেভেলিং • ফিটনেস জাগরণ ]" : "[ THE SYSTEM : SOLO LEVELING • FITNESS AWAKENING ]"}
              </p>
            </div>
          </div>

          {/* Action HUD Buttons */}
          <div className="flex items-center gap-2">
            {/* Language Switcher: Dual Segmented Bangla / English */}
            <div
              id="landing-lang-toggle"
              role="group"
              aria-label="Language selection"
              className="flex items-center rounded-xl border border-cyan-500/40 bg-[#03081a] p-0.5 font-mono text-xs shadow-[0_0_12px_rgba(6,182,212,0.2)]"
            >
              <button
                type="button"
                id="landing-lang-bn"
                onClick={() => {
                  if (lang !== "bn") {
                    playSound("system-click");
                    onLanguageToggle();
                  }
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-black transition-all cursor-pointer ${
                  lang === "bn"
                    ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.7)]"
                    : "text-cyan-400/70 hover:text-cyan-200"
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
                    playSound("system-click");
                    onLanguageToggle();
                  }
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-black transition-all cursor-pointer ${
                  lang === "en"
                    ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.7)]"
                    : "text-cyan-400/70 hover:text-cyan-200"
                }`}
                aria-pressed={lang === "en"}
              >
                EN
              </button>
            </div>

            {/* Hunter Auth / Profile Selector */}
            <button
              onClick={onOpenAuth}
              type="button"
              className="btn btn-sm btn-outline btn-neutral gap-1.5 font-mono text-xs text-cyan-300 hover:text-white"
            >
              <User className="h-4 w-4 text-cyan-400" />
              <span className="hidden sm:inline">{userName ? `[ ${userName} ]` : t.navLogin}</span>
            </button>

            {/* Launch App Primary CTA */}
            <button
              id="btn-landing-launch-header"
              onClick={() => {
                playSound("system-alert");
                onLaunchApp();
              }}
              type="button"
              className="btn btn-sm btn-primary gap-2 font-mono text-xs font-black uppercase text-white shadow-[0_0_20px_rgba(6,182,212,0.45)]"
            >
              <span>{t.landingLaunchApp}</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section: System Awakening Notice */}
      <section className="relative overflow-hidden pt-10 pb-16 px-4 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-5xl text-center relative z-10 space-y-6">
          {/* Manhwa Holographic Badge */}
          <div className="inline-flex items-center gap-2 system-btn-chamfer border border-cyan-400/60 bg-[#03081a]/90 px-4 py-1.5 font-mono text-xs font-black text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 animate-spin text-cyan-400" />
            <span>{isBn ? "[ জরুরি সিস্টেম কোয়েস্ট : আপনি নির্বাচিত হয়েছেন ]" : "[ EMERGENCY SYSTEM QUEST : YOU HAVE BEEN CHOSEN ]"}</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl md:text-6xl md:leading-[1.12] uppercase font-mono [text-shadow:0_0_25px_rgba(6,182,212,0.4)]">
            {isBn ? (
              <>
                সোলো লেভেলিং সিস্টেমের মতো <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  আপনার শরীর ও ফিটনেস লেভেল আপ করুন
                </span>
              </>
            ) : (
              <>
                LEVEL UP YOUR PHYSIQUE WITH <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  THE SHADOW MONARCH SYSTEM
                </span>
              </>
            )}
          </h1>

          <p className="mx-auto max-w-2xl font-mono text-sm sm:text-base text-cyan-200/80 leading-relaxed">
            {isBn
              ? "আইকনিক ডেইলি কোয়েস্ট (১০০ পুশ-আপ, ১০০ সিট-আপ, ১০০ স্কোয়াট, ১০ কিমি রান), স্ট্যাটাস উইন্ডো (STR/AGI/VIT), শ্যাডো আর্মি আনলক এবং দেশীয় খাঁটি বাঙালি পুষ্টিবিজ্ঞান।"
              : "Execute the legendary Daily Quest, allocate stat points to STR/AGI/VIT, ascend from E-Rank Weakest to S-Rank Shadow Monarch, and fuel your physique with calibrated local nutrition."}
          </p>

          {/* Cinematic Solo Leveling Banner Frame with Corner Pins */}
          <div className="relative mx-auto max-w-3xl h-60 sm:h-88 w-full system-window rounded-2xl overflow-hidden border-2 border-cyan-400/70 shadow-[0_0_45px_rgba(6,182,212,0.4)] group">
            <Image
              src="/images/solo-leveling/system-monarch-banner.jpg"
              alt="Solo Leveling System Interface"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              priority
            />
            {/* Holographic Overlay with Korean & English System Text */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020510] via-[#020510]/50 to-transparent flex flex-col justify-end p-5 sm:p-7 text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="system-btn-chamfer px-2.5 py-0.5 font-mono text-[10px] font-black bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                  PLAYER STATUS
                </span>
                <span className="font-mono text-xs text-cyan-300 font-bold tracking-wider">
                  {isBn ? "S-RANK • শ্যাডো মনার্ক (SHADOW MONARCH)" : "S-RANK • SHADOW MONARCH"}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-mono uppercase tracking-wide text-glow-cyan">
                [ DAILY QUEST : PREPARATIONS TO BECOME STRONG ]
              </h3>
              <p className="font-mono text-xs text-cyan-300/80 mt-1">
                {isBn
                  ? "সতর্কতা: দৈনিক কোয়েস্ট সম্পন্ন করতে ব্যর্থ হলে শাস্তিমূলক পেনাল্টি জোনে স্থানান্তরিত হবেন।"
                  : "Warning: Failure to complete daily objectives will trigger a punitive teleportation to the Penalty Zone."}
              </p>
            </div>

            {/* Corner Diamond Runes */}
            <span className="absolute top-2 left-2 font-mono text-xs text-cyan-400/80 select-none">◆</span>
            <span className="absolute top-2 right-2 font-mono text-xs text-cyan-400/80 select-none">◆</span>
            <span className="absolute bottom-2 left-2 font-mono text-xs text-cyan-400/80 select-none">◆</span>
            <span className="absolute bottom-2 right-2 font-mono text-xs text-cyan-400/80 select-none">◆</span>
          </div>

          {/* Action Button Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              id="btn-landing-cta"
              onClick={() => {
                playSound("arise");
                onLaunchApp();
              }}
              type="button"
              className="btn btn-primary min-h-[54px] px-8 font-mono text-sm font-black uppercase text-white shadow-[0_0_25px_rgba(6,182,212,0.5)] tracking-wider gap-2.5 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-current stroke-none" />
              <span>{isBn ? "◆ সিস্টেমে প্রবেশ করুন (ARISE) ◆" : "◆ ENTER THE SYSTEM (ARISE) ◆"}</span>
            </button>

            <button
              onClick={() => {
                playSound("system-click");
                onOpenDiet();
              }}
              type="button"
              className="btn btn-outline btn-primary min-h-[54px] px-6 font-mono text-sm font-bold gap-2 text-cyan-300"
            >
              <Utensils className="h-4 w-4 text-cyan-400" />
              <span>{isBn ? "[ হান্টার পুষ্টি : বাঙালি ডায়েট ]" : "[ HUNTER NUTRITION ARCHIVES ]"}</span>
            </button>

            {onOpenExercises && (
              <button
                onClick={() => {
                  playSound("system-click");
                  onOpenExercises();
                }}
                type="button"
                className="btn btn-outline btn-secondary min-h-[54px] px-6 font-mono text-sm font-bold gap-2 text-purple-300"
              >
                <Dumbbell className="h-4 w-4 text-purple-400" />
                <span>{isBn ? "[ কমব্যাট কোডেক্স : ১০০+ মুভমেন্ট ]" : "[ COMBAT CODEX : 93+ MOVEMENTS ]"}</span>
              </button>
            )}
          </div>

          {/* Key Value Badges */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="system-btn-chamfer border border-cyan-500/30 bg-[#03081a]/80 p-3.5 shadow-[0_0_15px_rgba(6,182,212,0.08)]">
              <div className="text-cyan-400 text-xs font-mono font-bold mb-1 flex items-center gap-1.5 uppercase">
                <Zap className="h-3.5 w-3.5" /> [ AI ARCHITECT ]
              </div>
              <div className="font-mono text-[11px] text-cyan-300/70 leading-snug">
                Gemini 2.5 Flash & ChatGPT combat telemetry, or 100% deterministic offline engine.
              </div>
            </div>

            <div className="system-btn-chamfer border border-cyan-500/30 bg-[#03081a]/80 p-3.5 shadow-[0_0_15px_rgba(6,182,212,0.08)]">
              <div className="text-cyan-400 text-xs font-mono font-bold mb-1 flex items-center gap-1.5 uppercase">
                <Utensils className="h-3.5 w-3.5" /> [ RATIONS ]
              </div>
              <div className="font-mono text-[11px] text-cyan-300/70 leading-snug">
                Rui fish, chicken, eggs, lentils, and rice calibrated to your exact BMI target.
              </div>
            </div>

            <div className="system-btn-chamfer border border-cyan-500/30 bg-[#03081a]/80 p-3.5 shadow-[0_0_15px_rgba(6,182,212,0.08)]">
              <div className="text-purple-400 text-xs font-mono font-bold mb-1 flex items-center gap-1.5 uppercase">
                <Play className="h-3.5 w-3.5" /> [ TEMPO LOOPS ]
              </div>
              <div className="font-mono text-[11px] text-purple-300/70 leading-snug">
                Biomechanical cadence with 3s eccentric lowering and muscle highlight loops.
              </div>
            </div>

            <div className="system-btn-chamfer border border-cyan-500/30 bg-[#03081a]/80 p-3.5 shadow-[0_0_15px_rgba(6,182,212,0.08)]">
              <div className="text-cyan-400 text-xs font-mono font-bold mb-1 flex items-center gap-1.5 uppercase">
                <ShieldCheck className="h-3.5 w-3.5" /> [ CLASSIFIED ]
              </div>
              <div className="font-mono text-[11px] text-cyan-300/70 leading-snug">
                All biometric stats remain on your local hardware. Zero tracking, free forever.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Hunter Biometric Telemetry Scanner (Live Calibrator) */}
      <section className="px-4 py-14 border-y border-cyan-500/25 bg-[#03081a]/70">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="text-center space-y-1.5">
            <span className="font-mono text-xs font-black tracking-widest text-cyan-400 uppercase">
              ◆ {isBn ? "[ বায়োমেট্রিক স্ক্যানার : হান্টার পরিমাপ ]" : "[ BIOMETRIC TELEMETRY SCANNER ]"} ◆
            </span>
            <h2 className="text-2xl font-black text-white sm:text-3xl font-mono uppercase text-glow-cyan">
              {t.landingCalculatorTitle}
            </h2>
            <p className="font-mono text-xs text-cyan-400/80 max-w-xl mx-auto">
              {t.landingCalculatorSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-center system-window rounded-2xl border-1.5 border-cyan-500/50 bg-[#03081a]/95 p-6 shadow-[0_0_35px_rgba(6,182,212,0.3)]">
            {/* Input Controls */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-mono text-xs font-semibold tracking-wider text-cyan-400/80 uppercase">
                    {t.sexLabel}
                  </label>
                  <select
                    className="select select-bordered select-primary w-full min-h-[44px] system-btn-chamfer bg-[#020512] px-3 font-mono text-sm text-cyan-100 focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(6,182,212,0.35)] focus:outline-none"
                    value={calcGender}
                    onChange={(e) => setCalcGender(e.target.value as Gender)}
                  >
                    <option value="male">{t.maleOption}</option>
                    <option value="female">{t.femaleOption}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-mono text-xs font-semibold tracking-wider text-cyan-400/80 uppercase">
                    {t.ageLabel}
                  </label>
                  <input
                    type="number"
                    className="input input-bordered input-primary w-full min-h-[44px] system-btn-chamfer bg-[#020512] px-3 font-mono text-sm text-cyan-100 focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(6,182,212,0.35)] focus:outline-none"
                    value={calcAge}
                    onChange={(e) => setCalcAge(Number(e.target.value) || 20)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-mono text-xs font-semibold tracking-wider text-cyan-400/80 uppercase">
                    {t.heightLabelMetric}
                  </label>
                  <input
                    type="number"
                    className="input input-bordered input-primary w-full min-h-[44px] system-btn-chamfer bg-[#020512] px-3 font-mono text-sm text-cyan-100 focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(6,182,212,0.35)] focus:outline-none"
                    value={calcHeight}
                    onChange={(e) => setCalcHeight(Number(e.target.value) || 160)}
                  />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-xs font-semibold tracking-wider text-cyan-400/80 uppercase">
                    {t.weightLabelMetric}
                  </label>
                  <input
                    type="number"
                    className="input input-bordered input-primary w-full min-h-[44px] system-btn-chamfer bg-[#020512] px-3 font-mono text-sm text-cyan-100 focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(6,182,212,0.35)] focus:outline-none"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(Number(e.target.value) || 60)}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-mono text-xs font-semibold tracking-wider text-cyan-400/80 uppercase">
                  {t.goalLabel}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["endurance", "muscle", "strength"] as Goal[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setCalcGoal(g)}
                      className={`min-h-[40px] system-btn-chamfer border px-2 font-mono text-xs font-bold tracking-wide transition-all ${
                        calcGoal === g
                          ? "border-cyan-400 bg-cyan-500/25 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                          : "border-cyan-500/20 bg-[#020512] text-cyan-400/60 hover:border-cyan-500/40 hover:text-cyan-200"
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
                            ? "শক্তি (STR)"
                            : "Strength"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Calculation Output Console */}
            <div className="space-y-4 system-btn-chamfer border border-cyan-500/30 bg-[#020512]/90 p-4">
              <BmiGauge bmi={previewStats.bmi} category={previewStats.bmiCategory} />

              <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-cyan-500/25">
                <div className="system-btn-chamfer bg-[#03081a] p-2.5 border border-cyan-500/25">
                  <div className="font-mono text-[10px] text-cyan-400/70 uppercase">[ MANA RECOVERY (BMR) ]</div>
                  <div className="text-base font-bold text-white font-mono">
                    {previewStats.bmr} <span className="text-[10px] text-cyan-500 font-normal">kcal</span>
                  </div>
                </div>
                <div className="system-btn-chamfer bg-[#03081a] p-2.5 border border-cyan-500/25">
                  <div className="font-mono text-[10px] text-cyan-400/70 uppercase">[ COMBAT ENERGY (TDEE) ]</div>
                  <div className="text-base font-bold text-cyan-300 font-mono text-glow-cyan">
                    {previewStats.tdee} <span className="text-[10px] text-cyan-500 font-normal">kcal</span>
                  </div>
                </div>
              </div>

              {previewMacros && (
                <div className="system-btn-chamfer bg-[#03081a] p-3 border border-cyan-500/30 space-y-1.5 text-center">
                  <div className="flex items-center justify-between font-mono text-xs text-cyan-200 font-medium">
                    <span>{t.targetCalories(calcGoal)}</span>
                    <strong className="text-cyan-300 font-mono font-bold text-glow-cyan">
                      {previewMacros.targetCalories} kcal/day
                    </strong>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
                    <div className="bg-[#020512] p-2 system-btn-chamfer border border-cyan-500/25">
                      <span className="text-cyan-400 font-bold block text-[10px]">PROTEIN (STR)</span>
                      <strong className="text-white font-mono">{previewMacros.proteinGrams}g</strong>
                    </div>
                    <div className="bg-[#020512] p-2 system-btn-chamfer border border-cyan-500/25">
                      <span className="text-blue-400 font-bold block text-[10px]">CARBS (AGI)</span>
                      <strong className="text-white font-mono">{previewMacros.carbGrams}g</strong>
                    </div>
                    <div className="bg-[#020512] p-2 system-btn-chamfer border border-cyan-500/25">
                      <span className="text-purple-400 font-bold block text-[10px]">FATS (VIT)</span>
                      <strong className="text-white font-mono">{previewMacros.fatGrams}g</strong>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  playSound("system-alert");
                  onLaunchApp();
                }}
                className="w-full flex min-h-[46px] items-center justify-center gap-2 system-btn-chamfer bg-gradient-to-r from-cyan-400 via-blue-600 to-purple-600 font-mono text-xs font-black uppercase text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-95 transition-all"
              >
                <span>{isBn ? "◆ এই টার্গেট নিয়ে রেইড শুরু করুন ◆" : "◆ INITIATE RAID WITH THIS PROFILE ◆"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid: Hunter Capabilities */}
      <section className="px-4 py-16 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <span className="font-mono text-xs font-black tracking-widest text-cyan-400 uppercase">
            ◆ {isBn ? "সিস্টেম সক্ষমতা (CAPABILITIES)" : "SYSTEM CAPABILITIES"} ◆
          </span>
          <h2 className="text-2xl font-black text-white sm:text-4xl font-mono uppercase text-glow-cyan">
            {t.landingFeaturesTitle}
          </h2>
          <p className="font-mono text-xs text-cyan-400/80 max-w-2xl mx-auto">
            {t.landingFeaturesSubtitle}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="system-window rounded-2xl border border-cyan-500/30 bg-[#03081a]/85 p-5 space-y-3 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
            <div className="flex h-10 w-10 items-center justify-center system-btn-chamfer bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-mono text-base font-bold text-white uppercase text-glow-cyan">
              {isBn ? "[ AI SYSTEM ARCHITECT ]" : "[ DUAL-AI SYSTEM ARCHITECT ]"}
            </h3>
            <p className="font-mono text-xs text-cyan-300/70 leading-relaxed">
              {isBn
                ? "ব্যায়ামের ক্লান্তি ও সেশনের অনুভূতির ওপর ভিত্তি করে প্রতি সেশনে লোড নিয়ন্ত্রণ করে। সম্পূর্ণ অফলাইনেও নিখুঁত প্ল্যান তৈরি করতে পারে।"
                : "Personalized programming that reads your fatigue and muscle soreness. Intelligently cross-verified between Gemini 2.5 Flash and ChatGPT."}
            </p>
          </div>

          {/* Card 2 */}
          <div className="system-window rounded-2xl border border-cyan-500/30 bg-[#03081a]/85 p-5 space-y-3 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
            <div className="flex h-10 w-10 items-center justify-center system-btn-chamfer bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Utensils className="h-5 w-5" />
            </div>
            <h3 className="font-mono text-base font-bold text-white uppercase text-glow-cyan">
              {isBn ? "[ 100% LOCAL NUTRITION ]" : "[ 100% LOCAL NUTRITION ]"}
            </h3>
            <p className="font-mono text-xs text-cyan-300/70 leading-relaxed">
              {isBn
                ? "বিদেশি অ্যাভোকাডো বা স্যামনের দরকার নেই! দেশি রুই মাছ, ডিম, মুরগি, ডাল, ছোলা ও লাল চাল দিয়ে তৈরি বৈজ্ঞানিক ৫-বেলা খাবারের চার্ট।"
                : "No unrealistic imported ingredients. Calibrated around local fish, eggs, chicken, lentils, and seasonal vegetables with exact gram portions."}
            </p>
          </div>

          {/* Card 3 */}
          <div className="system-window rounded-2xl border border-purple-500/30 bg-[#080418]/85 p-5 space-y-3 hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all">
            <div className="flex h-10 w-10 items-center justify-center system-btn-chamfer bg-purple-500/20 text-purple-300 border border-purple-500/40">
              <Play className="h-5 w-5" />
            </div>
            <h3 className="font-mono text-base font-bold text-white uppercase text-glow-purple">
              {isBn ? "[ CADENCE MOTION TELEMETRY ]" : "[ CADENCE MOTION TELEMETRY ]"}
            </h3>
            <p className="font-mono text-xs text-purple-300/70 leading-relaxed">
              {isBn
                ? "৩-সেকেন্ড নামা, ১-সেকেন্ড বিরতি ও ওঠার অ্যানিমেটেড লুপ। সাথে কী করবেন ও কী এড়িয়ে চলবেন তার সুস্পষ্ট নির্দেশনা।"
                : "Interactive loop animation with 3-second eccentric tempo, targeted muscle highlight, step-by-step form cues, and Do's & Don'ts."}
            </p>
          </div>

          {/* Card 4 */}
          <div className="system-window rounded-2xl border border-cyan-500/30 bg-[#03081a]/85 p-5 space-y-3 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
            <div className="flex h-10 w-10 items-center justify-center system-btn-chamfer bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="font-mono text-base font-bold text-white uppercase text-glow-cyan">
              {isBn ? "[ WEEKLY RAID SCHEDULE ]" : "[ WEEKLY RAID SCHEDULE ]"}
            </h3>
            <p className="font-mono text-xs text-cyan-300/70 leading-relaxed">
              {isBn
                ? "সপ্তাহে ৩ দিন (PPL), ৪ দিন বা ৫ দিন রেইডের দিন বেছে নিন। আজকের টার্গেট বা বিশ্রামের দিন সিস্টেম স্বয়ংক্রিয়ভাবে শনাক্ত করে।"
                : "Select your training days (3D PPL, 4D split, 5D hypertrophy). Today's dungeon target or rest day is automatically scheduled with audio cues."}
            </p>
          </div>

          {/* Card 5 */}
          <div className="system-window rounded-2xl border border-cyan-500/30 bg-[#03081a]/85 p-5 space-y-3 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
            <div className="flex h-10 w-10 items-center justify-center system-btn-chamfer bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="font-mono text-base font-bold text-white uppercase text-glow-cyan">
              {isBn ? "[ DUAL LINGUISTIC ENGINE ]" : "[ DUAL LINGUISTIC ENGINE ]"}
            </h3>
            <p className="font-mono text-xs text-cyan-300/70 leading-relaxed">
              {isBn
                ? "পুরো অ্যাপ্লিকেশন ১ ক্লিকেই সম্পূর্ণ বাংলায় বা ইংরেজিতে পরিবর্তন করা যায়। কোনো রিফ্রেশ বা ডেটা হারানোর ভয় নেই।"
                : "Instantly toggle between fluent English and Bengali with zero page reloads and complete state preservation."}
            </p>
          </div>

          {/* Card 6 */}
          <div className="system-window rounded-2xl border border-purple-500/30 bg-[#080418]/85 p-5 space-y-3 hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all">
            <div className="flex h-10 w-10 items-center justify-center system-btn-chamfer bg-purple-500/20 text-purple-300 border border-purple-500/40">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-mono text-base font-bold text-white uppercase text-glow-purple">
              {isBn ? "[ CLASSIFIED DATA SECURITY ]" : "[ CLASSIFIED DATA SECURITY ]"}
            </h3>
            <p className="font-mono text-xs text-purple-300/70 leading-relaxed">
              {isBn
                ? "আপনার ওজন, পরিমাপ বা শারীরিক সীমাবদ্ধতা কখনো সার্ভারে আপলোড করা হয় না। ফোনে ইনস্টল করে অ্যাপের মতো ব্যবহার করুন।"
                : "Zero telemetry tracking. Works 100% offline or syncs with your encrypted Supabase backend. Installable on mobile phones via PWA."}
            </p>
          </div>
        </div>
      </section>

      {/* Classified System Intel (FAQ) */}
      <section className="px-4 py-16 border-t border-cyan-500/25 max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center space-y-1.5">
          <span className="font-mono text-xs font-black tracking-widest text-cyan-400 uppercase">
            ◆ {isBn ? "[ গোপনীয় হান্টার ইন্টেল : CLASSIFIED INTEL ]" : "[ CLASSIFIED HUNTER INTEL ]"} ◆
          </span>
          <h2 className="text-2xl font-black text-white sm:text-3xl font-mono uppercase text-glow-cyan">
            {t.landingFaqTitle}
          </h2>
          <p className="font-mono text-xs text-cyan-400/80">
            {isBn ? "আপনার যেকোনো সাধারণ প্রশ্নের পরিষ্কার উত্তর" : "Official operational briefs for awakening hunters"}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="collapse collapse-arrow border border-cyan-500/30 bg-[#03081a]/90 font-mono text-cyan-200"
            >
              <input
                type="checkbox"
                checked={openFaqIndex === idx}
                onChange={() => {
                  playSound("system-click");
                  setOpenFaqIndex(openFaqIndex === idx ? null : idx);
                }}
              />
              <div className="collapse-title text-xs sm:text-sm font-bold text-cyan-200">
                {faq.q}
              </div>
              <div className="collapse-content font-mono text-xs text-cyan-300/80 leading-relaxed border-t border-cyan-500/20 bg-[#020512] pt-3">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Monarch Awakening Banner */}
      <section className="px-4 py-16 border-t border-cyan-500/30 bg-gradient-to-t from-[#04081c] via-[#020510] to-[#020510] text-center space-y-5">
        <div className="inline-flex items-center gap-2 system-btn-chamfer border border-cyan-400/60 bg-[#03081a] px-3.5 py-1 font-mono text-[11px] font-black text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.35)]">
          <Crown className="h-3.5 w-3.5 text-cyan-400" />
          <span>{isBn ? "আমি একাই লেভেল আপ করব • I ALONE LEVEL UP" : "I ALONE LEVEL UP • SOLO LEVELING"}</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-white font-mono uppercase text-glow-cyan">
          {isBn ? "আজ থেকেই শুরু হোক আপনার সিস্টেম জাগরণ" : "AWAKEN YOUR INNER SHADOW MONARCH TODAY"}
        </h2>

        <p className="font-mono text-xs sm:text-sm text-cyan-300/80 max-w-md mx-auto">
          {isBn
            ? "কোনো সাবস্ক্রিপশন নেই, কোনো পে-ওয়াল নেই। এখনই আপনার সরঞ্জাম ও টার্গেট বেছে নিয়ে লেভেল আপ করুন।"
            : "No subscriptions, no fees. Train with your available equipment and conquer your daily hunter limits."}
        </p>

        <button
          onClick={() => {
            playSound("arise");
            onLaunchApp();
          }}
          type="button"
          className="inline-flex min-h-[52px] items-center gap-2.5 system-btn-chamfer bg-gradient-to-r from-cyan-400 via-blue-600 to-purple-600 px-8 font-mono text-sm font-black uppercase text-white shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:brightness-110 active:scale-95 transition-all"
        >
          <Play className="h-4 w-4 fill-current stroke-none" />
          <span>{isBn ? "◆ সিস্টেম সক্রিয় করুন (ARISE) ◆" : "◆ ARISE : ENTER THE SYSTEM ◆"}</span>
        </button>
      </section>

      {/* Footer HUD */}
      <footer className="border-t border-cyan-500/25 py-8 px-4 text-center font-mono text-xs text-cyan-600/80 space-y-2 bg-[#020510]">
        <div className="flex items-center justify-center gap-2 font-bold text-cyan-400">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <span>ARISE : THE SYSTEM • SOLO LEVELING FITNESS & BANGLADESHI NUTRITION</span>
        </div>
        <p className="text-[11px]">System Protocol Version 2.0 • Autonomous Client Architecture</p>
      </footer>
    </div>
  );
}
