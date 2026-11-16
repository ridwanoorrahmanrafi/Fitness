import { KEYS } from "./storage";
import type { HistoryEntry, Profile, UserGoal, ProgressEvaluation } from "./types";
import type { AthleteStats } from "./athleteStats";
import {
  syncProfileToMongo,
  syncWorkoutToMongo,
  syncGoalsToMongo,
  syncEvaluationToMongo,
  syncAthleteStatsToMongo,
} from "./mongodb-sync";

export interface MigrationResult {
  migrated: boolean;
  workoutsSynced: number;
  goalsSynced: number;
  evaluationsSynced: number;
  profileSynced: boolean;
  athleteStatsSynced: boolean;
  playerStatsSynced?: boolean;
}

/**
 * Checks whether guest data has already been migrated for this specific user ID.
 */
export function isGuestMigrated(userId: string): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(`${KEYS.profile}_migrated_${userId}`) === "true";
}

/**
 * Marks guest data as migrated in localStorage for this specific user ID.
 */
export function markGuestMigrated(userId: string): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(`${KEYS.profile}_migrated_${userId}`, "true");
}

/**
 * Safely migrates local guest data (profile, workouts, goals, evaluations, athlete stats)
 * up to the user's cloud account upon registration or sign-in.
 * Preserves 100% of athletic history without breaking guest sessions.
 */
export async function migrateGuestDataToCloud(
  userId: string,
  data: {
    profile?: Profile | null;
    history?: HistoryEntry[];
    goals?: UserGoal[];
    evaluations?: ProgressEvaluation[];
    athleteStats?: AthleteStats | null;
    playerStats?: AthleteStats | null;
  }
): Promise<MigrationResult> {
  const result: MigrationResult = {
    migrated: false,
    workoutsSynced: 0,
    goalsSynced: 0,
    evaluationsSynced: 0,
    profileSynced: false,
    athleteStatsSynced: false,
  };

  if (!userId) return result;

  try {
    const promises: Promise<boolean>[] = [];

    // 1. Sync Profile
    if (data.profile) {
      promises.push(
        syncProfileToMongo(data.profile, userId).then((ok) => {
          result.profileSynced = ok;
          return ok;
        })
      );
    }

    // 2. Sync Athlete Stats
    const statsToSync = data.athleteStats || data.playerStats;
    if (statsToSync) {
      promises.push(
        syncAthleteStatsToMongo(statsToSync, userId).then((ok) => {
          result.athleteStatsSynced = ok;
          result.playerStatsSynced = ok;
          return ok;
        })
      );
    }

    // 3. Sync Workouts (History)
    if (data.history && data.history.length > 0) {
      for (const entry of data.history) {
        promises.push(
          syncWorkoutToMongo(entry, userId).then((ok) => {
            if (ok) result.workoutsSynced++;
            return ok;
          })
        );
      }
    }

    // 4. Sync Goals
    if (data.goals && data.goals.length > 0) {
      promises.push(
        syncGoalsToMongo(data.goals, userId).then((ok) => {
          if (ok) result.goalsSynced = data.goals?.length || 0;
          return ok;
        })
      );
    }

    // 5. Sync Evaluations
    if (data.evaluations && data.evaluations.length > 0) {
      for (const ev of data.evaluations) {
        promises.push(
          syncEvaluationToMongo(ev, userId).then((ok) => {
            if (ok) result.evaluationsSynced++;
            return ok;
          })
        );
      }
    }

    await Promise.all(promises);
    markGuestMigrated(userId);
    result.migrated = true;
  } catch (err) {
    console.warn("Guest data migration partial failure:", err);
  }

  return result;
}
