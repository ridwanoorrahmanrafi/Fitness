import { EXERCISES, EXERCISE_MAP, LEVEL_NUM, WARMUPS, WARMUP_MAP, hasEquipment } from "./exercises";
import type {
  Difficulty,
  Exercise,
  Feedback,
  FocusId,
  Muscle,
  PlanExercise,
  PlanWarmup,
  Profile,
  WorkoutPlan,
} from "./types";
import { FOCUSES } from "./types";

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

/** Deterministic PRNG so the same seed yields the same offline plan. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function newId(): string {
  // crypto.randomUUID exists in Node 19+ and every modern browser; fall back for old test runners.
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  return c?.randomUUID ? c.randomUUID() : `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function focusLabel(id: FocusId): string {
  return FOCUSES.find((f) => f.id === id)?.label ?? id;
}

const FOCUS_MUSCLES: Record<FocusId, Muscle[] | "all"> = {
  full: "all",
  chest_tri: ["chest", "triceps"],
  back_bi: ["back", "biceps"],
  legs_core: ["quads", "hamstrings", "glutes", "calves", "core"],
  shoulders_arms: ["shoulders", "biceps", "triceps"],
};

function inFocus(e: Exercise, focus: FocusId): boolean {
  const set = FOCUS_MUSCLES[focus];
  if (set === "all") return true;
  return e.muscles.slice(0, 2).some((m) => set.includes(m));
}

// ---------------------------------------------------------------------------
// Which exercises are allowed for this person (hard filters, in code)
// ---------------------------------------------------------------------------

export interface AllowedResult {
  exercises: Exercise[];
  /** Human-readable notes about things the person should know (thin equipment, soreness overrides). */
  warnings: string[];
}

export function allowedExercises(
  profile: Pick<Profile, "equipment" | "level" | "lowImpact" | "focus">,
  soreMuscles: Muscle[] = [],
): AllowedResult {
  const warnings: string[] = [];
  const cap = LEVEL_NUM[profile.level];

  const base = EXERCISES.filter((e) => hasEquipment(e, profile.equipment) && (!profile.lowImpact || e.lowImpact));

  // Level cap: allow one level above only when a focus would otherwise be too thin.
  let atLevel = base.filter((e) => e.level <= cap && inFocus(e, profile.focus));
  if (atLevel.length < 8) {
    const stretch = base.filter((e) => e.level <= cap + 1 && inFocus(e, profile.focus));
    if (stretch.length > atLevel.length) atLevel = stretch;
  }

  // Soreness: drop exercises whose main muscle is sore, but never leave the focus too thin.
  const sore = new Set(soreMuscles);
  let result = atLevel;
  if (sore.size) {
    const rested = atLevel.filter((e) => !sore.has(e.muscles[0]));
    if (rested.length >= 6) {
      result = rested;
    } else {
      warnings.push(
        "You reported sore muscles, but this focus needs them. I kept them in; consider a lighter day or another focus.",
      );
    }
  }

  if (result.length < 4) {
    warnings.push("Very little matches your equipment for this focus. Add equipment or pick another focus for a fuller session.");
  }
  return { exercises: result, warnings };
}

/** Alternatives for a swap: same main muscle + pattern group, allowed for this person, excluding what's already in the plan. */
export function alternativesFor(
  exerciseId: string,
  profile: Pick<Profile, "equipment" | "level" | "lowImpact" | "focus">,
  excludeIds: string[],
): Exercise[] {
  const current = EXERCISE_MAP[exerciseId];
  if (!current) return [];
  const cap = LEVEL_NUM[profile.level] + 1;
  return EXERCISES.filter(
    (e) =>
      e.id !== exerciseId &&
      !excludeIds.includes(e.id) &&
      hasEquipment(e, profile.equipment) &&
      (!profile.lowImpact || e.lowImpact) &&
      e.level <= cap &&
      e.muscles[0] === current.muscles[0] &&
      (e.pattern === current.pattern || e.pattern === "isolation" || current.pattern === "isolation"),
  ).sort((a, b) => Math.abs(a.level - current.level) - Math.abs(b.level - current.level));
}

// ---------------------------------------------------------------------------
// Prescription (sets / reps / rest) shared by the offline builder and the AI sanitizer
// ---------------------------------------------------------------------------

export interface Prescription {
  sets: number;
  reps: string;
  restSeconds: number;
}

