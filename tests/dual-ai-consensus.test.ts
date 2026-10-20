import { describe, expect, it } from "vitest";
import { crossCheckWorkout, crossCheckDiet } from "../lib/server/consensus";
import type { WorkoutPlan, Profile, GenerateDietRequest } from "../lib/types";
import type { BangladeshiDietPlan } from "../lib/diet";

const mockProfile: Profile = {
  gender: "male",
  age: 25,
  heightCm: 175,
  weightKg: 72,
  activity: "moderate",
  goal: "muscle",
  dietGoal: "muscle",
  level: "intermediate",
  minutes: 45,
  focus: "chest_tri",
  equipment: ["dumbbells", "bench"],
  limitations: "mild left shoulder impingement",
  lowImpact: false,
  workoutDays: [1, 3, 5],
};

const mockPlan: WorkoutPlan = {
  id: "plan_test_1",
  createdAt: Date.now(),
  title: "Upper Body Hypertrophy",
  focus: "chest_tri",
  source: "ai",
  model: "gemini-3.5-flash",
  warmup: [{ moveId: "arm_circles", seconds: 30 }],
  exercises: [
    { uid: "ex_1", exerciseId: "db_bench_press", sets: 3, reps: "8-12", restSeconds: 90 },
    { uid: "ex_2", exerciseId: "push_up", sets: 3, reps: "12-15", restSeconds: 60 },
  ],
  coachNote: "Keep shoulders retracted and depressed during dumbbell press.",
};

const mockDiet: BangladeshiDietPlan = {
  goalId: "muscle",
  title: "Bangladeshi Muscle Hypertrophy Plan",
  bengaliTitle: "মাসল বৃদ্ধি দেশীয় খাদ্য তালিকা",
  description: "High protein meal plan calibrated with local Bengali staples.",
  targetCalories: 2400,
  proteinGrams: 140,
  carbsGrams: 280,
  fatGrams: 65,
  waterLiters: 3,
  meals: [
    {
      id: "breakfast",
      title: "Breakfast",
      bengaliTitle: "সকালের নাস্তা",
      time: "8:00 AM",
      items: [
        { name: "Egg", bengaliName: "সিদ্ধ ডিম ২টি", portion: "2 eggs", calories: 150, proteinG: 13, carbsG: 1, fatG: 10 },
        { name: "Ruti", bengaliName: "আটার রুটি ২টি", portion: "2 pieces", calories: 220, proteinG: 7, carbsG: 44, fatG: 1.6 },
      ],
    },
  ],
  guidelines: ["Drink 3L water", "Eat protein every 3-4 hours"],
};

const mockDietReq: GenerateDietRequest = {
  weightKg: 72,
  heightCm: 175,
  age: 25,
  gender: "male",
  activity: "moderate",
  goal: "muscle",
  bmi: 23.5,
  tdee: 2200,
  targetCalories: 2400,
};

describe("Dual-AI Consensus & Cross-Verification Engine", () => {
  it("generates autonomous validation when secondary reviewer is not provided", async () => {
    const consensus = await crossCheckWorkout(mockPlan, mockProfile, undefined, {
      primaryName: "Google Gemini",
      reviewerName: "ChatGPT (OpenAI)",
      reviewerModel: "gpt-4o",
      reviewerCaller: undefined,
    });

    expect(consensus.primaryModel).toBe("gemini-3.5-flash");
    expect(consensus.status).toBe("single_model");
    expect(consensus.safetyScore).toBeGreaterThanOrEqual(80);
    expect(consensus.summary).toBeTruthy();
  });

  it("performs cross-verification audit using secondary AI reviewer", async () => {
    // Mock reviewer caller simulating ChatGPT
    const mockReviewerCaller = async () =>
      JSON.stringify({
        status: "verified",
        safetyScore: 98,
        summary: "Verified: DB bench press safely preserves shoulder joint subacromial space.",
        notes: [
          "Compound pressing placed first while CNS is fresh",
          "Shoulder impingement risk mitigated by dumbbell neutral grip cue",
        ],
      });

    const consensus = await crossCheckWorkout(mockPlan, mockProfile, undefined, {
      primaryName: "Google Gemini 3.5 Flash",
      reviewerName: "ChatGPT GPT-4o",
      reviewerModel: "gpt-4o",
      reviewerCaller: mockReviewerCaller,
    });

    expect(consensus.verifiedBy).toContain("Dual-AI Consensus");
    expect(consensus.status).toBe("verified");
    expect(consensus.safetyScore).toBe(98);
    expect(consensus.notes?.length).toBe(2);
    expect(consensus.notes?.[0]).toContain("Compound pressing");
  });

  it("handles secondary AI reviewer failures gracefully without crashing", async () => {
    const failingCaller = async () => {
      throw new Error("429 rate limit exceeded");
    };

    const consensus = await crossCheckWorkout(mockPlan, mockProfile, undefined, {
      primaryName: "Google Gemini 3.5 Flash",
      reviewerName: "ChatGPT GPT-4o",
      reviewerModel: "gpt-4o",
      reviewerCaller: failingCaller,
    });

    expect(consensus.status).toBe("single_model");
    expect(consensus.summary).toBeTruthy();
    expect(consensus.notes?.length).toBeGreaterThan(0);
  });

  it("cross-verifies nutritional Bangladeshi diet plan", async () => {
    const mockDietReviewer = async () =>
      JSON.stringify({
        status: "verified",
        safetyScore: 97,
        summary: "Nutritional audit confirmed 140g protein with authentic Bengali staples.",
        notes: [
          "High biological value protein sources",
          "Glycemic load balanced across 5 meals",
        ],
      });

    const consensus = await crossCheckDiet(mockDiet, mockDietReq, {
      primaryName: "Google Gemini 3.5 Flash",
      reviewerName: "ChatGPT GPT-4o",
      reviewerModel: "gpt-4o",
      reviewerCaller: mockDietReviewer,
    });

    expect(consensus.verifiedBy).toContain("Dual-AI Consensus");
    expect(consensus.status).toBe("verified");
    expect(consensus.safetyScore).toBe(97);
    expect(consensus.summary).toContain("140g protein");
  });
});
