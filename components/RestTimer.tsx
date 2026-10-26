"use client";

import { Pause, Play, X, Plus, Minus, BellRing, Sparkles } from "lucide-react";
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
        className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-6 z-50 mx-auto flex max-w-lg items-center justify-between rounded-2xl border-2 border-cyan-400 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 p-4 text-black shadow-[0_0_35px_rgba(6,182,212,0.8)] animate-in slide-in-from-bottom duration-300 font-mono"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/20 text-black">
            <BellRing className="h-5 w-5 animate-bounce stroke-[2.5]" />
          </span>
          <div>
            <span className="font-black text-sm sm:text-base block uppercase tracking-wide">
              {isBn ? "[ বিশ্রাম সম্পন্ন : RECOVERY COMPLETE ]" : "[ RECOVERY COMPLETE ]"}
            </span>
            <span className="text-xs font-bold opacity-90">
              {isBn ? "শক্তি পুনঃসংগৃহীত হয়েছে। পরবর্তী সেটে অংশ নিন!" : "Mana replenished. Engage next set!"}
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            playSound("system-click");
            onStop();
          }}
          aria-label="Dismiss timer"
          className="system-btn-chamfer flex h-10 w-10 shrink-0 items-center justify-center bg-black text-cyan-300 hover:bg-black/80 active:scale-90 transition-all font-black cursor-pointer"
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
      className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-6 z-50 mx-auto max-w-lg rounded-2xl border-2 border-cyan-400/80 bg-[#03081a]/95 p-4 shadow-[0_0_40px_rgba(6,182,212,0.45)] backdrop-blur-2xl animate-in slide-in-from-bottom duration-300 font-mono text-zinc-100 system-scanlines system-grid-bg"
    >
      {/* Corner Luminous Diamonds */}
      <div className="absolute top-1 left-1.5 text-cyan-400 text-[10px] select-none drop-shadow-[0_0_6px_rgba(6,182,212,0.9)]">◆</div>
      <div className="absolute top-1 right-1.5 text-cyan-400 text-[10px] select-none drop-shadow-[0_0_6px_rgba(6,182,212,0.9)]">◆</div>

      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 shadow-sm shadow-cyan-400"></span>
          </span>
          <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300">
            {isBn ? "[ বিশ্রাম কাল : RECOVERY CADENCE ]" : "[ RECOVERY CADENCE ]"}
          </span>
        </div>
        <span className="max-w-[55%] truncate text-xs font-black text-cyan-400 text-glow-cyan">{label}</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-1.5">
          <span
            className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-white text-glow-cyan"
            role="timer"
            aria-label={`${seconds} seconds remaining`}
          >
            {mm}:{ss}
          </span>
          <span className="text-[10px] font-mono text-cyan-400/80 font-bold uppercase">REMAINING</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              playSound("system-click");
              onAdjust(-15);
            }}
            className="btn btn-xs btn-outline btn-neutral text-zinc-300 hover:text-white font-mono font-black"
            title="Subtract 15 seconds"
          >
            -15s
          </button>
          <button
            onClick={() => {
              playSound("system-click");
              onAdjust(15);
            }}
            className="btn btn-xs btn-outline btn-neutral text-cyan-300 hover:text-white font-mono font-black"
            title="Add 15 seconds"
          >
            +15s
          </button>
          <button
            onClick={() => {
              playSound("system-click");
              state === "running" ? onPause() : onResume();
            }}
            aria-label={state === "running" ? "Pause" : "Resume"}
            className="btn btn-sm btn-primary btn-square shadow-[0_0_15px_rgba(6,182,212,0.8)]"
          >
            {state === "running" ? (
              <Pause className="h-4 w-4 stroke-[3]" />
            ) : (
              <Play className="h-4 w-4 fill-current ml-0.5" />
            )}
          </button>
          <button
            onClick={() => {
              playSound("system-click");
              onStop();
            }}
            aria-label="Skip timer"
            title="Skip timer"
            className="btn btn-sm btn-ghost btn-square text-zinc-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Fluid progress indicator bar */}
      <progress
        className="progress progress-primary w-full h-1.5 mt-3"
        value={Math.max(0, Math.min(100, Math.round((1 - progress) * 100)))}
        max="100"
      />
    </aside>
  );
}
