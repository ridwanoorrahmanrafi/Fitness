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
import type { Language } from "@/lib/i18n";
import { playSound } from "@/lib/audio";

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
  lang?: Language;
  onLanguageChange?: (lang: Language) => void;
  onSave: (r: FinishResult) => void;
  onClose: () => void;
}

const MUSCLE_LABEL_BN: Record<Muscle, string> = {
  chest: "বুক (Chest)",
  back: "পিঠ (Back)",
  shoulders: "কাঁধ (Shoulders)",
  biceps: "বাইসেপ (Biceps)",
  triceps: "ট্রাইসেপ (Triceps)",
  quads: "কোয়াডস (Quads)",
  hamstrings: "হ্যামস্ট্রিং (Hamstrings)",
  glutes: "নিতম্ব (Glutes)",
  calves: "কাফ (Calves)",
  core: "কোর / পেট (Core)",
};

export function FinishSheet({ open, session, weightKg, lang = "bn", onLanguageChange, onSave, onClose }: Props) {
  const isBn = lang === "bn";
  const t = useMemo(() => totals(session), [session]);
  const [difficulty, setDifficulty] = useState<Difficulty>("just_right");
  const [sore, setSore] = useState<Muscle[]>([]);
  const [notes, setNotes] = useState("");

  const difficultyOptions: { id: Difficulty; label: string; hint: string }[] = isBn
    ? [
      { id: "too_easy", label: "সহজ ছিল", hint: "পরের বার আরও লোড দিন" },
      { id: "just_right", label: "একদম উপযুক্ত", hint: "একই লোড ধরে রাখুন" },
      { id: "too_hard", label: "খুব কঠিন ছিল", hint: "পরের বার লোড কমান" },
    ]
    : [
      { id: "too_easy", label: "Too easy", hint: "Do more next time" },
      { id: "just_right", label: "Just right", hint: "Keep it similar" },
      { id: "too_hard", label: "Too hard", hint: "Ease off next time" },
    ];

  useEffect(() => {
    if (open) {
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.65 },
          colors: ["#10b981", "#3b82f6", "#6366f1"],
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
    <Sheet
      open={open}
      title={isBn ? "ওয়ার্কআউট সম্পন্ন" : "Workout Completed"}
      onClose={onClose}
    >
      <div className="space-y-5 font-sans">
        {/* Workout Complete Banner */}
        <div className="relative rounded-3xl p-5 glass-surface border border-lime-400/30 shadow-lg overflow-hidden">
          <div className="absolute top-2.5 right-3 flex items-center gap-2">
            {onLanguageChange && (
              <div
                role="group"
                aria-label="Language selection"
                className="flex items-center rounded-lg border border-slate-700/60 bg-slate-900/80 p-0.5 text-xs"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (lang !== "bn") {
                      playSound("click");
                      onLanguageChange("bn");
                    }
                  }}
                  className={`rounded px-2 py-0.5 text-[10px] font-bold transition-all cursor-pointer ${lang === "bn"
                      ? "bg-emerald-500 text-slate-950"
                      : "text-slate-400 hover:text-white"
                    }`}
                  aria-pressed={lang === "bn"}
                >
                  বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (lang !== "en") {
                      playSound("click");
                      onLanguageChange("en");
                    }
                  }}
                  className={`rounded px-2 py-0.5 text-[10px] font-bold transition-all cursor-pointer ${lang === "en"
                      ? "bg-emerald-500 text-slate-950"
                      : "text-slate-400 hover:text-white"
                    }`}
                  aria-pressed={lang === "en"}
                >
                  EN
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Trophy className="h-6 w-6 stroke-[2]" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">
                {t.setsDone} / {t.setsTotal} {isBn ? "সেট সম্পন্ন হয়েছে" : "Sets Completed"}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {completion === 1
                  ? isBn ? "সম্পূর্ণ ওয়ার্কআউট সফলভাবে শেষ হয়েছে! দারুণ কাজ করেছেন।" : "Full workout completed! Great job on finishing strong."
                  : isBn ? "ওয়ার্কআউট শেষ হয়েছে। আপনার প্রগ্রেস সেভ করা হবে।" : "Session wrapped up. Progress will be saved."}
              </div>
            </div>
          </div>
        </div>

        {/* Workout Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-2xl border border-white/10 glass-surface p-3 text-center">
            <div className="text-[11px] text-zinc-400 font-medium">
              {isBn ? "সময়কাল" : "Duration"}
            </div>
            <div className="text-base font-extrabold text-white mt-1">
              {minutes} {isBn ? "মি." : "min"}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 glass-surface p-3 text-center">
            <div className="text-[11px] text-zinc-400 font-medium">
              {isBn ? "মোট ভলিউম" : "Total Volume"}
            </div>
            <div className="text-base font-extrabold text-white mt-1">
              {t.volumeKg ? `${t.volumeKg} kg` : "-"}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 glass-surface p-3 text-center">
            <div className="text-[11px] text-zinc-400 font-medium">
              {isBn ? "আনুমানিক ক্যালোরি" : "Calories (Est.)"}
            </div>
            <div className="text-base font-extrabold text-lime-400 mt-1">
              ~{kcal} kcal
            </div>
          </div>
        </div>

        {/* Perceived Intensity */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-300">
            {isBn ? "ব্যায়ামের তীব্রতা কেমন ছিল?" : "How did the workout feel?"}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {difficultyOptions.map((d) => (
              <button
                key={d.id}
                type="button"
                aria-pressed={difficulty === d.id}
                onClick={() => setDifficulty(d.id)}
                className={`min-h-[56px] h-auto p-2.5 flex flex-col items-center justify-center rounded-2xl border transition-all cursor-pointer ${difficulty === d.id
                    ? "border-lime-400 bg-lime-400/15 text-lime-400 font-extrabold"
                    : "border-white/10 glass-surface text-zinc-400 hover:text-white hover:border-white/20"
                  }`}
              >
                <div className="text-xs font-semibold">{d.label}</div>
                <div className="text-[10px] opacity-75 mt-0.5">{d.hint}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Muscular Soreness & Recovery */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-300">
            {isBn ? "কোন পেশীতে বেশি চাপ অনুভূত হচ্ছে?" : "Targeted Muscle Soreness & Fatigue"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {MUSCLES.map((m) => (
              <Chip key={m} selected={sore.includes(m)} onClick={() => setSore((s) => (s.includes(m) ? s.filter((x) => x !== m) : [...s, m]))}>
                {isBn ? MUSCLE_LABEL_BN[m] : MUSCLE_LABEL[m]}
              </Chip>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-zinc-400">
            {isBn
              ? "নির্বাচিত পেশীগুলোকে পরবর্তী ৭২ ঘণ্টার জন্য রিকভারি অগ্রাধিকার দেওয়া হবে।"
              : "Selected muscle groups will be scheduled for recovery prioritization over the next 72 hours."}
          </p>
        </section>

        {/* Workout Notes */}
        <section>
          <label htmlFor="notes" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
            {isBn ? "ওয়ার্কআউট নোট / অনুভূতি (ঐচ্ছিক)" : "Workout Notes & Reflections (Optional)"}
          </label>
          <textarea
            id="notes"
            rows={2}
            maxLength={200}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={isBn ? "যেমন: শেষ সেটে দারুণ পাম্প পেয়েছি, ফর্ম সঠিক ছিল" : "e.g. good depth on squats, maintained steady tempo throughout"}
            className="w-full rounded-2xl border border-white/10 glass-surface bg-black/60 p-3 text-xs text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none"
          />
        </section>

        {/* Save Workout Button */}
        <button
          onClick={() => onSave({ difficulty, soreMuscles: sore, notes: notes.trim(), minutes, kcal })}
          disabled={t.setsDone === 0}
          className={`w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm transition-all cursor-pointer ${t.setsDone === 0
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              : "bg-gradient-to-r from-lime-400 to-emerald-500 hover:from-lime-300 hover:to-emerald-400 text-zinc-950 shadow-md shadow-lime-400/25 active:scale-[0.98]"
            }`}
        >
          {t.setsDone === 0
            ? isBn ? "অন্তত একটি সেট সম্পন্ন করুন" : "Complete at least one set"
            : isBn ? "ওয়ার্কআউট সেভ করুন" : "Save Workout"}
        </button>
      </div>
    </Sheet>
  );
}