const isCompound = (e: Exercise) => e.pattern !== "isolation" && e.pattern !== "core";

export function prescribe(
  e: Exercise,
  profile: Pick<Profile, "goal" | "level">,
  lastDifficulty?: Difficulty,
  position = 0,
): Prescription {
  const compound = isCompound(e);
  let sets: number;
  let reps: string;
  let rest: number;

  if (e.timed) {
    const holds = { beginner: "20-30s", intermediate: "30-45s", advanced: "45-60s" } as const;
    reps = profile.goal === "endurance" ? "45-60s" : holds[profile.level];
    sets = 3;
    rest = 45;
  } else if (profile.goal === "strength") {
    if (compound) {
      sets = 4;
      reps = e.loaded ? "4-6" : "6-10";
      rest = 120;
    } else {
      sets = 3;
      reps = "8-12";
      rest = 75;
    }
  } else if (profile.goal === "endurance") {
    sets = 3;
    reps = "15-20";
    rest = 40;
  } else {
    sets = 3;
    reps = compound ? "8-12" : "12-15";
    rest = compound ? 75 : 60;
  }

  if (profile.level === "beginner") sets = Math.max(2, sets - 1);
  if (profile.level === "advanced" && position < 2 && !e.timed) sets = Math.min(5, sets + 1);

  if (lastDifficulty === "too_hard") {
    sets = Math.max(2, sets - 1);
    rest += 15;
  } else if (lastDifficulty === "too_easy") {
    sets = Math.min(5, sets + 1);
  }

  if (e.perSide) reps = `${reps} / side`;
  return { sets, reps, restSeconds: rest };
}

/** Seconds of work for a prescription, used only for time estimates. */
function workSeconds(reps: string): number {
  const nums = reps.match(/\d+/g)?.map(Number) ?? [10];
  const mid = nums.length >= 2 ? (nums[0] + nums[1]) / 2 : nums[0];
  if (/s\b/.test(reps)) return mid; // timed hold
  const perSide = /side/.test(reps) ? 2 : 1;
  return mid * 3.5 * perSide; // ~3.5 s per rep incl. tempo
}

export function estimateMinutes(plan: Pick<WorkoutPlan, "warmup" | "exercises">): number {
  const warm = plan.warmup.reduce((s, w) => s + w.seconds, 0);
  const main = plan.exercises.reduce((s, e) => {
    const perSet = workSeconds(e.reps) + e.restSeconds;
    return s + e.sets * perSet;
  }, 0);
  return Math.max(5, Math.round((warm + main) / 60));
}

const SLOT_COUNT: Record<Profile["minutes"], number> = { 20: 4, 30: 5, 45: 6, 60: 8 };

// ---------------------------------------------------------------------------
// Warm-up selection (deterministic)
// ---------------------------------------------------------------------------

export function pickWarmup(focus: FocusId, rng: () => number): PlanWarmup[] {
  const regionsByFocus: Record<FocusId, ("upper" | "lower" | "core" | "full")[]> = {
    full: ["full", "upper", "lower"],
    chest_tri: ["upper", "upper", "core"],
    back_bi: ["upper", "core", "upper"],
    legs_core: ["lower", "lower", "core"],
    shoulders_arms: ["upper", "upper", "core"],
  };
  const chosen: string[] = [];
  for (const region of regionsByFocus[focus]) {
    const pool = WARMUPS.filter((w) => w.regions.includes(region) && !chosen.includes(w.id));
    if (!pool.length) continue;
    chosen.push(pool[Math.floor(rng() * pool.length)].id);
  }
  return chosen.map((id) => ({ moveId: id, seconds: WARMUP_MAP[id].seconds }));
}

// ---------------------------------------------------------------------------
// Offline (deterministic) plan builder
// ---------------------------------------------------------------------------

type Slot = (e: Exercise) => boolean;
const pat = (...p: Exercise["pattern"][]): Slot => (e) => p.includes(e.pattern);
const prim = (m: Muscle, ...p: Exercise["pattern"][]): Slot => (e) =>
  e.muscles[0] === m && (p.length === 0 || p.includes(e.pattern));
const anyMuscle = (m: Muscle, ...p: Exercise["pattern"][]): Slot => (e) =>
  e.muscles.slice(0, 2).includes(m) && (p.length === 0 || p.includes(e.pattern));

