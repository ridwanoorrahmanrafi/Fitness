"use client";

import { useState, useMemo } from "react";
import {
  X,
  Search,
  Dumbbell,
  Play,
  Filter,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";
import { EXERCISES, MUSCLE_LABEL } from "@/lib/exercises";
import type { Exercise, Muscle } from "@/lib/types";
import { TRANSLATIONS, type Language } from "@/lib/i18n";
import { getExerciseMedia } from "@/lib/exerciseMedia";

interface Props {
  open: boolean;
  lang?: Language;
  onSelectExercise: (exercise: Exercise) => void;
  onClose: () => void;
}

const MUSCLE_FILTERS: { id: string; label: string; muscles: Muscle[] }[] = [
  { id: "all", label: "All Muscles", muscles: [] },
  { id: "chest", label: "Chest", muscles: ["chest"] },
  { id: "back", label: "Back", muscles: ["back"] },
  { id: "legs", label: "Legs", muscles: ["quads", "glutes", "hamstrings", "calves"] },
  { id: "shoulders", label: "Shoulders", muscles: ["shoulders"] },
  { id: "arms", label: "Arms", muscles: ["biceps", "triceps"] },
  { id: "core", label: "Core", muscles: ["core"] },
];

export function ExerciseLibraryModal({
  open,
  lang = "bn",
  onSelectExercise,
  onClose,
}: Props) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const t = TRANSLATIONS[lang] ?? TRANSLATIONS.bn;

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
      <div className="modal-box relative flex max-h-[92vh] w-full max-w-3xl flex-col p-0 rounded-t-2xl sm:rounded-2xl border-1.5 border-cyan-500/60 bg-[#03081a]/95 text-cyan-100 shadow-[0_0_40px_rgba(6,182,212,0.35)] overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 bg-[#03081a] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center system-btn-chamfer bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              <Dumbbell className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] tracking-widest text-cyan-400 font-bold">◆ SYSTEM ARCHIVE ◆</span>
              </div>
              <h2 id="exercise-library-title" className="text-base sm:text-lg font-black text-white tracking-wide text-glow-cyan uppercase font-mono">
                {lang === "bn" ? "[ COMBAT ARCHIVES : ব্যায়াম ডাটাবেস ]" : "[ COMBAT ARCHIVES : EXERCISE CODEX ]"}
              </h2>
              <p className="font-mono text-[11px] text-cyan-400/80">
                {lang === "bn"
                  ? `${EXERCISES.length}+ টি বৈজ্ঞানিক ব্যায়ামের সম্পূর্ণ HD অ্যানিমেশন ও টেকনিক`
                  : `Classified Hunter Archives • ${EXERCISES.length}+ HD Combat Techniques`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close library"
            className="btn btn-sm btn-circle btn-ghost text-cyan-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="border-b border-cyan-500/20 bg-[#03081a]/80 p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400 z-10 pointer-events-none" />
            <input
              type="text"
              placeholder={lang === "bn" ? "ব্যায়াম বা পেশির নাম দিয়ে খুঁজুন..." : "Filter hunter combat archives..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input input-bordered input-primary input-sm w-full bg-[#020512] pl-10 text-xs font-mono text-cyan-100 placeholder-zinc-500"
            />
          </div>

          {/* Muscle category filter chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {MUSCLE_FILTERS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`btn btn-xs font-mono font-bold tracking-wide shrink-0 ${
                  selectedCategory === cat.id
                    ? "btn-primary shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                    : "btn-outline btn-neutral text-cyan-300"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exercises Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
          <div className="text-xs text-cyan-400/70 font-mono font-bold px-1 flex items-center justify-between">
            <span>
              {lang === "bn" ? `[ ${filteredExercises.length} টি ব্যায়াম উপলব্ধ ]` : `[ ${filteredExercises.length} COMBAT TECHNIQUES IDENTIFIED ]`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredExercises.map((ex) => {
              const media = getExerciseMedia(ex.id);
              return (
                <div
                  key={ex.id}
                  onClick={() => onSelectExercise(ex)}
                  className="group relative flex items-center gap-3.5 p-3 system-btn-chamfer border border-cyan-500/30 bg-[#03081a]/80 hover:bg-cyan-950/30 hover:border-cyan-400 hover:shadow-[0_0_18px_rgba(6,182,212,0.35)] transition-all duration-200 cursor-pointer active:scale-[0.98]"
                >
                  {/* Animated Thumbnail */}
                  <div className="relative shrink-0 h-16 w-16 system-btn-chamfer overflow-hidden border border-cyan-500/40 bg-black">
                    <img
                      src={media.localGif}
                      alt={ex.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = media.remoteFallbackGif;
                      }}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/90 text-black shadow-[0_0_10px_rgba(6,182,212,0.8)] opacity-90 group-hover:opacity-100 transition-opacity">
                        <Play className="h-3 w-3 fill-current ml-0.5" />
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate font-mono">
                      {ex.name}
                    </h3>
                    <p className="text-[11px] font-mono text-cyan-400/90 truncate mt-0.5">
                      {ex.muscles.map((m) => MUSCLE_LABEL[m]).join(" · ")}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-cyan-500/70">
                      <span className="badge badge-outline badge-primary badge-xs text-cyan-300">
                        {ex.requires.length ? ex.requires.join(" + ").replace(/_/g, " ") : "bodyweight"}
                      </span>
                      <span>•</span>
                      <span className="font-bold text-cyan-300">Rank {ex.level}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-cyan-500/30 bg-[#03081a] px-5 py-3 flex items-center justify-between">
          <span className="text-xs font-mono text-cyan-400/70">
            {lang === "bn" ? "যেকোনো ব্যায়ামে ট্যাপ করে সম্পূর্ণ গাইড ও অ্যানিমেশন দেখুন" : "Select any combat technique to inspect biomechanical telemetry"}
          </span>
          <button
            onClick={onClose}
            className="btn btn-sm btn-primary font-mono font-bold uppercase text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            {t.gotItBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
