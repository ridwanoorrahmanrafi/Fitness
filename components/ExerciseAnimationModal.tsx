"use client";

import { useEffect, useState, useRef } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  Timer,
  Zap,
  TrendingDown,
  TrendingUp,
  Activity,
  Dumbbell,
  ExternalLink,
  Eye,
  Maximize2,
  Minimize2,
  Gauge,
  Flame,
  Wind,
} from "lucide-react";
import { MUSCLE_LABEL } from "@/lib/exercises";
import { TRANSLATIONS, type Language } from "@/lib/i18n";
import type { Exercise } from "@/lib/types";
import { getExerciseMedia } from "@/lib/exerciseMedia";

interface Props {
  exercise: Exercise | null;
  easier?: Exercise;
  harder?: Exercise;
  lang?: Language;
  onClose: () => void;
  onSwap?: (exerciseId: string) => void;
}

type ViewMode = "gif" | "biomechanics";

export function ExerciseAnimationModal({
  exercise,
  easier,
  harder,
  lang = "bn",
  onClose,
  onSwap,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("gif");
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 1 | 1.5>(1);
  const [tempoPhase, setTempoPhase] = useState<"eccentric" | "pause" | "concentric">("eccentric");
  const [tempoSec, setTempoSec] = useState(3);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gifLoadError, setGifLoadError] = useState(false);
  const [imgKey, setImgKey] = useState(0);

  const t = TRANSLATIONS[lang] ?? TRANSLATIONS.bn;

  // Exercise media item
  const media = exercise ? getExerciseMedia(exercise.id) : null;

  // Tempo cycle simulation: 3s eccentric -> 1s pause -> 1s concentric -> repeat (5s loop adjusted by speed)
  useEffect(() => {
    if (!exercise || !isPlaying) return;

    let elapsed = 0;
    const intervalMs = Math.round(1000 / playbackSpeed);

    const interval = setInterval(() => {
      elapsed = (elapsed + 1) % 5;
      if (elapsed < 3) {
        setTempoPhase("eccentric");
        setTempoSec(3 - elapsed);
      } else if (elapsed === 3) {
        setTempoPhase("pause");
        setTempoSec(1);
      } else {
        setTempoPhase("concentric");
        setTempoSec(1);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [exercise, isPlaying, playbackSpeed]);

  // Reset states when exercise changes
  useEffect(() => {
    setGifLoadError(false);
    setIsPlaying(true);
    setImgKey((k) => k + 1);
  }, [exercise?.id]);

  if (!exercise || !media) return null;

  const pattern = exercise.pattern;

  // Biomechanical cues and detailed steps tailored to pattern
  const getPatternGuide = () => {
    switch (pattern) {
      case "squat":
        return {
          setup:
            lang === "bn"
              ? "পা কাঁধ বরাবর চওড়া, পায়ের পাতা ১৫-৩০° কোণে বাইরের দিকে। কোরকে পেটের ভেতর শক্ত করে ব্রেস করুন।"
              : "Feet shoulder-width apart, toes turned out 15-30°. Core braced firmly like anticipating a punch.",
          descent:
            lang === "bn"
              ? "হিপস ও হাঁটু একসাথে ভাঁজ করে ৩ সেকেন্ডে ধীরে বসুন। বুক টানটান রাখুন ও হাঁটু বুড়ো আঙুলের অভিমুখে রাখুন।"
              : "Break hips & knees simultaneously over 3 controlled seconds. Sit deep between thighs while chest stays proud.",
          drive:
            lang === "bn"
              ? "পায়ের পাতার মাঝখান দিয়ে মেঝেতে চাপ দিয়ে সজোরে সোজা হয়ে দাঁড়ান। শীর্ষে গ্লুটস চেপে ধরুন।"
              : "Drive through mid-foot aggressively. Squeeze glutes and extend knees fully at top lockout.",
          dos: [
            lang === "bn" ? "হাঁটু যেন পায়ের পাতার সোজা বরাবর থাকে" : "Keep knees tracking directly in line with toes",
            lang === "bn" ? "মেরুদণ্ড সোজা ও বুক টানটান রাখুন" : "Maintain neutral spine with chest held high",
            lang === "bn" ? "কমপক্ষে থাই মেঝের সমান্তরাল (প্যারালাল) গভীরতায় নামুন" : "Hit parallel depth (hip crease at or below knee level)",
          ],
          donts: [
            lang === "bn" ? "হাঁটু ভেতরে ভেঙে পড়তে দেবেন না" : "Don't let knees cave inward (valgus collapse)",
            lang === "bn" ? "নিচে গিয়ে কোমর বাঁকাবেন না (বাট উইংক)" : "Don't round your lower spine at bottom (butt wink)",
            lang === "bn" ? "গোড়ালি মেঝে থেকে তুলবেন না" : "Don't allow heels to lift off the floor",
          ],
        };
      case "push_h":
        return {
          setup:
            lang === "bn"
              ? "হাত কাঁধের চেয়ে সামান্য চওড়া, আঙুল ছড়ানো। মাথা থেকে গোড়ালি পর্যন্ত পুরো শরীর একদম সোজা তক্তার মতো।"
              : "Hands slightly wider than shoulder-width. Body in a rigid plank from head to heels.",
          descent:
            lang === "bn"
              ? "কনুই ৪৫° কোণে তীরের ফলার মতো রেখে বুক মেঝের ১-২ ইঞ্চি ওপর পর্যন্ত ৩ সেকেন্ডে নামান।"
              : "Lower chest to 1 inch above floor over 3 seconds with elbows tucked at 45° arrow angle.",
          drive:
            lang === "bn"
              ? "মেঝেতে জোরে ধাক্কা দিয়ে এক সেকেন্ডে সোজা ওপরে উঠুন, শীর্ষে কনুই নিয়ন্ত্রণ রেখে লক করুন।"
              : "Push aggressively through the palms, locking elbows cleanly while flaring lats.",
          dos: [
            lang === "bn" ? "কনুই শরীরের সাথে ৪৫° কোণে রাখুন (টি-শেপ নয়)" : "Keep elbows tucked at 45° arrow angle, not flared 90°",
            lang === "bn" ? "কোর ও গ্লুটস শক্ত রেখে কোমর সোজা রাখুন" : "Squeeze glutes & brace abs to prevent hip sag",
            lang === "bn" ? "পুরো রেঞ্জে বুক মেঝে পর্যন্ত নামান" : "Full range of motion: chest grazes floor each rep",
          ],
          donts: [
            lang === "bn" ? "কনুই ৯০° বাইরে ছড়িয়ে দেবেন না" : "Don't flare elbows wide (causes rotator cuff impingement)",
            lang === "bn" ? "কোমর নিচে ঝুলে পড়তে দেবেন না" : "Don't let lower back sag toward floor",
            lang === "bn" ? "গভীরতা নকল করতে ঘাড় ঝুঁকবেন না" : "Don't crane neck forward to fake depth",
          ],
        };
      case "pull_h":
      case "pull_v":
        return {
          setup:
            lang === "bn"
              ? "গ্রিপ শক্ত করে ধরুন। টানার আগে কাঁধের ব্লেড নিচে ও পেছনে লক (রিট্র্যাক্ট) করে নিন।"
              : "Grip firmly. Pack shoulder blades down and back before initiating the pull.",
          descent:
            lang === "bn"
              ? "কনুই পাঁজরের দিকে টেনে বুক হ্যান্ডেল বা বারের দিকে নিন। শীর্ষে পিঠের পেশি চেপে ধরুন।"
              : "Drive elbows down and back towards ribs. Pull until chest touches bar/handles.",
          drive:
            lang === "bn"
              ? "ধীরে ৩ সেকেন্ড ধরে হাত সোজা করে নামুন, কাঁধ আলগা না করে সম্পূর্ণ স্ট্রেচ অনুভব করুন।"
              : "Lower with strict 3-second control to full hang without relaxing scapular engagement.",
          dos: [
            lang === "bn" ? "হাতকে শুধু হুক মনে করুন, কনুই দিয়ে টানুন" : "Think of hands as hooks; pull primarily through elbows",
            lang === "bn" ? "বুকে টানুন এবং স্ক্যাপুলা চেপে ধরুন" : "Lead with chest tall and retract scapulae fully",
            lang === "bn" ? "নিচে সম্পূর্ণ স্ট্রেচ ও ওপরে পিক স্কুইজ করুন" : "Get full stretch at bottom, full contraction at top",
          ],
          donts: [
            lang === "bn" ? "শরীর দুলিয়ে মোমেন্টাম নেবেন না" : "Don't swing body or kip with momentum",
            lang === "bn" ? "কাঁধ কানের কাছে তুলে আনবেন না" : "Don't shrug shoulders up towards ears",
            lang === "bn" ? "অর্ধেক পথ গিয়ে টান থামাবেন না" : "Don't cut range of motion short at either end",
          ],
        };
      case "lunge":
        return {
          setup:
            lang === "bn"
              ? "সোজা হয়ে দাঁড়ান, পা হিপ বরাবর চওড়া। সামনের বা পেছনের পা নিয়ন্ত্রণ রেখে এক কদম বাড়ান।"
              : "Stand tall, feet hip-width. Take a controlled stride keeping torso upright.",
          descent:
            lang === "bn"
              ? "পেছনের হাঁটু মেঝের ১ ইঞ্চি ওপর পর্যন্ত নামান। উভয় হাঁটুতে প্রায় ৯০° কোণ তৈরি হবে।"
              : "Lower rear knee straight down until 1 inch off floor. Both knees at 90°.",
          drive:
            lang === "bn"
              ? "সামনের গোড়ালি দিয়ে চাপ দিয়ে সোজা আগের অবস্থানে উঠে আসুন।"
              : "Push through front heel & midfoot to return to starting position.",
          dos: [
            lang === "bn" ? "সামনের গোড়ালি সবসময় মেঝেতে শক্ত রাখুন" : "Keep front heel securely pinned to floor",
            lang === "bn" ? "হিপস হেডলাইটের মতো সোজা সামনের দিকে রাখুন" : "Keep hips square like headlights facing forward",
            lang === "bn" ? "৭০% ওজন সামনের পায়ে ও ৩০% পেছনের পায়ে রাখুন" : "Balance ~70% weight on front leg, 30% on back toe",
          ],
          donts: [
            lang === "bn" ? "সামনের হাঁটু ভেতরে ঢুকে যেতে দেবেন না" : "Don't let front knee collapse inward",
            lang === "bn" ? "শরীর অতিরিক্ত সামনের দিকে ঝুঁকবেন না" : "Don't lean torso excessively forward",
            lang === "bn" ? "পেছনের হাঁটু মেঝেতে আছাড় খাবেন না" : "Don't slam rear knee onto floor",
          ],
        };
      case "hinge":
        return {
          setup:
            lang === "bn"
              ? "পা হিপ বরাবর, হাঁটু সামান্য নরম (সফট বেন্ড)। কোমর ও কোর শক্ত করে প্রস্তুত হন।"
              : "Feet hip-width, soft bend in knees. Hips loaded and core braced.",
          descent:
            lang === "bn"
              ? "হিপস পেছনের দেয়াল ছোঁয়ার মতো পেছনে ঠেলুন। মেরুদণ্ড সোজা রেখে কোমর ভাঁজ করুন।"
              : "Push hips backward as if touching a wall behind you. Spine remains perfectly flat.",
          drive:
            lang === "bn"
              ? "গ্লুটস ও হ্যামস্ট্রিং চেপে হিপস সোজা সামনে এনে দাঁড়ান। পেছনের দিকে অতিরিক্ত হেলবেন না।"
              : "Drive hips forward by firing glutes & hamstrings to full lockout.",
          dos: [
            lang === "bn" ? "হাঁটু নিচে নয়, হিপস পেছনে ঠেলুন" : "Think hips back, not knees down (pure horizontal displacement)",
            lang === "bn" ? "ওজন পায়ের খুব কাছাকাছি রাখুন" : "Keep bar or dumbbells grazing against thighs & shins",
            lang === "bn" ? "হ্যামস্ট্রিং-এ গভীর স্ট্রেচ অনুভব করুন" : "Feel deep stretch loaded into hamstrings at bottom",
          ],
          donts: [
            lang === "bn" ? "পিঠ বা কোমর গোল করবেন না" : "Don't round your spine or look straight up",
            lang === "bn" ? "হাঁটু বেশি ভেঙে স্কোয়াট বানাবেন না" : "Don't squat it by bending knees excessively",
            lang === "bn" ? "শীর্ষে গিয়ে কোমর অতিরিক্ত পেছনে হেলাবেন না" : "Don't hyperextend lower back at lockout",
          ],
        };
      default:
        return {
          setup:
            lang === "bn"
              ? "সঠিক শরীর সংমিশ্রণ নিয়ে ব্যালান্স বজায় রাখুন এবং টার্গেট পেশিতে টান অনুভব করুন।"
              : "Establish balanced posture and engage target muscle group before initiating movement.",
          descent:
            lang === "bn"
              ? "৩ সেকেন্ড ধরে ধীরে স্ট্রেচ করে ওজন নামান (ইসেন্ট্রিক ফেজ)।"
              : "Control the 3-second eccentric phase, loading the muscle fully under stretch.",
          drive:
            lang === "bn"
              ? "১ সেকেন্ডে শক্ত কন্ট্রাকশন দিয়ে তুলুন এবং ১ সেকেন্ড শীর্ষে হোল্ড করুন।"
              : "Contract forcefully on concentric phase, pausing 1 second at peak tension.",
          dos: [
            lang === "bn" ? "পেশি ও মনের সংযোগ (মাইন্ড-মাসল) বজায় রাখুন" : "Focus on strict mind-muscle contraction",
            lang === "bn" ? "ছন্দ বজায় রেখে স্বাভাবিক শ্বাস নিন" : "Maintain steady, rhythmic breathing throughout",
            lang === "bn" ? "৩:১:১ টেম্পো কঠোরভাবে মেনে চলুন" : "Maintain strict 3-1-1 tempo control",
          ],
          donts: [
            lang === "bn" ? "ঝাঁকুনি বা মোমেন্টাম দেবেন না" : "Don't jerk or swing with momentum",
            lang === "bn" ? "শ্বাস আটকে রাখবেন না" : "Don't hold breath under strain",
            lang === "bn" ? "ফর্ম নষ্ট করে বেশি ওজন নেবেন না" : "Don't sacrifice form for heavier load",
          ],
        };
    }
  };

  const guide = getPatternGuide();
  const gifSrc = gifLoadError ? media.remoteFallbackGif : media.localGif;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="animation-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 backdrop-blur-md sm:items-center p-0 sm:p-4 transition-all duration-300 animate-in fade-in"
    >
      <div
        className={`system-window relative flex w-full flex-col rounded-t-2xl sm:rounded-2xl border-1.5 border-cyan-500/60 bg-[#03081a]/95 shadow-[0_0_40px_rgba(6,182,212,0.4)] text-cyan-100 overflow-hidden transition-all duration-300 font-sans ${
          isFullscreen
            ? "fixed inset-0 max-h-screen rounded-none z-50"
            : "max-h-[94vh] max-w-2xl"
        }`}
      >
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-90 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 bg-[#03081a] px-4 sm:px-6 py-3.5 backdrop-blur-md">
          <div className="min-w-0 pr-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center system-btn-chamfer bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                <Activity className="h-4 w-4" />
              </span>
              <h2 id="animation-modal-title" className="text-base sm:text-lg font-black text-white truncate font-mono uppercase text-glow-cyan">
                {exercise.name}
              </h2>
            </div>
            <div className="flex items-center gap-2 mt-1 font-mono">
              <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
                {exercise.muscles.map((m) => MUSCLE_LABEL[m]).join(" · ")}
              </span>
              <span className="text-cyan-700">•</span>
              <span className="text-xs text-cyan-500/80 uppercase tracking-wide">{exercise.pattern.replace("_", " ")}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* View Mode Switcher Pills */}
            <div className="hidden sm:flex items-center system-btn-chamfer border border-cyan-500/30 bg-[#020512] p-1 mr-1">
              <button
                onClick={() => setViewMode("gif")}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold system-btn-chamfer transition-all ${
                  viewMode === "gif"
                    ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                    : "text-cyan-400/60 hover:text-cyan-200"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>{lang === "bn" ? "হলোগ্রাম মোশন" : "Hologram Motion"}</span>
              </button>
              <button
                onClick={() => setViewMode("biomechanics")}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold system-btn-chamfer transition-all ${
                  viewMode === "biomechanics"
                    ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                    : "text-cyan-400/60 hover:text-cyan-200"
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>{lang === "bn" ? "ভেক্টর রিগ" : "Vector Rig"}</span>
              </button>
            </div>

            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pause animation" : "Play animation"}
              className="flex h-9 w-9 items-center justify-center system-btn-chamfer border border-cyan-500/30 bg-[#03081a] text-cyan-300 hover:text-white hover:border-cyan-400 transition-colors"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
            </button>

            {/* Fullscreen Expand */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              className="hidden sm:flex h-9 w-9 items-center justify-center system-btn-chamfer border border-cyan-500/30 bg-[#03081a] text-cyan-300 hover:text-white transition-colors"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close animation guide"
              className="flex h-9 w-9 items-center justify-center system-btn-chamfer border border-cyan-500/30 bg-[#03081a] text-cyan-400 hover:text-white hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex sm:hidden border-b border-cyan-500/20 bg-[#03081a]/90 p-1.5 px-4 gap-2 font-mono">
          <button
            onClick={() => setViewMode("gif")}
            className={`flex-1 py-1.5 text-xs font-semibold system-btn-chamfer text-center transition-all ${
              viewMode === "gif"
                ? "bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                : "text-cyan-400/70 bg-[#020512] border border-cyan-500/30"
            }`}
          >
            {lang === "bn" ? "📹 হলোগ্রাম মোশন" : "📹 Hologram Motion"}
          </button>
          <button
            onClick={() => setViewMode("biomechanics")}
            className={`flex-1 py-1.5 text-xs font-semibold system-btn-chamfer text-center transition-all ${
              viewMode === "biomechanics"
                ? "bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                : "text-cyan-400/70 bg-[#020512] border border-cyan-500/30"
            }`}
          >
            {lang === "bn" ? "🧬 ভেক্টর রিগ" : "🧬 Vector Rig"}
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Main Visualizer Frame */}
          <div className="relative overflow-hidden rounded-2xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 p-4 shadow-2xl flex flex-col items-center justify-center min-h-[290px]">
            {/* Subtle Grid Backdrop */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(#10b981 1.2px, transparent 1.2px)",
                backgroundSize: "20px 20px",
              }}
            />

            {/* Ambient Backlight Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

            {/* Top Bar inside Viewport: Speed Selector & Status */}
            <div className="relative z-10 w-full flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono font-medium text-emerald-400/90 uppercase tracking-wider">
                  {isPlaying ? "Live Looping" : "Paused"}
                </span>
              </div>

              {/* Speed Buttons */}
              <div className="flex items-center gap-1 bg-zinc-950/80 border border-zinc-800 rounded-lg p-0.5">
                {([0.5, 1, 1.5] as const).map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-all ${
                      playbackSpeed === spd
                        ? "bg-emerald-500 text-zinc-950 font-bold"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* VIEW MODE 1: REAL HIGH-DEFINITION MOTION GIF */}
            {viewMode === "gif" && (
              <div className="relative z-10 w-full max-w-[380px] h-[220px] sm:h-[240px] flex items-center justify-center rounded-xl overflow-hidden bg-zinc-950/60 border border-zinc-800/60">
                <img
                  key={`${exercise.id}-${imgKey}`}
                  src={gifSrc}
                  alt={`Demonstration of ${exercise.name}`}
                  className={`w-full h-full object-contain transition-opacity duration-300 ${
                    isPlaying ? "opacity-100" : "opacity-85"
                  }`}
                  loading="eager"
                  onError={() => {
                    if (!gifLoadError) {
                      setGifLoadError(true);
                    }
                  }}
                />

                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/90 text-zinc-950 shadow-lg cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setIsPlaying(true)}
                    >
                      <Play className="h-6 w-6 fill-current ml-0.5" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW MODE 2: BIOMECHANICAL VECTOR RIG WITH ACTIVE SKELETON & GLOW */}
            {viewMode === "biomechanics" && (
              <div className="relative z-10 w-full max-w-[340px] h-[220px] sm:h-[240px] flex items-center justify-center">
                <svg viewBox="0 0 240 180" className="w-full h-full drop-shadow-xl">
                  <defs>
                    <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="boneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#a1a1aa" />
                    </linearGradient>
                    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#0284c7" />
                    </linearGradient>
                  </defs>

                  {/* Ground Plane Grid */}
                  <line x1="20" y1="165" x2="220" y2="165" stroke="#3f3f46" strokeWidth="2.5" strokeDasharray="4 4" />
                  <rect x="20" y="166" width="200" height="2" fill="#27272a" />

                  {/* SQUAT PATTERN */}
                  {pattern === "squat" && (
                    <g className={isPlaying ? "animate-squat" : ""}>
                      {/* Head */}
                      <circle cx="120" cy="40" r="12" fill="url(#bodyGrad)" />
                      {/* Torso */}
                      <line x1="120" y1="52" x2="120" y2="100" stroke="url(#bodyGrad)" strokeWidth="12" strokeLinecap="round" />
                      {/* Arms Holding Balance */}
                      <line x1="120" y1="62" x2="148" y2="76" stroke="#f4f4f5" strokeWidth="7" strokeLinecap="round" />
                      <line x1="148" y1="76" x2="155" y2="60" stroke="#f4f4f5" strokeWidth="6" strokeLinecap="round" />
                      {/* Left Leg (Background) */}
                      <line x1="114" y1="100" x2="98" y2="132" stroke="url(#boneGrad)" strokeWidth="8" strokeLinecap="round" />
                      <line x1="98" y1="132" x2="102" y2="165" stroke="url(#boneGrad)" strokeWidth="8" strokeLinecap="round" />
                      <ellipse cx="106" cy="165" rx="10" ry="4" fill="#a1a1aa" />
                      {/* Right Leg (Active Quad Glow) */}
                      <line x1="126" y1="100" x2="142" y2="132" stroke="url(#bodyGrad)" strokeWidth="9" strokeLinecap="round" />
                      <line x1="142" y1="132" x2="138" y2="165" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
                      <ellipse cx="142" cy="165" rx="10" ry="4" fill="#34d399" />
                      {/* Flexion Angle Marker */}
                      <circle cx="142" cy="132" r="5" fill="#38bdf8" />
                    </g>
                  )}

                  {/* PUSH-UP / HORIZONTAL PUSH PATTERN */}
                  {pattern === "push_h" && (
                    <g className={isPlaying ? "animate-pushup" : ""}>
                      <circle cx="50" cy="160" r="6" fill="#71717a" />
                      <line x1="52" y1="158" x2="110" y2="130" stroke="url(#boneGrad)" strokeWidth="8" strokeLinecap="round" />
                      <line x1="110" y1="130" x2="170" y2="100" stroke="url(#bodyGrad)" strokeWidth="12" strokeLinecap="round" />
                      <circle cx="186" cy="92" r="11" fill="url(#bodyGrad)" />
                      {/* Pectoral Activation Highlight */}
                      <circle cx="160" cy="110" r="8" fill="#10b981" opacity="0.6" />
                      {/* Arm Articulation */}
                      <line x1="165" y1="105" x2="155" y2="135" stroke="#f4f4f5" strokeWidth="8" strokeLinecap="round" />
                      <line x1="155" y1="135" x2="155" y2="165" stroke="#f4f4f5" strokeWidth="8" strokeLinecap="round" />
                      <circle cx="155" cy="135" r="5" fill="#38bdf8" />
                      <circle cx="155" cy="165" r="5" fill="#10b981" />
                    </g>
                  )}

                  {/* PULL PATTERN */}
                  {(pattern === "pull_v" || pattern === "pull_h") && (
                    <g className={isPlaying ? "animate-pullup" : ""}>
                      <line x1="40" y1="20" x2="200" y2="20" stroke="#71717a" strokeWidth="7" strokeLinecap="round" />
                      <circle cx="95" cy="20" r="5" fill="#10b981" />
                      <circle cx="145" cy="20" r="5" fill="#10b981" />
                      <line x1="95" y1="20" x2="105" y2="55" stroke="#f4f4f5" strokeWidth="7" strokeLinecap="round" />
                      <line x1="145" y1="20" x2="135" y2="55" stroke="#f4f4f5" strokeWidth="7" strokeLinecap="round" />
                      <circle cx="120" cy="45" r="11" fill="url(#bodyGrad)" />
                      {/* Latissimus Dorsi Muscle Flare */}
                      <path d="M 112 65 Q 98 85 110 110" stroke="#34d399" strokeWidth="6" fill="none" opacity="0.8" />
                      <path d="M 128 65 Q 142 85 130 110" stroke="#34d399" strokeWidth="6" fill="none" opacity="0.8" />
                      <line x1="120" y1="56" x2="120" y2="110" stroke="url(#bodyGrad)" strokeWidth="12" strokeLinecap="round" />
                      <line x1="120" y1="110" x2="115" y2="155" stroke="url(#boneGrad)" strokeWidth="8" strokeLinecap="round" />
                      <line x1="115" y1="155" x2="125" y2="170" stroke="url(#boneGrad)" strokeWidth="7" strokeLinecap="round" />
                    </g>
                  )}

                  {/* LUNGE PATTERN */}
                  {pattern === "lunge" && (
                    <g className={isPlaying ? "animate-lunge" : ""}>
                      <circle cx="120" cy="40" r="11" fill="url(#bodyGrad)" />
                      <line x1="120" y1="52" x2="120" y2="102" stroke="url(#bodyGrad)" strokeWidth="11" strokeLinecap="round" />
                      <line x1="120" y1="62" x2="105" y2="80" stroke="#f4f4f5" strokeWidth="6" strokeLinecap="round" />
                      <line x1="105" y1="80" x2="115" y2="95" stroke="#f4f4f5" strokeWidth="6" strokeLinecap="round" />
                      {/* Front Leg (90° bend) */}
                      <line x1="120" y1="102" x2="155" y2="132" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
                      <line x1="155" y1="132" x2="155" y2="165" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
                      <circle cx="155" cy="132" r="5" fill="#38bdf8" />
                      <ellipse cx="160" cy="165" rx="8" ry="4" fill="#34d399" />
                      {/* Back Leg */}
                      <line x1="120" y1="102" x2="88" y2="135" stroke="url(#boneGrad)" strokeWidth="8" strokeLinecap="round" />
                      <line x1="88" y1="135" x2="75" y2="165" stroke="url(#boneGrad)" strokeWidth="8" strokeLinecap="round" />
                      <circle cx="75" cy="165" r="4" fill="#a1a1aa" />
                    </g>
                  )}

                  {/* HINGE / CORE / DEFAULT */}
                  {pattern !== "squat" && pattern !== "push_h" && pattern !== "pull_v" && pattern !== "pull_h" && pattern !== "lunge" && (
                    <g className={isPlaying ? "animate-squat" : ""}>
                      <circle cx="120" cy="42" r="11" fill="url(#bodyGrad)" />
                      <line x1="120" y1="54" x2="120" y2="105" stroke="url(#bodyGrad)" strokeWidth="11" strokeLinecap="round" />
                      <line x1="120" y1="64" x2="140" y2="95" stroke="#f4f4f5" strokeWidth="7" strokeLinecap="round" />
                      <circle cx="140" cy="98" r="7" fill="#10b981" />
                      <line x1="116" y1="105" x2="105" y2="165" stroke="url(#boneGrad)" strokeWidth="8" strokeLinecap="round" />
                      <line x1="124" y1="105" x2="135" y2="165" stroke="url(#boneGrad)" strokeWidth="8" strokeLinecap="round" />
                    </g>
                  )}
                </svg>
              </div>
            )}

            {/* Cadence & Tempo Bar */}
            <div className="relative z-10 w-full mt-3 rounded-xl border border-zinc-800 bg-zinc-950/85 p-3 flex flex-wrap items-center justify-between gap-2 shadow-inner">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">{t.tempoLabel}</span>
                <span className="text-[11px] font-mono text-zinc-400 font-bold">
                  ({tempoSec}s)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-md px-2.5 py-1 text-xs font-mono font-bold transition-all duration-300 ${
                    tempoPhase === "eccentric"
                      ? "bg-amber-500/25 text-amber-300 border border-amber-500/50 scale-105 shadow-sm"
                      : "text-zinc-500"
                  }`}
                >
                  {t.tempoEccentric}
                </span>
                <span className="text-zinc-700 font-mono">•</span>
                <span
                  className={`rounded-md px-2.5 py-1 text-xs font-mono font-bold transition-all duration-300 ${
                    tempoPhase === "pause"
                      ? "bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 scale-105 shadow-sm"
                      : "text-zinc-500"
                  }`}
                >
                  {t.tempoPause}
                </span>
                <span className="text-zinc-700 font-mono">•</span>
                <span
                  className={`rounded-md px-2.5 py-1 text-xs font-mono font-bold transition-all duration-300 ${
                    tempoPhase === "concentric"
                      ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 scale-105 shadow-sm"
                      : "text-zinc-500"
                  }`}
                >
                  {t.tempoConcentric}
                </span>
              </div>
            </div>

            {/* Breathing Guidance Pill */}
            <div className="relative z-10 w-full mt-2 rounded-xl border border-emerald-500/20 bg-emerald-950/20 px-3.5 py-2 flex items-center gap-2.5 text-xs text-emerald-300">
              <Wind className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{media.keyBreathingCue}</span>
            </div>
          </div>

          {/* Biomechanical Execution Guide */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Zap className="h-3.5 w-3.5" /> {t.stepByStepTitle}
            </h3>

            <div className="space-y-2.5 text-xs leading-relaxed text-zinc-300">
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-3 transition-colors hover:border-zinc-700">
                <strong className="text-white block mb-0.5">
                  {lang === "bn" ? "১. সেটআপ ও অবস্থান (Setup & Stance):" : "1. Setup & Stance:"}
                </strong>
                {guide.setup}
              </div>
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-3 transition-colors hover:border-zinc-700">
                <strong className="text-white block mb-0.5">
                  {lang === "bn" ? "২. নামার কৌশল (Controlled Descent):" : "2. Controlled Descent (Eccentric):"}
                </strong>
                {guide.descent}
              </div>
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-3 transition-colors hover:border-zinc-700">
                <strong className="text-white block mb-0.5">
                  {lang === "bn" ? "৩. ওঠার ড্রাইভ ও কন্ট্রাকশন (The Concentric Drive):" : "3. Concentric Drive & Lockout:"}
                </strong>
                {guide.drive}
              </div>
            </div>
          </div>

          {/* Form Checklist: Do's and Don'ts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* DO's */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-3.5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> {t.dosTitle}
              </h4>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {guide.dos.map((d, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* DONT's */}
            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/15 p-3.5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <AlertOctagon className="h-3.5 w-3.5" /> {t.dontsTitle}
              </h4>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {guide.donts.map((d, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold shrink-0">✕</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Progression & Regression Quick-Swap Links */}
          {(easier || harder) && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-zinc-400">
                {lang === "bn" ? "ভ্যারিয়েন্ট পরিবর্তন করুন:" : "Swap Variation:"}
              </span>
              <div className="flex items-center gap-2">
                {easier && onSwap && (
                  <button
                    onClick={() => {
                      onSwap(easier.id);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700 transition-colors"
                  >
                    <TrendingDown className="h-3.5 w-3.5 text-amber-400" />
                    <span>{t.easierBtn(easier.name)}</span>
                  </button>
                )}
                {harder && onSwap && (
                  <button
                    onClick={() => {
                      onSwap(harder.id);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700 transition-colors"
                  >
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{t.harderBtn(harder.name)}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-cyan-500/30 bg-[#03081a] px-5 py-3.5 flex items-center justify-between gap-3">
          <a
            href={`https://www.youtube.com/results?search_query=proper+form+${encodeURIComponent(exercise.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center gap-2 system-btn-chamfer border border-cyan-500/30 bg-[#020512] px-4 font-mono text-xs font-bold text-cyan-300 hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(6,182,212,0.35)] transition-all"
          >
            <ExternalLink className="h-3.5 w-3.5 text-cyan-400" />
            <span>{t.formVideoBtn} (YouTube)</span>
          </a>

          <button
            onClick={onClose}
            className="flex min-h-[44px] items-center justify-center system-btn-chamfer bg-gradient-to-r from-cyan-400 via-blue-600 to-purple-600 px-6 font-mono text-xs font-black uppercase text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-95 transition-all"
          >
            {t.gotItBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
