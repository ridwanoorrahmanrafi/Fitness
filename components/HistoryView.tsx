"use client";

import { Download, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { getExercise } from "@/lib/exercises";
import { focusLabel } from "@/lib/builder";
import { sessionsInLastDays } from "@/lib/session";
import type { HistoryEntry } from "@/lib/types";

interface Props {
  history: HistoryEntry[];
  onExport: () => void;
  onImport: (text: string) => string;
  onClear: () => void;
}

const DIFF_LABEL = { too_easy: "Too easy", just_right: "Just right", too_hard: "Too hard" } as const;

export function HistoryView({ history, onExport, onImport, onClear }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const week = sessionsInLastDays(history, 7);
  const totalVolume = history.reduce((s, h) => s + h.volumeKg, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
          <div className="text-xl font-extrabold text-white">{week}</div>
          <div className="text-[11px] text-zinc-400">last 7 days</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
          <div className="text-xl font-extrabold text-white">{history.length}</div>
          <div className="text-[11px] text-zinc-400">sessions total</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
          <div className="text-xl font-extrabold text-white">{totalVolume.toLocaleString()}</div>
          <div className="text-[11px] text-zinc-400">kg lifted (logged)</div>
        </div>
      </div>

      {history.length === 0 ? (
        <p className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-400">
          No sessions yet. Finish a workout and it will show up here, and its feedback will shape your next plan.
        </p>
      ) : (
        <ul className="space-y-2">
          {history.map((h) => {
            const expanded = open === h.id;
            return (
              <li key={h.id} className="rounded-xl border border-zinc-800 bg-zinc-900/80">
                <button
                  onClick={() => setOpen(expanded ? null : h.id)}
                  aria-expanded={expanded}
                  className="flex min-h-[56px] w-full items-center justify-between gap-3 p-3 text-left"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{h.title}</div>
                    <div className="text-[11px] text-zinc-400">
                      {new Date(h.finishedAt).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} ·{" "}
                      {focusLabel(h.focus)} · {h.minutes} min
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-[11px] text-zinc-400">
                    <div className="font-semibold text-emerald-400">{h.setsDone}/{h.setsTotal} sets</div>
                    <div>{DIFF_LABEL[h.difficulty]}</div>
                  </div>
                </button>
                {expanded && (
                  <div className="space-y-1.5 border-t border-zinc-800 p-3 text-xs text-zinc-300">
                    {h.exercises.map((ex, i) => {
                      const done = ex.sets.filter((s) => s.done);
                      const best = done.reduce<{ w: number; r: number } | null>((b, s) => {
                        const w = s.weightKg ?? 0;
                        const r = s.reps ?? 0;
                        return !b || w > b.w || (w === b.w && r > b.r) ? { w, r } : b;
                      }, null);
                      return (
                        <div key={i} className="flex justify-between gap-3">
                          <span>{getExercise(ex.exerciseId)?.name ?? ex.exerciseId}</span>
                          <span className="text-zinc-500">
                            {done.length}/{ex.sets.length}
                            {best && best.w > 0 ? ` · best ${best.r || "?"} × ${best.w} kg` : best && best.r > 0 ? ` · best ${best.r} reps` : ""}
                          </span>
                        </div>
                      );
                    })}
                    {h.notes && <p className="pt-1 text-zinc-400">Note: {h.notes}</p>}
                    <p className="pt-1 text-[11px] text-zinc-500">
                      {h.source === "ai" ? "AI-coached plan" : "Offline plan"} · ~{h.kcalEstimate} kcal (estimate)
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
        <p className="text-xs text-zinc-400">Your data lives only in this browser. Back it up now and then, or move it to another device.</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={onExport} className="flex min-h-[44px] items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-100 hover:bg-zinc-700">
            <Download className="h-4 w-4" /> Export
          </button>
          <button onClick={() => fileRef.current?.click()} className="flex min-h-[44px] items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-100 hover:bg-zinc-700">
            <Upload className="h-4 w-4" /> Import
          </button>
          {history.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm("Delete all workout history on this device? This cannot be undone.")) onClear();
              }}
              className="flex min-h-[44px] items-center gap-2 rounded-xl border border-red-900/60 bg-red-950/40 px-3 text-sm text-red-300 hover:bg-red-950"
            >
              <Trash2 className="h-4 w-4" /> Clear
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
        {message && <p role="status" className="text-xs text-emerald-400">{message}</p>}
      </div>
    </div>
  );
}
