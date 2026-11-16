"use client";

import {
  ArrowLeftRight,
  CheckCircle2,
  Clock,
  Dumbbell,
  ExternalLink,
  Info,
  Play,
  RefreshCw,
  Sliders,
  Timer,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { MUSCLE_LABEL } from "@/lib/exercises";
import { kgToLbs, lbsToKg } from "@/lib/calc";
import { TRANSLATIONS, type Language } from "@/lib/i18n";
import type { Exercise, PlanExercise, SetLog } from "@/lib/types";
import { getExerciseMedia } from "@/lib/exerciseMedia";

interface Props {
  index: number;
  planExercise: PlanExercise;
  exercise: Exercise;
  sets: SetLog[];
  lastWeightKg?: number;
  previousSets?: { reps?: number; weightKg?: number }[];
  easier?: Exercise;
  harder?: Exercise;
  alternatives: Exercise[];
  unitSystem?: "metric" | "imperial";
  lang?: Language;
  onToggleSet: (setIndex: number) => void;
  onChangeSet: (setIndex: number, patch: Partial<SetLog>) => void;
  onSwap: (exerciseId: string) => void;
  onStartHold: (seconds: number, label: string) => void;
  onOpenAnimation?: () => void;
  onOpenPlateCalculator?: (initialWeight: number) => void;
}

/** "30-45s" -> 45, "40s" -> 40 */
function holdSeconds(reps: string): number {
  const nums = reps.match(/\d+/g)?.map(Number) ?? [30];
  return Math.max(...nums);
}

export function ExerciseCard({
  index,
  planExercise: pe,
  exercise,
  sets,
  lastWeightKg,
  previousSets,
  easier,
  harder,
  alternatives,
  unitSystem = "metric",
  lang = "bn",
  onToggleSet,
  onChangeSet,
  onSwap,
  onStartHold,
  onOpenAnimation,
  onOpenPlateCalculator,
}: Props) {
  const [swapOpen, setSwapOpen] = useState(false);
  const [detailedOpen, setDetailedOpen] = useState(false);
  const [isSwappingAnim, setIsSwappingAnim] = useState(false);
  const [imgError, setImgError] = useState(false);

  const doneCount = sets.filter((s) => s.done).length;
  const allDone = sets.length > 0 && doneCount === sets.length;
  const canSwap = doneCount === 0;
  const t = TRANSLATIONS[lang] ?? TRANSLATIONS.bn;
  const isBn = lang === "bn";

  const isImperial = unitSystem === "imperial";
  const weightUnit = isImperial ? "lbs" : "kg";
  const lastWeightDisplay = lastWeightKg
    ? isImperial
      ? kgToLbs(lastWeightKg)
      : lastWeightKg
    : undefined;

  const media = getExerciseMedia(exercise.id);
  const previewGif = imgError ? media.remoteFallbackGif : media.localGif;

  const handleQuickSwap = (newId: string) => {
    setIsSwappingAnim(true);
    setTimeout(() => {
      onSwap(newId);
      setIsSwappingAnim(false);
      setSwapOpen(false);
    }, 280);
  };

  return (
    <div
      className={`rounded-3xl bg-[#18181B] border p-4 transition-all ${allDone
        ? "border-emerald-500/40 bg-zinc-900/60"
        : "border-zinc-800/80 hover:border-zinc-700/80"
        } ${isSwappingAnim ? "opacity-50 scale-[0.99]" : ""}`}
    >
      {/* Top Row: Index + Target Muscle + Title + Quick AI Swap Button */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          {/* Animated guide thumbnail button */}
          {onOpenAnimation && (
            <button
              type="button"
              onClick={onOpenAnimation}
              title={`View ${exercise.name} animated guide`}
              className="relative shrink-0 h-12 w-12 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow hover:border-lime-400 transition-all active:scale-95 cursor-pointer"
            >
              <img
                src={previewGif}
                alt={exercise.name}
                className="w-full h-full object-cover object-center"
                onError={() => setImgError(true)}
              />
              <div className="absolute inset-0 bg-black/30 hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lime-400 text-zinc-950 shadow">
                  <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
                </span>
              </div>
            </button>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
                #{index + 1}
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 truncate">
                {exercise.muscles.map((m) => MUSCLE_LABEL[m]).join(" · ")}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white leading-snug truncate">
              {exercise.name}
            </h3>
          </div>
        </div>

        {/* AI Swap Button */}
        {canSwap && alternatives.length > 0 && (
          <button
            type="button"
            onClick={() => setSwapOpen((prev) => !prev)}
            disabled={isSwappingAnim}
            title={isBn ? "ব্যায়াম পরিবর্তন করুন (AI Swap)" : "Instant AI Exercise Swap"}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-lime-400 active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw
              className={`w-3 h-3 ${isSwappingAnim ? "animate-spin" : ""}`}
            />
            <span>{isBn ? "সোয়াপ" : "AI Swap"}</span>
          </button>
        )}
      </div>

      {/* Alternative Swap Dropdown Menu */}
      {swapOpen && canSwap && (
        <div className="mt-3 rounded-2xl border border-lime-400/30 bg-zinc-950 p-3 space-y-2 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-lime-400">
            <span>{isBn ? "বিকল্প ব্যায়াম বেছে নিন" : "Select Alternative Movement"}</span>
            <button
              type="button"
              onClick={() => setSwapOpen(false)}
              className="text-zinc-500 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {easier && (
              <button
                type="button"
                onClick={() => handleQuickSwap(easier.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-amber-400 hover:bg-zinc-850 transition-colors"
              >
                <TrendingDown className="w-3 h-3" />
                <span>{isBn ? `সহজ: ${easier.name}` : `Easier: ${easier.name}`}</span>
              </button>
            )}
            {harder && (
              <button
                type="button"
                onClick={() => handleQuickSwap(harder.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-sky-400 hover:bg-zinc-850 transition-colors"
              >
                <TrendingUp className="w-3 h-3" />
                <span>{isBn ? `কঠিন: ${harder.name}` : `Harder: ${harder.name}`}</span>
              </button>
            )}
          </div>

          <ul className="space-y-1 pt-1">
            {alternatives.slice(0, 5).map((alt) => (
              <li key={alt.id}>
                <button
                  type="button"
                  onClick={() => handleQuickSwap(alt.id)}
                  className="w-full text-left px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800/80 flex items-center justify-between text-xs text-zinc-200 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="font-semibold truncate">{alt.name}</span>
                  <span className="text-[10px] text-zinc-400 shrink-0 ml-2">
                    {alt.requires.length ? alt.requires.join(" + ").replace("_", " ") : "bodyweight"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sets x Reps & Rest Metadata Row */}
      <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs">
        <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800/90 font-bold text-zinc-200">
          {pe.sets} × {pe.reps}
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800/90 text-zinc-400 flex items-center gap-1">
          <Clock className="w-3 h-3 text-lime-400" />
          {pe.restSeconds}s rest
        </span>

        {exercise.requires.includes("barbell") && onOpenPlateCalculator && (
          <button
            type="button"
            onClick={() => onOpenPlateCalculator(lastWeightKg || 60)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-semibold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
            title="Open Barbell Plate Calculator"
          >
            <Dumbbell className="w-3 h-3" />
            <span>{isBn ? "প্লেট হিসাব" : "Plates"}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setDetailedOpen(!detailedOpen)}
          className="ml-auto text-[11px] font-semibold text-zinc-400 hover:text-lime-400 flex items-center gap-1 transition-colors"
        >
          <Sliders className="w-3 h-3" />
          <span>{detailedOpen ? (isBn ? "সহজ ভিউ" : "Simple") : (isBn ? "বিস্তারিত লগ" : "Custom Reps/Kg")}</span>
        </button>
      </div>

      {/* Form Cue Pill */}
      <div className="mt-2.5 px-3 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800/70 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-lime-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          <strong className="text-zinc-200 font-semibold">{t.cuePrefix}</strong> {exercise.cues}
          {pe.note && (
            <>
              {" "}
              <strong className="text-emerald-400 font-semibold">({pe.note})</strong>
            </>
          )}
        </p>
      </div>

      {/* Thumb-Friendly Set Completion Pills */}
      <div className={`grid grid-cols-${Math.min(sets.length, 4)} sm:grid-cols-4 gap-2 mt-3.5`}>
        {sets.map((s, setIdx) => {
          const isDone = s.done;
          return (
            <button
              key={setIdx}
              type="button"
              onClick={() => onToggleSet(setIdx)}
              className={`py-2.5 px-2 rounded-2xl text-xs font-extrabold flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90 cursor-pointer ${isDone
                ? "bg-gradient-to-br from-lime-400 to-emerald-500 text-zinc-950 shadow-md shadow-lime-400/20"
                : "bg-zinc-950 text-zinc-300 border border-zinc-800 hover:border-zinc-700"
                }`}
            >
              <CheckCircle2
                className={`w-4 h-4 ${isDone ? "text-zinc-950 stroke-[2.75]" : "text-zinc-600"
                  }`}
              />
              <span className="text-[11px]">Set {setIdx + 1}</span>
            </button>
          );
        })}
      </div>

      {/* Expandable Detailed Log Drawer (Reps, Weight, Hold Timer) */}
      {detailedOpen && (
        <div className="mt-3.5 pt-3 border-t border-zinc-800/80 space-y-2 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400">
            <span>{t.setsProgress(doneCount, sets.length)}</span>
            {previousSets && previousSets.length > 0 && doneCount === 0 && (
              <button
                type="button"
                onClick={() => {
                  previousSets.forEach((ps, idx) => {
                    if (idx < sets.length) {
                      onChangeSet(idx, { reps: ps.reps, weightKg: ps.weightKg });
                    }
                  });
                }}
                className="text-lime-400 hover:underline cursor-pointer"
              >
                {isBn ? "পূর্ববর্তী ওজন ও রেপ কপি" : "Copy Previous Values"}
              </button>
            )}
          </div>

          <ul className="space-y-1.5">
            {sets.map((s, i) => {
              const currentWeightDisplay =
                s.weightKg !== undefined
                  ? isImperial
                    ? kgToLbs(s.weightKg)
                    : s.weightKg
                  : "";

              return (
                <li
                  key={i}
                  className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${s.done
                    ? "bg-emerald-950/20 border-emerald-500/40"
                    : "bg-zinc-950 border-zinc-800"
                    }`}
                >
                  <span className="w-12 text-xs font-bold text-zinc-400">
                    Set {i + 1}
                  </span>

                  {exercise.timed ? (
                    <button
                      type="button"
                      onClick={() => onStartHold(holdSeconds(pe.reps), exercise.name)}
                      className="flex min-h-[36px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs font-semibold text-zinc-200 hover:text-lime-400"
                    >
                      <Timer className="h-3.5 w-3.5 text-lime-400" /> Start {holdSeconds(pe.reps)}s hold
                    </button>
                  ) : (
                    <>
                      <div className="flex items-center gap-1">
                        <input
                          aria-label={`Set ${i + 1} reps`}
                          type="number"
                          min={0}
                          max={200}
                          placeholder={pe.reps.split(" ")[0]}
                          value={s.reps ?? ""}
                          onChange={(e) =>
                            onChangeSet(i, {
                              reps: e.target.value === "" ? undefined : Math.max(0, Number(e.target.value)),
                            })
                          }
                          className="h-8 w-14 rounded-lg border border-zinc-800 bg-zinc-900 text-center text-xs font-bold text-white focus:border-lime-400 focus:outline-none"
                        />
                        <span className="text-[10px] text-zinc-500">reps</span>
                      </div>

                      {exercise.loaded && (
                        <div className="flex items-center gap-1">
                          <input
                            aria-label={`Set ${i + 1} weight in ${weightUnit}`}
                            type="number"
                            min={0}
                            max={1000}
                            step={isImperial ? "1" : "0.5"}
                            placeholder={lastWeightDisplay ? String(lastWeightDisplay) : weightUnit}
                            value={currentWeightDisplay}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "") {
                                onChangeSet(i, { weightKg: undefined });
                              } else {
                                const num = Math.max(0, Number(val));
                                onChangeSet(i, {
                                  weightKg: isImperial ? lbsToKg(num) : num,
                                });
                              }
                            }}
                            className="h-8 w-16 rounded-lg border border-zinc-800 bg-zinc-900 text-center text-xs font-bold text-white focus:border-lime-400 focus:outline-none"
                          />
                          <span className="text-[10px] text-zinc-500">{weightUnit}</span>
                        </div>
                      )}
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => onToggleSet(i)}
                    className={`ml-auto px-3 py-1 rounded-lg text-xs font-bold transition-all ${s.done
                      ? "bg-lime-400 text-zinc-950"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                  >
                    {s.done ? "Done ✓" : "Check"}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
