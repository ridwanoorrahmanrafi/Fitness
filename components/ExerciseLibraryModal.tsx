"use client";

import { useState, useMemo } from "react";
import {
  X,
  Search,
  Dumbbell,
  Play,
} from "lucide-react";
import { EXERCISES, MUSCLE_LABEL } from "@/lib/exercises";
import type { Exercise, Muscle } from "@/lib/types";
import { TRANSLATIONS, type Language } from "@/lib/i18n";
import { getExerciseMedia } from "@/lib/exerciseMedia";
import { playSound } from "@/lib/audio";

interface Props {
  open: boolean;
  lang?: Language;
  onLanguageChange?: (lang: Language) => void;
  onSelectExercise: (exercise: Exercise) => void;
  onClose: () => void;
}

const MUSCLE_FILTERS: { id: string; label: string; labelBn: string; muscles: Muscle[] }[] = [
  { id: "all", label: "All Muscles", labelBn: "সকল পেশী", muscles: [] },
  { id: "chest", label: "Chest", labelBn: "বুক", muscles: ["chest"] },
  { id: "back", label: "Back", labelBn: "পিঠ", muscles: ["back"] },
  { id: "legs", label: "Legs", labelBn: "পা", muscles: ["quads", "glutes", "hamstrings", "calves"] },
  { id: "shoulders", label: "Shoulders", labelBn: "কাঁধ", muscles: ["shoulders"] },
  { id: "arms", label: "Arms", labelBn: "হাত / আর্মস", muscles: ["biceps", "triceps"] },
  { id: "core", label: "Core", labelBn: "কোর / পেট", muscles: ["core"] },
];

const LEVEL_LABELS = {
  1: { en: "Beginner", bn: "বিগিনার" },
  2: { en: "Intermediate", bn: "ইন্টারমিডিয়েট" },
  3: { en: "Advanced", bn: "এডভান্সড" },
};

export function ExerciseLibraryModal({
  open,
  lang = "bn",
  onLanguageChange,
  onSelectExercise,
  onClose,
}: Props) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const t = TRANSLATIONS[lang] ?? TRANSLATIONS.bn;
  const isBn = lang === "bn";

  const filteredExercises = useMemo(() => {
    return EXERCISES.filter((ex) => {
      // Query search
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesName = ex.name.toLowerCase().includes(q);
        const matchesMuscles = ex.muscles.some((m) =>
          (MUSCLE_LABEL[m] ?? m).toLowerCase().includes(q)
        );
        const matchesEquip = ex.requires.some((r) => r.toLowerCase().includes(q));
        if (!matchesName && !matchesMuscles && !matchesEquip) return false;
      }

      // Muscle filter
      if (selectedCategory !== "all") {
        const cat = MUSCLE_FILTERS.find((f) => f.id === selectedCategory);
        if (cat && cat.muscles.length > 0) {
          const hasMuscle = ex.muscles.some((m) => cat.muscles.includes(m));
          if (!hasMuscle) return false;
        }
      }

      return true;
    });
  }, [query, selectedCategory]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exercise-library-title"
      className="modal modal-open backdrop-blur-md z-50 p-0 sm:p-4"
    >
      <div className="modal-box relative flex max-h-[92vh] w-full max-w-3xl flex-col p-0 rounded-3xl border border-white/10 glass-surface bg-[#050507]/95 text-zinc-100 shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 glass-surface bg-[#050507]/90 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Dumbbell className="h-5 w-5" />
            </span>
            <div>
              <h2 id="exercise-library-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                {isBn ? "ব্যায়াম লাইব্রেরি" : "Exercise Library"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isBn
                  ? `${EXERCISES.length}+ টি বৈজ্ঞানিক ব্যায়ামের সম্পূর্ণ অ্যানিমেশন ও টেকনিক`
                  : `Comprehensive Guide • ${EXERCISES.length}+ Exercise Techniques`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onLanguageChange && (
              <div
                role="group"
                aria-label="Language selection"
                className="flex items-center rounded-lg border border-slate-700 bg-slate-900/80 p-0.5 text-xs"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (lang !== "bn") {
                      playSound("click");
                      onLanguageChange("bn");
                    }
                  }}
                  className={`rounded px-2 py-0.5 text-[11px] font-bold transition-all cursor-pointer ${
                    lang === "bn"
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
                  className={`rounded px-2 py-0.5 text-[11px] font-bold transition-all cursor-pointer ${
                    lang === "en"
                      ? "bg-emerald-500 text-slate-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                  aria-pressed={lang === "en"}
                >
                  EN
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              aria-label="Close library"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="border-b border-white/10 glass-surface bg-[#050507]/80 p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
            <input
              type="text"
              placeholder={isBn ? "ব্যায়াম বা পেশির নাম দিয়ে খুঁজুন..." : "Search exercises by name or muscle..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Muscle category filter chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {MUSCLE_FILTERS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-emerald-500 text-slate-950"
                    : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                {isBn ? cat.labelBn : cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exercises Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          <div className="text-xs text-slate-400 font-medium px-1 flex items-center justify-between">
            <span>
              {isBn ? `${filteredExercises.length} টি ব্যায়াম পাওয়া গেছে` : `${filteredExercises.length} exercises found`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredExercises.map((ex) => {
              const media = getExerciseMedia(ex.id);
              const levelObj = LEVEL_LABELS[ex.level];
              return (
                <div
                  key={ex.id}
                  onClick={() => onSelectExercise(ex)}
                  className="group relative flex items-center gap-3.5 p-3 rounded-2xl border border-white/10 glass-surface hover:border-lime-400/50 hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.99]"
                >
                  {/* Animated Thumbnail */}
                  <div className="relative shrink-0 h-16 w-16 rounded-xl overflow-hidden border border-slate-800 bg-black">
                    <img
                      src={media.localGif}
                      alt={ex.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = media.remoteFallbackGif;
                      }}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/90 text-slate-950 shadow-md">
                        <Play className="h-3 w-3 fill-current ml-0.5" />
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors truncate">
                      {ex.name}
                    </h3>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {ex.muscles.map((m) => MUSCLE_LABEL[m]).join(" · ")}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-300">
                        {ex.requires.length ? ex.requires.join(" + ").replace(/_/g, " ") : (isBn ? "বডিওয়েট" : "bodyweight")}
                      </span>
                      <span>•</span>
                      <span className="text-[10px] text-emerald-400 font-medium">
                        {isBn ? levelObj?.bn : levelObj?.en}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 glass-surface bg-[#050507] px-5 py-3.5 flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            {isBn ? "যেকোনো ব্যায়ামে ট্যাপ করে সম্পূর্ণ গাইড ও অ্যানিমেশন দেখুন" : "Select any exercise to view detailed form and execution"}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-lime-400 to-emerald-500 hover:from-lime-300 hover:to-emerald-400 text-zinc-950 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            {t.gotItBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
