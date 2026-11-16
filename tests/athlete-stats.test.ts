import { describe, it, expect } from "vitest";
import {
  DEFAULT_ATHLETE_STATS,
  calculateUpdatedAthleteStats,
  type AthleteStats,
} from "../lib/athleteStats";
import type { Session, HistoryEntry, WorkoutPlan, PlanMeta } from "../lib/types";

describe("AthleteStats Engine", () => {
  const dummyMeta: PlanMeta = { bmi: 22, bmiCategory: "normal", bmr: 1600, tdee: 2200 };

  it("initializes with default zeroed athletic stats", () => {
    expect(DEFAULT_ATHLETE_STATS.totalWorkouts).toBe(0);
    expect(DEFAULT_ATHLETE_STATS.totalVolumeKg).toBe(0);
    expect(DEFAULT_ATHLETE_STATS.currentStreak).toBe(0);
    expect(DEFAULT_ATHLETE_STATS.fitnessLevel).toBe("beginner");
  });

  it("updates volume, sets, and personal records from a finished session", () => {
    const mockPlan: WorkoutPlan = {
      id: "p_1",
      createdAt: Date.now(),
      title: "Strength Protocol",
      focus: "full",
      source: "ai",
      warmup: [],
      exercises: [
        { uid: "ex_1", exerciseId: "bb_bench_press", sets: 3, reps: "8-10", restSeconds: 90 },
      ],
      coachNote: "Push hard",
    };

    const mockSession: Session = {
      plan: mockPlan,
      meta: dummyMeta,
      startedAt: Date.now() - 3600000,
      warmupDone: {},
      sets: {
        ex_1: [
          { done: true, reps: 10, weightKg: 80 },
          { done: true, reps: 8, weightKg: 85 },
          { done: true, reps: 8, weightKg: 95 },
        ],
      },
    };

    const updated = calculateUpdatedAthleteStats(DEFAULT_ATHLETE_STATS, mockSession, []);
    expect(updated.totalWorkouts).toBe(1);
    expect(updated.totalSets).toBe(3);
    // Volume: (10*80) + (8*85) + (8*95) = 800 + 680 + 760 = 2240
    expect(updated.totalVolumeKg).toBe(2240);
    expect(updated.currentStreak).toBe(1);

    const pr = updated.personalRecords["bb_bench_press"];
    expect(pr).toBeDefined();
    expect(pr.weightKg).toBe(95);
    expect(pr.reps).toBe(8);
    expect(pr.estimated1Rm).toBeGreaterThan(115);
  });

  it("advances fitness level as lifetime workouts and volume accumulate", () => {
    const highVolumeStats: AthleteStats = {
      ...DEFAULT_ATHLETE_STATS,
      totalVolumeKg: 60000,
      totalWorkouts: 45,
    };

    const mockPlan: WorkoutPlan = {
      id: "p_2",
      createdAt: Date.now(),
      title: "Chest Day",
      focus: "chest_tri",
      source: "ai",
      warmup: [],
      exercises: [],
      coachNote: "",
    };

    const mockSession: Session = {
      plan: mockPlan,
      meta: dummyMeta,
      startedAt: Date.now() - 1800000,
      warmupDone: {},
      sets: {},
    };

    const updated = calculateUpdatedAthleteStats(highVolumeStats, mockSession, new Array(45) as HistoryEntry[]);
    expect(updated.fitnessLevel).toBe("advanced");
  });
});
