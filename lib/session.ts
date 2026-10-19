import { WARMUP_MAP, EXERCISE_MAP } from "./exercises";
import type { Feedback, HistoryEntry, Session, SetLog, WorkoutPlan } from "./types";

export function initSets(plan: WorkoutPlan): Record<string, SetLog[]> {
  const out: Record<string, SetLog[]> = {};
  for (const e of plan.exercises) out[e.uid] = Array.from({ length: e.sets }, () => ({ done: false }));
  return out;
}

export function totals(session: Session) {
  let setsDone = 0;
  let setsTotal = 0;
  let volumeKg = 0;
  for (const e of session.plan.exercises) {
    const sets = session.sets[e.uid] ?? [];
    setsTotal += sets.length;
    for (const s of sets) {
      if (!s.done) continue;
      setsDone++;
      if (s.reps && s.weightKg && s.weightKg > 0) volumeKg += s.reps * s.weightKg;
    }
  }
  return { setsDone, setsTotal, volumeKg: Math.round(volumeKg) };
}

/** Most recent logged weight per exercise, newest history first. Used to prefill the next session. */
export function lastWeights(history: HistoryEntry[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const h of history) {
    for (const ex of h.exercises) {
      if (out[ex.exerciseId] !== undefined) continue;
      const w = [...ex.sets].reverse().find((s) => s.done && s.weightKg && s.weightKg > 0)?.weightKg;
      if (w) out[ex.exerciseId] = w;
    }
  }
  return out;
}

const SORE_WINDOW_MS = 72 * 60 * 60 * 1000;

/** Everything the coach should know from past sessions. History is newest first. */
export function buildFeedback(history: HistoryEntry[], now = Date.now()): Feedback {
  const last = history[0];
  const recent = new Set<string>();
  for (const h of history.slice(0, 3)) for (const e of h.exercises) recent.add(e.exerciseId);
  return {
    lastDifficulty: last?.difficulty,
    soreMuscles: last && now - last.finishedAt < SORE_WINDOW_MS ? last.soreMuscles : [],
    recentExerciseIds: [...recent].slice(0, 30),
    notes: last?.notes,
  };
}

export function sessionsInLastDays(history: HistoryEntry[], days: number, now = Date.now()): number {
  return history.filter((h) => now - h.finishedAt < days * 86_400_000).length;
}

/** Defensive load: a corrupted or outdated saved session must never crash the app. */
export function normalizeSession(raw: unknown): Session | null {
  try {
    const s = raw as Session;
    if (!s || typeof s !== "object" || !s.plan || !Array.isArray(s.plan.exercises) || !s.meta) return null;
    if (s.plan.exercises.length === 0) return null;
    for (const e of s.plan.exercises) {
      if (!EXERCISE_MAP[e.exerciseId] || typeof e.uid !== "string" || !(e.sets >= 1)) return null;
    }
    s.plan.warmup = (s.plan.warmup ?? []).filter((w) => WARMUP_MAP[w.moveId]);
    const fresh = initSets(s.plan);
    const sets: Record<string, SetLog[]> = {};
    for (const e of s.plan.exercises) {
      const saved = s.sets?.[e.uid];
      sets[e.uid] = Array.isArray(saved) && saved.length === e.sets ? saved : fresh[e.uid];
    }
    return { ...s, sets, warmupDone: s.warmupDone ?? {} };
  } catch {
    return null;
  }
}

export function normalizeHistory(raw: unknown): HistoryEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (h): h is HistoryEntry =>
        !!h && typeof h === "object" && typeof h.id === "string" && typeof h.finishedAt === "number" && typeof h.title === "string" && Array.isArray(h.exercises),
    )
    .sort((a, b) => b.finishedAt - a.finishedAt)
    .slice(0, 500);
}
