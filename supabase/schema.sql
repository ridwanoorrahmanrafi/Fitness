-- ==============================================================================
-- ARISE COACH - SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Profiles Table (User biometrics, preferences, and workout configuration)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Athlete',
  gender TEXT NOT NULL DEFAULT 'male',
  age INTEGER NOT NULL DEFAULT 25,
  height_cm NUMERIC(5, 2) NOT NULL DEFAULT 172.0,
  weight_kg NUMERIC(5, 2) NOT NULL DEFAULT 68.0,
  activity TEXT NOT NULL DEFAULT 'moderate',
  goal TEXT NOT NULL DEFAULT 'muscle',
  diet_goal TEXT DEFAULT 'recomp',
  level INTEGER NOT NULL DEFAULT 1,
  minutes INTEGER NOT NULL DEFAULT 45,
  focus TEXT NOT NULL DEFAULT 'push',
  equipment JSONB NOT NULL DEFAULT '[]'::jsonb,
  soreness JSONB NOT NULL DEFAULT '[]'::jsonb,
  workout_days JSONB NOT NULL DEFAULT '[1, 3, 5]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Exercises Table (Master exercise movement catalog with biomechanical cues & GIF assets)
CREATE TABLE IF NOT EXISTS public.exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  muscles JSONB NOT NULL DEFAULT '[]'::jsonb,
  pattern TEXT NOT NULL,
  requires JSONB NOT NULL DEFAULT '[]'::jsonb,
  level INTEGER NOT NULL DEFAULT 1,
  low_impact BOOLEAN NOT NULL DEFAULT TRUE,
  timed BOOLEAN NOT NULL DEFAULT FALSE,
  per_side BOOLEAN NOT NULL DEFAULT FALSE,
  loaded BOOLEAN NOT NULL DEFAULT FALSE,
  cues TEXT NOT NULL DEFAULT '',
  easier_id TEXT,
  harder_id TEXT,
  gif_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Workout Sessions Table (Completed workouts, logged volume, feedback, and caloric estimate)
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  title TEXT NOT NULL,
  focus TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('too_easy', 'just_right', 'too_hard')),
  notes TEXT DEFAULT '',
  minutes INTEGER NOT NULL DEFAULT 0,
  sets_done INTEGER NOT NULL DEFAULT 0,
  sets_total INTEGER NOT NULL DEFAULT 0,
  volume_kg NUMERIC(10, 2) NOT NULL DEFAULT 0,
  kcal_estimate NUMERIC(8, 2) NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'ai',
  exercises_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. User Goals Table (Adaptive progression, milestone targets, volume, and consistency goals)
CREATE TABLE IF NOT EXISTS public.user_goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('strength', 'volume', 'consistency', 'weight', 'exercise')),
  target_value NUMERIC(10, 2) NOT NULL,
  current_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'reps',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'suggested')),
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 5. Progress Evaluations Table (Continuous AI & biometric evaluation snapshots)
CREATE TABLE IF NOT EXISTS public.progress_evaluations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  overall_score NUMERIC(5, 2) NOT NULL DEFAULT 80.0,
  strength_score NUMERIC(5, 2) NOT NULL DEFAULT 80.0,
  consistency_score NUMERIC(5, 2) NOT NULL DEFAULT 80.0,
  volume_7d_kg NUMERIC(10, 2) NOT NULL DEFAULT 0,
  volume_30d_kg NUMERIC(10, 2) NOT NULL DEFAULT 0,
  sessions_7d INTEGER NOT NULL DEFAULT 0,
  active_streak_days INTEGER NOT NULL DEFAULT 0,
  ai_summary TEXT NOT NULL DEFAULT '',
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user ON public.workout_sessions(user_id, finished_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_goals_user ON public.user_goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_evaluations_user ON public.progress_evaluations(user_id, evaluated_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_user ON public.profiles(user_id);

-- 6. Player Stats Table (Solo Leveling System Stats, Level, EXP, Attributes, HP, MP, Fatigue)
CREATE TABLE IF NOT EXISTS public.player_stats (
  user_id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Sung Jin-woo',
  job TEXT NOT NULL DEFAULT 'None (Candidate)',
  title TEXT NOT NULL DEFAULT 'Weakest Hunter',
  level INTEGER NOT NULL DEFAULT 1,
  exp INTEGER NOT NULL DEFAULT 0,
  exp_to_next INTEGER NOT NULL DEFAULT 100,
  rank TEXT NOT NULL DEFAULT 'E',
  hp JSONB NOT NULL DEFAULT '{"current": 100, "max": 100}'::jsonb,
  mp JSONB NOT NULL DEFAULT '{"current": 50, "max": 50}'::jsonb,
  fatigue INTEGER NOT NULL DEFAULT 0,
  attributes JSONB NOT NULL DEFAULT '{"str": 12, "agi": 10, "vit": 11, "int": 10, "per": 9}'::jsonb,
  unallocated_points INTEGER NOT NULL DEFAULT 3,
  shadow_army_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  total_workouts_cleared INTEGER NOT NULL DEFAULT 0,
  total_sets_completed INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access for client API keys (or customize based on Supabase Auth)
DROP POLICY IF EXISTS "Allow public read-write for profiles" ON public.profiles;
CREATE POLICY "Allow public read-write for profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read for exercises" ON public.exercises;
CREATE POLICY "Allow public read for exercises" ON public.exercises FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert for exercises" ON public.exercises;
CREATE POLICY "Allow public insert for exercises" ON public.exercises FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write for workout_sessions" ON public.workout_sessions;
CREATE POLICY "Allow public read-write for workout_sessions" ON public.workout_sessions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write for user_goals" ON public.user_goals;
CREATE POLICY "Allow public read-write for user_goals" ON public.user_goals FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write for progress_evaluations" ON public.progress_evaluations;
CREATE POLICY "Allow public read-write for progress_evaluations" ON public.progress_evaluations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write for player_stats" ON public.player_stats;
CREATE POLICY "Allow public read-write for player_stats" ON public.player_stats FOR ALL USING (true) WITH CHECK (true);

-- 7. Notes Table (Sample Server Component data)
CREATE TABLE IF NOT EXISTS public.notes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert sample notes if table is empty
INSERT INTO public.notes (title)
SELECT title FROM (VALUES
  ('Today I created a Supabase project.'),
  ('I added some data and queried it from Next.js.'),
  ('It was awesome!')
) AS v(title)
WHERE NOT EXISTS (SELECT 1 FROM public.notes LIMIT 1);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read for notes" ON public.notes;
CREATE POLICY "Allow public read for notes" ON public.notes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public write for notes" ON public.notes;
CREATE POLICY "Allow public write for notes" ON public.notes FOR INSERT WITH CHECK (true);


