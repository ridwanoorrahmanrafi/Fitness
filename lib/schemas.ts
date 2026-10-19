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
