// Sports Science & Athletic Performance Tracking Engine
// Tracks verified athletic progression: volume load, workout consistency, and personal records (PRs)

import type { Session, HistoryEntry } from "./types";
import { KEYS } from "./storage";
import { estimate1Rm } from "./calc";

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weightKg: number;
  reps: number;
  estimated1Rm: number;
  date: string;
}

export type FitnessLevel = "beginner" | "intermediate" | "advanced" | "elite";

export interface AthleteStats {
  totalWorkouts: number;
  totalVolumeKg: number;
  totalSets: number;
  currentStreak: number;
  bestStreak: number;
  lastWorkoutDate?: string;
  personalRecords: Record<string, PersonalRecord>;
  fitnessLevel: FitnessLevel;
}

export const DEFAULT_ATHLETE_STATS: AthleteStats = {
  totalWorkouts: 0,
  totalVolumeKg: 0,
  totalSets: 0,
  currentStreak: 0,
  bestStreak: 0,
  personalRecords: {},
  fitnessLevel: "beginner",
};

export function loadAthleteStats(): AthleteStats {
  if (typeof window === "undefined") return { ...DEFAULT_ATHLETE_STATS };
  try {
    const raw = localStorage.getItem(KEYS.playerStats); // uses playerStats key for clean backward compatibility
    if (!raw) return { ...DEFAULT_ATHLETE_STATS };
    const parsed = JSON.parse(raw);
    return {
      totalWorkouts: Number(parsed.totalWorkouts || parsed.totalWorkoutsCleared || 0),
      totalVolumeKg: Number(parsed.totalVolumeKg || 0),
      totalSets: Number(parsed.totalSets || parsed.totalSetsCompleted || 0),
      currentStreak: Number(parsed.currentStreak || 0),
      bestStreak: Number(parsed.bestStreak || 0),
      lastWorkoutDate: parsed.lastWorkoutDate,
      personalRecords: parsed.personalRecords || {},
      fitnessLevel: parsed.fitnessLevel || "beginner",
    };
  } catch {
    return { ...DEFAULT_ATHLETE_STATS };
  }
}

export function saveAthleteStats(stats: AthleteStats): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEYS.playerStats, JSON.stringify(stats));
  } catch {
    /* storage is best-effort */
  }
}

/**
 * Calculates updated athletic stats and personal records from a finished session
 */
export function calculateUpdatedAthleteStats(
  prev: AthleteStats,
  session: Session,
  history: HistoryEntry[]
): AthleteStats {
  const sessionDate = new Date().toISOString().split("T")[0];
  let sessionVolume = 0;
  let sessionSets = 0;
  const newPRs = { ...prev.personalRecords };

  for (const pe of session.plan.exercises) {
    const setLogs = session.sets[pe.uid] || [];
    for (const s of setLogs) {
      if (!s.done) continue;
      sessionSets++;
      const reps = Math.max(0, s.reps || 0);
      const weight = Math.max(0, s.weightKg || 0);
      sessionVolume += reps * weight;

      if (weight > 0 && reps > 0) {
        const est1Rm = estimate1Rm(weight, reps);
        const existing = newPRs[pe.exerciseId];
        if (!existing || est1Rm > existing.estimated1Rm) {
          newPRs[pe.exerciseId] = {
            exerciseId: pe.exerciseId,
            exerciseName: pe.exerciseId,
            weightKg: weight,
            reps,
            estimated1Rm: est1Rm,
            date: sessionDate,
          };
        }
      }
    }
  }

  // Calculate streaks
  let newStreak = prev.currentStreak;
  if (prev.lastWorkoutDate) {
    const lastDate = new Date(prev.lastWorkoutDate);
    const today = new Date(sessionDate);
    const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  const bestStreak = Math.max(prev.bestStreak, newStreak);
  const totalWorkouts = (history.length || 0) + 1;
  const totalVolumeKg = Math.round((prev.totalVolumeKg + sessionVolume) * 10) / 10;
  const totalSets = prev.totalSets + sessionSets;

  // Determine fitness level based on lifetime workouts & volume
  let fitnessLevel: FitnessLevel = "beginner";
  if (totalWorkouts >= 100 || totalVolumeKg >= 150000) {
    fitnessLevel = "elite";
  } else if (totalWorkouts >= 40 || totalVolumeKg >= 50000) {
    fitnessLevel = "advanced";
  } else if (totalWorkouts >= 10 || totalVolumeKg >= 10000) {
    fitnessLevel = "intermediate";
  }

  return {
    totalWorkouts,
    totalVolumeKg,
    totalSets,
    currentStreak: newStreak,
    bestStreak,
    lastWorkoutDate: sessionDate,
    personalRecords: newPRs,
    fitnessLevel,
  };
}
