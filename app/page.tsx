"use client";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Dumbbell,
  Flame,
  HeartPulse,
  History as HistoryIcon,
  Info,
  Loader2,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Timer,
  Utensils,
  Volume2,
  VolumeX,
  WifiOff,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ExerciseCard } from "@/components/ExerciseCard";
import { FinishSheet, type FinishResult } from "@/components/FinishSheet";
import { HistoryView } from "@/components/HistoryView";
import { ProfileSheet } from "@/components/ProfileSheet";
import { RestTimer } from "@/components/RestTimer";
import { BmiGauge } from "@/components/BmiGauge";
import { DietSheet } from "@/components/DietSheet";
import { WeeklyScheduleBar } from "@/components/WeeklyScheduleBar";
import { ExerciseAnimationModal } from "@/components/ExerciseAnimationModal";
import { Chip } from "@/components/Sheet";
import { useCountdown } from "@/hooks/useCountdown";
import { useStoredState } from "@/hooks/useStoredState";
import { useWakeLock } from "@/hooks/useWakeLock";
import { playSound, unlockAudio, vibrate } from "@/lib/audio";
import { alternativesFor, buildOfflinePlan, estimateMinutes, focusLabel, prescribe } from "@/lib/builder";
import { kcalEstimate, profileStats, macroTargets } from "@/lib/calc";
import { WARMUP_MAP, getExercise, hasEquipment } from "@/lib/exercises";
import { buildFeedback, initSets, lastWeights, normalizeHistory, normalizeSession, totals } from "@/lib/session";
import { KEYS, makeBackup, mergeHistory, parseProfile, readBackup } from "@/lib/storage";
import {
  DEFAULT_PROFILE,
  FOCUSES,
  type Exercise,
  type GenerateResponse,
  type HistoryEntry,
  type PlanMeta,
  type Profile,
  type Session,
  type SetLog,
  type WorkoutPlan,
} from "@/lib/types";

type View = "today" | "history";

