import { createClient, type SupabaseClient, type User as SupabaseUser, type Session as SupabaseSession } from "@supabase/supabase-js";
import { KEYS } from "./storage";
import { EXERCISES } from "./exercises";
import { getExerciseMedia } from "./exerciseMedia";
import type { PlayerStats } from "./systemStats";
import type {
  HistoryEntry,
  Profile,
  UserGoal,
  ProgressEvaluation,
  SupabaseConfig,
} from "./types";

export const DEFAULT_SUPABASE_URL = "https://vdaenqmujfpduvjmuxzm.supabase.co";
export const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_lVG_0H9Y_5rDkCCUFsqsyA_higcGnwm";

let cachedClient: SupabaseClient | null = null;
let cachedUrl = "";
let cachedKey = "";
let inMemoryConfig: SupabaseConfig | null = null;
let explicitlyCleared = false;

/**
 * Retrieve saved Supabase credentials from environment, localStorage, or in-memory fallback.
 */
export function getSupabaseConfig(): SupabaseConfig | null {
  if (explicitlyCleared) return null;

  if (inMemoryConfig?.url && inMemoryConfig?.anonKey) {
    return inMemoryConfig;
  }

  // 1. Check environment variables
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const envKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (envUrl && envKey) {
    return { url: envUrl.trim(), anonKey: envKey.trim() };
  }

  // 2. Check localStorage
  if (typeof localStorage !== "undefined") {
    try {
      const stored = localStorage.getItem(KEYS.supabaseConfig);
      if (stored) {
        const parsed = JSON.parse(stored) as SupabaseConfig;
        if (parsed.url && parsed.anonKey) {
          return { url: parsed.url.trim(), anonKey: parsed.anonKey.trim() };
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. Built-in default project credentials (ensures Vercel deployment works seamlessly)
  if (process.env.NODE_ENV !== "test") {
    return {
      url: DEFAULT_SUPABASE_URL,
      anonKey: DEFAULT_SUPABASE_ANON_KEY,
    };
  }

  return null;
}

/**
 * Persist user-provided Supabase credentials to localStorage and memory.
 */
export function saveSupabaseConfig(config: SupabaseConfig | null) {
  inMemoryConfig = config;
  explicitlyCleared = !config || !config.url || !config.anonKey;
  cachedClient = null; // force re-instantiation

  if (typeof localStorage !== "undefined") {
    try {
      if (!config || !config.url || !config.anonKey) {
        localStorage.removeItem(KEYS.supabaseConfig);
      } else {
        localStorage.setItem(KEYS.supabaseConfig, JSON.stringify(config));
      }
    } catch {
      // ignore
    }
  }
}

/**
 * Check if a valid Supabase project is configured.
 */
export function isSupabaseConfigured(): boolean {
  const config = getSupabaseConfig();
  return Boolean(config?.url && config?.anonKey);
}

/**
 * Get or create the Supabase client instance.
 */
export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config) return null;

  if (cachedClient && cachedUrl === config.url && cachedKey === config.anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    cachedUrl = config.url;
    cachedKey = config.anonKey;
    return cachedClient;
  } catch (err) {
    console.warn("Failed to initialize Supabase client:", err);
    return null;
  }
}

/**
 * Synchronize user profile and biometrics to Supabase.
 */
export async function syncProfileToSupabase(profile: Profile, userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("profiles").upsert(
      {
        id: `prof_${userId}`,
        user_id: userId,
        name: "Athlete",
        gender: profile.gender,
        age: profile.age,
        height_cm: profile.heightCm,
        weight_kg: profile.weightKg,
        activity: profile.activity,
        goal: profile.goal,
        diet_goal: profile.dietGoal ?? "recomp",
        level: profile.level,
        minutes: profile.minutes,
        focus: profile.focus,
        equipment: profile.equipment,
        limitations: profile.limitations ?? "",
        workout_days: profile.workoutDays ?? [1, 3, 5],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.warn("Supabase profile sync error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Supabase profile sync exception:", err);
    return false;
  }
}

/**
 * Synchronize a completed workout session to Supabase.
 */
export async function syncWorkoutToSupabase(
  entry: HistoryEntry,
  userId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("workout_sessions").upsert(
      {
        id: entry.id,
        user_id: userId,
        finished_at: new Date(entry.finishedAt).toISOString(),
        title: entry.title,
        focus: entry.focus,
        difficulty: entry.difficulty,
        notes: entry.notes ?? "",
        minutes: entry.minutes,
        sets_done: entry.setsDone,
        sets_total: entry.setsTotal,
        volume_kg: entry.volumeKg,
        kcal_estimate: entry.kcalEstimate,
        source: entry.source,
        exercises_data: entry.exercises,
      },
      { onConflict: "id" }
    );

    if (error) {
      console.warn("Supabase workout sync error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Supabase workout sync exception:", err);
    return false;
  }
}

/**
 * Synchronize goals to Supabase.
 */
export async function syncGoalsToSupabase(
  goals: UserGoal[],
  userId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || goals.length === 0) return false;

  try {
    const rows = goals.map((g) => ({
      id: g.id,
      user_id: userId,
      title: g.title,
      description: g.description ?? "",
      category: g.category,
      target_value: g.targetValue,
      current_value: g.currentValue,
      unit: g.unit,
      status: g.status,
      deadline: g.deadline ? new Date(g.deadline).toISOString() : null,
      created_at: new Date(g.createdAt).toISOString(),
      completed_at: g.completedAt ? new Date(g.completedAt).toISOString() : null,
    }));

    const { error } = await supabase.from("user_goals").upsert(rows, { onConflict: "id" });
    if (error) {
      console.warn("Supabase goals sync error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Supabase goals sync exception:", err);
    return false;
  }
}

/**
 * Synchronize progress evaluation to Supabase.
 */
export async function syncEvaluationToSupabase(
  evaluation: ProgressEvaluation,
  userId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("progress_evaluations").upsert(
      {
        id: evaluation.id,
        user_id: userId,
        evaluated_at: new Date(evaluation.evaluatedAt).toISOString(),
        overall_score: evaluation.overallScore,
        strength_score: evaluation.strengthScore,
        consistency_score: evaluation.consistencyScore,
        volume_7d_kg: evaluation.volume7dKg,
        volume_30d_kg: evaluation.volume30dKg,
        sessions_7d: evaluation.sessions7d,
        active_streak_days: evaluation.activeStreakDays,
        ai_summary: evaluation.aiSummary,
        recommendations: evaluation.recommendations,
      },
      { onConflict: "id" }
    );

    if (error) {
      console.warn("Supabase evaluation sync error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Supabase evaluation sync exception:", err);
    return false;
  }
}

/**
 * Seed all exercises from Arise Coach into the Supabase exercises table.
 */
export async function seedExercisesToSupabase(): Promise<{ ok: boolean; count: number; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, count: 0, error: "Supabase client not configured." };

  try {
    const rows = EXERCISES.map((ex) => {
      const media = getExerciseMedia(ex.id);
      return {
        id: ex.id,
        name: ex.name,
        muscles: ex.muscles,
        pattern: ex.pattern,
        requires: ex.requires,
        level: ex.level,
        low_impact: ex.lowImpact,
        timed: Boolean(ex.timed),
        per_side: Boolean(ex.perSide),
        loaded: Boolean(ex.loaded),
        cues: ex.cues,
        easier_id: ex.easier ?? null,
        harder_id: ex.harder ?? null,
        gif_url: media.localGif,
      };
    });

    const { error } = await supabase.from("exercises").upsert(rows, { onConflict: "id" });
    if (error) {
      return { ok: false, count: 0, error: error.message };
    }
    return { ok: true, count: rows.length };
  } catch (err) {
    return { ok: false, count: 0, error: String(err) };
  }
}

/**
 * Pull cloud progress data (workouts, goals, evaluations) for a user.
 */
export async function pullUserCloudData(userId: string): Promise<{
  workouts: HistoryEntry[];
  goals: UserGoal[];
  evaluations: ProgressEvaluation[];
}> {
  const supabase = getSupabaseClient();
  if (!supabase) return { workouts: [], goals: [], evaluations: [] };

  try {
    const [workoutsRes, goalsRes, evalRes] = await Promise.all([
      supabase
        .from("workout_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("finished_at", { ascending: false })
        .limit(200),
      supabase.from("user_goals").select("*").eq("user_id", userId),
      supabase
        .from("progress_evaluations")
        .select("*")
        .eq("user_id", userId)
        .order("evaluated_at", { ascending: false })
        .limit(10),
    ]);

    const workouts: HistoryEntry[] = (workoutsRes.data ?? []).map((row) => ({
      id: row.id,
      finishedAt: new Date(row.finished_at).getTime(),
      title: row.title,
      focus: row.focus,
      source: row.source,
      minutes: row.minutes,
      setsDone: row.sets_done,
      setsTotal: row.sets_total,
      volumeKg: Number(row.volume_kg || 0),
      kcalEstimate: Number(row.kcal_estimate || 0),
      difficulty: row.difficulty,
      soreMuscles: [],
      notes: row.notes,
      exercises: row.exercises_data ?? [],
    }));

    const goals: UserGoal[] = (goalsRes.data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      category: row.category,
      targetValue: Number(row.target_value),
      currentValue: Number(row.current_value),
      unit: row.unit,
      status: row.status,
      deadline: row.deadline ? new Date(row.deadline).getTime() : undefined,
      createdAt: new Date(row.created_at).getTime(),
      completedAt: row.completed_at ? new Date(row.completed_at).getTime() : undefined,
    }));

    const evaluations: ProgressEvaluation[] = (evalRes.data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      evaluatedAt: new Date(row.evaluated_at).getTime(),
      overallScore: Number(row.overall_score),
      strengthScore: Number(row.strength_score),
      consistencyScore: Number(row.consistency_score),
      volume7dKg: Number(row.volume_7d_kg),
      volume30dKg: Number(row.volume_30d_kg),
      sessions7d: Number(row.sessions_7d),
      activeStreakDays: Number(row.active_streak_days),
      aiSummary: row.ai_summary,
      recommendations: row.recommendations ?? [],
    }));

    return { workouts, goals, evaluations };
  } catch (err) {
    console.warn("Failed to pull cloud data from Supabase:", err);
    return { workouts: [], goals: [], evaluations: [] };
  }
}

