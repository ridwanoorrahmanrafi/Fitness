import { useMemo } from "react";
import { Calendar, Dumbbell, Moon, Sparkles, ChevronRight } from "lucide-react";
import { DAYS_OF_WEEK, getWeeklySplit, getTodaySchedule } from "@/lib/schedule";
import { TRANSLATIONS, type Language } from "@/lib/i18n";
import type { FocusId } from "@/lib/types";
import { playSound } from "@/lib/audio";

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
  const activeDays = useMemo(
    () => (workoutDays && workoutDays.length > 0 ? workoutDays : [1, 3, 5]),
    [workoutDays]
  );
  const weeklySplit = useMemo(() => getWeeklySplit(activeDays), [activeDays]);
  const todaySchedule = useMemo(() => getTodaySchedule(activeDays), [activeDays]);
  const todayIndex = new Date().getDay();
  const t = TRANSLATIONS[lang] ?? TRANSLATIONS.bn;

  const count = activeDays.length;

  let splitName = lang === "bn" ? "ফুল বডি কম্পাউন্ড ফাউন্ডেশন" : "Full Body Compound Foundation";
  if (count === 3) splitName = lang === "bn" ? "পুশ / পুল / লেগস (PPL)" : "Push / Pull / Legs (PPL)";
  else if (count === 4) splitName = lang === "bn" ? "আপার / লোয়ার ও আর্মস স্প্লিট" : "Upper / Lower & Arms Split";
  else if (count === 5) splitName = lang === "bn" ? "টার্গেটেড হাইপারট্রফি স্প্লিট" : "Targeted Hypertrophy Split";
  else if (count >= 6) splitName = lang === "bn" ? "হাই ফ্রিকোয়েন্সি PPL x ২" : "High Frequency PPL x 2";

  return (
    <div className="relative rounded-2xl border border-slate-800 bg-[#111726]/80 p-4 text-slate-100 space-y-4 font-sans shadow-lg">
      {/* Header and preset shortcuts */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-400" />
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            {lang === "bn" ? "সাপ্তাহিক শিডিউল" : "Weekly Schedule"}
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-xs">
          {[
            { label: t.daysPpl, days: [1, 3, 5], active: count === 3 && activeDays.includes(1) && activeDays.includes(3) && activeDays.includes(5) },
            { label: t.daysFour, days: [1, 2, 4, 5], active: count === 4 && activeDays.includes(1) && activeDays.includes(2) && activeDays.includes(4) && activeDays.includes(5) },
            { label: t.daysFive, days: [1, 2, 3, 4, 5], active: count === 5 && !activeDays.includes(0) && !activeDays.includes(6) },
          ].map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                playSound("click");
                onSetDays(preset.days);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                preset.active
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 7 Days Selector Strip */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
        {DAYS_OF_WEEK.map((d) => {
          const isSelected = activeDays.includes(d.dayIndex);
          const isToday = d.dayIndex === todayIndex;

          return (
            <button
              key={d.dayIndex}
              type="button"
              onClick={() => {
                playSound("click");
                onToggleDay(d.dayIndex);
              }}
              className={`relative flex flex-col items-center justify-between p-1.5 sm:p-2 min-h-[64px] sm:min-h-[72px] rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "border-emerald-500/80 bg-emerald-500/10 text-emerald-300 font-semibold shadow-sm"
                  : "border-slate-800/80 bg-slate-900/50 text-slate-500 hover:border-slate-700 hover:text-slate-300"
              } ${isToday ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#090d16]" : ""}`}
            >
              {isToday && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-emerald-500 px-1 py-0.2 text-[7px] sm:text-[8px] font-bold uppercase text-slate-950 tracking-wider">
                  {t.todayLabel}
                </span>
              )}

              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">{d.short}</span>
              <span className="text-[9px] sm:text-[10px] opacity-75">
                {lang === "bn" ? d.bengaliName.slice(0, 3) : d.name.slice(0, 3)}
              </span>

              <div className="mt-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full">
                {isSelected ? (
                  <Dumbbell className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400" />
                ) : (
                  <Moon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-600" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Today's Scheduled Status Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
              todaySchedule.isWorkoutDay
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-slate-700 bg-slate-800/60 text-slate-400"
            }`}
          >
            {todaySchedule.isWorkoutDay ? <Dumbbell className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                {todaySchedule.isWorkoutDay ? t.todayTarget : t.todayRest} : {todaySchedule.focusLabel}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  todaySchedule.isWorkoutDay
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {todaySchedule.isWorkoutDay ? (lang === "bn" ? "ওয়ার্কআউট দিন" : "Workout Day") : (lang === "bn" ? "বিশ্রাম ও রিকভারি" : "Rest & Recovery")}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {todaySchedule.isWorkoutDay
                ? `${t.programLabel} ${todaySchedule.sessionTitle}`
                : t.restDesc}
            </p>
          </div>
        </div>

        {todaySchedule.isWorkoutDay && onApplyTodayFocus && (
          <button
            type="button"
            onClick={() => {
              playSound("click");
              onApplyTodayFocus(todaySchedule.focusId);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-slate-950" />
            <span>{t.applyFocusBtn}</span>
            <ChevronRight className="h-3 w-3 stroke-[3]" />
          </button>
        )}
      </div>

      {/* Routine summary footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
        <span>{t.workoutDaysCount(count, 7 - count)}</span>
        <span className="text-emerald-400 font-semibold">{splitName}</span>
      </div>
    </div>
  );
}