export default function Page() {
  const [profile, setProfile, profileReady] = useStoredState<Profile | null>(KEYS.profile, null, parseProfile);
  const [session, setSession, sessionReady] = useStoredState<Session | null>(KEYS.session, null, normalizeSession);
  const [history, setHistory, historyReady] = useStoredState<HistoryEntry[]>(KEYS.history, [], normalizeHistory);
  const [accessCode, setAccessCode] = useStoredState<string>(KEYS.access, "");
  const [geminiKey, setGeminiKey] = useStoredState<string>(KEYS.geminiKey, "");
  const [unitSystem, setUnitSystem] = useStoredState<"metric" | "imperial">(KEYS.unitSystem, "metric");
  const [soundOn, setSoundOn] = useStoredState<boolean>(KEYS.sound, true);

  const [view, setView] = useState<View>("today");
  const [showProfile, setShowProfile] = useState(false);
  const [showFinish, setShowFinish] = useState(false);
  const [showDietSheet, setShowDietSheet] = useState(false);
  const [selectedAnimationEx, setSelectedAnimationEx] = useState<Exercise | null>(null);
  const [warmupOpen, setWarmupOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());

  const timer = useCountdown(soundOn);
  const ready = profileReady && sessionReady && historyReady;
  const needsSetup = ready && !profile;
  const activeProfile = profile ?? DEFAULT_PROFILE;
  const stats = useMemo(() => profileStats(activeProfile), [activeProfile]);
  const nutrition = useMemo(
    () => macroTargets(stats.tdee, activeProfile.weightKg, activeProfile.goal),
    [stats.tdee, activeProfile.weightKg, activeProfile.goal],
  );

  useWakeLock(!!session?.startedAt);

  // Elapsed-time display refresh.
  useEffect(() => {
    if (!session?.startedAt) return;
    const id = window.setInterval(() => setNowTick(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, [session?.startedAt]);

  const weights = useMemo(() => lastWeights(history), [history]);
  const t = useMemo(() => (session ? totals(session) : null), [session]);
  const allDone = !!t && t.setsTotal > 0 && t.setsDone === t.setsTotal;

  // ----- generation -------------------------------------------------------

  const applyPlan = useCallback(
    (plan: WorkoutPlan, meta: PlanMeta, warning?: string) => {
      timer.stop();
      setSession({ plan, meta, warmupDone: {}, sets: initSets(plan) });
      setNotice(warning ?? null);
      setError(null);
      setSaved(null);
      setView("today");
    },
    [setSession, timer],
  );

  const generate = useCallback(
    async (p: Profile, opts?: { offline?: boolean }) => {
      setBusy(true);
      setError(null);
      setNotice(null);
      const feedback = buildFeedback(history);
      const seed = Math.floor(Math.random() * 1_000_000_000);
      const meta = profileStats(p);
      const metaOnly: PlanMeta = { bmi: meta.bmi, bmiCategory: meta.bmiCategory, bmr: meta.bmr, tdee: meta.tdee };

      try {
        if (opts?.offline) {
          const { plan, warnings } = buildOfflinePlan(p, feedback, seed);
          applyPlan(plan, metaOnly, ["Built on this device without AI.", ...warnings].join(" "));
          return;
        }

        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 55_000);
        let res: Response;
        try {
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...(accessCode ? { "x-access-code": accessCode } : {}),
            ...(geminiKey ? { "x-gemini-api-key": geminiKey } : {}),
          };
          res = await fetch("/api/generate-workout", {
            method: "POST",
            headers,
            body: JSON.stringify({ profile: p, feedback, seed }),
            signal: controller.signal,
          });
        } finally {
          window.clearTimeout(timeout);
        }

        const data = (await res.json().catch(() => null)) as GenerateResponse | null;
        if (!data) {
          setError(`The server returned an unexpected response (status ${res.status}).`);
          return;
        }
        if (!data.ok) {
          if (data.code === "unauthorized") {
            setError("This server needs an access code. Add it in your profile.");
            setShowProfile(true);
          } else {
            setError(data.error);
          }
          return;
        }
        applyPlan(data.plan, data.meta, data.warning);
      } catch (err) {
        const aborted = err instanceof DOMException && err.name === "AbortError";
        setError(aborted ? "The AI coach took too long to answer." : "Could not reach the server. Check your connection.");
      } finally {
        setBusy(false);
      }
    },
    [accessCode, applyPlan, geminiKey, history],
  );

  const saveProfile = (p: Profile, code: string, key?: string, unit?: "metric" | "imperial") => {
    const first = !profile;
    setProfile(p);
    setAccessCode(code);
    if (key !== undefined) setGeminiKey(key);
    if (unit !== undefined) setUnitSystem(unit);
    setShowProfile(false);
    if (first) void generate(p);
  };

  const quickPatch = (patch: Partial<Profile>) => setProfile({ ...activeProfile, ...patch });

  // ----- session mutations --------------------------------------------------

  const patchSession = (fn: (s: Session) => Session) => setSession((prev) => (prev ? fn(prev) : prev));

  const toggleSet = (uid: string, idx: number) => {
    if (!session || !t) return;
    const pe = session.plan.exercises.find((e) => e.uid === uid);
    const ex = pe && getExercise(pe.exerciseId);
    const wasDone = session.sets[uid]?.[idx]?.done;
    if (!pe || !ex) return;

    patchSession((s) => ({
      ...s,
      startedAt: s.startedAt ?? Date.now(),
      sets: { ...s.sets, [uid]: s.sets[uid].map((x, i) => (i === idx ? { ...x, done: !x.done } : x)) },
    }));

    if (wasDone) return;
    unlockAudio();
    if (t.setsDone + 1 === t.setsTotal) {
      timer.stop();
      if (soundOn) playSound("complete");
      vibrate([100, 50, 100, 50, 200]);
    } else {
      if (soundOn) playSound("set");
      timer.start(pe.restSeconds, `Rest after ${ex.name}`);
    }
  };

  const changeSet = (uid: string, idx: number, patch: Partial<SetLog>) =>
    patchSession((s) => ({ ...s, sets: { ...s.sets, [uid]: s.sets[uid].map((x, i) => (i === idx ? { ...x, ...patch } : x)) } }));

  const swapExercise = (uid: string, newId: string) => {
    const next = getExercise(newId);
    if (!next) return;
    patchSession((s) => {
      const i = s.plan.exercises.findIndex((e) => e.uid === uid);
      if (i < 0) return s;
      const old = s.plan.exercises[i];
      const p = prescribe(next, activeProfile, undefined, i);
      const exercises = s.plan.exercises.map((e, k) => (k === i ? { ...e, exerciseId: newId, reps: p.reps, restSeconds: p.restSeconds, note: undefined } : e));
      return {
        ...s,
        plan: { ...s.plan, exercises },
        sets: { ...s.sets, [uid]: Array.from({ length: old.sets }, () => ({ done: false })) },
      };
    });
  };

  const toggleWarmup = (moveId: string) =>
    patchSession((s) => ({ ...s, warmupDone: { ...s.warmupDone, [moveId]: !s.warmupDone[moveId] } }));

  const startWorkout = () => {
    unlockAudio();
    patchSession((s) => ({ ...s, startedAt: s.startedAt ?? Date.now() }));
  };

  const discard = () => {
    if (!window.confirm("Discard this workout? Logged sets will be lost.")) return;
    timer.stop();
    setSession(null);
  };

  const finish = (r: FinishResult) => {
    if (!session || !t) return;
    const entry: HistoryEntry = {
      id: session.plan.id,
      finishedAt: Date.now(),
      title: session.plan.title,
      focus: session.plan.focus,
      source: session.plan.source,
      minutes: r.minutes,
      setsDone: t.setsDone,
      setsTotal: t.setsTotal,
      volumeKg: t.volumeKg,
      kcalEstimate: r.kcal,
      difficulty: r.difficulty,
      soreMuscles: r.soreMuscles,
      notes: r.notes || undefined,
      exercises: session.plan.exercises.map((e) => ({ exerciseId: e.exerciseId, sets: session.sets[e.uid] ?? [] })),
    };
    setHistory((h) => mergeHistory(h, [entry]));
    timer.stop();
    setSession(null);
    setShowFinish(false);
    setSaved(
      r.difficulty === "too_hard"
        ? "Saved. Your next plan will be lighter."
        : r.difficulty === "too_easy"
          ? "Saved. Your next plan will push a little harder."
          : "Saved. Your next plan will keep a similar load.",
    );
  };

  // ----- backup -------------------------------------------------------------

  const exportData = () => {
    const blob = new Blob([JSON.stringify(makeBackup(profile, history), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arise-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (text: string): string => {
    const b = readBackup(text);
    if (!b) return "That file is not an Arise Coach backup.";
    setHistory((h) => mergeHistory(h, b.history));
    if (b.profile && !profile) setProfile(b.profile);
    return `Imported ${b.history.length} session${b.history.length === 1 ? "" : "s"}.`;
  };

  // ----- render -------------------------------------------------------------

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500" aria-busy="true">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
      </main>
    );
  }

  const plan = session?.plan;
  const elapsedMin = session?.startedAt ? Math.max(0, Math.round((nowTick - session.startedAt) / 60000)) : null;

  return (
    <div className="min-h-screen pb-40">
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-900/80 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/20">
              <Flame className="h-5 w-5 stroke-[2.5] text-zinc-950" />
            </div>
            <div>
              <h1 className="flex items-center gap-1.5 text-base font-bold tracking-tight text-white">
                ARISE
                <span className="rounded border border-emerald-500/30 bg-emerald-950/80 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-emerald-400">
                  Coach
                </span>
              </h1>
              <p className="text-xs text-zinc-400">Adaptive personal training</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              id="btn-bangladeshi-diet"
              onClick={() => setShowDietSheet(true)}
              aria-label="Bangladeshi Diet Chart"
              title="বাঙালি ডায়েট চার্ট (Bangladeshi Diet Plan)"
              className="flex h-11 items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-2.5 sm:px-3 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 shadow-sm transition-colors"
            >
              <Utensils className="h-4 w-4" />
              <span className="hidden sm:inline">বাঙালি ডায়েট</span>
            </button>
            <button
              onClick={() => {
                unlockAudio();
                setSoundOn(!soundOn);
              }}
              aria-label={soundOn ? "Mute sounds" : "Unmute sounds"}
              aria-pressed={soundOn}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-700/60 bg-zinc-800/60 hover:bg-zinc-800"
            >
              {soundOn ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4 text-zinc-500" />}
            </button>
            <button
              onClick={() => setView(view === "history" ? "today" : "history")}
              aria-label={view === "history" ? "Back to today" : "History"}
              aria-pressed={view === "history"}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-700/60 bg-zinc-800/60 hover:bg-zinc-800"
            >
              <HistoryIcon className={`h-4 w-4 ${view === "history" ? "text-emerald-400" : "text-zinc-300"}`} />
            </button>
            <button
              onClick={() => setShowProfile(true)}
              aria-label="Profile and settings"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {view === "today" && session && t && (
          <div className="mx-auto mt-2.5 max-w-3xl">
            <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-zinc-400">
              <span className="flex items-center gap-1">
                <Activity className="h-3.5 w-3.5 text-emerald-400" /> Session
                {elapsedMin !== null && <span className="text-zinc-500">· {elapsedMin} min in</span>}
              </span>
              <span className="font-semibold text-emerald-400">
                {t.setsTotal ? Math.round((t.setsDone / t.setsTotal) * 100) : 0}% ({t.setsDone}/{t.setsTotal} sets)
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-[width] duration-300"
                style={{ width: `${t.setsTotal ? (t.setsDone / t.setsTotal) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-4 pt-5">
        {error && (
          <div role="alert" className="rounded-2xl border border-red-900/60 bg-red-950/40 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              <div className="flex-1 text-sm text-red-100">
                {error}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => void generate(activeProfile)}
                    disabled={busy}
                    className="min-h-[44px] rounded-xl bg-red-500/20 px-4 text-sm font-semibold text-red-100 hover:bg-red-500/30 disabled:opacity-50"
                  >
                    Try again
                  </button>
                  <button
                    onClick={() => void generate(activeProfile, { offline: true })}
                    disabled={busy}
                    className="flex min-h-[44px] items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 text-sm text-zinc-100 hover:bg-zinc-700 disabled:opacity-50"
                  >
                    <WifiOff className="h-4 w-4" /> Build an offline plan instead
                  </button>
                </div>
              </div>
              <button onClick={() => setError(null)} aria-label="Dismiss" className="text-red-300 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {view === "history" ? (
          <HistoryView
            history={history}
            onExport={exportData}
            onImport={importData}
            onClear={() => setHistory([])}
          />
        ) : !plan || !session ? (
          // ---------------- empty state ----------------
          <section className="space-y-4">
            {saved && (
              <div role="status" className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> {saved}
              </div>
            )}

            {/* Weekly Schedule & Smart Split Bar */}
            <WeeklyScheduleBar
              workoutDays={activeProfile.workoutDays ?? [1, 3, 5]}
              onToggleDay={(dayIndex) => {
                const cur = new Set(activeProfile.workoutDays ?? [1, 3, 5]);
                if (cur.has(dayIndex)) {
                  if (cur.size > 1) cur.delete(dayIndex);
                } else {
                  cur.add(dayIndex);
                }
                quickPatch({ workoutDays: Array.from(cur).sort((a, b) => a - b) });
              }}
              onSetDays={(days) => quickPatch({ workoutDays: days })}
              onApplyTodayFocus={(focusId) => quickPatch({ focus: focusId })}
            />

            <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950 p-5 shadow-xl">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
              <h2 className="text-2xl font-extrabold tracking-tight text-white">Ready for today&apos;s session?</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Pick a focus and length, and your coach builds it from the equipment you have.
              </p>

              <div className="mt-4">
                <span className="mb-1.5 block text-xs font-medium text-zinc-400">Focus</span>
                <div className="flex flex-wrap gap-2">
                  {FOCUSES.map((f) => (
                    <Chip key={f.id} selected={activeProfile.focus === f.id} onClick={() => quickPatch({ focus: f.id })}>
                      {f.label}
                    </Chip>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <span className="mb-1.5 block text-xs font-medium text-zinc-400">Time</span>
                <div className="flex flex-wrap gap-2">
                  {([20, 30, 45, 60] as const).map((m) => (
                    <Chip key={m} selected={activeProfile.minutes === m} onClick={() => quickPatch({ minutes: m })}>
                      {m} min
                    </Chip>
                  ))}
                </div>
              </div>

              <button
                id="btn-generate-ai"
                onClick={() => {
                  unlockAudio();
                  void generate(activeProfile);
                }}
                disabled={busy || !profile}
                className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 transition-opacity hover:opacity-95 disabled:opacity-50"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Building your session…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 stroke-[2.5]" /> Generate workout
                  </>
                )}
              </button>
              <button
                id="btn-generate-offline"
                onClick={() => void generate(activeProfile, { offline: true })}
                disabled={busy || !profile}
                className="mt-2 min-h-[44px] w-full text-xs text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline disabled:opacity-50"
              >
                Build without AI (works offline)
              </button>
            </div>

            {/* Visual BMI Gauge & Energy / Macro Split Card */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3.5 shadow-md">
              <BmiGauge bmi={stats.bmi} category={stats.bmiCategory} />

              <div className="grid grid-cols-2 gap-2 text-center pt-1 border-t border-zinc-800/60">
                <div className="rounded-xl bg-zinc-950/70 p-2.5 border border-zinc-800/50">
                  <div className="text-[10px] text-zinc-400">Resting BMR</div>
                  <div className="text-base font-bold text-white font-mono">{stats.bmr} <span className="text-[10px] text-zinc-500 font-normal">kcal</span></div>
                </div>
                <div className="rounded-xl bg-zinc-950/70 p-2.5 border border-zinc-800/50">
                  <div className="text-[10px] text-zinc-400">Daily Maintenance</div>
                  <div className="text-base font-bold text-emerald-400 font-mono">{stats.tdee} <span className="text-[10px] text-zinc-500 font-normal">kcal</span></div>
                </div>
              </div>

              {nutrition && (
                <div className="rounded-xl bg-zinc-950/80 p-3 border border-zinc-800 text-center space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                    <span>Target Calories ({activeProfile.goal}):</span>
                    <strong className="text-white font-mono">{nutrition.targetCalories} kcal/day</strong>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    <div className="bg-zinc-900/90 p-2 rounded-lg border border-zinc-800">
                      <span className="text-emerald-400 font-semibold block text-[10px]">Protein</span>
                      <strong className="text-white font-mono">{nutrition.proteinGrams}g</strong>
                    </div>
                    <div className="bg-zinc-900/90 p-2 rounded-lg border border-zinc-800">
                      <span className="text-teal-400 font-semibold block text-[10px]">Carbs</span>
                      <strong className="text-white font-mono">{nutrition.carbGrams}g</strong>
                    </div>
                    <div className="bg-zinc-900/90 p-2 rounded-lg border border-zinc-800">
                      <span className="text-amber-400 font-semibold block text-[10px]">Fats</span>
                      <strong className="text-white font-mono">{nutrition.fatGrams}g</strong>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowDietSheet(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-2.5 px-3 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-colors shadow-sm"
              >
                <Utensils className="h-4 w-4" />
                <span>দেশীয় খাবারের সম্পূর্ণ ডায়েট চার্ট দেখুন (Bangladeshi Diet Chart)</span>
              </button>
            </div>

            {history[0] && (
              <p className="text-center text-xs text-zinc-500">
                Last session: {history[0].title}, felt &ldquo;{history[0].difficulty.replace("_", " ")}&rdquo;. Your coach will use that.
              </p>
            )}
          </section>
        ) : (
          // ---------------- active workout ----------------
          <>
            <section className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950 p-5 shadow-xl">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                {plan.source === "ai" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                    <Sparkles className="h-3 w-3" /> AI coach
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-600 bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300">
                    <WifiOff className="h-3 w-3" /> Offline plan (no AI)
                  </span>
                )}
                <span className="flex items-center gap-1.5 rounded-full border border-zinc-700/60 bg-zinc-800/90 px-2.5 py-1 text-xs text-zinc-300">
                  <HeartPulse className="h-3.5 w-3.5 text-rose-400" /> BMI <strong className="text-white">{session.meta.bmi}</strong> ({session.meta.bmiCategory})
                </span>
              </div>

              <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-white md:text-3xl">{plan.title}</h2>
              <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-zinc-400 md:text-sm">
                <span className="flex items-center gap-1.5">
                  <Dumbbell className="h-4 w-4 text-emerald-400" />
                  <span className="text-zinc-200">{focusLabel(plan.focus)}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-emerald-400" /> ~{estimateMinutes(plan)} min
                </span>
                <span className="flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-emerald-400" /> {plan.exercises.length} movements
                </span>
              </div>

              {plan.coachNote && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-zinc-950/60 p-3.5">
                  <div className="mt-0.5 shrink-0 rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400">
                    <Info className="h-4 w-4" />
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-300 md:text-sm">
                    <strong className="font-semibold text-emerald-400">Coach: </strong>
                    {plan.coachNote}
                  </p>
                </div>
              )}

              {!session.startedAt && (
                <button
                  onClick={startWorkout}
                  className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 font-semibold text-emerald-300 hover:bg-emerald-500/20"
                >
                  <Play className="h-4 w-4" /> Start workout (keeps the screen on)
                </button>
              )}
            </section>

            {notice && (
              <div role="status" className="flex items-start gap-2 rounded-xl border border-amber-700/40 bg-amber-950/30 p-3 text-xs text-amber-100">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <span className="flex-1">{notice}</span>
                <button onClick={() => setNotice(null)} aria-label="Dismiss notice" className="text-amber-300 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <section className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60">
              <button
                onClick={() => setWarmupOpen(!warmupOpen)}
                aria-expanded={warmupOpen}
                className="flex min-h-[64px] w-full items-center justify-between p-4 text-left hover:bg-zinc-800/40"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-teal-500/20 bg-teal-500/10 text-teal-400">
                    <Flame className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Warm-up</h3>
                    <p className="text-xs text-zinc-400">
                      {plan.warmup.filter((w) => session.warmupDone[w.moveId]).length} of {plan.warmup.length} done
                    </p>
                  </div>
                </div>
                {warmupOpen ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
              </button>
              {warmupOpen && (
                <ul className="space-y-2 border-t border-zinc-800/50 p-4 pt-3">
                  {plan.warmup.map((w) => {
                    const move = WARMUP_MAP[w.moveId];
                    if (!move) return null;
                    const done = !!session.warmupDone[w.moveId];
                    return (
                      <li
                        key={w.moveId}
                        className={`flex items-start gap-3 rounded-xl border p-3 ${done ? "border-emerald-500/30 bg-zinc-950/60 opacity-70" : "border-zinc-800 bg-zinc-900/90"}`}
                      >
                        <button
                          onClick={() => toggleWarmup(w.moveId)}
                          aria-pressed={done}
                          aria-label={`Mark ${move.name} ${done ? "not done" : "done"}`}
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${done ? "bg-emerald-500 text-black" : "border border-zinc-600 bg-zinc-800/50"}`}
                        >
                          {done && <CheckCircle2 className="h-4 w-4 stroke-[3]" />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className={`text-sm font-medium ${done ? "text-zinc-400 line-through" : "text-zinc-100"}`}>{move.name}</div>
                          <p className="mt-0.5 text-xs leading-snug text-zinc-400">{move.notes}</p>
                        </div>
                        <button
                          onClick={() => {
                            unlockAudio();
                            timer.start(w.seconds, `Warm-up: ${move.name}`);
                          }}
                          className="flex min-h-[40px] shrink-0 items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 text-xs text-zinc-200 hover:bg-zinc-700"
                        >
                          <Timer className="h-3.5 w-3.5" /> {w.seconds}s
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
                  <Dumbbell className="h-5 w-5 text-emerald-400" /> Main work ({plan.exercises.length})
                </h3>
                <button onClick={discard} className="flex min-h-[40px] items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200">
                  <RotateCcw className="h-3 w-3" /> Discard
                </button>
              </div>

              {plan.exercises.map((pe, i) => {
                const ex = getExercise(pe.exerciseId);
                if (!ex) return null;
                const owned = activeProfile.equipment;
                const easier = ex.easier ? getExercise(ex.easier) : undefined;
                const harder = ex.harder ? getExercise(ex.harder) : undefined;
                const inPlan = plan.exercises.map((x) => x.exerciseId);
                return (
                  <ExerciseCard
                    key={pe.uid}
                    index={i}
                    planExercise={pe}
                    exercise={ex}
                    sets={session.sets[pe.uid] ?? []}
                    lastWeightKg={weights[ex.id]}
                    easier={easier && hasEquipment(easier, owned) && !inPlan.includes(easier.id) ? easier : undefined}
                    harder={harder && hasEquipment(harder, owned) && !inPlan.includes(harder.id) ? harder : undefined}
                    alternatives={alternativesFor(ex.id, activeProfile, inPlan)}
                    unitSystem={unitSystem}
                    onToggleSet={(idx) => toggleSet(pe.uid, idx)}
                    onChangeSet={(idx, patch) => changeSet(pe.uid, idx, patch)}
                    onSwap={(id) => swapExercise(pe.uid, id)}
                    onStartHold={(secs, label) => {
                      unlockAudio();
                      timer.start(secs, `Hold: ${label}`);
                    }}
                    onOpenAnimation={() => setSelectedAnimationEx(ex)}
                  />
                );
              })}
            </section>

            <section className={`rounded-2xl border p-4 ${allDone ? "border-emerald-500/40 bg-emerald-500/10" : "border-zinc-800 bg-zinc-900/60"}`}>
              <p className="mb-3 text-sm text-zinc-300">
                {allDone
                  ? "All sets done. Log how it felt so your next session adapts."
                  : "Done early or short on time? You can finish any time and still log it."}
              </p>
              <button
                onClick={() => setShowFinish(true)}
                className={`min-h-[48px] w-full rounded-xl font-bold ${allDone ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950" : "border border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700"}`}
              >
                Finish workout
              </button>
              {session.startedAt && t && (
                <p className="mt-2 text-center text-[11px] text-zinc-500">~{kcalEstimate(activeProfile.weightKg, Math.max(1, elapsedMin ?? 0))} kcal so far (estimate)</p>
              )}
            </section>
          </>
        )}

        <p className="pb-4 text-center text-[11px] leading-relaxed text-zinc-600">
          Training suggestions only, not medical advice. Stop if something hurts, and check with a professional if you have a condition or injury.
        </p>
      </main>

      <RestTimer
        state={timer.state}
        seconds={timer.seconds}
        label={timer.label}
        progress={timer.progress}
        onPause={timer.pause}
        onResume={timer.resume}
        onAdjust={timer.adjust}
        onStop={timer.stop}
      />

      {(showProfile || needsSetup) && (
        <ProfileSheet
          open
          firstRun={needsSetup}
          profile={activeProfile}
          accessCode={accessCode}
          geminiKey={geminiKey}
          unitSystem={unitSystem}
          onSave={saveProfile}
          onClose={() => setShowProfile(false)}
        />
      )}

      {showFinish && session && (
        <FinishSheet open session={session} weightKg={activeProfile.weightKg} onSave={finish} onClose={() => setShowFinish(false)} />
      )}

      <DietSheet
        open={showDietSheet}
        weightKg={activeProfile.weightKg}
        heightCm={activeProfile.heightCm}
        bmi={stats.bmi}
        bmiCategory={stats.bmiCategory}
        tdee={stats.tdee}
        initialGoal={activeProfile.dietGoal ?? (activeProfile.goal === "muscle" ? "muscle" : "recomp")}
        onClose={() => setShowDietSheet(false)}
      />

      <ExerciseAnimationModal
        exercise={selectedAnimationEx}
        easier={selectedAnimationEx?.easier ? getExercise(selectedAnimationEx.easier) : undefined}
        harder={selectedAnimationEx?.harder ? getExercise(selectedAnimationEx.harder) : undefined}
        onClose={() => setSelectedAnimationEx(null)}
        onSwap={
          session && selectedAnimationEx
            ? (newId) => {
                const pe = session.plan.exercises.find((e) => e.exerciseId === selectedAnimationEx.id);
                if (pe) swapExercise(pe.uid, newId);
                setSelectedAnimationEx(getExercise(newId) ?? null);
              }
            : undefined
        }
      />
    </div>
  );
}
