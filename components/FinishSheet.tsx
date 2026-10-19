"use client";

import { Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { kcalEstimate } from "@/lib/calc";
import { estimateMinutes } from "@/lib/builder";
import { MUSCLE_LABEL } from "@/lib/exercises";
import { totals } from "@/lib/session";
import { type Difficulty, MUSCLES, type Muscle, type Session } from "@/lib/types";
import { Chip, Sheet } from "./Sheet";

export interface FinishResult {
  difficulty: Difficulty;
  soreMuscles: Muscle[];
  notes: string;
  minutes: number;
  kcal: number;
}

interface Props {
  open: boolean;
  session: Session;
  weightKg: number;
  onSave: (r: FinishResult) => void;
  onClose: () => void;
}

const DIFFICULTY: { id: Difficulty; label: string; hint: string }[] = [
  { id: "too_easy", label: "Too easy", hint: "Do more next time" },
  { id: "just_right", label: "Just right", hint: "Keep it similar" },
  { id: "too_hard", label: "Too hard", hint: "Ease off next time" },
];

export function FinishSheet({ open, session, weightKg, onSave, onClose }: Props) {
  const t = useMemo(() => totals(session), [session]);
  const [difficulty, setDifficulty] = useState<Difficulty>("just_right");
  const [sore, setSore] = useState<Muscle[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.65 },
          colors: ["#10b981", "#14b8a6", "#f59e0b", "#3b82f6"],
        });
      } catch {
        // Confetti is optional
      }
    }
  }, [open]);

  const completion = t.setsTotal ? t.setsDone / t.setsTotal : 0;
  const minutes = session.startedAt
    ? Math.min(180, Math.max(1, Math.round((Date.now() - session.startedAt) / 60000)))
    : Math.max(1, Math.round(estimateMinutes(session.plan) * completion));
  const kcal = kcalEstimate(weightKg, minutes);

  return (
    <Sheet open={open} title="Finish workout" onClose={onClose}>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-emerald-400 text-zinc-950">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <div className="text-base font-bold text-white">
              {t.setsDone} of {t.setsTotal} sets done
            </div>
            <div className="text-xs text-zinc-400">{completion === 1 ? "Full session. Recovery starts now." : "Partial sessions count too."}</div>
          </div>
        </div>

        <dl className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-2.5">
            <dt className="text-[11px] text-zinc-400">Time</dt>
            <dd className="text-base font-bold text-white">{minutes} min</dd>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-2.5">
            <dt className="text-[11px] text-zinc-400">Volume</dt>
            <dd className="text-base font-bold text-white">{t.volumeKg ? `${t.volumeKg} kg` : "-"}</dd>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-2.5">
            <dt className="text-[11px] text-zinc-400">Energy (est.)</dt>
            <dd className="text-base font-bold text-white">~{kcal} kcal</dd>
          </div>
        </dl>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-white">How did it feel?</h3>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTY.map((d) => (
              <button
                key={d.id}
                type="button"
                aria-pressed={difficulty === d.id}
                onClick={() => setDifficulty(d.id)}
                className={`min-h-[56px] rounded-xl border px-2 text-center transition-colors ${
                  difficulty === d.id ? "border-emerald-500/70 bg-emerald-500/15 text-emerald-300" : "border-zinc-700 bg-zinc-950 text-zinc-300"
                }`}
              >
                <div className="text-sm font-semibold">{d.label}</div>
                <div className="text-[10px] text-zinc-500">{d.hint}</div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-white">Anything sore or tweaky? (optional)</h3>
          <div className="flex flex-wrap gap-2">
            {MUSCLES.map((m) => (
              <Chip key={m} selected={sore.includes(m)} onClick={() => setSore((s) => (s.includes(m) ? s.filter((x) => x !== m) : [...s, m]))}>
                {MUSCLE_LABEL[m]}
              </Chip>
            ))}
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">Sore areas are rested in the next 3 days of plans.</p>
        </section>

        <section>
          <label htmlFor="notes" className="mb-1 block text-sm font-semibold text-white">Note for your coach (optional)</label>
          <textarea
            id="notes"
            rows={2}
            maxLength={200}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. lunges felt great, pull-ups were the limit"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
          />
        </section>

        <button
          onClick={() => onSave({ difficulty, soreMuscles: sore, notes: notes.trim(), minutes, kcal })}
          disabled={t.setsDone === 0}
          className="min-h-[48px] w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 font-bold text-zinc-950 disabled:opacity-40"
        >
          {t.setsDone === 0 ? "Complete at least one set to save" : "Save to history"}
        </button>
      </div>
    </Sheet>
  );
}
