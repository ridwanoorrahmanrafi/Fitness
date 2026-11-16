import { describe, expect, it } from "vitest";
import { evaluateUserProgress } from "../lib/evaluation";
import { generateInitialGoals, evaluateAndUpdateGoals } from "../lib/goals";
import { isCloudConfigured } from "../lib/mongodb-sync";
import type { HistoryEntry, Profile, UserGoal } from "../lib/types";

const mockProfile: Profile = {
  gender: "male",
  age: 26,
  heightCm: 175,
  weightKg: 72,
  activity: "moderate",
  goal: "muscle",
  dietGoal: "muscle",
  level: "intermediate",
  minutes: 45,
  focus: "chest_tri",
  equipment: ["dumbbells", "bench"],
  limitations: "",
  lowImpact: false,
  workoutDays: [1, 3, 5],
};

const createMockSession = (id: string, daysAgo: number, volumeKg: number = 2400): HistoryEntry => ({
  id,
  finishedAt: Date.now() - daysAgo * 24 * 60 * 60 * 1000,
  title: "Chest & Triceps Hypertrophy",
  focus: "chest_tri",
  source: "ai",
  minutes: 42,
  setsDone: 15,
  setsTotal: 15,
  volumeKg,
  kcalEstimate: 310,
  difficulty: "just_right",
  soreMuscles: [],
  exercises: [
    {
      exerciseId: "push_up",
      sets: [
        { done: true, reps: 15, weightKg: 0 },
        { done: true, reps: 15, weightKg: 0 },
        { done: true, reps: 12, weightKg: 0 },
      ],
    },
  ],
});

describe("Automated Biomechanical Evaluation Engine", () => {
  it("generates beginner encouragement when history is sparse", () => {
    const history: HistoryEntry[] = [];
    const evaluation = evaluateUserProgress(history, mockProfile, "test_user");

    expect(evaluation.overallScore).toBe(35);
    expect(evaluation.activeStreakDays).toBe(0);
    expect(evaluation.sessions7d).toBe(0);
    expect(evaluation.volume7dKg).toBe(0);
    expect(evaluation.aiSummary.toLowerCase()).toContain("baseline");
    expect(evaluation.recommendations.length).toBeGreaterThan(0);
  });

  it("calculates realistic strength & consistency scores from active training history", () => {
    const history: HistoryEntry[] = [
      createMockSession("s1", 1, 3200),
      createMockSession("s2", 3, 3500),
      createMockSession("s3", 5, 2900),
    ];

    const evaluation = evaluateUserProgress(history, mockProfile, "test_user");

    expect(evaluation.sessions7d).toBe(3);
    expect(evaluation.volume7dKg).toBe(9600);
    expect(evaluation.consistencyScore).toBeGreaterThanOrEqual(80);
    expect(evaluation.overallScore).toBeGreaterThan(50);
    expect(evaluation.activeStreakDays).toBeGreaterThan(0);
    expect(evaluation.recommendations.length).toBeGreaterThan(0);
  });
});

describe("Dynamic Adaptive Goal Tracker", () => {
  it("initializes tailored baseline goals matching user frequency", () => {
    const goals = generateInitialGoals(mockProfile, "test_user");

    expect(goals.length).toBeGreaterThanOrEqual(3);
    const weeklyGoal = goals.find((g) => g.category === "consistency" && g.unit === "sessions");
    expect(weeklyGoal).toBeDefined();
    expect(weeklyGoal?.targetValue).toBe(3); // 3 workoutDays configured

    expect(goals.some((g) => g.category === "consistency")).toBe(true);
    expect(goals.some((g) => g.category === "volume")).toBe(true);
  });

  it("advances goal progress and completes achieved milestones", () => {
    const initialGoals = generateInitialGoals(mockProfile, "test_user");
    const history: HistoryEntry[] = [
      createMockSession("s1", 1, 4000),
      createMockSession("s2", 2, 4000),
      createMockSession("s3", 4, 3000),
    ];

    const { updatedGoals, newlyCompleted } = evaluateAndUpdateGoals(
      initialGoals,
      history,
      mockProfile,
      "test_user"
    );

    // Consistency goal (target 3 workouts) should now be completed
    const sessionGoal = updatedGoals.find((g) => g.category === "consistency" && g.unit === "sessions");
    expect(sessionGoal?.status).toBe("completed");
    expect(sessionGoal?.completedAt).toBeTruthy();

    // Volume goal (target 1500 kg) should be completed with 11000 kg logged
    const volumeGoal = updatedGoals.find((g) => g.category === "volume" && g.targetValue === 1500);
    expect(volumeGoal?.status).toBe("completed");
    expect(volumeGoal?.completedAt).toBeTruthy();

    expect(newlyCompleted.length).toBeGreaterThan(0);
  });
});

describe("Cloud Sync Configuration & Engine", () => {
  it("verifies cloud sync is active and configured", () => {
    expect(isCloudConfigured()).toBe(true);
  });
});
