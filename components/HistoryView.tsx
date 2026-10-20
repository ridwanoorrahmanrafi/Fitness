import { Download, Trash2, Upload, Swords, ShieldCheck, Trophy, Sparkles } from "lucide-react";
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
    ? { too_easy: "সহজ (EASY)", just_right: "উপযুক্ত (BALANCED)", too_hard: "কঠিন (BRUTAL)" }
    : { too_easy: "EASY", just_right: "BALANCED", too_hard: "BRUTAL" };

  return (
    <div className="space-y-5 font-mono text-zinc-100">
      {/* Header Banner */}
      <div className="rounded-2xl border-2 border-cyan-500/40 bg-gradient-to-r from-cyan-950/80 via-black to-purple-950/70 p-4 shadow-[0_0_25px_rgba(6,182,212,0.25)] system-scanlines system-grid-bg">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-cyan-400 text-black">
            {isBn ? "হান্টার আর্কাইভ" : "HUNTER ARCHIVES"}
          </span>
          <span className="text-xs text-cyan-300 font-bold uppercase tracking-wider">
            {isBn ? "[ অতীতের ওয়ার্কআউট লগ : RAID LOGS ]" : "[ DUNGEON RAID LOGS : COMBAT RECORDS ]"}
          </span>
        </div>
        <h3 className="text-lg font-black text-white uppercase tracking-wide text-glow-cyan">
          {isBn ? "সম্পন্ন ওয়ার্কআউট ও মোট উত্তোলিত ওজন" : "CONQUERED RAIDS & COMBAT VOLUME"}
        </h3>
      </div>

      {/* 3 Metric Pills */}
      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className="rounded-xl border border-cyan-500/40 bg-black/70 p-3 shadow-md">
          <div className="text-xl font-black text-white text-glow-cyan">{week}</div>
          <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
            {isBn ? "৭ দিনের সেশন" : "7D RAIDS"}
          </div>
        </div>
        <div className="rounded-xl border border-purple-500/40 bg-black/70 p-3 shadow-md">
          <div className="text-xl font-black text-purple-300 text-glow-purple">{history.length}</div>
          <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
            {isBn ? "মোট সেশন" : "TOTAL CLEARS"}
          </div>
        </div>
        <div className="rounded-xl border border-cyan-500/40 bg-black/70 p-3 shadow-md">
          <div className="text-xl font-black text-amber-400 text-glow-amber">{totalVolume.toLocaleString()}</div>
          <div className="text-[10px] text-amber-400/90 font-bold uppercase tracking-wider">
            {isBn ? "উত্তোলিত কেজি" : "KG LIFTED"}
          </div>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-cyan-500/30 bg-black/40 p-6 text-center text-xs text-zinc-400 space-y-2">
          <Swords className="h-8 w-8 text-cyan-400 mx-auto opacity-50" />
          <p className="font-bold text-white uppercase">
            {isBn ? "[ এখনও কোনো ওয়ার্কআউট সম্পন্ন হয়নি ]" : "[ NO COMBAT LOGS RECORDED YET ]"}
          </p>
          <p className="text-[11px]">
            {isBn
              ? "সিস্টেম আর্কাইভে আপনার যুদ্ধের রেকর্ড সংরক্ষণ করতে আপনার প্রথম সেশন শুরু ও শেষ করুন।"
              : "Complete your first workout mission to permanently register combat logs into the System archives."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {history.map((h) => {
            const expanded = open === h.id;
            return (
              <li
                key={h.id}
                className={`rounded-xl border transition-all ${
                  expanded
                    ? "border-cyan-400 bg-[#040f2d]/95 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                    : "border-cyan-500/30 bg-black/70 hover:border-cyan-400/60"
                }`}
              >
                <button
                  onClick={() => {
                    playSound("system-click");
                    setOpen(expanded ? null : h.id);
                  }}
                  aria-expanded={expanded}
                  className="flex min-h-[56px] w-full items-center justify-between gap-3 p-3.5 text-left cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-black text-white uppercase tracking-wide flex items-center gap-2">
                      <span className="text-cyan-400">◆</span>
                      <span>{h.title}</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      {new Date(h.finishedAt).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} ·{" "}
                      <span className="text-cyan-300 font-bold uppercase">{focusLabel(h.focus)}</span> · {h.minutes} {isBn ? "মি." : "min"}
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-[11px]">
                    <div className="font-black text-cyan-300 text-glow-cyan">
                      {h.setsDone} / {h.setsTotal} {isBn ? "সেট" : "SETS"}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-bold">{diffLabel[h.difficulty]}</div>
                  </div>
                </button>
                {expanded && (
                  <div className="space-y-2 border-t border-cyan-500/30 p-3.5 text-xs text-zinc-300 bg-black/50">
                    {h.exercises.map((ex, i) => {
                      const done = ex.sets.filter((s) => s.done);
                      const best = done.reduce<{ w: number; r: number } | null>((b, s) => {
                        const w = s.weightKg ?? 0;
                        const r = s.reps ?? 0;
                        return !b || w > b.w || (w === b.w && r > b.r) ? { w, r } : b;
                      }, null);
                      return (
                        <div key={i} className="flex items-center justify-between border-b border-zinc-800/60 py-1">
                          <span className="text-white font-bold">{getExercise(ex.exerciseId)?.name ?? ex.exerciseId}</span>
                          <span className="font-mono text-cyan-400">
                            {done.length} {isBn ? "সেট" : "sets"} {best?.w ? `· সর্বোচ্চ ${best.w}kg x ${best.r}` : ""}
                          </span>
                        </div>
                      );
                    })}
                    {h.notes && (
                      <p className="pt-1 text-zinc-300">
                        <strong className="text-cyan-400">{isBn ? "নোট:" : "NOTE:"}</strong> {h.notes}
                      </p>
                    )}
                    <p className="pt-1 text-[10px] text-zinc-500 flex justify-between">
                      <span>{h.source === "ai" ? "[ DUAL-AI DIRECTIVE ]" : "[ OFFLINE CORE ]"}</span>
                      <span className="text-amber-400/90 font-bold">~{h.kcalEstimate} kcal {isBn ? "ব্যয়িত" : "expended"}</span>
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Cloud & Local Backup Card */}
      <div className="space-y-2.5 rounded-xl border border-cyan-500/30 bg-black/60 p-4">
        <p className="text-xs text-zinc-400">
          {isBn
            ? "আপনার বায়োমেট্রিক ও ওয়ার্কআউট ডাটা ব্রাউজারে অফলাইনে সংরক্ষিত থাকে এবং সুপাবেস ক্লাউডে সিঙ্ক হয়।"
            : "Hunter biometric data persists offline in browser storage and syncs to Supabase cloud database when connected."}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => {
              playSound("system-click");
              onExport();
            }}
            className="system-btn-chamfer flex min-h-[40px] items-center gap-1.5 border border-cyan-500/50 bg-cyan-950/40 px-3.5 text-xs font-black uppercase text-cyan-200 hover:bg-cyan-900/50 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" /> {isBn ? "[ ব্যাকআপ এক্সপোর্ট ]" : "[ EXPORT BACKUP ]"}
          </button>
          <button
            onClick={() => {
              playSound("system-click");
              fileRef.current?.click();
            }}
            className="system-btn-chamfer flex min-h-[40px] items-center gap-1.5 border border-cyan-500/50 bg-black px-3.5 text-xs font-black uppercase text-zinc-200 hover:border-cyan-400 active:scale-95 transition-all cursor-pointer"
          >
            <Upload className="h-4 w-4" /> {isBn ? "[ ব্যাকআপ ইমপোর্ট ]" : "[ IMPORT BACKUP ]"}
          </button>
          {history.length > 0 && (
            <button
              onClick={() => {
                const prompt = isBn
                  ? "ডিভাইসের সব ওয়ার্কআউট হিস্ট্রি মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।"
                  : "Purge all hunter combat history on this device? This cannot be undone.";
                if (window.confirm(prompt)) {
                  playSound("system-alert");
                  onClear();
                }
              }}
              className="system-btn-chamfer flex min-h-[40px] items-center gap-1.5 border border-red-500/50 bg-red-950/40 px-3.5 text-xs font-black uppercase text-red-300 hover:bg-red-950 active:scale-95 transition-all cursor-pointer"
            >
              <Trash2 className="h-4 w-4" /> {isBn ? "[ হিস্ট্রি মুছুন ]" : "[ PURGE ARCHIVES ]"}
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
        {message && <p role="status" className="text-xs text-cyan-300 font-bold">{message}</p>}
      </div>
    </div>
  );
}
