import { Download, Trash2, Upload, Dumbbell, Calendar, Flame, CheckCircle2 } from "lucide-react";
import { useRef, useState } from "react";
import { getExercise } from "@/lib/exercises";
import { focusLabel } from "@/lib/builder";
import { sessionsInLastDays } from "@/lib/session";
import type { HistoryEntry } from "@/lib/types";
import { playSound } from "@/lib/audio";
import type { Language } from "@/lib/i18n";

interface Props {
  history: HistoryEntry[];
  lang?: Language;
  onExport: () => void;
  onImport: (text: string) => string;
  onClear: () => void;
}

export function HistoryView({ history, lang = "bn", onExport, onImport, onClear }: Props) {
  const isBn = lang === "bn";
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const week = sessionsInLastDays(history, 7);
  const totalVolume = history.reduce((s, h) => s + h.volumeKg, 0);

  const diffLabel = isBn
    ? { too_easy: "সহজ", just_right: "উপযুক্ত", too_hard: "চ্যালেঞ্জিং" }
    : { too_easy: "Easy", just_right: "Balanced", too_hard: "Hard" };

  return (
    <div className="space-y-5 text-zinc-100">
      {/* Header Banner */}
      <div className="rounded-3xl glass-surface border border-white/10 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-lime-400/15 text-lime-400">
            <Dumbbell className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-lime-400">
            {isBn ? "ওয়ার্কআউট ইতিহাস" : "Workout Records"}
          </span>
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">
          {isBn ? "সম্পন্ন সেশন ও উত্তোলিত ভলিউম" : "Completed Sessions & Volume"}
        </h3>
        <p className="mt-1 text-xs text-zinc-400">
          {isBn
            ? "আপনার অতীতের সব ব্যায়াম, সেট এবং মোট উত্তোলিত ওজনের ধারাবাহিক রেকর্ড।"
            : "Detailed tracking of your sets, reps, and progressive overload volume."}
        </p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl glass-surface border border-white/10 p-4 text-center shadow-sm">
          <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            {isBn ? "গত ৭ দিন" : "Last 7 Days"}
          </div>
          <div className="mt-1 text-2xl font-bold text-white">{week}</div>
          <div className="text-[10px] text-zinc-500">{isBn ? "সেশন" : "sessions"}</div>
        </div>
        <div className="rounded-2xl glass-surface border border-white/10 p-4 text-center shadow-sm">
          <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            {isBn ? "মোট সেশন" : "Total Workouts"}
          </div>
          <div className="mt-1 text-2xl font-bold text-lime-400">{history.length}</div>
          <div className="text-[10px] text-zinc-500">{isBn ? "সম্পন্ন" : "completed"}</div>
        </div>
        <div className="rounded-2xl glass-surface border border-white/10 p-4 text-center shadow-sm">
          <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            {isBn ? "মোট ভলিউম" : "Volume Lifted"}
          </div>
          <div className="mt-1 text-2xl font-bold text-emerald-400">{totalVolume.toLocaleString()}</div>
          <div className="text-[10px] text-zinc-500">kg</div>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-8 text-center text-zinc-400 space-y-2">
          <Calendar className="h-8 w-8 text-zinc-500 mx-auto" />
          <p className="font-semibold text-white">
            {isBn ? "এখনও কোনো ওয়ার্কআউট সম্পন্ন হয়নি" : "No Workout Records Yet"}
          </p>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {isBn
              ? "আপনার প্রথম ওয়ার্কআউট শুরু করে শেষ করুন। এখানে আপনার সব সেশন এবং অগ্রগতি রেকর্ড করা হবে।"
              : "Complete and log your first workout session to start building your training history and volume logs."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {history.map((h) => {
            const expanded = open === h.id;
            return (
              <li
                key={h.id}
                className={`rounded-2xl border transition-all ${expanded
                    ? "border-lime-400/50 glass-surface shadow-md"
                    : "border-white/10 glass-surface hover:border-white/20"
                  }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    setOpen(expanded ? null : h.id);
                  }}
                  aria-expanded={expanded}
                  className="flex min-h-[56px] w-full items-center justify-between gap-3 p-4 text-left cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-white flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                      <span>{h.title}</span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      {new Date(h.finishedAt).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} ·{" "}
                      <span className="font-medium text-emerald-400/90">{focusLabel(h.focus)}</span> · {h.minutes} {isBn ? "মি." : "min"}
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-xs">
                    <div className="font-bold text-zinc-100">
                      {h.setsDone} / {h.setsTotal} {isBn ? "সেট" : "sets"}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-medium">{diffLabel[h.difficulty]}</span>
                    </div>
                  </div>
                </button>
                {expanded && (
                  <div className="space-y-2 border-t border-zinc-800 p-4 text-xs text-zinc-300 bg-zinc-900/50">
                    {h.exercises.map((ex, i) => {
                      const done = ex.sets.filter((s) => s.done);
                      const best = done.reduce<{ w: number; r: number } | null>((b, s) => {
                        const w = s.weightKg ?? 0;
                        const r = s.reps ?? 0;
                        return !b || w > b.w || (w === b.w && r > b.r) ? { w, r } : b;
                      }, null);
                      return (
                        <div key={i} className="flex items-center justify-between border-b border-zinc-800/60 py-1.5">
                          <span className="text-white font-medium">{getExercise(ex.exerciseId)?.name ?? ex.exerciseId}</span>
                          <span className="text-zinc-400 font-mono text-[11px]">
                            {done.length} {isBn ? "সেট" : "sets"} {best?.w ? `· সর্বোচ্চ ${best.w}kg × ${best.r}` : ""}
                          </span>
                        </div>
                      );
                    })}
                    {h.notes && (
                      <p className="pt-1.5 text-zinc-300">
                        <strong className="text-emerald-400">{isBn ? "নোট:" : "Note:"}</strong> {h.notes}
                      </p>
                    )}
                    <div className="pt-2 text-[11px] text-zinc-400 flex items-center justify-between border-t border-zinc-800/60">
                      <span className="text-zinc-500">{h.source === "ai" ? "AI Adaptive Plan" : "Offline Plan"}</span>
                      <span className="text-amber-400/90 font-semibold">~{h.kcalEstimate} kcal burned</span>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Cloud & Local Backup Card */}
      <div className="rounded-2xl border border-white/10 glass-surface p-4 space-y-3">
        <p className="text-xs text-zinc-400">
          {isBn
            ? "আপনার বায়োমেট্রিক ও ওয়ার্কআউট ডাটা ব্রাউজারে অফলাইনে সংরক্ষিত থাকে এবং ব্যাকআপ হিসেবে এক্সপোর্ট বা ইমপোর্ট করা যায়।"
            : "Workout history is stored securely on your device. Export a backup anytime to preserve or transfer your data."}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              playSound("click");
              onExport();
            }}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 transition-all"
          >
            <Download className="h-3.5 w-3.5" /> {isBn ? "ব্যাকআপ এক্সপোর্ট" : "Export Backup"}
          </button>
          <button
            type="button"
            onClick={() => {
              playSound("click");
              fileRef.current?.click();
            }}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition-all"
          >
            <Upload className="h-3.5 w-3.5" /> {isBn ? "ব্যাকআপ ইমপোর্ট" : "Import Backup"}
          </button>
          {history.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const prompt = isBn
                  ? "ডিভাইসের সব ওয়ার্কআউট হিস্ট্রি মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।"
                  : "Delete all workout history on this device? This action cannot be undone.";
                if (window.confirm(prompt)) {
                  playSound("warning");
                  onClear();
                }
              }}
              className="flex items-center gap-1.5 rounded-lg border border-red-900/50 bg-red-950/20 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-950/40 transition-all ml-auto"
            >
              <Trash2 className="h-3.5 w-3.5" /> {isBn ? "হিস্ট্রি মুছুন" : "Clear History"}
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setMessage(onImport(await file.text()));
            }}
          />
        </div>
        {message && <div role="status" className="rounded-lg bg-emerald-950/40 border border-emerald-500/30 p-2 text-xs font-medium text-emerald-300 mt-2">{message}</div>}
      </div>
    </div>
  );
}