/**
 * Synchronize Solo Leveling hunter stats, rank, attributes, and gauges to Supabase.
 */
export async function syncPlayerStatsToSupabase(stats: PlayerStats, userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("player_stats").upsert(
      {
        user_id: userId,
        name: stats.name,
        job: stats.job,
        title: stats.title,
        level: stats.level,
        exp: stats.exp,
        exp_to_next: stats.expToNext,
        rank: stats.rank,
        hp: stats.hp,
        mp: stats.mp,
        fatigue: stats.fatigue,
        attributes: stats.attributes,
        unallocated_points: stats.unallocatedPoints,
        shadow_army_unlocked: stats.shadowArmyUnlocked,
        total_workouts_cleared: stats.totalWorkoutsCleared,
        total_sets_completed: stats.totalSetsCompleted,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.warn("Supabase player_stats sync error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Supabase player_stats sync exception:", err);
    return false;
  }
}

/**
 * Pull Solo Leveling hunter stats from Supabase cloud.
 */
export async function pullPlayerStatsFromSupabase(userId: string): Promise<PlayerStats | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("player_stats")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      name: data.name,
      job: data.job,
      title: data.title,
      level: Number(data.level) || 1,
      exp: Number(data.exp) || 0,
      expToNext: Number(data.exp_to_next) || 100,
      rank: data.rank,
      hp: data.hp ?? { current: 100, max: 100 },
      mp: data.mp ?? { current: 50, max: 50 },
      fatigue: Number(data.fatigue) || 0,
      attributes: data.attributes ?? { str: 12, agi: 10, vit: 11, int: 10, per: 9 },
      unallocatedPoints: Number(data.unallocated_points) || 0,
      shadowArmyUnlocked: Boolean(data.shadow_army_unlocked),
      totalWorkoutsCleared: Number(data.total_workouts_cleared) || 0,
      totalSetsCompleted: Number(data.total_sets_completed) || 0,
    };
  } catch (err) {
    console.warn("Supabase pullPlayerStats error:", err);
    return null;
  }
}