/** Ordered by priority so truncating for short sessions keeps the most valuable slots (core is early). */
const TEMPLATES: Record<FocusId, Slot[]> = {
  full: [
    pat("squat", "lunge"),
    pat("push_h"),
    pat("pull_h", "pull_v"),
    pat("hinge"),
    pat("core"),
    pat("push_v"),
    pat("pull_v", "pull_h"),
    pat("lunge", "squat"),
  ],
  chest_tri: [
    pat("push_h"),
    pat("push_v"),
    pat("push_h"),
    anyMuscle("triceps"),
    prim("chest", "isolation"),
    anyMuscle("triceps"),
    pat("core"),
    pat("push_h"),
  ],
  back_bi: [
    pat("pull_v"),
    pat("pull_h"),
    pat("pull_h", "pull_v"),
    (e) => e.pattern === "isolation" && (e.muscles[0] === "shoulders" || e.muscles[0] === "back"),
    prim("biceps"),
    pat("core"),
    prim("biceps"),
    (e) => e.pattern === "isolation" && e.muscles.includes("back"),
  ],
  legs_core: [
    pat("squat"),
    pat("hinge"),
    pat("lunge"),
    pat("core"),
    prim("calves"),
    prim("glutes"),
    pat("core"),
    (e) => e.pattern === "isolation" && (e.muscles[0] === "quads" || e.muscles[0] === "hamstrings"),
  ],
  shoulders_arms: [
    pat("push_v"),
    prim("shoulders", "isolation"),
    prim("biceps"),
    anyMuscle("triceps"),
    pat("core"),
    (e) => e.pattern === "isolation" && e.muscles[0] === "shoulders",
    prim("biceps"),
    anyMuscle("triceps"),
  ],
};

export interface OfflineResult {
  plan: WorkoutPlan;
  warnings: string[];
}

export function buildOfflinePlan(profile: Profile, feedback: Feedback | undefined, seed: number): OfflineResult {
  const rng = mulberry32(seed || 1);
  const { exercises: allowed, warnings } = allowedExercises(profile, feedback?.soreMuscles ?? []);
  const recent = new Set(feedback?.recentExerciseIds ?? []);
  const sore = new Set(feedback?.soreMuscles ?? []);
  const cap = LEVEL_NUM[profile.level];
  const chosen: Exercise[] = [];

  const score = (e: Exercise) => {
    let s = e.level; // prefer the hardest exercise the person is ready for
    if (e.loaded && profile.goal !== "endurance") s += 2;
    if (recent.has(e.id)) s -= 4;
    if (e.muscles.slice(1).some((m) => sore.has(m))) s -= 2;
    if (e.level > cap) s -= 3; // stretch exercises only if nothing else fits
    return s + rng() * 2.5;
  };

  const slots = TEMPLATES[profile.focus];
  const target = SLOT_COUNT[profile.minutes];
  for (const slot of slots) {
    if (chosen.length >= target) break;
    const pool = allowed.filter((e) => slot(e) && !chosen.some((c) => c.id === e.id));
    if (!pool.length) continue;
    pool.sort((a, b) => score(b) - score(a));
    chosen.push(pool[0]);
  }

  // Top up from anything allowed if slots came up short.
  if (chosen.length < Math.min(target, 4)) {
    const rest = allowed
      .filter((e) => !chosen.some((c) => c.id === e.id))
      .sort((a, b) => score(b) - score(a));
    for (const e of rest) {
      if (chosen.length >= Math.min(target, 4)) break;
      chosen.push(e);
    }
  }

  if (profile.focus === "back_bi" && !chosen.some((e) => e.pattern === "pull_h" || e.pattern === "pull_v")) {
    warnings.push(
      "Pulling work needs a pull-up bar, bands, dumbbells or a sturdy table. Add one of them for a proper back session.",
    );
  }

  const exercises: PlanExercise[] = chosen.map((e, i) => {
    const p = prescribe(e, profile, feedback?.lastDifficulty, i);
    return { uid: `e${i}`, exerciseId: e.id, ...p };
  });

  const plan: WorkoutPlan = {
    id: newId(),
    createdAt: Date.now(),
    title: `${focusLabel(profile.focus)} ${profile.equipment.length ? "Session" : "Bodyweight Session"}`,
    focus: profile.focus,
    source: "offline",
    warmup: pickWarmup(profile.focus, rng),
    exercises,
    coachNote:
      "Built locally from your equipment and level. Finish each set with 1 to 2 reps left in reserve, and add reps or weight once the top of the range feels easy.",
  };
  return { plan, warnings };
}

