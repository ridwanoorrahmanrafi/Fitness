"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { MUSCLE_LABEL } from "@/lib/exercises";
import { TRANSLATIONS, type Language } from "@/lib/i18n";
import type { Exercise } from "@/lib/types";

interface Props {
  exercise: Exercise | null;
  easier?: Exercise;
  harder?: Exercise;
  lang?: Language;
  onClose: () => void;
  onSwap?: (exerciseId: string) => void;
}

export function ExerciseAnimationModal({
  exercise,
  easier,
  harder,
  lang = "bn",
  onClose,
  onSwap,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [tempoPhase, setTempoPhase] = useState<"eccentric" | "pause" | "concentric">("eccentric");
  const [tempoSec, setTempoSec] = useState(3);
  const t = TRANSLATIONS[lang] ?? TRANSLATIONS.bn;

  // Tempo cycle simulation: 3s eccentric -> 1s pause -> 1s concentric -> repeat (5s total loop)
  useEffect(() => {
    if (!exercise || !isPlaying) return;

    let elapsed = 0;
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
    }, 1000);

    return () => clearInterval(interval);
  }, [exercise, isPlaying]);

  if (!exercise) return null;

  const pattern = exercise.pattern;

  // Biomechanical cues and detailed steps tailored to pattern
  const getPatternGuide = () => {
    switch (pattern) {
      case "squat":
        return {
          setup: "Feet shoulder-width apart, toes turned out 15-30°. Core braced like you're about to be punched.",
          descent: "Break at the hips and knees simultaneously. Sit down between your thighs while keeping chest proud.",
          drive: "Drive the floor away through your mid-foot. Squeeze glutes and extend knees together at the top.",
          dos: [
            "Keep knees tracking in line with your 2nd and 3rd toes",
            "Maintain a neutral spine with chest tall throughout",
            "Hit parallel depth (hip crease at or below knee level)",
          ],
          donts: [
            "Don't let knees cave inward (valgus collapse)",
            "Don't round your lower back at bottom (butt wink)",
            "Don't lift your heels off the ground",
          ],
        };
      case "push_h":
        return {
          setup: "Hands slightly wider than shoulder-width, fingers spread. Body in a rigid plank from head to heels.",
          descent: "Lower chest to within 1-2 inches of floor with elbows tucked at a 45-degree arrow angle.",
          drive: "Push aggressively into the ground, locking elbows cleanly at top while protracting shoulder blades.",
          dos: [
            "Keep elbows tucked at ~45° (arrow shape, not T-shape)",
            "Engage glutes and core to keep hips level with shoulders",
            "Full range of motion: chest touches or grazes the floor",
          ],
          donts: [
            "Don't flare elbows out at 90 degrees (strains rotator cuff)",
            "Don't allow your lower back or hips to sag down",
            "Don't crane neck forward to fake depth",
          ],
        };
      case "pull_h":
      case "pull_v":
        return {
          setup: "Grip bar or handles firmly. Set shoulder blades down and back before starting the pull.",
          descent: "Initiate pull by driving elbows down and back towards your ribs. Pull until chest reaches handles/bar.",
          drive: "Lower with strict 3-second control back to full arm extension without relaxing shoulders.",
          dos: [
            "Lead with your chest and retract your scapula first",
            "Think of your hands as hooks; pull with your elbows",
            "Get a full stretch at bottom and peak squeeze at top",
          ],
          donts: [
            "Don't swing your torso or use momentum/kipping",
            "Don't shrug shoulders up towards your ears",
            "Don't cut range of motion short at either end",
          ],
        };
      case "lunge":
        return {
          setup: "Stand tall, feet hip-width. Take a controlled stride forward or backward keeping torso upright.",
          descent: "Lower rear knee straight down until it hovers 1 inch above the floor. Front shin stays nearly vertical.",
          drive: "Push through the front heel and mid-foot to stand back up to starting position.",
          dos: [
            "Create 90-degree angles at both front and back knees",
            "Keep hips square facing forward like headlights",
            "Distribute ~70% weight through front leg, 30% through back toe",
          ],
          donts: [
            "Don't let front knee collapse inward",
            "Don't let front heel rise up off the floor",
            "Don't lean torso aggressively forward",
          ],
        };
      case "hinge":
        return {
          setup: "Feet hip-width apart, soft bend in knees. Hips loaded and core pressurized.",
          descent: "Push hips backward as if touching a wall behind you. Torso hinges forward with a flat spine.",
          drive: "Drive hips forward by contracting glutes and hamstrings until standing fully tall.",
          dos: [
            "Think hips back, not knees down (pure horizontal displacement)",
            "Keep weights/arms tracing close against thighs and shins",
            "Feel strong stretch in hamstrings at end range",
          ],
          donts: [
            "Don't round your spine or look straight up at ceiling",
            "Don't turn it into a squat by bending knees too much",
            "Don't hyperextend lower back at the top lockout",
          ],
        };
      case "push_v":
        return {
          setup: "Feet planted, glutes and abs squeezed tight. Dumbbells at shoulder level with forearms vertical.",
          descent: "Press vertically overhead in a slight arc until arms are locked with bicep next to ear.",
          drive: "Lower slowly with control back to clavicle level over 3 seconds.",
          dos: [
            "Lock ribs down and squeeze glutes to prevent back arching",
            "Press head through the window at top lockout",
            "Keep wrists straight directly over elbows",
          ],
          donts: [
            "Don't arch lower back to turn it into an incline press",
            "Don't press weights forward away from center of gravity",
            "Don't bounce out of bottom position",
          ],
        };
      default:
        return {
          setup: "Set up with balanced posture and tension in target muscles before initiating movement.",
          descent: "Control the eccentric phase for 3 seconds, stretching the muscle under tension.",
          drive: "Contract forcefully on concentric phase, pausing for 1 second at peak contraction.",
          dos: [
            "Focus strictly on mind-muscle connection",
            "Maintain steady breathing throughout",
            "Keep movement tempo strict and controlled",
          ],
          donts: [
            "Don't use momentum or jerking motions",
            "Don't hold your breath under exertion",
            "Don't sacrifice form for more weight",
          ],
        };
    }
  };

  const guide = getPatternGuide();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="animation-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 backdrop-blur-md sm:items-center p-0 sm:p-4"
    >
      <div className="relative flex max-h-[94vh] w-full max-w-2xl flex-col rounded-t-3xl sm:rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl text-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/90 px-5 py-3.5">
          <div className="min-w-0 pr-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <Activity className="h-3.5 w-3.5" />
              </span>
              <h2 id="animation-modal-title" className="text-base font-bold text-white sm:text-lg truncate">
                {exercise.name}
              </h2>
            </div>
            <p className="text-xs text-emerald-400 font-medium mt-0.5">
              {exercise.muscles.map((m) => MUSCLE_LABEL[m]).join(" · ")}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pause animation" : "Play animation"}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              aria-label="Close animation guide"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Animated Vector Rig Screen */}
          <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-zinc-950 p-4 shadow-inner flex flex-col items-center justify-center">
            {/* Visual Grid Background */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(#10b981 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* Glowing Accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

            {/* Exercise Animated SVG Vector Visualizer */}
            <div className="relative z-10 w-full max-w-[340px] h-52 flex items-center justify-center">
              <svg viewBox="0 0 240 180" className="w-full h-full drop-shadow-lg">
                <defs>
                  <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="boneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f4f4f5" />
                    <stop offset="100%" stopColor="#a1a1aa" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Ground plane */}
                <line x1="20" y1="165" x2="220" y2="165" stroke="#3f3f46" strokeWidth="2.5" strokeDasharray="4 4" />
                <rect x="20" y="166" width="200" height="2" fill="#27272a" />

                {/* SQUAT ANIMATION */}
                {pattern === "squat" && (
                  <g className={isPlaying ? "animate-squat" : ""}>
                    {/* Head */}
                    <circle cx="120" cy="40" r="12" fill="url(#bodyGrad)" />
                    {/* Torso */}
                    <line x1="120" y1="52" x2="120" y2="100" stroke="url(#bodyGrad)" strokeWidth="12" strokeLinecap="round" />
                    {/* Arms (holding forward balance or goblet) */}
                    <line x1="120" y1="62" x2="148" y2="76" stroke="#e4e4e7" strokeWidth="7" strokeLinecap="round" />
                    <line x1="148" y1="76" x2="155" y2="60" stroke="#e4e4e7" strokeWidth="6" strokeLinecap="round" />
                    {/* Left Leg */}
                    <line x1="114" y1="100" x2="98" y2="132" stroke="url(#boneGrad)" strokeWidth="8" strokeLinecap="round" />
                    <line x1="98" y1="132" x2="102" y2="165" stroke="url(#boneGrad)" strokeWidth="8" strokeLinecap="round" />
                    <ellipse cx="106" cy="165" rx="10" ry="4" fill="#a1a1aa" />
                    {/* Right Leg */}
                    <line x1="126" y1="100" x2="142" y2="132" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
                    <line x1="142" y1="132" x2="138" y2="165" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
                    <ellipse cx="142" cy="165" rx="10" ry="4" fill="#34d399" />
                  </g>
                )}

                {/* PUSH-UP ANIMATION */}
                {pattern === "push_h" && (
                  <g className={isPlaying ? "animate-pushup" : ""}>
                    {/* Feet planted */}
                    <circle cx="50" cy="160" r="6" fill="#71717a" />
                    {/* Legs */}
                    <line x1="52" y1="158" x2="110" y2="130" stroke="url(#boneGrad)" strokeWidth="8" strokeLinecap="round" />
                    {/* Torso & Core */}
                    <line x1="110" y1="130" x2="170" y2="100" stroke="url(#bodyGrad)" strokeWidth="11" strokeLinecap="round" />
                    {/* Head */}
                    <circle cx="186" cy="92" r="11" fill="url(#bodyGrad)" />
                    {/* Arm pushing to floor */}
                    <line x1="165" y1="105" x2="155" y2="135" stroke="#f4f4f5" strokeWidth="8" strokeLinecap="round" />
                    <line x1="155" y1="135" x2="155" y2="165" stroke="#f4f4f5" strokeWidth="8" strokeLinecap="round" />
                    <circle cx="155" cy="165" r="5" fill="#10b981" />
                  </g>
                )}

                {/* PULL-UP / PULL ANIMATION */}
                {(pattern === "pull_v" || pattern === "pull_h") && (
                  <g className={isPlaying ? "animate-pullup" : ""}>
                    {/* Pull-up Bar */}
                    <line x1="40" y1="20" x2="200" y2="20" stroke="#71717a" strokeWidth="6" strokeLinecap="round" />
                    {/* Hands on bar */}
                    <circle cx="95" cy="20" r="5" fill="#10b981" />
                    <circle cx="145" cy="20" r="5" fill="#10b981" />
                    {/* Arms */}
                    <line x1="95" y1="20" x2="105" y2="55" stroke="#f4f4f5" strokeWidth="7" strokeLinecap="round" />
                    <line x1="145" y1="20" x2="135" y2="55" stroke="#f4f4f5" strokeWidth="7" strokeLinecap="round" />
                    {/* Head */}
                    <circle cx="120" cy="45" r="11" fill="url(#bodyGrad)" />
                    {/* Torso & Back */}
                    <line x1="120" y1="56" x2="120" y2="110" stroke="url(#bodyGrad)" strokeWidth="12" strokeLinecap="round" />
                    {/* Legs */}
                    <line x1="120" y1="110" x2="115" y2="155" stroke="url(#boneGrad)" strokeWidth="8" strokeLinecap="round" />
                    <line x1="115" y1="155" x2="125" y2="170" stroke="url(#boneGrad)" strokeWidth="7" strokeLinecap="round" />
                  </g>
                )}

                {/* LUNGE ANIMATION */}
                {pattern === "lunge" && (
                  <g className={isPlaying ? "animate-lunge" : ""}>
                    {/* Head */}
                    <circle cx="120" cy="40" r="11" fill="url(#bodyGrad)" />
                    {/* Torso */}
                    <line x1="120" y1="52" x2="120" y2="102" stroke="url(#bodyGrad)" strokeWidth="11" strokeLinecap="round" />
                    {/* Arms on hips */}
                    <line x1="120" y1="62" x2="105" y2="80" stroke="#f4f4f5" strokeWidth="6" strokeLinecap="round" />
                    <line x1="105" y1="80" x2="115" y2="95" stroke="#f4f4f5" strokeWidth="6" strokeLinecap="round" />
                    {/* Front Leg (stepping forward) */}
                    <line x1="120" y1="102" x2="155" y2="132" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
                    <line x1="155" y1="132" x2="155" y2="165" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
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
                    {/* Head */}
                    <circle cx="120" cy="42" r="11" fill="url(#bodyGrad)" />
                    {/* Torso */}
                    <line x1="120" y1="54" x2="120" y2="105" stroke="url(#bodyGrad)" strokeWidth="11" strokeLinecap="round" />
                    {/* Arms */}
                    <line x1="120" y1="64" x2="140" y2="95" stroke="#f4f4f5" strokeWidth="7" strokeLinecap="round" />
                    {/* Dumbbells in hand */}
                    <circle cx="140" cy="98" r="7" fill="#10b981" />
                    {/* Legs */}
                    <line x1="116" y1="105" x2="105" y2="165" stroke="url(#boneGrad)" strokeWidth="8" strokeLinecap="round" />
                    <line x1="124" y1="105" x2="135" y2="165" stroke="url(#boneGrad)" strokeWidth="8" strokeLinecap="round" />
                  </g>
                )}
              </svg>
            </div>

            {/* Tempo Cadence Bar */}
            <div className="relative z-10 w-full mt-2 rounded-xl border border-zinc-800 bg-zinc-950/80 p-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">{t.tempoLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-mono font-bold transition-all ${
                    tempoPhase === "eccentric"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "text-zinc-500"
                  }`}
                >
                  {t.tempoEccentric}
                </span>
                <span className="text-zinc-600 font-mono">•</span>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-mono font-bold transition-all ${
                    tempoPhase === "pause"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "text-zinc-500"
                  }`}
                >
                  {t.tempoPause}
                </span>
                <span className="text-zinc-600 font-mono">•</span>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-mono font-bold transition-all ${
                    tempoPhase === "concentric"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "text-zinc-500"
                  }`}
                >
                  {t.tempoConcentric}
                </span>
              </div>
            </div>
          </div>

          {/* Biomechanical Execution Guide */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Zap className="h-3.5 w-3.5" /> {t.stepByStepTitle}
            </h3>

            <div className="space-y-2.5 text-xs leading-relaxed text-zinc-300">
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-3">
                <strong className="text-white block mb-0.5">
                  {lang === "bn" ? "১. সেটআপ ও অবস্থান (Setup & Stance):" : "1. Setup & Stance:"}
                </strong>
                {guide.setup}
              </div>
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-3">
                <strong className="text-white block mb-0.5">
                  {lang === "bn" ? "২. নামার কৌশল (Controlled Descent):" : "2. Controlled Descent (Eccentric):"}
                </strong>
                {guide.descent}
              </div>
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-3">
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

          {/* Progression & Regression Links */}
          {(easier || harder) && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-zinc-400">
                {lang === "bn" ? "বিকল্প ভ্যারিয়েন্ট:" : "Progression Options:"}
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

        {/* Footer */}
        <div className="border-t border-zinc-800/80 bg-zinc-900/90 px-5 py-3.5 flex items-center justify-between gap-3">
          <a
            href={`https://www.youtube.com/results?search_query=proper+form+${encodeURIComponent(exercise.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 text-emerald-400" />
            <span>{t.formVideoBtn} (YouTube)</span>
          </a>

          <button
            onClick={onClose}
            className="flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-6 text-xs font-bold text-zinc-950 shadow-md shadow-emerald-500/20 hover:opacity-95 transition-opacity"
          >
            {t.gotItBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