/**
 * Pull user profile from Supabase cloud.
 */
export async function pullUserProfileFromSupabase(userId: string): Promise<{ profile: Profile; name: string } | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    const profile: Profile = {
      gender: data.gender,
      age: Number(data.age) || 25,
      heightCm: Number(data.height_cm) || 172,
      weightKg: Number(data.weight_kg) || 68,
      activity: data.activity,
      level: data.level === 3 ? "advanced" : data.level === 2 ? "intermediate" : "beginner",
      goal: data.goal,
      dietGoal: data.diet_goal ?? "recomp",
      equipment: data.equipment ?? [],
      focus: data.focus ?? "full",
      minutes: (data.minutes as 20 | 30 | 45 | 60) ?? 45,
      lowImpact: true,
      limitations: "",
      workoutDays: data.workout_days ?? [1, 3, 5],
    };

    return { profile, name: data.name || "Hunter" };
  } catch (err) {
    console.warn("Supabase pullUserProfile error:", err);
    return null;
  }
}

// -----------------------------------------------------------------------------
// Supabase Authentication (Hunter Login, Register, Magic Link, Session)
// -----------------------------------------------------------------------------

export async function signInWithEmail(email: string, password: string) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase.auth.signInWithPassword({ email: email.trim(), password });
}

export async function signUpWithEmail(email: string, password: string, hunterName?: string) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        hunter_name: hunterName?.trim() || "Shadow Hunter",
      },
    },
  });
}

export async function signInWithMagicLink(email: string) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/#auth` : undefined;
  return supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      emailRedirectTo: redirectUrl,
    },
  });
}

export async function signOutSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: null };
  return supabase.auth.signOut();
}

export async function getSupabaseAuthSession(): Promise<SupabaseSession | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getCurrentSupabaseUser(): Promise<SupabaseUser | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

