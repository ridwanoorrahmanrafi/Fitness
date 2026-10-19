"use client";

import { ArrowLeftRight, CheckCircle2, Clock, ExternalLink, Play, Timer, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { MUSCLE_LABEL } from "@/lib/exercises";
import { kgToLbs, lbsToKg } from "@/lib/calc";
import type { Exercise, PlanExercise, SetLog } from "@/lib/types";

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
  onToggleSet,
  onChangeSet,
  onSwap,
  onStartHold,
  onOpenAnimation,
}: Props) {
  const [swapOpen, setSwapOpen] = useState(false);
  const doneCount = sets.filter((s) => s.done).length;
  const allDone = sets.length > 0 && doneCount === sets.length;
  const canSwap = doneCount === 0;
  const equipmentText = exercise.requires.length ? exercise.requires.map((r) => r.replace("_", " ")).join(" + ") : "bodyweight";

  const isImperial = unitSystem === "imperial";
  const weightUnit = isImperial ? "lbs" : "kg";
  const lastWeightDisplay = lastWeightKg ? (isImperial ? kgToLbs(lastWeightKg) : lastWeightKg) : undefined;

  return (
    <article
      className={`overflow-hidden rounded-2xl border transition-colors ${
        allDone ? "border-emerald-500/30 bg-zinc-900/50" : "border-zinc-800 bg-zinc-900/90 shadow-md"
      }`}
    >
      <div className="p-4 md:p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300">
                {index + 1}
              </span>
              <h3 className="text-base font-bold text-white md:text-lg">{exercise.name}</h3>
            </div>
            <p className="mt-1 text-xs font-medium text-emerald-400">
              {exercise.muscles.slice(0, 3).map((m) => MUSCLE_LABEL[m]).join(" · ")}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <span className="inline-block rounded-md border border-zinc-700/60 bg-zinc-800 px-2 py-1 text-xs font-semibold text-zinc-200">
              {pe.sets} × {pe.reps}
            </span>
            <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-zinc-400">
              <Clock className="h-3 w-3" /> {pe.restSeconds}s rest
            </div>
          </div>
        </div>

        <div className="my-3 rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-3 text-xs leading-relaxed text-zinc-300">
          <strong className="text-zinc-100">Cue:</strong> {exercise.cues}
          {pe.note && (
            <>
              <br />
              <strong className="text-zinc-100">Coach:</strong> {pe.note}
            </>
          )}
          <div className="mt-1.5 text-[11px] text-zinc-500">Equipment: {equipmentText}</div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          {/* Animated Demonstration & Form Guide */}
          {onOpenAnimation && (
            <button
              id={`btn-animation-${exercise.id}`}
              data-testid={`btn-animation-${exercise.id}`}
              type="button"
              onClick={onOpenAnimation}
              className="flex min-h-[36px] items-center gap-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/15 px-3 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 transition-colors shadow-sm"
              title={`Watch animated demonstration and form guide for ${exercise.name}`}
            >
              <Play className="h-3 w-3 fill-emerald-400 text-emerald-400" />
              <span>Animation & How-To</span>
            </button>
          )}

          {easier && (
            <button
              onClick={() => onSwap(easier.id)}
              disabled={!canSwap}
              className="flex min-h-[36px] items-center gap-1.5 rounded-full border border-zinc-700 px-3 text-xs text-zinc-300 hover:border-zinc-500 disabled:opacity-40"
            >
              <TrendingDown className="h-3.5 w-3.5" /> Easier: {easier.name}
            </button>
          )}
          {harder && (
            <button
              onClick={() => onSwap(harder.id)}
              disabled={!canSwap}
              className="flex min-h-[36px] items-center gap-1.5 rounded-full border border-zinc-700 px-3 text-xs text-zinc-300 hover:border-zinc-500 disabled:opacity-40"
            >
              <TrendingUp className="h-3.5 w-3.5" /> Harder: {harder.name}
            </button>
          )}
          {alternatives.length > 0 && (
            <button
              onClick={() => setSwapOpen((o) => !o)}
              aria-expanded={swapOpen}
              disabled={!canSwap}
              className="flex min-h-[36px] items-center gap-1.5 rounded-full border border-zinc-700 px-3 text-xs text-zinc-300 hover:border-zinc-500 disabled:opacity-40"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" /> Swap
            </button>
          )}

          {/* External video search link */}
          <a
            href={`https://www.youtube.com/results?search_query=proper+form+${encodeURIComponent(exercise.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[36px] items-center gap-1.5 rounded-full border border-zinc-700/80 bg-zinc-800/40 px-3 text-xs text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
            title={`Search proper biomechanical form for ${exercise.name}`}
          >
            <ExternalLink className="h-3 w-3 text-emerald-400" />
            <span>Form Video</span>
          </a>
        </div>
        {!canSwap && <p className="mb-2 text-[11px] text-zinc-500">Swapping is available until you complete a set.</p>}

        {swapOpen && canSwap && (
          <ul className="mb-3 space-y-1 rounded-xl border border-zinc-800 bg-zinc-950/60 p-2">
            {alternatives.slice(0, 6).map((alt) => (
              <li key={alt.id}>
                <button
                  onClick={() => {
                    setSwapOpen(false);
                    onSwap(alt.id);
                  }}
                  className="flex min-h-[40px] w-full items-center justify-between rounded-lg px-3 text-left text-sm text-zinc-200 hover:bg-zinc-800"
                >
                  <span>{alt.name}</span>
                  <span className="text-[11px] text-zinc-500">{alt.requires.length ? alt.requires.join(" + ").replace("_", " ") : "bodyweight"}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
          Sets {doneCount}/{sets.length}
          {exercise.loaded && lastWeightDisplay ? (
            <span className="ml-2 normal-case text-zinc-500">
              last time {lastWeightDisplay} {weightUnit}
            </span>
          ) : null}
        </div>

        <ul className="space-y-2">
          {sets.map((s, i) => {
            const currentWeightDisplay = s.weightKg !== undefined
              ? (isImperial ? kgToLbs(s.weightKg) : s.weightKg)
              : "";

            return (
              <li key={i} className="flex items-center gap-2">
                <span className="w-12 shrink-0 text-xs font-semibold text-zinc-300">Set {i + 1}</span>

                {exercise.timed ? (
                  <button
                    onClick={() => onStartHold(holdSeconds(pe.reps), exercise.name)}
                    className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
                  >
                    <Timer className="h-4 w-4" /> Start {holdSeconds(pe.reps)}s hold
                  </button>
                ) : (
                  <>
                    <input
                      aria-label={`Set ${i + 1} reps`}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={200}
                      placeholder={pe.reps.split(" ")[0]}
                      value={s.reps ?? ""}
                      onChange={(e) => onChangeSet(i, { reps: e.target.value === "" ? undefined : Math.max(0, Number(e.target.value)) })}
                      className="min-h-[44px] w-16 rounded-xl border border-zinc-700 bg-zinc-950 px-2 text-center text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
                    />
                    <span className="text-xs text-zinc-500">reps</span>
                    {exercise.loaded && (
                      <>
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
                          className="min-h-[44px] w-[4.5rem] rounded-xl border border-zinc-700 bg-zinc-950 px-2 text-center text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
                        />
                        <span className="text-xs text-zinc-500">{weightUnit}</span>
                      </>
                    )}
                    <span className="flex-1" />
                  </>
                )}

                <button
                  onClick={() => onToggleSet(i)}
                  aria-pressed={s.done}
                  aria-label={`Mark set ${i + 1} ${s.done ? "not done" : "done"}`}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    s.done
                      ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/25"
                      : "border border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
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
