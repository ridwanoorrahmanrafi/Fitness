import { describe, expect, it, beforeEach } from "vitest";
import { evaluateUserProgress } from "../lib/evaluation";
import { generateInitialGoals, evaluateAndUpdateGoals } from "../lib/goals";
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  isSupabaseConfigured,
  signInWithEmail,
  signUpWithEmail,
  signInWithMagicLink,
  signOutSupabase,
  getSupabaseAuthSession,
  getSupabaseClient,
} from "../lib/supabase";
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
        { done: true, reps: 12, weightKg: 0 },
        { done: true, reps: 10, weightKg: 0 },
      ],
    },
    {
      exerciseId: "db_bench_press",
      sets: [
        { done: true, reps: 10, weightKg: 20 },
        { done: true, reps: 10, weightKg: 20 },
        { done: true, reps: 8, weightKg: 22 },
      ],
    },
  ],
});

describe("Continuous Evaluation Engine", () => {
  it("evaluates empty history safely with friendly baseline scores", () => {
    const evalResult = evaluateUserProgress([], mockProfile, "test_user");
    expect(evalResult.userId).toBe("test_user");
    expect(evalResult.sessions7d).toBe(0);
    expect(evalResult.volume7dKg).toBe(0);
    expect(evalResult.volume30dKg).toBe(0);
    expect(evalResult.overallScore).toBeGreaterThanOrEqual(0);
    expect(evalResult.aiSummary).toBeTruthy();
    expect(evalResult.recommendations.length).toBeGreaterThan(0);
  });

  it("calculates accurate volume, consistency, and active streaks from workout history", () => {
    const history: HistoryEntry[] = [
      createMockSession("s1", 1, 3000),
      createMockSession("s2", 3, 2800),
      createMockSession("s3", 5, 2600),
    ];

    const evalResult = evaluateUserProgress(history, mockProfile, "test_user");
    expect(evalResult.sessions7d).toBe(3);
    expect(evalResult.volume7dKg).toBe(8400);
    expect(evalResult.volume30dKg).toBe(8400);
    expect(evalResult.consistencyScore).toBe(100); // 3 of 3 planned days
    expect(evalResult.activeStreakDays).toBeGreaterThan(0);
    expect(evalResult.overallScore).toBeGreaterThanOrEqual(70);
  });
});

describe("Adaptive Goals Engine", () => {
  it("generates initial tailored goals for user", () => {
    const goals = generateInitialGoals(mockProfile, "test_user");
    expect(goals.length).toBeGreaterThanOrEqual(3);
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

describe("Supabase Configuration & Client Management", () => {
  beforeEach(() => {
    saveSupabaseConfig(null);
  });

  it("handles empty / unconfigured state gracefully", () => {
    expect(isSupabaseConfigured()).toBe(false);
    expect(getSupabaseConfig()).toBeNull();
  });

  it("stores and retrieves valid Supabase configuration credentials", () => {
    const mockConfig = {
      url: "https://xyzexample.supabase.co",
      anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummykey",
    };
    saveSupabaseConfig(mockConfig);
    expect(isSupabaseConfigured()).toBe(true);
    const retrieved = getSupabaseConfig();
    expect(retrieved?.url).toBe(mockConfig.url);
    expect(retrieved?.anonKey).toBe(mockConfig.anonKey);
  });
});

describe("Supabase Authentication Engine", () => {
  beforeEach(() => {
    saveSupabaseConfig(null);
  });

  it("fails early when unconfigured for auth actions", async () => {
    await expect(signInWithEmail("test@example.com", "pass123")).rejects.toThrow("Supabase is not configured");
    await expect(signUpWithEmail("test@example.com", "pass123", "Hunter")).rejects.toThrow("Supabase is not configured");
    await expect(signInWithMagicLink("test@example.com")).rejects.toThrow("Supabase is not configured");
  });

  it("initializes auth methods when configured and handles guest sessions", async () => {
    saveSupabaseConfig({
      url: "https://vdaenqmujfpduvjmuxzm.supabase.co",
      anonKey: "sb_publishable_lVG_0H9Y_5rDkCCUFsqsyA_higcGnwm",
    });

    expect(isSupabaseConfigured()).toBe(true);
    const client = getSupabaseClient();
    expect(client).toBeTruthy();
    expect(client?.auth).toBeTruthy();

    const session = await getSupabaseAuthSession();
    expect(session).toBeNull();
  });
});

