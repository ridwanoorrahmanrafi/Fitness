import { describe, expect, it } from "vitest";
import { generateBangladeshiDiet, BANGLADESHI_FOODS } from "../lib/diet";
import { getWeeklySplit, getTodaySchedule, DAYS_OF_WEEK } from "../lib/schedule";

describe("Bangladeshi Diet Engine", () => {
  it("calculates fat loss plan with proper calorie deficit and high protein", () => {
    const plan = generateBangladeshiDiet(70, 2200, "endurance", 26);
    expect(plan.targetCalories).toBeLessThan(2200);
    expect(plan.meals.length).toBe(5);
    expect(plan.proteinGrams).toBeGreaterThan(100);
    expect(plan.bengaliTitle).toContain("ওজন কমানো");
  });

  it("calculates muscle building plan with caloric surplus", () => {
    const plan = generateBangladeshiDiet(65, 2000, "muscle", 21);
    expect(plan.targetCalories).toBeGreaterThan(2000);
    expect(plan.meals.length).toBe(5);
    expect(plan.proteinGrams).toBeGreaterThan(120);
    expect(plan.bengaliTitle).toContain("মাসল");
  });

  it("calculates aesthetic recomp plan with maintenance calories", () => {
    const plan = generateBangladeshiDiet(68, 2100, "recomp", 22.5);
    expect(plan.meals.length).toBe(5);
    expect(plan.bengaliTitle).toContain("এস্থেটিক");
    expect(plan.waterLiters).toBeGreaterThanOrEqual(2.5);
  });

  it("food database has valid Bengali names and positive macros", () => {
    for (const [key, food] of Object.entries(BANGLADESHI_FOODS)) {
      expect(food.name).toBeTruthy();
      expect(food.bengaliName).toBeTruthy();
      expect(food.calories).toBeGreaterThan(0);
      expect(food.proteinG).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("Weekly Schedule Engine", () => {
  it("generates a balanced 3-day PPL split", () => {
    const split = getWeeklySplit([1, 3, 5]); // Mon, Wed, Fri
    expect(split[1].isWorkoutDay).toBe(true);
    expect(split[1].focusId).toBe("chest_tri");
    expect(split[3].isWorkoutDay).toBe(true);
    expect(split[3].focusId).toBe("back_bi");
    expect(split[5].isWorkoutDay).toBe(true);
    expect(split[5].focusId).toBe("legs_core");
    expect(split[0].isWorkoutDay).toBe(false); // Sunday rest
    expect(split[2].isWorkoutDay).toBe(false); // Tuesday rest
  });

  it("generates full body split for 2-day workout frequency", () => {
    const split = getWeeklySplit([2, 5]); // Tue, Fri
    expect(split[2].focusId).toBe("full");
    expect(split[5].focusId).toBe("full");
  });

  it("returns today schedule", () => {
    const today = getTodaySchedule([1, 3, 5]);
    expect(today.dayIndex).toBe(new Date().getDay());
    expect(DAYS_OF_WEEK.length).toBe(7);
  });
});

describe("Gemini Diet Plan Serverless Engine", () => {
  it("generates deterministic local diet with source tag when no API key provided", async () => {
    const { generateDietPlan } = await import("../lib/server/diet-generate");
    const result = await generateDietPlan({
      weightKg: 72,
      heightCm: 175,
      age: 25,
      gender: "male",
      activity: "moderate",
      goal: "muscle",
      bmi: 23.5,
      tdee: 2400,
      targetCalories: 2700,
      language: "bn",
    });

    expect(result.diet).toBeDefined();
    expect(result.diet.source).toBe("local");
    expect(result.diet.meals.length).toBe(5);
    expect(result.diet.proteinGrams).toBeGreaterThan(120);
    expect(result.diet.groceryList?.length).toBeGreaterThan(0);
  });

  it("validates GenerateDietRequestSchema properly", async () => {
    const { GenerateDietRequestSchema } = await import("../lib/schemas");
    const valid = GenerateDietRequestSchema.safeParse({
      weightKg: 70,
      heightCm: 175,
      age: 24,
      gender: "male",
      activity: "moderate",
      goal: "recomp",
      bmi: 22.8,
      tdee: 2200,
      targetCalories: 2200,
      preferences: ["high_protein", "student"],
      budgetLevel: "standard",
      language: "en",
    });
    expect(valid.success).toBe(true);

    const invalid = GenerateDietRequestSchema.safeParse({
      weightKg: 10, // below minimum 30kg
      heightCm: 175,
    });
    expect(invalid.success).toBe(false);
  });
});

