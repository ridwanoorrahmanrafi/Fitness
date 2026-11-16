import { describe, it, expect, vi, beforeEach } from "vitest";
import { isGuestMigrated, markGuestMigrated, migrateGuestDataToCloud } from "../lib/guest-migration";
import type { HistoryEntry, Profile, UserGoal, ProgressEvaluation } from "../lib/types";
import type { AthleteStats } from "../lib/athleteStats";

// Mock MongoDB sync functions
vi.mock("../lib/mongodb-sync", () => ({
  syncProfileToMongo: vi.fn().mockResolvedValue(true),
  syncWorkoutToMongo: vi.fn().mockResolvedValue(true),
  syncGoalsToMongo: vi.fn().mockResolvedValue(true),
  syncEvaluationToMongo: vi.fn().mockResolvedValue(true),
  syncAthleteStatsToMongo: vi.fn().mockResolvedValue(true),
  syncPlayerStatsToMongo: vi.fn().mockResolvedValue(true),
  pullUserCloudDataFromMongo: vi.fn().mockResolvedValue({ workouts: [], goals: [], evaluations: [] }),
}));

// In-memory localStorage mock for Node test environment
const memoryStore = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => memoryStore.get(key) ?? null,
  setItem: (key: string, val: string) => memoryStore.set(key, String(val)),
  removeItem: (key: string) => memoryStore.delete(key),
  clear: () => memoryStore.clear(),
};
Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("Guest Data Migration Engine", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("accurately tracks migration status per user ID", () => {
    const userId = "athlete_user_123";
    expect(isGuestMigrated(userId)).toBe(false);

    markGuestMigrated(userId);
    expect(isGuestMigrated(userId)).toBe(true);

    // Another user ID should still be false
    expect(isGuestMigrated("athlete_user_456")).toBe(false);
  });

  it("migrates all local guest telemetry, stats, and workouts to cloud", async () => {
    const userId = "athlete_user_cloud_99";

    const mockProfile: Profile = {
      gender: "male",
      age: 26,
      heightCm: 180,
      weightKg: 78,
      activity: "moderate",
      level: "intermediate",
      goal: "muscle",
      equipment: ["dumbbells"],
      minutes: 45,
      focus: "full",
      lowImpact: false,
      limitations: "",
    };

    const mockStats: AthleteStats = {
      totalWorkouts: 15,
      totalVolumeKg: 34000,
      totalSets: 120,
      currentStreak: 3,
      bestStreak: 7,
      lastWorkoutDate: "2026-11-04",
      personalRecords: {
        bb_bench_press: {
          exerciseId: "bb_bench_press",
          exerciseName: "Barbell Bench Press",
          weightKg: 85,
          reps: 5,
          estimated1Rm: 95.6,
          date: "2026-11-04",
        },
      },
      fitnessLevel: "intermediate",
    };

    const mockHistory: HistoryEntry[] = [
      {
        id: "hist_1",
        finishedAt: Date.now() - 86400000,
        title: "Upper Body Assault",
        focus: "chest_tri",
        source: "ai",
        minutes: 42,
        setsDone: 12,
        setsTotal: 12,
        volumeKg: 3400,
        kcalEstimate: 280,
        difficulty: "just_right",
        soreMuscles: [],
        exercises: [],
      },
    ];

    const mockGoals: UserGoal[] = [
      {
        id: "goal_1",
        userId: "guest",
        title: "Bench Press 100kg",
        category: "strength",
        targetValue: 100,
        currentValue: 85,
        unit: "kg",
        status: "active",
        createdAt: Date.now(),
      },
    ];

    const mockEvals: ProgressEvaluation[] = [
      {
        id: "eval_1",
        userId: "guest",
        evaluatedAt: Date.now(),
        overallScore: 88,
        strengthScore: 85,
        consistencyScore: 92,
        volume7dKg: 6800,
        volume30dKg: 24000,
        sessions7d: 4,
        activeStreakDays: 5,
        aiSummary: "Optimal progressive overload maintained.",
        recommendations: ["Increase shoulder mobility"],
      },
    ];

    const result = await migrateGuestDataToCloud(userId, {
      profile: mockProfile,
      playerStats: mockStats,
      history: mockHistory,
      goals: mockGoals,
      evaluations: mockEvals,
    });

    expect(result.migrated).toBe(true);
    expect(result.profileSynced).toBe(true);
    expect(result.playerStatsSynced).toBe(true);
    expect(result.workoutsSynced).toBe(1);
    expect(result.goalsSynced).toBe(1);
    expect(result.evaluationsSynced).toBe(1);

    expect(isGuestMigrated(userId)).toBe(true);
  });

  it("handles empty local datasets gracefully without crashing", async () => {
    const result = await migrateGuestDataToCloud("athlete_empty", {});
    expect(result.migrated).toBe(true);
    expect(result.workoutsSynced).toBe(0);
    expect(result.goalsSynced).toBe(0);
  });
});
