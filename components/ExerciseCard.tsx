"use client";

import {
  ArrowLeftRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Play,
  Timer,
  TrendingDown,
  TrendingUp,
  Maximize2,
  Flame,
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
}: Props) {
  const [swapOpen, setSwapOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const doneCount = sets.filter((s) => s.done).length;
  const allDone = sets.length > 0 && doneCount === sets.length;
  const canSwap = doneCount === 0;
  const equipmentText = exercise.requires.length
    ? exercise.requires.map((r) => r.replace("_", " ")).join(" + ")
    : "bodyweight";
  const t = TRANSLATIONS[lang] ?? TRANSLATIONS.bn;

  const isImperial = unitSystem === "imperial";
  const weightUnit = isImperial ? "lbs" : "kg";
  const lastWeightDisplay = lastWeightKg
    ? isImperial
      ? kgToLbs(lastWeightKg)
      : lastWeightKg
    : undefined;

  const media = getExerciseMedia(exercise.id);
  const previewGif = imgError ? media.remoteFallbackGif : media.localGif;
  const progressPercent = sets.length > 0 ? (doneCount / sets.length) * 100 : 0;

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 shadow-xl ${
        allDone
          ? "border-cyan-400 bg-[#040e29]/95 shadow-[0_0_30px_rgba(6,182,212,0.45)]"
          : "border-cyan-500/35 bg-[#05112e]/90 hover:border-cyan-400/80 shadow-lg"
      } system-scanlines system-grid-bg`}
    >
      {/* Top Progress Accent Bar */}
      <div className="h-1.5 w-full bg-zinc-950 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(6,182,212,0.9)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="p-4 sm:p-5">
        {/* Header with Exercise Title and Live Animated Thumbnail */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Live Animated Exercise Thumbnail Preview */}
            <button
              type="button"
              onClick={onOpenAnimation}
              title={`View ${exercise.name} animated guide`}
              className="relative group/thumb shrink-0 h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden border-2 border-cyan-400/60 bg-zinc-950 shadow-md hover:border-cyan-400 transition-all active:scale-95 cursor-pointer"
            >
              <img
                src={previewGif}
                alt={exercise.name}
                className="w-full h-full object-cover object-center group-hover/thumb:scale-110 transition-transform duration-300"
                onError={() => setImgError(true)}
              />
              <div className="absolute inset-0 bg-black/40 group-hover/thumb:bg-black/15 transition-colors flex items-center justify-center">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400 text-zinc-950 shadow-md opacity-90 group-hover/thumb:opacity-100 group-hover/thumb:scale-110 transition-all">
                  <Play className="h-3 w-3 fill-current ml-0.5" />
                </span>
              </div>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-cyan-950 border border-cyan-400/60 text-[11px] font-mono font-black text-cyan-300">
                  {index + 1}
                </span>
                <h3 className="text-base font-black text-white sm:text-lg truncate tracking-tight uppercase">
                  {exercise.name}
                </h3>
              </div>
              <p className="mt-0.5 text-xs font-mono font-bold text-cyan-300 truncate text-glow-cyan">
                {exercise.muscles.slice(0, 3).map((m) => MUSCLE_LABEL[m]).join(" · ")}
              </p>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                <span className="rounded bg-black/60 border border-cyan-500/25 px-1.5 py-0.5 font-bold text-zinc-300">
                  {equipmentText}
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <span className="inline-block rounded-lg border border-zinc-700/70 bg-zinc-800/90 px-2.5 py-1 text-xs font-bold text-zinc-100 shadow-sm">
              {pe.sets} × {pe.reps}
            </span>
            <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-zinc-400">
              <Clock className="h-3 w-3 text-emerald-400" /> {t.restSecLabel(pe.restSeconds)}
            </div>
          </div>
        </div>

        {/* Cues Box */}
        <div className="my-3 rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3 text-xs leading-relaxed text-zinc-300">
          <strong className="text-emerald-400">{t.cuePrefix}</strong> {exercise.cues}
          {pe.note && (
            <>
              <br />
              <strong className="text-zinc-200">{t.coachNotePrefix}</strong> {pe.note}
            </>
          )}
        </div>

        {/* Action Buttons: Animation Guide, Swaps, YouTube */}
        <div className="mb-3.5 flex flex-wrap items-center gap-2">
          {/* Animated Demonstration & Form Guide */}
          {onOpenAnimation && (
            <button
              id={`btn-animation-${exercise.id}`}
              data-testid={`btn-animation-${exercise.id}`}
              type="button"
              onClick={onOpenAnimation}
              className="flex min-h-[36px] items-center gap-1.5 rounded-full border border-emerald-500/60 bg-emerald-500/15 px-3.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition-all shadow-sm active:scale-95"
              title={`Watch animated demonstration and form guide for ${exercise.name}`}
            >
              <Play className="h-3.5 w-3.5 fill-emerald-400 text-emerald-400" />
              <span>{t.animationBtn}</span>
            </button>
          )}

          {easier && (
            <button
              onClick={() => onSwap(easier.id)}
              disabled={!canSwap}
              className="flex min-h-[36px] items-center gap-1.5 rounded-full border border-zinc-700 px-3 text-xs text-zinc-300 hover:border-zinc-500 hover:text-white disabled:opacity-40 transition-colors active:scale-95"
            >
              <TrendingDown className="h-3.5 w-3.5 text-amber-400" /> {t.easierBtn(easier.name)}
            </button>
          )}
          {harder && (
            <button
              onClick={() => onSwap(harder.id)}
              disabled={!canSwap}
              className="flex min-h-[36px] items-center gap-1.5 rounded-full border border-zinc-700 px-3 text-xs text-zinc-300 hover:border-zinc-500 hover:text-white disabled:opacity-40 transition-colors active:scale-95"
            >
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> {t.harderBtn(harder.name)}
            </button>
          )}
          {alternatives.length > 0 && (
            <button
              onClick={() => setSwapOpen((o) => !o)}
              aria-expanded={swapOpen}
              disabled={!canSwap}
              className="flex min-h-[36px] items-center gap-1.5 rounded-full border border-zinc-700 px-3 text-xs text-zinc-300 hover:border-zinc-500 hover:text-white disabled:opacity-40 transition-colors active:scale-95"
            >
              <ArrowLeftRight className="h-3.5 w-3.5 text-cyan-400" /> {t.swapBtn}
            </button>
          )}

          {/* External video search link */}
          <a
            href={`https://www.youtube.com/results?search_query=proper+form+${encodeURIComponent(exercise.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[36px] items-center gap-1.5 rounded-full border border-zinc-700/80 bg-zinc-800/40 px-3 text-xs text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors ml-auto"
            title={`Search proper biomechanical form for ${exercise.name}`}
          >
            <ExternalLink className="h-3 w-3 text-emerald-400" />
            <span className="hidden sm:inline">{t.formVideoBtn}</span>
          </a>
        </div>
        {!canSwap && <p className="mb-2 text-[11px] text-zinc-500">{t.swapNotice}</p>}

        {swapOpen && canSwap && (
          <ul className="mb-3 space-y-1 rounded-xl border border-zinc-800 bg-zinc-950/70 p-2 shadow-inner">
            {alternatives.slice(0, 6).map((alt) => (
              <li key={alt.id}>
                <button
                  onClick={() => {
                    setSwapOpen(false);
                    onSwap(alt.id);
                  }}
                  className="flex min-h-[40px] w-full items-center justify-between rounded-lg px-3 text-left text-sm text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  <span className="font-medium">{alt.name}</span>
                  <span className="text-[11px] text-zinc-500">
                    {alt.requires.length ? alt.requires.join(" + ").replace("_", " ") : "bodyweight"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Sets Tracker Header */}
        <div className="mb-2.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          <span>{t.setsProgress(doneCount, sets.length)}</span>
          {exercise.loaded && lastWeightDisplay ? (
            <span className="normal-case text-emerald-400/90 font-mono">
              {t.lastWeightPrefix(lastWeightDisplay, weightUnit)}
            </span>
          ) : null}
        </div>

        {/* Sets List */}
        <ul className="space-y-2.5">
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
                className={`flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-xl border transition-all duration-200 ${
                  s.done
                    ? "bg-emerald-950/20 border-emerald-500/30"
                    : "bg-zinc-950/40 border-zinc-800/80 hover:border-zinc-700"
                }`}
              >
                <span className="w-8 sm:w-12 shrink-0 text-center sm:text-left text-[11px] sm:text-xs font-bold text-zinc-300">
                  <span className="sm:hidden">S{i + 1}</span>
                  <span className="hidden sm:inline">Set {i + 1}</span>
                </span>

                {exercise.timed ? (
                  <button
                    onClick={() => onStartHold(holdSeconds(pe.reps), exercise.name)}
                    className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 active:scale-95 transition-all"
                  >
                    <Timer className="h-4 w-4 text-emerald-400" /> Start {holdSeconds(pe.reps)}s hold
                  </button>
                ) : (
                  <>
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        aria-label={`Set ${i + 1} reps`}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={200}
                        placeholder={pe.reps.split(" ")[0]}
                        value={s.reps ?? ""}
                        onChange={(e) =>
                          onChangeSet(i, {
                            reps: e.target.value === "" ? undefined : Math.max(0, Number(e.target.value)),
                          })
                        }
                        className="min-h-[44px] w-14 sm:w-16 rounded-xl border border-zinc-700 bg-zinc-900 px-1 text-center text-base sm:text-sm font-semibold text-zinc-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors"
                      />
                      <span className="text-[11px] sm:text-xs text-zinc-400 font-medium hidden xs:inline">reps</span>
                    </div>

                    {exercise.loaded && (
                      <div className="flex items-center gap-1 shrink-0">
                        <input
                          aria-label={`Set ${i + 1} weight in ${weightUnit}`}
                          type="number"
                          inputMode="decimal"
                          min={0}
                          max={1000}
                          step={isImperial ? "1" : "0.5"}
                          placeholder={lastWeightDisplay ? String(lastWeightDisplay) : weightUnit}
                          value={currentWeightDisplay}
                          onChange={(e) => {
                            if (e.target.value === "") {
                              onChangeSet(i, { weightKg: undefined });
                            } else {
                              const val = Math.max(0, Number(e.target.value));
                              const kgVal = isImperial ? lbsToKg(val) : val;
                              onChangeSet(i, { weightKg: kgVal });
                            }
                          }}
                          className="min-h-[44px] w-16 sm:w-20 rounded-xl border border-zinc-700 bg-zinc-900 px-1 text-center text-base sm:text-sm font-semibold text-zinc-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors"
                        />
                        <span className="text-[11px] sm:text-xs text-zinc-400 font-medium">{weightUnit}</span>
                      </div>
                    )}
                    <span className="flex-1" />
                  </>
                )}

                {/* Complete Set Checkbox Button with Solo Leveling Chamfer & Glow */}
                <button
                  onClick={() => onToggleSet(i)}
                  aria-pressed={s.done}
                  aria-label={`Mark set ${i + 1} ${s.done ? "not done" : "done"}`}
                  className={`system-btn-chamfer flex h-11 w-11 shrink-0 items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer ${
                    s.done
                      ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-[0_0_18px_rgba(6,182,212,0.85)] scale-105"
                      : "border border-cyan-500/40 bg-black/60 text-cyan-400/80 hover:bg-cyan-950/40 hover:text-cyan-200 hover:border-cyan-400"
                  }`}
                >
                  <CheckCircle2 className={`h-5 w-5 ${s.done ? "stroke-[3]" : ""}`} />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}
