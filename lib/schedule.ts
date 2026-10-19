// Weekly Schedule & Split Manager - Adjusts workout days and splits intelligently

import type { FocusId } from "./types";

export interface DayInfo {
  dayIndex: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  short: string;
  name: string;
  bengaliName: string;
}

export const DAYS_OF_WEEK: DayInfo[] = [
  { dayIndex: 0, short: "Sun", name: "Sunday", bengaliName: "রবিবার" },
  { dayIndex: 1, short: "Mon", name: "Monday", bengaliName: "সোমবার" },
  { dayIndex: 2, short: "Tue", name: "Tuesday", bengaliName: "মঙ্গলবার" },
  { dayIndex: 3, short: "Wed", name: "Wednesday", bengaliName: "বুধবার" },
  { dayIndex: 4, short: "Thu", name: "Thursday", bengaliName: "বৃহস্পতিবার" },
  { dayIndex: 5, short: "Fri", name: "Friday", bengaliName: "শুক্রবার" },
  { dayIndex: 6, short: "Sat", name: "Saturday", bengaliName: "শনিবার" },
];

export interface ScheduledDay {
  dayIndex: number;
  dayName: string;
  bengaliName: string;
  isWorkoutDay: boolean;
  focusId: FocusId;
  focusLabel: string;
  sessionTitle: string;
}

/**
 * Generate intelligent split mapping based on user's chosen workout days
 */
export function getWeeklySplit(chosenDays: number[] = [1, 3, 5]): Record<number, ScheduledDay> {
  const activeDays = chosenDays.length > 0 ? [...chosenDays].sort((a, b) => a - b) : [1, 3, 5];
  const count = activeDays.length;

  // Split configurations based on frequency
  let splitFoci: { focusId: FocusId; label: string; title: string }[] = [];

  if (count <= 2) {
    // 1-2 days: Full body compound work
    splitFoci = [
      { focusId: "full", label: "Full Body (Compound Foundation)", title: "Full Body Strength A" },
      { focusId: "full", label: "Full Body (Power & Core)", title: "Full Body Hypertrophy B" },
    ];
  } else if (count === 3) {
    // 3 days: Classic Push / Pull / Legs
    splitFoci = [
      { focusId: "chest_tri", label: "Push (Chest, Shoulders & Triceps)", title: "Upper Push & Chest Sculpt" },
      { focusId: "back_bi", label: "Pull (Back, Lats & Biceps)", title: "Posterior Pull & Back Density" },
      { focusId: "legs_core", label: "Legs & Core (Quad & Glute Power)", title: "Lower Body & Core Stability" },
    ];
  } else if (count === 4) {
    // 4 days: Upper / Lower or Push / Pull / Legs / Arms
    splitFoci = [
      { focusId: "chest_tri", label: "Push (Chest & Triceps)", title: "Chest & Triceps Hypertrophy" },
      { focusId: "back_bi", label: "Pull (Back & Biceps)", title: "Back & Lat Density" },
      { focusId: "legs_core", label: "Legs & Core", title: "Quad, Hamstring & Core Power" },
      { focusId: "shoulders_arms", label: "Shoulders & Arms", title: "Shoulders, Biceps & Triceps Burnout" },
    ];
  } else if (count === 5) {
    // 5 days: Bro-Split / Targeted
    splitFoci = [
      { focusId: "chest_tri", label: "Chest & Triceps", title: "Chest & Triceps Heavy Press" },
      { focusId: "back_bi", label: "Back & Biceps", title: "Back Width & Bicep Peak" },
      { focusId: "legs_core", label: "Legs & Abs", title: "Lower Body Strength & Core" },
      { focusId: "shoulders_arms", label: "Shoulders & Arms", title: "Shoulder Boulder & Arm Pump" },
      { focusId: "full", label: "Full Body Athletic", title: "Full Body Conditioning & Burn" },
    ];
  } else {
    // 6-7 days: PPL x 2 or high frequency
    splitFoci = [
      { focusId: "chest_tri", label: "Push (Chest Focus)", title: "Push Session 1" },
      { focusId: "back_bi", label: "Pull (Lat Focus)", title: "Pull Session 1" },
      { focusId: "legs_core", label: "Legs (Quad Focus)", title: "Legs & Core Session 1" },
      { focusId: "chest_tri", label: "Push (Shoulder/Tricep)", title: "Push Session 2" },
      { focusId: "back_bi", label: "Pull (Row Focus)", title: "Pull Session 2" },
      { focusId: "legs_core", label: "Legs & Posterior", title: "Legs & Core Session 2" },
      { focusId: "full", label: "Active Recovery & Mobility", title: "Mobility & Core Maintenance" },
    ];
  }

  const result: Record<number, ScheduledDay> = {};

  DAYS_OF_WEEK.forEach((d) => {
    const isWorkout = activeDays.includes(d.dayIndex);
    if (isWorkout) {
      const dayOrder = activeDays.indexOf(d.dayIndex);
      const assigned = splitFoci[dayOrder % splitFoci.length];
      result[d.dayIndex] = {
        dayIndex: d.dayIndex,
        dayName: d.name,
        bengaliName: d.bengaliName,
        isWorkoutDay: true,
        focusId: assigned.focusId,
        focusLabel: assigned.label,
        sessionTitle: assigned.title,
      };
    } else {
      result[d.dayIndex] = {
        dayIndex: d.dayIndex,
        dayName: d.name,
        bengaliName: d.bengaliName,
        isWorkoutDay: false,
        focusId: "full",
        focusLabel: "Rest & Active Recovery",
        sessionTitle: "Rest Day (Muscle Recovery)",
      };
    }
  });

  return result;
}

/**
 * Get current day's scheduled session status
 */
export function getTodaySchedule(chosenDays: number[] = [1, 3, 5]): ScheduledDay {
  const todayIndex = new Date().getDay(); // 0-6
  const split = getWeeklySplit(chosenDays);
  return split[todayIndex] || {
    dayIndex: todayIndex,
    dayName: DAYS_OF_WEEK[todayIndex]?.name || "Today",
    bengaliName: DAYS_OF_WEEK[todayIndex]?.bengaliName || "আজ",
    isWorkoutDay: false,
    focusId: "full",
    focusLabel: "Rest & Active Recovery",
    sessionTitle: "Rest Day",
  };
}
