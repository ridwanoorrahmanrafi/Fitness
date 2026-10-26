"use client";

import React, { useState, useEffect } from "react";
import {
  Info,
  Clock,
  CheckCircle2,
  Bell,
  BellOff,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Flame,
  Award,
  Zap,
  Dumbbell,
} from "lucide-react";
import { playSound, vibrate } from "@/lib/audio";
import type { Language } from "@/lib/i18n";
import type { DailySystemQuest } from "@/lib/systemStats";
import type { WorkoutPlan, Exercise } from "@/lib/types";

interface Props {
  dailyQuest: DailySystemQuest;
  onUpdateDailyQuest: (q: DailySystemQuest) => void;
  onClaimDailyQuest: () => void;
  focusPlan?: WorkoutPlan | null;
  onStartFocusWorkout?: () => void;
  onOpenExerciseAnimation?: (ex: Exercise) => void;
  lang?: Language;
}

export function LevelingQuestCarouselCard({
  dailyQuest,
  onUpdateDailyQuest,
  onClaimDailyQuest,
  focusPlan,
  onStartFocusWorkout,
  onOpenExerciseAnimation,
  lang = "bn",
}: Props) {
  const isBn = lang === "bn";
  // Active Quest: 0 = Daily, 1 = Focus, 2 = Urgent, 3 = Custom
  const [activeQuestIndex, setActiveQuestIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState("00:35:19");
  const [urgentNotifications, setUrgentNotifications] = useState(false);
  const [urgentActive, setUrgentActive] = useState(false);

  // Focus quest checked state
  const [focusChecked, setFocusChecked] = useState<Record<string, boolean>>({});

  // Countdown timer to midnight
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft("00:00:00");
        return;
      }
      const hrs = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, "0");
      const mins = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, "0");
      const secs = Math.floor((diff / 1000) % 60).toString().padStart(2, "0");
      setTimeLeft(`${hrs}:${mins}:${secs}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const { objectives, completed } = dailyQuest;

  // Toggle or increment daily exercise
  const handleToggleDailyItem = (key: keyof DailySystemQuest["objectives"]) => {
    playSound("system-click");
    vibrate(25);
    const target = objectives[key].target;
    const current = objectives[key].current >= target ? 0 : target;
    const updated: DailySystemQuest = {
      ...dailyQuest,
      objectives: {
        ...objectives,
        [key]: {
          ...objectives[key],
          current,
        },
      },
    };

    const allDone =
      updated.objectives.pushups.current >= updated.objectives.pushups.target &&
      updated.objectives.situps.current >= updated.objectives.situps.target &&
      updated.objectives.squats.current >= updated.objectives.squats.target &&
      updated.objectives.runKm.current >= updated.objectives.runKm.target;

    updated.completed = allDone;
    onUpdateDailyQuest(updated);
    if (allDone && !completed) {
      playSound("quest-complete");
      vibrate([50, 100, 50]);
    }
  };

  const totalCurrent =
    objectives.pushups.current +
    objectives.situps.current +
    objectives.squats.current +
    objectives.runKm.current * 10;
  const totalTarget =
    objectives.pushups.target +
    objectives.situps.target +
    objectives.squats.target +
    objectives.runKm.target * 10;
  const dailyPercent = Math.min(100, Math.round((totalCurrent / totalTarget) * 100));

  // Focus exercises from today's plan
  const focusExercises = focusPlan?.exercises
    ? focusPlan.exercises.map((pe) => {
        return {
          id: pe.uid,
          name: pe.note || pe.exerciseId.replace(/_/g, " "),
          targetReps: `[0/${pe.reps || 12}]`,
        };
      })
    : [
        { id: "calves", name: isBn ? "স্ট্যান্ডিং কাফ রেইজ" : "Standing Calf Raise", targetReps: "[0/24]" },
        { id: "lunges", name: isBn ? "রিভার্স লাঞ্জ হাই নী" : "Reverse Lunge High Knee", targetReps: "[0/8]" },
        { id: "leg_raise", name: isBn ? "অল্টারনেটিং ফ্লোর লেগ রেইজ" : "Alt. Floor Leg Raise", targetReps: "[0/18]" },
        { id: "lunge_twist", name: isBn ? "রিভার্স লাঞ্জ টুইস্ট" : "Reverse Lunge Twist", targetReps: "[0/8]" },
      ];

  const focusCompletedCount = Object.values(focusChecked).filter(Boolean).length;
  const focusPercent = Math.round((focusCompletedCount / focusExercises.length) * 100);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Carousel Summary Pill Card */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#0d214d] via-[#10295c] to-[#1e1e4f] border border-cyan-500/30 p-4 shadow-[0_0_30px_rgba(0,140,255,0.25)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* 4 Vertical Dots indicator */}
          <div className="flex flex-col gap-2 py-1">
            {[0, 1, 2, 3].map((dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => {
                  playSound("system-click");
                  vibrate(15);
                  setActiveQuestIndex(dotIdx);
                }}
                className={`h-2.5 w-2.5 rounded-full transition-all cursor-pointer ${
                  activeQuestIndex === dotIdx
                    ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] scale-125"
                    : "bg-white/30 hover:bg-white/60"
                }`}
                aria-label={`Quest tab ${dotIdx + 1}`}
              />
            ))}
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
              {activeQuestIndex === 0 && (isBn ? "ডেইলি কোয়েস্ট" : "Daily Quest")}
              {activeQuestIndex === 1 && (isBn ? "ফোকাস কোয়েস্ট" : "Focus Quest")}
              {activeQuestIndex === 2 && (isBn ? "জরুরি কোয়েস্ট" : "Urgent Quest")}
              {activeQuestIndex === 3 && (isBn ? "কাস্টম কোয়েস্ট" : "Custom Quest")}
            </h3>
            <p className="text-xs text-cyan-200/80 font-medium">
              {activeQuestIndex === 0 &&
                (completed
                  ? (isBn ? "সকল ব্যায়াম সম্পন্ন!" : "All exercises completed!")
                  : (isBn ? "৪টি অনুশীলন বাকি" : "4 exercises remaining"))}
              {activeQuestIndex === 1 &&
                (isBn ? `${focusExercises.length - focusCompletedCount}টি অনুশীলন বাকি` : `${focusExercises.length - focusCompletedCount} exercises remaining`)}
              {activeQuestIndex === 2 &&
                (urgentActive
                  ? (isBn ? "রেইড বস সক্রিয়!" : "Raid Boss Active!")
                  : (isBn ? "কোনো কোয়েস্ট উপলব্ধ নেই" : "No Quest Available"))}
              {activeQuestIndex === 3 &&
                (isBn ? "আপনার লক্ষ্য অনুযায়ী সাজান" : "Create a quest")}
            </p>
          </div>
        </div>

        {/* Circular Percentage Ring */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-950/60 border-2 border-blue-400/50 text-xs font-black text-white shadow-[0_0_15px_rgba(0,140,255,0.3)]">
          {activeQuestIndex === 0 && `${dailyPercent}%`}
          {activeQuestIndex === 1 && `${focusPercent}%`}
          {activeQuestIndex === 2 && (urgentActive ? "BOSS" : "-")}
          {activeQuestIndex === 3 && "+"}
        </div>
      </div>

      {/* Main Quest Container Card */}
      <div className="leveling-card p-5 relative">
        {/* ============================================================== */}
        {/* QUEST 0: DAILY QUEST (Exact layout from screenshot) */}
        {/* ============================================================== */}
        {activeQuestIndex === 0 && (
          <div>
            {/* Header Box: (i) [ DAILY QUEST ] */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="leveling-dialog-tag h-10 w-10 rounded-xl">
                <Info className="h-5 w-5" />
              </div>
              <div className="leveling-header-box">
                {isBn ? "ডেইলি কোয়েস্ট" : "DAILY QUEST"}
              </div>
            </div>

            {/* Narrative Subtitle */}
            <div className="text-center mb-5">
              <span className="text-xs font-medium text-cyan-200/90 tracking-wide">
                {isBn
                  ? "[ একজন অপরাজেয় যোদ্ধা হওয়ার প্রস্তুতি। ]"
                  : "[Training to become a great warrior.]"}
              </span>
            </div>

            <h4 className="text-center text-sm font-black text-white tracking-widest uppercase mb-4">
              GOALS
            </h4>

            {/* Objectives List */}
            <div className="space-y-3 font-sans max-w-sm mx-auto">
              {/* Push-Up */}
              <div
                onClick={() => handleToggleDailyItem("pushups")}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer select-none"
              >
                <span className="text-sm font-semibold text-white">
                  {isBn ? "পুশ-আপ (Push-Up)" : "Push-Up"}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    [{objectives.pushups.current}/{objectives.pushups.target}]
                  </span>
                  <div
                    className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      objectives.pushups.current >= objectives.pushups.target
                        ? "bg-cyan-500 border-cyan-400 text-black shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                        : "border-cyan-500/40 bg-black/40"
                    }`}
                  >
                    {objectives.pushups.current >= objectives.pushups.target && (
                      <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                    )}
                  </div>
                </div>
              </div>

              {/* Crunch / Sit-up */}
              <div
                onClick={() => handleToggleDailyItem("situps")}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer select-none"
              >
                <span className="text-sm font-semibold text-white">
                  {isBn ? "ক্রাঞ্চ / সিট-আপ (Crunch)" : "Crunch"}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    [{objectives.situps.current}/{objectives.situps.target}]
                  </span>
                  <div
                    className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      objectives.situps.current >= objectives.situps.target
                        ? "bg-cyan-500 border-cyan-400 text-black shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                        : "border-cyan-500/40 bg-black/40"
                    }`}
                  >
                    {objectives.situps.current >= objectives.situps.target && (
                      <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                    )}
                  </div>
                </div>
              </div>

              {/* Squat */}
              <div
                onClick={() => handleToggleDailyItem("squats")}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer select-none"
              >
                <span className="text-sm font-semibold text-white">
                  {isBn ? "স্কোয়াট (Squat)" : "Squat"}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    [{objectives.squats.current}/{objectives.squats.target}]
                  </span>
                  <div
                    className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      objectives.squats.current >= objectives.squats.target
                        ? "bg-cyan-500 border-cyan-400 text-black shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                        : "border-cyan-500/40 bg-black/40"
                    }`}
                  >
                    {objectives.squats.current >= objectives.squats.target && (
                      <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                    )}
                  </div>
                </div>
              </div>

              {/* Running */}
              <div
                onClick={() => handleToggleDailyItem("runKm")}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer select-none"
              >
                <span className="text-sm font-semibold text-white">
                  {isBn ? "দৌড় (Running)" : "Running"}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    [{Math.round(objectives.runKm.current * 1000)}m/
                    {Math.round(objectives.runKm.target * 1000)}m]
                  </span>
                  <div
                    className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      objectives.runKm.current >= objectives.runKm.target
                        ? "bg-cyan-500 border-cyan-400 text-black shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                        : "border-cyan-500/40 bg-black/40"
                    }`}
                  >
                    {objectives.runKm.current >= objectives.runKm.target && (
                      <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Warning / Info Message (Exact match) */}
            <div className="my-6 text-center max-w-sm mx-auto">
              <p className="text-[11px] leading-relaxed text-zinc-300 font-medium">
                <span className="text-amber-400 font-black">INFO!</span> –{" "}
                {isBn
                  ? "এই কোয়েস্ট সম্পন্ন না করলে পেনাল্টি জোনে প্রেরণের ঝুঁকি রয়েছে। নিয়মিত অনুশীলন নিশ্চিত করুন।"
                  : "This quest prepares your vessel for ascension. If not completed before time expires, a penalty quest may trigger."}
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="flex flex-col items-center justify-center">
              <Clock className="h-6 w-6 text-cyan-400 mb-1" />
              <span className="text-2xl font-black font-mono text-white text-glow-cyan tracking-wider">
                {timeLeft}
              </span>
            </div>

            {/* Claim Reward Button */}
            {completed && (
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={onClaimDailyQuest}
                  className="btn btn-success btn-sm font-black text-black shadow-[0_0_20px_rgba(16,185,129,0.6)]"
                >
                  {isBn ? "পুরস্কার সংগ্রহ করুন (+500 XP)" : "Claim Rewards (+500 XP)"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* QUEST 1: FOCUS QUEST (Workout Plan & Target Session) */}
        {/* ============================================================== */}
        {activeQuestIndex === 1 && (
          <div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="leveling-dialog-tag h-10 w-10 rounded-xl">
                <Info className="h-5 w-5" />
              </div>
              <div className="leveling-header-box">
                {isBn ? "ফোকাস কোয়েস্ট" : "FOCUS QUEST"}
              </div>
            </div>

            <div className="text-center mb-5">
              <span className="text-xs font-medium text-cyan-200/90 tracking-wide">
                {focusPlan?.focus
                  ? `[ ${focusPlan.focus.toUpperCase()} TRAINING SESSION ]`
                  : isBn
                  ? "[ আপনার পেশী শক্তি ও গঠনের লক্ষ্যভেদী সেশন। ]"
                  : "[A session focused on your progressive overload.]"}
              </span>
            </div>

            <h4 className="text-center text-sm font-black text-white tracking-widest uppercase mb-4">
              GOALS
            </h4>

            {/* Focus exercises list with interactive checks */}
            <div className="space-y-3 font-sans max-w-sm mx-auto">
              {focusExercises.map((ex, idx) => {
                const isChecked = Boolean(focusChecked[ex.id || String(idx)]);
                return (
                  <div
                    key={ex.id || idx}
                    onClick={() => {
                      playSound("system-click");
                      vibrate(20);
                      setFocusChecked((prev) => ({
                        ...prev,
                        [ex.id || String(idx)]: !isChecked,
                      }));
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {ex.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        {ex.targetReps || "[0/12]"}
                      </span>
                      <div
                        className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          isChecked
                            ? "bg-cyan-500 border-cyan-400 text-black shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                            : "border-cyan-500/40 bg-black/40"
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="h-4 w-4 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="my-6 text-center max-w-sm mx-auto">
              <p className="text-[11px] leading-relaxed text-zinc-300 font-medium">
                <span className="text-amber-400 font-black">INFO!</span> –{" "}
                {isBn
                  ? "এই সেশনটি আপনার আজকের রুটিন অনুযায়ী প্রস্তুত। শুরু করতে 'স্টার্ট রেইড' বাটনে চাপুন।"
                  : "This session matches today's progressive overload target. Press start to launch full tracking."}
              </p>
            </div>

            {/* Launch Workout Button & Timer */}
            <div className="flex flex-col items-center justify-center gap-3">
              {onStartFocusWorkout && (
                <button
                  type="button"
                  onClick={onStartFocusWorkout}
                  className="btn btn-primary btn-sm gap-2 font-bold shadow-[0_0_20px_rgba(37,99,235,0.5)]"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>{isBn ? "রেইড শুরু করুন" : "Start Dungeon Raid"}</span>
                </button>
              )}

              <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
                <Clock className="h-4 w-4" />
                <span>{timeLeft}</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* QUEST 2: URGENT QUEST (Matches WhatsApp Image 2026-10-20 at 11.28.35 PM (1).jpeg) */}
        {/* ============================================================== */}
        {activeQuestIndex === 2 && (
          <div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="leveling-dialog-tag h-10 w-10 rounded-xl">
                <Info className="h-5 w-5" />
              </div>
              <div className="leveling-header-box">
                {isBn ? "জরুরি কোয়েস্ট" : "URGENT QUEST"}
              </div>
            </div>

            <div className="text-center mb-6">
              <span className="text-xs font-medium text-cyan-200/90 tracking-wide">
                {isBn
                  ? "[ সর্বশেষ জরুরি কোয়েস্ট: কখনো নয় ]"
                  : "[Last Urgent Quest: Never]"}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center py-8 text-center max-w-xs mx-auto">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-950/40 border border-cyan-500/30 text-amber-400 mb-3 shadow-[0_0_15px_rgba(0,140,255,0.2)]">
                {urgentNotifications ? (
                  <Bell className="h-7 w-7 text-cyan-400 animate-bounce" />
                ) : (
                  <BellOff className="h-7 w-7 text-amber-400/80" />
                )}
              </div>

              <h4 className="text-sm font-bold text-white mb-1">
                {urgentNotifications
                  ? (isBn ? "জরুরি কোয়েস্ট সতর্কতা সক্রিয়" : "Urgent quest alerts are active")
                  : (isBn ? "জরুরি কোয়েস্ট নোটিফিকেশন বন্ধ" : "Urgent quest notifications are off")}
              </h4>

              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                {isBn
                  ? "জরুরি কোয়েস্ট বা ডেনজার জোন উপস্থিত হওয়ামাত্র সতর্কতা পেতে নোটিফিকেশন চালু রাখুন।"
                  : "Allow the required notifications and reminders to get alerted as soon as an urgent quest appears."}
              </p>

              <button
                type="button"
                onClick={() => {
                  playSound("system-alert");
                  vibrate(30);
                  setUrgentNotifications(!urgentNotifications);
                  if (!urgentNotifications) {
                    setUrgentActive(true);
                  }
                }}
                className="btn btn-outline btn-primary btn-sm w-full"
              >
                {urgentNotifications
                  ? (isBn ? "নোটিফিকেশন বন্ধ করুন" : "Disable notifications")
                  : (isBn ? "নোটিফিকেশন চালু করুন" : "Enable notifications")}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* QUEST 3: CUSTOM QUEST (Matches WhatsApp Image 2026-10-20 at 11.28.35 PM (2).jpeg) */}
        {/* ============================================================== */}
        {activeQuestIndex === 3 && (
          <div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="leveling-dialog-tag h-10 w-10 rounded-xl">
                <Info className="h-5 w-5" />
              </div>
              <div className="leveling-header-box">
                {isBn ? "কাস্টম কোয়েস্ট" : "CUSTOM QUEST"}
              </div>
            </div>

            <div className="text-center mb-6">
              <span className="text-xs font-medium text-cyan-200/90 tracking-wide">
                {isBn
                  ? "[ আপনার নিজস্ব লক্ষ্য অনুযায়ী কাস্টম কোয়েস্ট তৈরি করুন। ]"
                  : "[Create a quest tailored to your training goals.]"}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center py-8 text-center max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => {
                  playSound("system-click");
                  vibrate(20);
                  alert(isBn ? "কাস্টম কোয়েস্ট তৈরি করতে হান্টার পাস বা আর্সেনাল ব্যবহার করুন।" : "Use the Hunter Arsenal to assemble a custom training protocol.");
                }}
                className="btn btn-circle btn-primary h-16 w-16 text-white shadow-[0_0_25px_rgba(0,140,255,0.6)] mb-6 cursor-pointer"
              >
                <Plus className="h-8 w-8 stroke-[2.5]" />
              </button>

              <p className="text-[11px] leading-relaxed text-zinc-400">
                <span className="text-amber-400 font-bold">INFO!</span>{" "}
                {isBn
                  ? "কাস্টম কোয়েস্ট ব্যায়ামগুলি সিস্টেম এক্সপি বা গোল্ড প্রদান করে না।"
                  : "Custom Quest exercises do not progress exercise achievements and do not grant XP or gold."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
