"use client";

import { useMemo } from "react";
import { Calendar, Dumbbell, Moon, Sparkles, ChevronRight } from "lucide-react";
import { DAYS_OF_WEEK, getWeeklySplit, getTodaySchedule } from "@/lib/schedule";
import { TRANSLATIONS, type Language } from "@/lib/i18n";
import type { FocusId } from "@/lib/types";

interface Props {
  workoutDays: number[];
  lang?: Language;
  onToggleDay: (dayIndex: number) => void;
  onSetDays: (days: number[]) => void;
  onApplyTodayFocus?: (focusId: FocusId) => void;
}

export function WeeklyScheduleBar({
  workoutDays,
  lang = "bn",
  onToggleDay,
  onSetDays,
  onApplyTodayFocus,
}: Props) {
  const activeDays = workoutDays && workoutDays.length > 0 ? workoutDays : [1, 3, 5];
  const weeklySplit = useMemo(() => getWeeklySplit(activeDays), [activeDays]);
  const todaySchedule = useMemo(() => getTodaySchedule(activeDays), [activeDays]);
  const todayIndex = new Date().getDay();
  const t = TRANSLATIONS[lang] ?? TRANSLATIONS.bn;

  const count = activeDays.length;

  let splitName = lang === "bn" ? "ফুল বডি ফাউন্ডেশন" : "Full Body Compound Foundation";
  if (count === 3) splitName = "Push / Pull / Legs (PPL)";
  else if (count === 4) splitName = lang === "bn" ? "আপার / লোয়ার ও আর্মস স্প্লিট" : "Upper / Lower & Arms Split";
  else if (count === 5) splitName = lang === "bn" ? "টার্গেটেড হাইপারট্রফি স্প্লিট" : "Targeted Hypertrophy Split";
  else if (count >= 6) splitName = lang === "bn" ? "হাই ফ্রিকোয়েন্সি PPL x 2" : "High Frequency PPL x 2";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950 p-4 shadow-md text-zinc-100 space-y-3.5">
      {/* Header and preset shortcuts */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">{t.weeklyRoutineTitle}</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => onSetDays([1, 3, 5])}
            className={`rounded-lg px-2 py-1 text-[11px] font-medium border transition-colors ${
              count === 3 && activeDays.includes(1) && activeDays.includes(3) && activeDays.includes(5)
                ? "border-emerald-500/80 bg-emerald-500/20 text-emerald-300 font-semibold"
                : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t.daysPpl}
          </button>
          <button
            type="button"
            onClick={() => onSetDays([1, 2, 4, 5])}
            className={`rounded-lg px-2 py-1 text-[11px] font-medium border transition-colors ${
              count === 4 && activeDays.includes(1) && activeDays.includes(2) && activeDays.includes(4) && activeDays.includes(5)
                ? "border-emerald-500/80 bg-emerald-500/20 text-emerald-300 font-semibold"
                : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t.daysFour}
          </button>
          <button
            type="button"
            onClick={() => onSetDays([1, 2, 3, 4, 5])}
            className={`rounded-lg px-2 py-1 text-[11px] font-medium border transition-colors ${
              count === 5 && !activeDays.includes(0) && !activeDays.includes(6)
                ? "border-emerald-500/80 bg-emerald-500/20 text-emerald-300 font-semibold"
                : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t.daysFive}
          </button>
        </div>
      </div>

      {/* 7 Days Selector Strip */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
        {DAYS_OF_WEEK.map((d) => {
          const isSelected = activeDays.includes(d.dayIndex);
          const isToday = d.dayIndex === todayIndex;

          return (
            <button
              key={d.dayIndex}
              type="button"
              onClick={() => onToggleDay(d.dayIndex)}
              className={`relative flex flex-col items-center justify-between rounded-xl p-2 min-h-[72px] border transition-all ${
                isSelected
                  ? "border-emerald-500/60 bg-emerald-950/30 text-emerald-300 shadow-sm shadow-emerald-950"
                  : "border-zinc-800/80 bg-zinc-950/60 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
              } ${isToday ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-zinc-950" : ""}`}
            >
              {isToday && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-emerald-400 px-1 py-0.2 text-[8px] font-black uppercase text-zinc-950 tracking-wider">
                  {t.todayLabel}
                </span>
              )}

              <span className="text-[10px] font-semibold uppercase">{d.short}</span>
              <span className="text-[11px] opacity-75">
                {lang === "bn" ? d.bengaliName.slice(0, 3) : d.name.slice(0, 3)}
              </span>

              <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full">
                {isSelected ? (
                  <Dumbbell className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Moon className="h-3 w-3 text-zinc-600" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Today's Scheduled Status Card */}
      <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/80 p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
              todaySchedule.isWorkoutDay
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-inner"
                : "border-teal-500/30 bg-teal-950/20 text-teal-400"
            }`}
          >
            {todaySchedule.isWorkoutDay ? <Dumbbell className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                {todaySchedule.isWorkoutDay ? t.todayTarget : t.todayRest} {todaySchedule.focusLabel}
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  todaySchedule.isWorkoutDay
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {todaySchedule.isWorkoutDay ? t.trainingDay : t.restDay}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              {todaySchedule.isWorkoutDay
                ? `${t.programLabel} ${todaySchedule.sessionTitle}`
                : t.restDesc}
            </p>
          </div>
        </div>

        {todaySchedule.isWorkoutDay && onApplyTodayFocus && (
          <button
            type="button"
            onClick={() => onApplyTodayFocus(todaySchedule.focusId)}
            className="flex min-h-[36px] items-center gap-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t.applyFocusBtn}</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Routine summary footer */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
        <span>{t.workoutDaysCount(count, 7 - count)}</span>
        <span className="text-zinc-500 font-medium">{splitName}</span>
      </div>
    </div>
  );
}
