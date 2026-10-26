import type { HistoryEntry, Profile, UserGoal, ProgressEvaluation } from "./types";
import type { PlayerStats } from "./systemStats";

/**
 * Client-side sync client for MongoDB cloud database.
 * Sends requests to the application's Next.js MongoDB API routes.
 */

export async function syncProfileToMongo(profile: Profile, userId: string): Promise<boolean> {
  try {
    const res = await fetch("/api/cloud/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, profile }),
    });
    const data = await res.json();
    return Boolean(data.ok);
  } catch (err) {
    console.warn("syncProfileToMongo error:", err);
    return false;
  }
}

export async function syncWorkoutToMongo(workout: HistoryEntry, userId: string): Promise<boolean> {
  try {
    const res = await fetch("/api/cloud/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, workout }),
    });
    const data = await res.json();
    return Boolean(data.ok);
  } catch (err) {
    console.warn("syncWorkoutToMongo error:", err);
    return false;
  }
}

export async function syncGoalsToMongo(goals: UserGoal[], userId: string): Promise<boolean> {
  if (!goals || goals.length === 0) return false;
  try {
    const res = await fetch("/api/cloud/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, goals }),
    });
    const data = await res.json();
    return Boolean(data.ok);
  } catch (err) {
    console.warn("syncGoalsToMongo error:", err);
    return false;
  }
}

export async function syncEvaluationToMongo(
  evaluation: ProgressEvaluation,
  userId: string
): Promise<boolean> {
  try {
    const res = await fetch("/api/cloud/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, evaluation }),
    });
    const data = await res.json();
    return Boolean(data.ok);
  } catch (err) {
    console.warn("syncEvaluationToMongo error:", err);
    return false;
  }
}

export async function syncPlayerStatsToMongo(
  playerStats: PlayerStats,
  userId: string
): Promise<boolean> {
  try {
    const res = await fetch("/api/cloud/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, playerStats }),
    });
    const data = await res.json();
    return Boolean(data.ok);
  } catch (err) {
    console.warn("syncPlayerStatsToMongo error:", err);
    return false;
  }
}

export async function pullUserCloudDataFromMongo(userId: string): Promise<{
  workouts: HistoryEntry[];
  goals: UserGoal[];
  evaluations: ProgressEvaluation[];
}> {
  try {
    const res = await fetch(`/api/cloud/pull?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();
    if (data.ok) {
      return {
        workouts: data.workouts || [],
        goals: data.goals || [],
        evaluations: data.evaluations || [],
      };
    }
    return { workouts: [], goals: [], evaluations: [] };
  } catch (err) {
    console.warn("pullUserCloudDataFromMongo error:", err);
    return { workouts: [], goals: [], evaluations: [] };
  }
}

export async function pullPlayerStatsFromMongo(userId: string): Promise<PlayerStats | null> {
  try {
    const res = await fetch(`/api/cloud/pull?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();
    return data.ok && data.playerStats ? (data.playerStats as PlayerStats) : null;
  } catch (err) {
    console.warn("pullPlayerStatsFromMongo error:", err);
    return null;
  }
}

export async function pullUserProfileFromMongo(
  userId: string
): Promise<{ profile: Profile; name: string } | null> {
  try {
    const res = await fetch(`/api/cloud/pull?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();
    if (data.ok && data.profile) {
      return { profile: data.profile as Profile, name: data.name || "Hunter" };
    }
    return null;
  } catch (err) {
    console.warn("pullUserProfileFromMongo error:", err);
    return null;
  }
}

export async function seedExercisesToMongo(): Promise<{ ok: boolean; count: number; error?: string }> {
  try {
    const res = await fetch("/api/cloud/seed", { method: "POST" });
    const data = await res.json();
    return data;
  } catch (err) {
    return { ok: false, count: 0, error: String(err) };
  }
}
