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
  Star,
  TrendingUp,
  Mail,
  User,
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
  onOpenLogin?: () => void;
}

export function SoloLevelingWelcomeOnboarding({
  open,
  initialProfile,
  initialName = "Sung Jin-woo",
  lang,
  onLanguageChange,
  onComplete,
  onClose,
  onOpenLogin,
}: Props) {
  const isBn = lang === "bn";

  // Flow stages:
  // 0: "AWAKEN" Splash Screen
  // 1: Dialogue 1 ("HMM...?")
  // 2: Dialogue 2 ("WAIT... COULD IT BE YOU?!")
  // 3: Dialogue 3 ("I SENSE A PRESENCE... ONE WITH EXTRAORDINARY POTENTIAL.")
  // 4: Dialogue 4 ("BEFORE ANYTHING ELSE, WHICH PATH WILL YOU FOLLOW?")
  // 5: Class Selection ("Choose your class": Warrior, Assassin, Mage)
  // 6: Dialogue 5 ("AND WHICH ULTIMATE QUEST DRIVES YOU TO RISE?")
  // 7: Ultimate Quest Selection (Hero physique, Protect others, Improve Health, Surpassing yourself)
  // 8: Dialogue 6 ("VERY WELL. YOU WILL NEED COURAGE TO HOLD ON...")
  // 9: Final Dialogue ("ARE YOU READY TO BECOME A PLAYER? [ ACCEPT ] / [ DECLINE ]")
  // 10: Biometric calibration (Name, Gender, Height, Weight, Equipment)
  // 11: Final Awakening Confirmation
  const [stage, setStage] = useState<number>(0);

  // Form State
  const [hunterName, setHunterName] = useState<string>(initialName);
  const [selectedClass, setSelectedClass] = useState<"WARRIOR" | "ASSASSIN" | "MAGE">("WARRIOR");
  const [selectedQuestMotivation, setSelectedQuestMotivation] = useState<string>("Hero physique");
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

  // Auth bottom sheet state
  const [showAuthSheet, setShowAuthSheet] = useState(false);

  if (!open) return null;

  const nextStage = () => {
    playSound("system-click");
    vibrate(20);
    setStage((prev) => prev + 1);
  };

  const prevStage = () => {
    playSound("system-click");
    vibrate(15);
    setStage((prev) => Math.max(0, prev - 1));
  };

  const handleFinish = () => {
    playSound("arise");
    vibrate([80, 120, 80, 200]);

    const mappedGoal: Goal = selectedClass === "WARRIOR" ? "muscle" : selectedClass === "ASSASSIN" ? "strength" : "endurance";

    const finalProfile: Profile = {
      gender,
      age: Number(age) || 24,
      heightCm: Number(heightCm) || 175,
      weightKg: Number(weightKg) || 70,
      activity,
      level,
      goal: mappedGoal,
      dietGoal: mappedGoal === "muscle" ? "muscle" : mappedGoal === "endurance" ? "endurance" : "recomp",
      equipment,
      focus: "full",
      minutes,
      lowImpact,
      limitations: "",
      workoutDays,
    };

    // Update Player Stats with Hunter Name & Class
    const currentStats = loadPlayerStats();
    const updatedStats: PlayerStats = {
      ...currentStats,
      name: hunterName.trim() || (isBn ? "সুং জিন-উ" : "Sung Jin-woo"),
      hunterClass: selectedClass === "WARRIOR" ? "Warrior" : selectedClass === "ASSASSIN" ? "Assassin" : "Mage",
    };
    savePlayerStats(updatedStats);

    onComplete(finalProfile, updatedStats.name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030611] text-zinc-100 overflow-y-auto selection:bg-cyan-500 selection:text-black">
      {/* Background Aura */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(0,110,255,0.18)_0%,transparent_70%)]" />

      {/* Top Controls: Back and Language Toggle */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        {stage > 0 && (
          <button
            type="button"
            onClick={prevStage}
            className="leveling-circle-btn"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            playSound("system-click");
            onLanguageChange(isBn ? "en" : "bn");
          }}
          className="rounded-full border border-cyan-500/40 bg-[#0c162d]/90 px-3 py-1.5 text-xs font-bold text-cyan-300 shadow-[0_0_12px_rgba(0,140,255,0.25)] flex items-center gap-1.5"
        >
          <span>🌐</span>
          <span>{isBn ? "EN" : "বাংলা"}</span>
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="leveling-circle-btn"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* ============================================================== */}
      {/* STAGE 0: HERO SPLASH "AWAKEN" (Matches WhatsApp Image 2026-10-20 at 11.28.29 PM.jpeg) */}
      {/* ============================================================== */}
      {stage === 0 && (
        <div className="relative w-full max-w-sm px-6 py-12 flex flex-col items-center justify-between min-h-[90vh] text-center animate-in fade-in duration-500">
          {/* Brand Logo & Name */}
          <div className="mt-8 flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-black tracking-widest text-white uppercase drop-shadow-[0_2px_12px_rgba(0,140,255,0.4)]">
              LEVELING
            </span>
            <span className="text-xs font-bold tracking-[0.35em] text-cyan-400 uppercase mt-0.5">
              FITNESS
            </span>
          </div>

          {/* Crossed Daggers Emblem Graphic with Glowing Reticle */}
          <div className="my-8 relative flex items-center justify-center">
            <div className="absolute h-56 w-56 rounded-full border border-cyan-500/20 animate-spin [animation-duration:30s]" />
            <div className="absolute h-48 w-48 rounded-full border border-cyan-500/30" />
            <div className="absolute h-44 w-44 rounded-full bg-cyan-500/10 blur-2xl" />

            {/* Crossed Daggers Icon */}
            <div className="relative flex h-32 w-32 items-center justify-center">
              <Swords className="h-28 w-28 text-cyan-300 drop-shadow-[0_0_25px_rgba(0,140,255,0.8)] stroke-[1.5]" />
            </div>
          </div>

          {/* Awaken Title & Subtitle */}
          <div className="space-y-3 mb-6">
            <h1 className="text-4xl sm:text-5xl font-black tracking-[0.2em] text-white uppercase text-glow-cyan">
              AWAKEN
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300/90 max-w-xs mx-auto leading-relaxed">
              {isBn
                ? "আপনার বিবর্তনের কোয়েস্টে প্রবেশ করুন। লেভেল আপ করুন এবং আপনার ফিটনেস জীবন রূপান্তর করুন।"
                : "Embark on your quest for evolution. Level up and transform your fitness life."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-4">
            <button
              type="button"
              id="btn-become-player"
              onClick={nextStage}
              className="w-full py-4 rounded-2xl leveling-btn-primary text-sm font-black tracking-widest uppercase shadow-[0_0_30px_rgba(0,110,255,0.6)] cursor-pointer"
            >
              {isBn ? "একজন খেলোয়াড় হোন" : "BECOME A PLAYER"}
            </button>

            <button
              type="button"
              onClick={() => {
                playSound("system-click");
                setShowAuthSheet(true);
              }}
              className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              {isBn ? "ইতিমধ্যে অ্যাকাউন্ট আছে? " : "Already have an account? "}
              <span className="text-cyan-400 font-bold hover:underline">
                {isBn ? "লগইন করুন" : "Log in"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CINEMATIC DIALOGUES 1 - 4 (Matches Screenshots) */}
      {/* ============================================================== */}
      {stage >= 1 && stage <= 4 && (
        <div className="relative w-full max-w-md px-6 py-12 flex flex-col items-center justify-center min-h-[85vh] animate-in fade-in duration-300">
          <div
            onClick={nextStage}
            className="leveling-dialog-box p-8 w-full text-center cursor-pointer select-none space-y-5"
          >
            {/* Header Tags: [ i ]  [ ??? ] */}
            <div className="flex items-center justify-center gap-3">
              <div className="leveling-dialog-tag h-12 w-12 rounded-xl text-lg">
                ℹ
              </div>
              <div className="leveling-dialog-tag px-5 py-2.5 rounded-xl text-sm font-black tracking-widest">
                ???
              </div>
            </div>

            {/* Narrative Line */}
            <div className="py-4">
              {stage === 1 && (
                <p className="text-base sm:text-lg font-bold text-white tracking-wide">
                  [HMM...?]
                </p>
              )}
              {stage === 2 && (
                <p className="text-base sm:text-lg font-bold text-white tracking-wide">
                  [WAIT... COULD IT BE{" "}
                  <span className="text-cyan-400 text-glow-cyan font-black">
                    YOU?!
                  </span>
                  ]
                </p>
              )}
              {stage === 3 && (
                <p className="text-base sm:text-lg font-bold text-white tracking-wide leading-relaxed">
                  [I SENSE A PRESENCE... ONE WITH{" "}
                  <span className="text-purple-400 text-glow-purple font-black">
                    EXTRAORDINARY POTENTIAL
                  </span>
                  .]
                </p>
              )}
              {stage === 4 && (
                <p className="text-base sm:text-lg font-bold text-white tracking-wide leading-relaxed">
                  [BEFORE ANYTHING ELSE, WHICH{" "}
                  <span className="text-cyan-400 text-glow-cyan font-black">
                    PATH
                  </span>{" "}
                  WILL YOU FOLLOW?]
                </p>
              )}
            </div>

            <p className="text-[11px] text-zinc-500 uppercase tracking-widest animate-pulse">
              {isBn ? "এগিয়ে যেতে চাপুন →" : "Tap anywhere to continue →"}
            </p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STAGE 5: CHOOSE YOUR CLASS (Matches WhatsApp Image 2026-10-20 at 11.28.31 PM (1).jpeg) */}
      {/* ============================================================== */}
      {stage === 5 && (
        <div className="relative w-full max-w-md px-6 py-12 flex flex-col justify-between min-h-[85vh] animate-in fade-in duration-300">
          <div>
            <h2 className="text-2xl font-black text-white text-center">
              {isBn ? "আপনার ক্লাস নির্বাচন করুন" : "Choose your class"}
            </h2>
            <p className="text-xs text-zinc-400 text-center mt-1">
              {isBn
                ? "কোন লক্ষ্যটি আপনি সবচেয়ে বেশি অর্জন করতে চান?"
                : "Which goal would you most like to achieve?"}
            </p>

            <div className="mt-8 space-y-3">
              {[
                {
                  id: "WARRIOR",
                  name: "WARRIOR",
                  nameBn: "যোদ্ধা (WARRIOR)",
                  desc: "Muscle strengthening",
                  descBn: "পেশী শক্তিশালীকরণ ও হাইপারট্রফি",
                },
                {
                  id: "ASSASSIN",
                  name: "ASSASSIN",
                  nameBn: "অ্যাসাসিন (ASSASSIN)",
                  desc: "Weight loss & lean cut",
                  descBn: "ওজন হ্রাস ও লীন শারীরিক গঠন",
                },
                {
                  id: "MAGE",
                  name: "MAGE",
                  nameBn: "মেইজ (MAGE)",
                  desc: "Stay in shape & stamina",
                  descBn: "শারীরিক সহনশীলতা ও ফিট থাকা",
                },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    playSound("system-click");
                    vibrate(20);
                    setSelectedClass(c.id as any);
                  }}
                  className={`w-full p-5 rounded-2xl border text-left transition-all ${
                    selectedClass === c.id
                      ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(0,140,255,0.35)]"
                      : "border-cyan-500/20 bg-[#091326] hover:border-cyan-500/40"
                  }`}
                >
                  <h3 className="text-base font-black text-white tracking-wider uppercase">
                    {isBn ? c.nameBn : c.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {isBn ? c.descBn : c.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={nextStage}
              className="w-full py-4 rounded-2xl leveling-btn-primary text-sm font-black uppercase tracking-wider"
            >
              {isBn ? "চালিয়ে যান" : "CONTINUE"}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STAGE 6: DIALOGUE 5 (ULTIMATE QUEST PROMPT) */}
      {/* ============================================================== */}
      {stage === 6 && (
        <div className="relative w-full max-w-md px-6 py-12 flex flex-col items-center justify-center min-h-[85vh] animate-in fade-in duration-300">
          <div
            onClick={nextStage}
            className="leveling-dialog-box p-8 w-full text-center cursor-pointer select-none space-y-5"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="leveling-dialog-tag h-12 w-12 rounded-xl text-lg">
                ℹ
              </div>
              <div className="leveling-dialog-tag px-5 py-2.5 rounded-xl text-sm font-black tracking-widest">
                ???
              </div>
            </div>

            <div className="py-4">
              <p className="text-base sm:text-lg font-bold text-white tracking-wide leading-relaxed">
                [AND WHICH{" "}
                <span className="text-purple-400 text-glow-purple font-black">
                  ULTIMATE QUEST
                </span>{" "}
                DRIVES YOU TO RISE?]
              </p>
            </div>

            <p className="text-[11px] text-zinc-500 uppercase tracking-widest animate-pulse">
              {isBn ? "এগিয়ে যেতে চাপুন →" : "Tap anywhere to continue →"}
            </p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STAGE 7: ULTIMATE QUEST 2x2 SELECTION (Matches WhatsApp Image 2026-10-20 at 11.28.32 PM.jpeg) */}
      {/* ============================================================== */}
      {stage === 7 && (
        <div className="relative w-full max-w-md px-6 py-12 flex flex-col justify-between min-h-[85vh] animate-in fade-in duration-300">
          <div>
            <h2 className="text-2xl font-black text-white text-center">
              {isBn ? "আপনার চূড়ান্ত লক্ষ্য কী?" : "What's your ultimate quest?"}
            </h2>
            <p className="text-xs text-zinc-400 text-center mt-1">
              {isBn
                ? "ধারাবাহিক থাকার প্রেরণা বেছে নিন।"
                : "Choose what will motivate you to stay consistent."}
            </p>

            {/* 2x2 Grid of Cards */}
            <div className="mt-8 grid grid-cols-2 gap-3.5">
              {[
                {
                  id: "Hero physique",
                  name: "Hero physique",
                  nameBn: "বীরোচিত অবয়ব",
                  icon: <Star className="h-10 w-10 text-white fill-white" />,
                },
                {
                  id: "Protect others",
                  name: "Protect others",
                  nameBn: "অন্যদের সুরক্ষা",
                  icon: <Shield className="h-10 w-10 text-white fill-white" />,
                },
                {
                  id: "Improve Health",
                  name: "Improve Health",
                  nameBn: "সুস্বাস্থ্য অর্জন",
                  icon: <Heart className="h-10 w-10 text-white fill-white" />,
                },
                {
                  id: "Surpassing yourself",
                  name: "Surpassing yourself",
                  nameBn: "নিজেকে অতিক্রম",
                  icon: <TrendingUp className="h-10 w-10 text-white stroke-[2.5]" />,
                },
              ].map((quest) => (
                <button
                  key={quest.id}
                  type="button"
                  onClick={() => {
                    playSound("system-click");
                    vibrate(20);
                    setSelectedQuestMotivation(quest.id);
                  }}
                  className={`aspect-square p-4 rounded-3xl border flex flex-col items-center justify-center text-center gap-3 transition-all ${
                    selectedQuestMotivation === quest.id
                      ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(0,140,255,0.4)]"
                      : "border-cyan-500/20 bg-[#091326] hover:border-cyan-500/40"
                  }`}
                >
                  <div>{quest.icon}</div>
                  <span className="text-xs font-bold text-white leading-tight">
                    {isBn ? quest.nameBn : quest.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={nextStage}
              className="w-full py-4 rounded-2xl leveling-btn-primary text-sm font-black uppercase tracking-wider"
            >
              {isBn ? "চালিয়ে যান" : "CONTINUE"}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STAGE 8 & 9: FINAL COURAGE & ACCEPT / DECLINE PROMPT */}
      {/* ============================================================== */}
      {stage === 8 && (
        <div className="relative w-full max-w-md px-6 py-12 flex flex-col items-center justify-center min-h-[85vh] animate-in fade-in duration-300">
          <div
            onClick={nextStage}
            className="leveling-dialog-box p-8 w-full text-center cursor-pointer select-none space-y-5"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="leveling-dialog-tag h-12 w-12 rounded-xl text-lg">
                ℹ
              </div>
              <div className="leveling-dialog-tag px-5 py-2.5 rounded-xl text-sm font-black tracking-widest">
                ???
              </div>
            </div>

            <div className="py-4">
              <p className="text-base sm:text-lg font-bold text-white tracking-wide leading-relaxed">
                [VERY WELL. YOU WILL NEED{" "}
                <span className="text-amber-400 text-glow-amber font-black">
                  COURAGE
                </span>{" "}
                TO HOLD ON, BUT YOU ARE{" "}
                <span className="text-cyan-400 text-glow-cyan font-black">
                  CAPABLE
                </span>{" "}
                OF IT.]
              </p>
            </div>

            <p className="text-[11px] text-zinc-500 uppercase tracking-widest animate-pulse">
              {isBn ? "এগিয়ে যেতে চাপুন →" : "Tap anywhere to continue →"}
            </p>
          </div>
        </div>
      )}

      {stage === 9 && (
        <div className="relative w-full max-w-md px-6 py-12 flex flex-col items-center justify-center min-h-[85vh] animate-in fade-in duration-300">
          <div className="leveling-dialog-box p-8 w-full text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="leveling-dialog-tag h-12 w-12 rounded-xl text-lg">
                ℹ
              </div>
              <div className="leveling-dialog-tag px-5 py-2.5 rounded-xl text-sm font-black tracking-widest">
                ???
              </div>
            </div>

            <div className="py-2">
              <p className="text-base sm:text-lg font-bold text-white tracking-wide leading-relaxed">
                [VERY WELL THEN, ARE YOU READY TO BECOME A{" "}
                <span className="text-cyan-400 text-glow-cyan font-black">
                  PLAYER?
                </span>
                ]
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={nextStage}
                className="py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(37,99,235,0.6)] active:scale-95 transition-all"
              >
                {isBn ? "সম্মতি (ACCEPT)" : "ACCEPT"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3.5 rounded-2xl bg-zinc-800/80 border border-zinc-700 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider active:scale-95 transition-all"
              >
                {isBn ? "প্রত্যাখ্যান (DECLINE)" : "DECLINE"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STAGE 10: BIOMETRIC PROTOCOL (Name, Gender, Height, Weight, Equipment) */}
      {/* ============================================================== */}
      {stage === 10 && (
        <div className="relative w-full max-w-lg px-6 py-12 flex flex-col justify-between min-h-[90vh] animate-in fade-in duration-300">
          <div className="space-y-4">
            <div className="text-center">
              <div className="leveling-header-box mb-2">
                {isBn ? "বায়োমেট্রিক ক্যালিব্রেশন" : "BIOMETRIC CALIBRATION"}
              </div>
              <p className="text-xs text-zinc-400">
                {isBn
                  ? "সিস্টেম ক্যালকুলেশন ও সঠিক পুষ্টির জন্য আপনার পরিমাপ দিন।"
                  : "Calibrate your physical vessel for training formulas and metrics."}
              </p>
            </div>

            {/* Hunter Alias */}
            <div className="rounded-2xl border border-cyan-500/20 bg-[#091326] p-4 space-y-1.5">
              <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider">
                {isBn ? "হান্টার নাম / ছদ্মনাম" : "Hunter Name / Alias"}
              </label>
              <input
                type="text"
                value={hunterName}
                onChange={(e) => setHunterName(e.target.value)}
                placeholder="Sung Jin-woo"
                className="w-full rounded-xl border border-cyan-500/30 bg-black/60 p-3 text-sm font-bold text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Height, Weight, Age Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-2xl border border-cyan-500/20 bg-[#091326] p-3 text-center">
                <span className="block text-[10px] uppercase font-bold text-zinc-400">
                  {isBn ? "বয়স" : "Age"}
                </span>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-transparent text-center text-lg font-black text-white focus:outline-none"
                />
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-[#091326] p-3 text-center">
                <span className="block text-[10px] uppercase font-bold text-zinc-400">
                  {isBn ? "উচ্চতা (cm)" : "Height (cm)"}
                </span>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full bg-transparent text-center text-lg font-black text-white focus:outline-none"
                />
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-[#091326] p-3 text-center">
                <span className="block text-[10px] uppercase font-bold text-zinc-400">
                  {isBn ? "ওজন (kg)" : "Weight (kg)"}
                </span>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full bg-transparent text-center text-lg font-black text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Equipment Selection */}
            <div className="rounded-2xl border border-cyan-500/20 bg-[#091326] p-4">
              <span className="block text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">
                {isBn ? "প্রশিক্ষণ সরঞ্জাম" : "Training Equipment"}
              </span>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT.map((eq) => {
                  const isSelected = equipment.includes(eq.id);
                  return (
                    <button
                      key={eq.id}
                      type="button"
                      onClick={() => {
                        playSound("system-click");
                        setEquipment((prev) =>
                          prev.includes(eq.id) ? prev.filter((x) => x !== eq.id) : [...prev, eq.id]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(0,140,255,0.3)]"
                          : "border-zinc-800 bg-black/40 text-zinc-400"
                      }`}
                    >
                      {eq.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={handleFinish}
              className="w-full py-4 rounded-2xl leveling-btn-primary text-sm font-black uppercase tracking-wider shadow-[0_0_35px_rgba(0,110,255,0.7)]"
            >
              {isBn ? "সিস্টেম জাগ্রত করুন (ARISE)" : "AWAKEN SYSTEM (ARISE)"}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* AUTH BOTTOM SHEET [WELCOME, PLAYER] (Matches WhatsApp Image 2026-10-20 at 11.28.34 PM.jpeg) */}
      {/* ============================================================== */}
      {showAuthSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-t-3xl border-t border-x border-cyan-500/40 bg-[#091429] p-6 shadow-[0_-10px_40px_rgba(0,140,255,0.3)] text-zinc-100">
            {/* Grab handle */}
            <div className="mx-auto h-1 w-12 rounded-full bg-zinc-600 mb-6" />

            <div className="text-center mb-6">
              <h3 className="text-xl font-black text-white tracking-widest uppercase text-glow-cyan">
                [WELCOME, PLAYER]
              </h3>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setShowAuthSheet(false);
                  if (onOpenLogin) onOpenLogin();
                }}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-white text-black font-bold text-sm shadow-md active:scale-95 transition-all"
              >
                <span></span>
                <span>Continue with Apple</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAuthSheet(false);
                  if (onOpenLogin) onOpenLogin();
                }}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-[#111827] border border-zinc-700 text-white font-bold text-sm shadow-md active:scale-95 transition-all"
              >
                <span className="text-base font-bold text-red-400">G</span>
                <span>Continue with Google</span>
              </button>

              <div className="my-3 flex items-center gap-3 text-zinc-500 text-xs font-semibold">
                <div className="h-px flex-1 bg-zinc-800" />
                <span>other options</span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAuthSheet(false);
                  if (onOpenLogin) onOpenLogin();
                }}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-[#0e1e3b] border border-cyan-500/40 text-cyan-200 font-bold text-sm shadow-sm active:scale-95 transition-all"
              >
                <Mail className="h-4 w-4 text-cyan-400" />
                <span>Continue with Email</span>
              </button>
            </div>

            <p className="text-[10px] text-zinc-500 text-center mt-6 leading-relaxed">
              By continuing you agree to the{" "}
              <span className="text-blue-400 hover:underline">Terms of Service</span> and{" "}
              <span className="text-blue-400 hover:underline">Privacy Policy</span>.
            </p>

            <button
              type="button"
              onClick={() => setShowAuthSheet(false)}
              className="mt-4 w-full py-2 text-xs font-bold text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
