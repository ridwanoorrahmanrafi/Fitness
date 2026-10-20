import { useMemo } from "react";
import { Calendar, Dumbbell, Moon, Sparkles, ChevronRight, Swords } from "lucide-react";
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
  const activeDays = workoutDays && workoutDays.length > 0 ? workoutDays : [1, 3, 5];
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
    <div className="relative rounded-2xl border-2 border-cyan-500/40 bg-gradient-to-b from-[#05112e]/90 via-[#07153a]/80 to-[#030818]/95 p-4 shadow-[0_0_30px_rgba(6,182,212,0.25)] text-zinc-100 space-y-3.5 font-mono system-scanlines system-grid-bg">
      {/* Corner Luminous Diamonds */}
      <div className="absolute top-1.5 left-1.5 text-cyan-400 text-[10px] select-none drop-shadow-[0_0_6px_rgba(6,182,212,0.9)]">◆</div>
      <div className="absolute top-1.5 right-1.5 text-cyan-400 text-[10px] select-none drop-shadow-[0_0_6px_rgba(6,182,212,0.9)]">◆</div>

      {/* Header and preset shortcuts */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/30 pb-2.5">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-cyan-400" />
          <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider text-glow-cyan">
            {lang === "bn" ? "[ WEEKLY SCHEDULE : সাপ্তাহিক রুটিন ]" : "[ WEEKLY SCHEDULE : DEPLOYMENT ]"}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {[
            { label: t.daysPpl, days: [1, 3, 5], active: count === 3 && activeDays.includes(1) && activeDays.includes(3) && activeDays.includes(5) },
            { label: t.daysFour, days: [1, 2, 4, 5], active: count === 4 && activeDays.includes(1) && activeDays.includes(2) && activeDays.includes(4) && activeDays.includes(5) },
            { label: t.daysFive, days: [1, 2, 3, 4, 5], active: count === 5 && !activeDays.includes(0) && !activeDays.includes(6) },
          ].map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                playSound("system-click");
                onSetDays(preset.days);
              }}
              className={`system-btn-chamfer px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                preset.active
                  ? "border-cyan-400 bg-cyan-400 text-black shadow-[0_0_12px_rgba(6,182,212,0.7)]"
                  : "border-cyan-500/30 bg-black/60 text-zinc-400 hover:text-cyan-300 hover:border-cyan-400/60"
              }`}
            >
              {preset.label}
            </button>
          ))}
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
              onClick={() => {
                playSound("system-click");
                onToggleDay(d.dayIndex);
              }}
              className={`system-btn-chamfer relative flex flex-col items-center justify-between p-2 min-h-[72px] border transition-all cursor-pointer ${
                isSelected
                  ? "border-cyan-400/80 bg-cyan-950/60 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.35)] scale-102"
                  : "border-zinc-800 bg-black/60 text-zinc-500 hover:border-cyan-500/40 hover:text-zinc-300"
              } ${isToday ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-black" : ""}`}
            >
              {isToday && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-cyan-400 px-1 py-0.2 text-[8px] font-black uppercase text-black tracking-wider shadow-sm">
                  {t.todayLabel}
                </span>
              )}

              <span className="text-[10px] font-black uppercase tracking-wider">{d.short}</span>
              <span className="text-[10px] opacity-75">
                {lang === "bn" ? d.bengaliName.slice(0, 3) : d.name.slice(0, 3)}
              </span>

              <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full">
                {isSelected ? (
                  <Swords className="h-3.5 w-3.5 text-cyan-400" />
                ) : (
                  <Moon className="h-3 w-3 text-zinc-600" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Today's Scheduled Status Card */}
      <div className="rounded-xl border border-cyan-500/30 bg-black/70 p-3 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
              todaySchedule.isWorkoutDay
                ? "border-cyan-400/60 bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                : "border-purple-500/40 bg-purple-950/40 text-purple-300"
            }`}
          >
            {todaySchedule.isWorkoutDay ? <Swords className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white uppercase tracking-wide text-glow-cyan">
                {todaySchedule.isWorkoutDay ? t.todayTarget : t.todayRest} : {todaySchedule.focusLabel}
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                  todaySchedule.isWorkoutDay
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50"
                    : "bg-purple-950/60 text-purple-300 border border-purple-500/40"
                }`}
              >
                {todaySchedule.isWorkoutDay ? "[ RAID DAY ]" : "[ REST & RECOVERY ]"}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
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
              playSound("system-click");
              onApplyTodayFocus(todaySchedule.focusId);
            }}
            className="system-btn-chamfer flex min-h-[36px] items-center gap-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 px-3 text-xs font-black uppercase text-black hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.6)]"
          >
            <Sparkles className="h-3.5 w-3.5 text-black" />
            <span>{t.applyFocusBtn}</span>
            <ChevronRight className="h-3 w-3 stroke-[3]" />
          </button>
        )}
      </div>

      {/* Routine summary footer */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 font-mono">
        <span>{t.workoutDaysCount(count, 7 - count)}</span>
        <span className="text-cyan-400 font-bold">{splitName}</span>
      </div>
    </div>
  );
}
