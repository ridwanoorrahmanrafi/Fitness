// Shared types for the whole app (client + server).

export const EQUIPMENT = [
  { id: "dumbbells", label: "Dumbbells" },
  { id: "bands", label: "Resistance bands" },
  { id: "pullup_bar", label: "Pull-up bar" },
  { id: "chair", label: "Sturdy chair / ledge" },
  { id: "table", label: "Sturdy table (inverted rows)" },
  { id: "bench", label: "Flat / adjustable bench" },
  { id: "barbell", label: "Barbell + plates" },
  { id: "machines", label: "Gym machines & cables" },
] as const;

export type Equipment = (typeof EQUIPMENT)[number]["id"];
export const EQUIPMENT_IDS = EQUIPMENT.map((e) => e.id) as [Equipment, ...Equipment[]];

export const EQUIPMENT_PRESETS: { id: string; label: string; equipment: Equipment[] }[] = [
  { id: "bodyweight", label: "Bodyweight only", equipment: [] },
  { id: "home", label: "Minimal home", equipment: ["dumbbells", "bands", "pullup_bar", "chair"] },
  {
    id: "gym",
    label: "Full gym",
    equipment: ["dumbbells", "bands", "pullup_bar", "chair", "table", "bench", "barbell", "machines"],
  },
];

export const MUSCLES = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "core",
] as const;
export type Muscle = (typeof MUSCLES)[number];

export type Pattern =
  | "squat"
  | "lunge"
  | "hinge"
  | "push_h"
  | "push_v"
  | "pull_h"
  | "pull_v"
  | "core"
  | "isolation";

export type Level = "beginner" | "intermediate" | "advanced";
export type Goal = "muscle" | "strength" | "endurance";
export type Gender = "male" | "female" | "other";
export type Activity = "sedentary" | "light" | "moderate" | "active" | "very_active";

export const FOCUSES = [
  { id: "full", label: "Full body" },
  { id: "chest_tri", label: "Chest & triceps" },
  { id: "back_bi", label: "Back & biceps" },
  { id: "legs_core", label: "Legs & core" },
  { id: "shoulders_arms", label: "Shoulders & arms" },
] as const;
export type FocusId = (typeof FOCUSES)[number]["id"];
export const FOCUS_IDS = FOCUSES.map((f) => f.id) as [FocusId, ...FocusId[]];

export interface Exercise {
  id: string;
  name: string;
  /** Primary muscle first. */
  muscles: Muscle[];
  pattern: Pattern;
  /** Every item must be available. Empty = bodyweight only. */
  requires: Equipment[];
  /** Minimum level this suits: 1 beginner, 2 intermediate, 3 advanced. */
  level: 1 | 2 | 3;
  /** False for jumping / ballistic work. */
  lowImpact: boolean;
  /** Prescribed as a time hold instead of reps. */
  timed?: boolean;
  /** Reps are per side. */
  perSide?: boolean;
  /** Counts as "loaded": weight can be added and tracked. */
  loaded?: boolean;
  cues: string;
  easier?: string;
  harder?: string;
}

export interface WarmupMove {
  id: string;
  name: string;
  seconds: number;
  notes: string;
  /** Regions it prepares. */
  regions: ("upper" | "lower" | "core" | "full")[];
}

export interface Profile {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: Activity;
  level: Level;
  goal: Goal;
  equipment: Equipment[];
  focus: FocusId;
  minutes: 20 | 30 | 45 | 60;
  lowImpact: boolean;
  /** Free text, optional. Sent to the model as data, never as instructions. */
  limitations: string;
}

export const DEFAULT_PROFILE: Profile = {
  gender: "male",
  age: 25,
  heightCm: 175,
  weightKg: 70,
  activity: "light",
  level: "intermediate",
  goal: "muscle",
  equipment: [],
  focus: "full",
  minutes: 30,
  lowImpact: false,
  limitations: "",
};

export interface PlanExercise {
  /** Stable key inside this plan. */
  uid: string;
  /** Library exercise id. */
  exerciseId: string;
  sets: number;
  /** "8-12", "12", "30-45s" */
  reps: string;
  restSeconds: number;
  note?: string;
}

export interface PlanWarmup {
  moveId: string;
  seconds: number;
}

export interface WorkoutPlan {
  id: string;
  createdAt: number;
  title: string;
  focus: FocusId;
  source: "ai" | "offline";
  model?: string;
  warmup: PlanWarmup[];
  exercises: PlanExercise[];
  coachNote: string;
}

export interface PlanMeta {
  bmi: number;
  bmiCategory: string;
  bmr: number;
  tdee: number;
}

export type Difficulty = "too_easy" | "just_right" | "too_hard";

/** Everything the coach needs from past sessions to adapt the next one. */
export interface Feedback {
  lastDifficulty?: Difficulty;
  soreMuscles: Muscle[];
  recentExerciseIds: string[];
  notes?: string;
}

export interface SetLog {
  done: boolean;
  reps?: number;
  weightKg?: number;
}

export interface Session {
  plan: WorkoutPlan;
  meta: PlanMeta;
  startedAt?: number;
  warmupDone: Record<string, boolean>;
  /** keyed by PlanExercise.uid */
  sets: Record<string, SetLog[]>;
}

export interface HistoryEntry {
  id: string;
  finishedAt: number;
  title: string;
  focus: FocusId;
  source: "ai" | "offline";
  minutes: number;
  setsDone: number;
  setsTotal: number;
  volumeKg: number;
  kcalEstimate: number;
  difficulty: Difficulty;
  soreMuscles: Muscle[];
  notes?: string;
  exercises: { exerciseId: string; sets: SetLog[] }[];
}

export interface GenerateRequest {
  profile: Profile;
  feedback?: Feedback;
  /** Different seed -> different (but valid) offline plan. */
  seed?: number;
  /** Skip the model and build locally. */
  offline?: boolean;
}

export type GenerateResponse =
  | {
      ok: true;
      plan: WorkoutPlan;
      meta: PlanMeta;
      /** Present when the plan is not what the person asked for (e.g. model unavailable). */
      warning?: string;
    }
  | { ok: false; error: string; code: "bad_request" | "unauthorized" | "rate_limited" | "server" };
