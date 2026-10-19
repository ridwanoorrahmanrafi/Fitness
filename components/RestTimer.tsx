"use client";

import { Pause, Play, X } from "lucide-react";
import type { TimerState } from "@/hooks/useCountdown";

interface Props {
  state: TimerState;
  seconds: number;
  label: string;
  progress: number;
  onPause: () => void;
  onResume: () => void;
  onAdjust: (delta: number) => void;
  onStop: () => void;
}

export function RestTimer({ state, seconds, label, progress, onPause, onResume, onAdjust, onStop }: Props) {
  if (state === "idle") return null;

  if (state === "finished") {
    return (
      <aside
        role="status"
        aria-live="assertive"
        className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-lg items-center justify-between rounded-2xl border border-emerald-400/50 bg-emerald-500 p-4 text-zinc-950 shadow-2xl"
      >
        <span className="font-bold">Time. Next set.</span>
        <button onClick={onStop} aria-label="Dismiss" className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/10">
          <X className="h-5 w-5" />
        </button>
      </aside>
    );
  }

  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <aside
      aria-label="Rest timer"
      className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-lg rounded-2xl border border-zinc-700/80 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-xl"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full bg-emerald-400 ${state === "running" ? "animate-pulse" : "opacity-40"}`} />
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-300">{state === "paused" ? "Paused" : "Timer"}</span>
        </div>
        <span className="max-w-[60%] truncate text-xs text-zinc-400">{label}</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span
          className="font-mono text-3xl font-extrabold tracking-tight text-emerald-400"
          role="timer"
          aria-label={`${seconds} seconds remaining`}
        >
          {mm}:{ss}
        </span>
        <div className="flex items-center gap-1.5">
          <button onClick={() => onAdjust(-15)} className="min-h-[44px] rounded-xl border border-zinc-700 bg-zinc-800 px-3 text-xs font-medium text-zinc-200 hover:bg-zinc-700">
            -15s
          </button>
          <button onClick={() => onAdjust(15)} className="min-h-[44px] rounded-xl border border-zinc-700 bg-zinc-800 px-3 text-xs font-medium text-zinc-200 hover:bg-zinc-700">
            +15s
          </button>
          <button
            onClick={state === "running" ? onPause : onResume}
            aria-label={state === "running" ? "Pause" : "Resume"}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
          >
            {state === "running" ? <Pause className="h-4 w-4 stroke-[3]" /> : <Play className="h-4 w-4 stroke-[3]" />}
          </button>
          <button onClick={onStop} aria-label="Skip" title="Skip" className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full bg-emerald-400 transition-[width] duration-200" style={{ width: `${(1 - progress) * 100}%` }} />
      </div>
    </aside>
  );
}
