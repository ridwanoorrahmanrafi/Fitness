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

export function FinishSheet({ open, session, weightKg, lang = "bn", onSave, onClose }: Props) {
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
          particleCount: 75,
          spread: 60,
          origin: { y: 0.65 },
          colors: ["#06b6d4", "#3b82f6", "#a855f7", "#10b981"],
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
      title={isBn ? "[ DUNGEON CLEARED : ডানজিয়ন জয় সম্পন্ন ]" : "[ DUNGEON CLEARED : MISSION SUCCESS ]"}
      onClose={onClose}
    >
      <div className="space-y-5 font-mono">
        {/* Holographic Dungeon Clear Banner */}
        <div className="relative rounded-xl p-4 bg-gradient-to-r from-cyan-950/80 via-black to-purple-950/80 border-2 border-cyan-400/70 shadow-[0_0_25px_rgba(6,182,212,0.35)] overflow-hidden">
          <div className="absolute top-1 right-2 text-[10px] text-cyan-300 font-bold uppercase tracking-widest">
            {isBn ? "স্ট্যাটাস : সফলভাবে সম্পন্ন" : "DUNGEON STATUS : CONQUERED"}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 to-purple-600 text-black shadow-lg shadow-cyan-400/50">
              <Trophy className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-lg font-black text-white uppercase tracking-wide text-glow-cyan">
                {t.setsDone} / {t.setsTotal} {isBn ? "সেট সম্পন্ন" : "COMBAT SETS CLEARED"}
              </div>
              <div className="text-xs text-cyan-300/80 font-bold">
                {completion === 1
                  ? isBn ? "১০০% সম্পূর্ণ ওয়ার্কআউট শেষ হয়েছে! বস পরাজিত।" : "100% Full Workout Cleared. Mission conquered."
                  : isBn ? "আংশিক ওয়ার্কআউট সম্পন্ন হয়েছে। প্রগ্রেস সংরক্ষিত।" : "Partial extraction completed. Rewards tallied."}
              </div>
            </div>
          </div>

          {/* Dungeon Clear Rewards Pill */}
          <div className="mt-3 pt-2.5 border-t border-cyan-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-zinc-400 uppercase font-bold text-[10px]">
              {isBn ? "অর্জিত পুরস্কার:" : "CLEAR REWARDS:"}
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-400/50 text-cyan-300 text-[11px] font-black shadow-sm">
                +250 EXP
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-400/50 text-purple-300 text-[11px] font-black shadow-sm">
                {isBn ? "+১ স্ট্যাট পয়েন্ট" : "+1 STAT POINT"}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-400/50 text-emerald-300 text-[11px] font-black shadow-sm">
                {isBn ? "ক্লান্তি মুক্তি" : "FATIGUE RECOVERY"}
              </span>
            </div>
          </div>
        </div>

        {/* Combat Stats Grid */}
        <dl className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-xl border border-cyan-500/30 bg-black/70 p-2.5 shadow-sm">
            <dt className="text-[10px] text-zinc-400 uppercase font-bold">
              {isBn ? "সময়" : "TIME ELAPSED"}
            </dt>
            <dd className="text-base font-black text-white font-mono text-glow-cyan">
              {minutes} {isBn ? "মি." : "min"}
            </dd>
          </div>
          <div className="rounded-xl border border-cyan-500/30 bg-black/70 p-2.5 shadow-sm">
            <dt className="text-[10px] text-zinc-400 uppercase font-bold">
              {isBn ? "মোট ওজন" : "VOLUME LOAD"}
            </dt>
            <dd className="text-base font-black text-white font-mono text-glow-cyan">
              {t.volumeKg ? `${t.volumeKg} kg` : "-"}
            </dd>
          </div>
          <div className="rounded-xl border border-cyan-500/30 bg-black/70 p-2.5 shadow-sm">
            <dt className="text-[10px] text-zinc-400 uppercase font-bold">
              {isBn ? "ক্যালোরি" : "ENERGY (EST.)"}
            </dt>
            <dd className="text-base font-black text-amber-400 font-mono">~{kcal} kcal</dd>
          </div>
        </dl>

        {/* Perceived Dungeon Difficulty */}
        <section>
          <h3 className="mb-2 text-xs font-black uppercase text-cyan-300 tracking-wider">
            {isBn ? "[ অনুভূত ব্যায়ামের তীব্রতা : WORKOUT INTENSITY ]" : "[ PERCEIVED DIFFICULTY : INTENSITY ]"}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {difficultyOptions.map((d) => (
              <button
                key={d.id}
                type="button"
                aria-pressed={difficulty === d.id}
                onClick={() => setDifficulty(d.id)}
                className={`system-btn-chamfer min-h-[56px] px-2 text-center transition-all cursor-pointer ${
                  difficulty === d.id
                    ? "bg-cyan-500/20 border-2 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.6)] text-glow-cyan"
                    : "border border-zinc-800 bg-black/60 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="text-xs font-black uppercase">{d.label}</div>
                <div className="text-[10px] text-zinc-400">{d.hint}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Muscular Soreness & Recovery */}
        <section>
          <h3 className="mb-2 text-xs font-black uppercase text-purple-300 tracking-wider">
            {isBn ? "[ অতিরিক্ত ক্লান্ত পেশীসমূহ (SORE MUSCLES) ]" : "[ TARGETED SORENESS / FATIGUED MUSCLES ]"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {MUSCLES.map((m) => (
              <Chip key={m} selected={sore.includes(m)} onClick={() => setSore((s) => (s.includes(m) ? s.filter((x) => x !== m) : [...s, m]))}>
                {isBn ? MUSCLE_LABEL_BN[m] : MUSCLE_LABEL[m]}
              </Chip>
            ))}
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">
            {isBn
              ? "নির্বাচিত পেশীগুলোকে পরবর্তী ৭২ ঘণ্টার জন্য রিকভারি অগ্রাধিকার দেওয়া হবে।"
              : "Selected muscle regions will be granted prioritized regeneration for 72 hours."}
          </p>
        </section>

        {/* Combat Log Notes */}
        <section>
          <label htmlFor="notes" className="mb-1 block text-xs font-black uppercase text-zinc-300">
            {isBn ? "[ হান্টার নোট / অনুভূতি (ঐচ্ছিক) ]" : "[ HUNTER COMBAT LOG NOTES (OPTIONAL) ]"}
          </label>
          <textarea
            id="notes"
            rows={2}
            maxLength={200}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={isBn ? "যেমন: শেষ সেটে খুব ভালো পাম্প পেয়েছি, ফর্ম সঠিক ছিল" : "e.g. explosive leg drive, form remained rigid through final set"}
            className="w-full rounded-xl border border-cyan-500/30 bg-black/80 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-400 focus:outline-none"
          />
        </section>

        {/* Claim Rewards Button */}
        <button
          onClick={() => onSave({ difficulty, soreMuscles: sore, notes: notes.trim(), minutes, kcal })}
          disabled={t.setsDone === 0}
          className={`system-btn-chamfer min-h-[52px] w-full font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${
            t.setsDone === 0
              ? "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed opacity-50"
              : "bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:brightness-110 text-black shadow-[0_0_25px_rgba(6,182,212,0.8)] active:scale-95"
          }`}
        >
          {t.setsDone === 0
            ? isBn ? "অন্তত একটি সেট শেষ করুন" : "COMPLETE AT LEAST ONE SET"
            : isBn ? "পুরস্কার সংরক্ষণ ও সংগ্রহ করুন" : "CONFIRM CLEAR & RECORD EXP REWARDS"}
        </button>
      </div>
    </Sheet>
  );
}
