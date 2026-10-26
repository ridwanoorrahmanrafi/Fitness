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
          <div className="absolute top-1.5 right-2 flex items-center gap-2">
            {onLanguageChange && (
              <div
                role="group"
                aria-label="Language selection"
                className="flex items-center rounded-lg border border-cyan-500/40 bg-[#020512] p-0.5 font-mono text-xs shadow-[0_0_12px_rgba(6,182,212,0.2)]"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (lang !== "bn") {
                      playSound("system-click");
                      onLanguageChange("bn");
                    }
                  }}
                  className={`rounded px-1.5 py-0.5 text-[9px] font-black transition-all cursor-pointer ${
                    lang === "bn"
                      ? "bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.7)]"
                      : "text-cyan-400/70 hover:text-cyan-200"
                  }`}
                  aria-pressed={lang === "bn"}
                >
                  বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (lang !== "en") {
                      playSound("system-click");
                      onLanguageChange("en");
                    }
                  }}
                  className={`rounded px-1.5 py-0.5 text-[9px] font-black transition-all cursor-pointer ${
                    lang === "en"
                      ? "bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.7)]"
                      : "text-cyan-400/70 hover:text-cyan-200"
                  }`}
                  aria-pressed={lang === "en"}
                >
                  EN
                </button>
              </div>
            )}
            <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-widest hidden sm:inline">
              {isBn ? "স্ট্যাটাস : সফলভাবে সম্পন্ন" : "DUNGEON STATUS : CONQUERED"}
            </span>
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
              <span className="badge badge-info badge-outline font-black text-[11px]">
                +250 EXP
              </span>
              <span className="badge badge-secondary badge-outline font-black text-[11px]">
                {isBn ? "+১ স্ট্যাট পয়েন্ট" : "+1 STAT POINT"}
              </span>
              <span className="badge badge-success badge-outline font-black text-[11px]">
                {isBn ? "ক্লান্তি মুক্তি" : "FATIGUE RECOVERY"}
              </span>
            </div>
          </div>
        </div>

        {/* Combat Stats Grid */}
        <div className="stats stats-horizontal shadow w-full bg-base-300/80 border border-cyan-500/30">
          <div className="stat p-2.5 text-center">
            <div className="stat-title text-[10px] text-zinc-400 uppercase font-bold">
              {isBn ? "সময়" : "TIME ELAPSED"}
            </div>
            <div className="stat-value text-base font-black text-white font-mono text-glow-cyan">
              {minutes} {isBn ? "মি." : "min"}
            </div>
          </div>
          <div className="stat p-2.5 text-center">
            <div className="stat-title text-[10px] text-zinc-400 uppercase font-bold">
              {isBn ? "মোট ওজন" : "VOLUME LOAD"}
            </div>
            <div className="stat-value text-base font-black text-white font-mono text-glow-cyan">
              {t.volumeKg ? `${t.volumeKg} kg` : "-"}
            </div>
          </div>
          <div className="stat p-2.5 text-center">
            <div className="stat-title text-[10px] text-zinc-400 uppercase font-bold">
              {isBn ? "ক্যালোরি" : "ENERGY (EST.)"}
            </div>
            <div className="stat-value text-base font-black text-amber-400 font-mono">
              ~{kcal} kcal
            </div>
          </div>
        </div>

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
                className={`btn min-h-[56px] h-auto p-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                  difficulty === d.id
                    ? "btn-primary shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                    : "btn-outline btn-neutral text-zinc-400 hover:text-white"
                }`}
              >
                <div className="text-xs font-black uppercase">{d.label}</div>
                <div className="text-[10px] opacity-80">{d.hint}</div>
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
            className="textarea textarea-bordered textarea-primary w-full bg-black/80 text-xs text-zinc-100 font-mono"
          />
        </section>

        {/* Claim Rewards Button */}
        <button
          onClick={() => onSave({ difficulty, soreMuscles: sore, notes: notes.trim(), minutes, kcal })}
          disabled={t.setsDone === 0}
          className={`btn btn-primary w-full min-h-[52px] font-black text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(6,182,212,0.8)] ${
            t.setsDone === 0 ? "btn-disabled opacity-50" : ""
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