// ---------------------------------------------------------------------------
// Turning model output into a safe plan
// ---------------------------------------------------------------------------

export interface LlmPlan {
  title: string;
  coachNote: string;
  warmup: { moveId: string; seconds: number }[];
  exercises: { exerciseId: string; sets: number; reps: string; restSeconds: number; note?: string }[];
}

const REPS_OK = /^(\d{1,2}(-\d{1,2})?( ?\/ ?side)?|\d{1,3}(-\d{1,3})?s)$/;

/**
 * Accepts the model's rep string only if it fits the exercise: holds must be times ("30-45s"),
 * rep work must be counts, and per-side movements must say so. Otherwise our own prescription is used.
 */
export function coerceReps(raw: string, e: Pick<Exercise, "timed" | "perSide">, fallback: string): string {
  const r = (raw ?? "").trim();
  if (!REPS_OK.test(r)) return fallback;
  const isTime = /s$/.test(r);
  if (!!e.timed !== isTime) return fallback;
  if (isTime) return r;
  const base = r.replace(/ ?\/ ?side/, "");
  return e.perSide ? `${base} / side` : base;
}

function cleanText(s: string, max: number): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

/**
 * Validates and normalises a model reply against the allowed library.
 * Unknown ids are dropped (never trusted), numbers are clamped, odd rep strings fall back to our own prescription.
 * Throws if too little survives so the caller can retry or fall back.
 */
export function sanitizeAiPlan(
  raw: LlmPlan,
  profile: Profile,
  feedback: Feedback | undefined,
  allowed: Exercise[],
  model: string,
): WorkoutPlan {
  const allowedMap = new Map(allowed.map((e) => [e.id, e]));
  const seen = new Set<string>();
  const exercises: PlanExercise[] = [];

  for (const item of raw.exercises) {
    const e = allowedMap.get(item.exerciseId);
    if (!e || seen.has(e.id)) continue;
    seen.add(e.id);
    const fallback = prescribe(e, profile, feedback?.lastDifficulty, exercises.length);
    const reps = coerceReps(item.reps, e, fallback.reps);
    exercises.push({
      uid: `e${exercises.length}`,
      exerciseId: e.id,
      sets: Math.min(6, Math.max(1, Math.round(item.sets))) || fallback.sets,
      reps,
      restSeconds: Math.min(240, Math.max(20, Math.round(item.restSeconds))) || fallback.restSeconds,
      note: item.note ? cleanText(item.note, 140) : undefined,
    });
  }

  if (exercises.length < 3) throw new Error("Model returned too few valid exercises.");

  const warmup: PlanWarmup[] = [];
  for (const w of raw.warmup ?? []) {
    const move = WARMUP_MAP[w.moveId];
    if (!move || warmup.some((x) => x.moveId === move.id)) continue;
    warmup.push({ moveId: move.id, seconds: Math.min(120, Math.max(20, Math.round(w.seconds) || move.seconds)) });
  }
  if (warmup.length < 2) {
    const fill = pickWarmup(profile.focus, mulberry32(7));
    for (const w of fill) if (warmup.length < 3 && !warmup.some((x) => x.moveId === w.moveId)) warmup.push(w);
  }

  const plan: WorkoutPlan = {
    id: newId(),
    createdAt: Date.now(),
    title: cleanText(raw.title, 60) || `${focusLabel(profile.focus)} Session`,
    focus: profile.focus,
    source: "ai",
    model,
    warmup: warmup.slice(0, 3),
    exercises,
    coachNote: cleanText(raw.coachNote, 320),
  };

  fitToTime(plan, profile.minutes);
  return plan;
}

/** Drops trailing exercises until the estimate fits the requested session length (with 20% slack). */
export function fitToTime(plan: WorkoutPlan, minutes: number): void {
  const max = SLOT_COUNT[minutes as Profile["minutes"]] ?? 6;
  while (plan.exercises.length > max) plan.exercises.pop();
  while (plan.exercises.length > 3 && estimateMinutes(plan) > minutes * 1.2) plan.exercises.pop();
  plan.exercises.forEach((e, i) => (e.uid = `e${i}`));
}
