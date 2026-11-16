"use client";

import { Pause, Play, X, BellRing } from "lucide-react";
import type { TimerState } from "@/hooks/useCountdown";
import { playSound } from "@/lib/audio";
import type { Language } from "@/lib/i18n";

interface Props {
  state: TimerState;
  seconds: number;
  label: string;
  progress: number;
  lang?: Language;
  onPause: () => void;
  onResume: () => void;
  onAdjust: (delta: number) => void;
  onStop: () => void;
}

export function RestTimer({
  state,
  seconds,
  label,
  progress,
  lang = "bn",
  onPause,
  onResume,
  onAdjust,
  onStop,
}: Props) {
  const isBn = lang === "bn";
  if (state === "idle") return null;

  if (state === "finished") {
    return (
      <aside
        role="status"
        aria-live="assertive"
        className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-6 z-50 mx-auto flex max-w-lg items-center justify-between rounded-2xl border border-emerald-500/40 bg-emerald-600 p-4 text-white shadow-xl shadow-emerald-950/50 animate-in slide-in-from-bottom duration-300 font-sans"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
            <BellRing className="h-5 w-5 animate-bounce stroke-[2.5]" />
          </span>
          <div>
            <span className="font-bold text-sm sm:text-base block">
              {isBn ? "বিশ্রাম শেষ" : "Rest Period Complete"}
            </span>
            <span className="text-xs font-medium text-emerald-100">
              {isBn ? "পরবর্তী সেটের জন্য প্রস্তুত হন!" : "Ready to start your next set!"}
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            playSound("click");
            onStop();
          }}
          aria-label="Dismiss timer"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/20 hover:bg-black/30 text-white transition-all cursor-pointer"
        >
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
      className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-6 z-50 mx-auto max-w-lg rounded-2xl border border-slate-800 bg-[#111726]/95 p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom duration-300 font-sans text-white"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
            {isBn ? "বিশ্রাম সময়" : "Rest Timer"}
          </span>
        </div>
        <span className="max-w-[55%] truncate text-xs font-medium text-slate-300">{label}</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono"
            role="timer"
            aria-label={`${seconds} seconds remaining`}
          >
            {mm}:{ss}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {isBn ? "বাকি" : "left"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              playSound("click");
              onAdjust(-15);
            }}
            className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition-all cursor-pointer"
            title="Subtract 15 seconds"
          >
            -15s
          </button>
          <button
            onClick={() => {
              playSound("click");
              onAdjust(15);
            }}
            className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:border-slate-600 transition-all cursor-pointer"
            title="Add 15 seconds"
          >
            +15s
          </button>
          <button
            onClick={() => {
              playSound("click");
              state === "running" ? onPause() : onResume();
            }}
            aria-label={state === "running" ? "Pause" : "Resume"}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all cursor-pointer font-bold"
          >
            {state === "running" ? (
              <Pause className="h-4 w-4 stroke-[2.5]" />
            ) : (
              <Play className="h-4 w-4 fill-current ml-0.5" />
            )}
          </button>
          <button
            onClick={() => {
              playSound("click");
              onStop();
            }}
            aria-label="Skip timer"
            title="Skip timer"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mt-3">
        <div
          className="bg-emerald-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.max(0, Math.min(100, Math.round((1 - progress) * 100)))}%` }}
        />
      </div>
    </aside>
  );
}
