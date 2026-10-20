import { z } from "zod";
import { EQUIPMENT_IDS, FOCUS_IDS, MUSCLES } from "./types";
import { LIMITS } from "./calc";

export const ProfileSchema = z.object({
  gender: z.enum(["male", "female", "other"]),
  age: z.number().int().min(LIMITS.age.min).max(LIMITS.age.max),
  heightCm: z.number().min(LIMITS.heightCm.min).max(LIMITS.heightCm.max),
  weightKg: z.number().min(LIMITS.weightKg.min).max(LIMITS.weightKg.max),
  activity: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  goal: z.enum(["muscle", "strength", "endurance"]),
  equipment: z.array(z.enum(EQUIPMENT_IDS)).max(EQUIPMENT_IDS.length),
  focus: z.enum(FOCUS_IDS),
  minutes: z.union([z.literal(20), z.literal(30), z.literal(45), z.literal(60)]),
  lowImpact: z.boolean(),
  limitations: z.string().max(300),
  workoutDays: z.array(z.number().int().min(0).max(6)).max(7).optional(),
  dietGoal: z.enum(["muscle", "strength", "endurance", "recomp"]).optional(),
});

export const FeedbackSchema = z.object({
  lastDifficulty: z.enum(["too_easy", "just_right", "too_hard"]).optional(),
  soreMuscles: z.array(z.enum(MUSCLES)).max(MUSCLES.length),
  recentExerciseIds: z.array(z.string().max(40)).max(40),
  notes: z.string().max(300).optional(),
});

export const GenerateRequestSchema = z.object({
  profile: ProfileSchema,
  feedback: FeedbackSchema.optional(),
  seed: z.number().int().min(0).max(2_000_000_000).optional(),
  offline: z.boolean().optional(),
});

/** What we require back from the model. Everything is re-validated against the library afterwards. */
export const LlmPlanSchema = z.object({
  title: z.string(),
  coachNote: z.string(),
  warmup: z.array(z.object({ moveId: z.string(), seconds: z.number() })),
  exercises: z.array(
    z.object({
      exerciseId: z.string(),
      sets: z.number(),
      reps: z.string(),
      restSeconds: z.number(),
      note: z.string().optional(),
    }),
  ),
});

export const GenerateDietRequestSchema = z.object({
  weightKg: z.number().min(30).max(300),
  heightCm: z.number().min(90).max(250),
  age: z.number().int().min(10).max(120),
  gender: z.enum(["male", "female", "other"]),
  activity: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  goal: z.enum(["muscle", "strength", "endurance", "recomp"]),
  bmi: z.number(),
  tdee: z.number(),
  targetCalories: z.number(),
  preferences: z.array(z.string()).optional(),
  allergiesOrRestrictions: z.string().max(300).optional(),
  budgetLevel: z.enum(["student", "standard", "premium"]).optional(),
  language: z.enum(["en", "bn"]).optional(),
});

export const LlmDietSchema = z.object({
  title: z.string(),
  bengaliTitle: z.string(),
  summary: z.string(),
  targetCalories: z.number(),
  proteinGrams: z.number(),
  carbsGrams: z.number(),
  fatGrams: z.number(),
  meals: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      bengaliTitle: z.string(),
      time: z.string(),
      items: z.array(
        z.object({
          name: z.string(),
          bengaliName: z.string(),
          portion: z.string(),
          calories: z.number(),
          proteinG: z.number(),
          carbsG: z.number(),
          fatG: z.number(),
          notes: z.string().optional(),
        }),
      ),
      tips: z.string().optional(),
    }),
  ),
  groceryList: z.array(z.string()).optional(),
  guidelines: z.array(z.string()),
});

