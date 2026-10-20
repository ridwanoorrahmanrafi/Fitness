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
  Home,
  User as UserIcon,
  Target,
  Database,
  Cloud,
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
import { ExerciseLibraryModal } from "@/components/ExerciseLibraryModal";
import { GoalsProgressView } from "@/components/GoalsProgressView";
import { LandingPage } from "@/components/LandingPage";
import { HunterAuthModal } from "@/components/HunterAuthModal";
import { Chip } from "@/components/Sheet";
import Image from "next/image";
import SoloLevelingStatusModal from "@/components/SoloLevelingStatusModal";
import DailyQuestCard from "@/components/DailyQuestCard";
import AriseAwakeningOverlay from "@/components/AriseAwakeningOverlay";
import SystemNotificationToast, { type SystemToast } from "@/components/SystemNotificationToast";
import { SoloLevelingWelcomeOnboarding } from "@/components/SoloLevelingWelcomeOnboarding";
import { SoloLevelingWelcomeBackModal } from "@/components/SoloLevelingWelcomeBackModal";
import { getTodaySchedule } from "@/lib/schedule";
import {
  type PlayerStats,
  type DailySystemQuest,
  getDefaultPlayerStats,
  loadPlayerStats,
  savePlayerStats,
  addPlayerExp,
  getTodaySystemQuest,
  saveTodaySystemQuest,
} from "@/lib/systemStats";
import { useCountdown } from "@/hooks/useCountdown";
import { useStoredState } from "@/hooks/useStoredState";
import { useWakeLock } from "@/hooks/useWakeLock";
import { playSound, unlockAudio, vibrate } from "@/lib/audio";
import { alternativesFor, buildOfflinePlan, estimateMinutes, focusLabel, prescribe } from "@/lib/builder";
import { kcalEstimate, profileStats, macroTargets } from "@/lib/calc";
import { WARMUP_MAP, getExercise, hasEquipment } from "@/lib/exercises";
import { buildFeedback, initSets, lastWeights, normalizeHistory, normalizeSession, totals } from "@/lib/session";
import { KEYS, makeBackup, mergeHistory, parseProfile, readBackup } from "@/lib/storage";
import { evaluateUserProgress } from "@/lib/evaluation";
import { generateInitialGoals, evaluateAndUpdateGoals } from "@/lib/goals";
import {
  isSupabaseConfigured,
  getSupabaseClient,
  syncWorkoutToSupabase,
  syncProfileToSupabase,
  syncGoalsToSupabase,
  syncEvaluationToSupabase,
  syncPlayerStatsToSupabase,
  pullUserCloudData,
  pullPlayerStatsFromSupabase,
  pullUserProfileFromSupabase,
} from "@/lib/supabase";
import { type Language, TRANSLATIONS, FOCUS_LABELS_I18N } from "@/lib/i18n";
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
  type UserAccount,
  type UserGoal,
  type ProgressEvaluation,
} from "@/lib/types";

type View = "today" | "goals" | "history";
type ActiveView = "landing" | "app";

export default function Page() {
  const [profile, setProfile, profileReady] = useStoredState<Profile | null>(KEYS.profile, null, parseProfile);
  const [session, setSession, sessionReady] = useStoredState<Session | null>(KEYS.session, null, normalizeSession);
  const [history, setHistory, historyReady] = useStoredState<HistoryEntry[]>(KEYS.history, [], normalizeHistory);
  const [accessCode, setAccessCode] = useStoredState<string>(KEYS.access, "");
  const [geminiKey, setGeminiKey] = useStoredState<string>(KEYS.geminiKey, "");
  const [unitSystem, setUnitSystem] = useStoredState<"metric" | "imperial">(KEYS.unitSystem, "metric");
  const [lang, setLang] = useStoredState<Language>(KEYS.language, "bn");
  const [soundOn, setSoundOn] = useStoredState<boolean>(KEYS.sound, true);
  const [hasVisited, setHasVisited, hasVisitedReady] = useStoredState<boolean>(KEYS.hasVisited, false);
  const [activeUser, setActiveUser] = useStoredState<UserAccount | null>(KEYS.activeUser, null);
  const [accounts, setAccounts] = useStoredState<UserAccount[]>(KEYS.accounts, []);

  const tr = TRANSLATIONS[lang] ?? TRANSLATIONS.bn;

  const [activeView, setActiveView] = useState<ActiveView>("app");
  const [view, setView] = useState<View>("today");
  const [showProfile, setShowProfile] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFinish, setShowFinish] = useState(false);
  const [showDietSheet, setShowDietSheet] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);

  const [selectedAnimationEx, setSelectedAnimationEx] = useState<Exercise | null>(null);
  const [warmupOpen, setWarmupOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());

  // Solo Leveling System State
  const [playerStats, setPlayerStats] = useState<PlayerStats>(getDefaultPlayerStats);
  const [dailyQuest, setDailyQuest] = useState<DailySystemQuest>(getTodaySystemQuest);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAriseModal, setShowAriseModal] = useState(false);
  const [ariseModalText, setAriseModalText] = useState<{ title: string; subtitle: string }>({
    title: "ARISE",
    subtitle: "THE SHADOW MONARCH AWAKENS",
  });
  const [toasts, setToasts] = useState<SystemToast[]>([]);

  const addSystemToast = useCallback((title: string, message: string) => {
    playSound("system-alert");
    vibrate(25);
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newToast: SystemToast = { id, title, message };
    setToasts((prev) => [...prev.slice(-3), newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  // Hydrate Solo Leveling System State on client mount
  useEffect(() => {
    setPlayerStats(loadPlayerStats());
    setDailyQuest(getTodaySystemQuest());
  }, []);

  // URL Hash & return visitor synchronization for intuitive forward/back browser navigation
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === "#landing" || hash === "#home") {
        setActiveView("landing");
      } else if (hash === "#onboarding" || hash === "#welcome") {
        setActiveView("app");
        setShowWelcomeOnboarding(true);
      } else {
        setActiveView("app");
        if (hash === "#history") {
          setView("history");
        } else if (hash === "#goals" || hash === "#evaluation" || hash === "#progress") {
          setView("goals");
        } else if (hash === "#diet") {
          setShowDietSheet(true);
        } else if (hash === "#library" || hash === "#exercises" || hash === "#animations") {
          setShowLibraryModal(true);
        } else if (hash === "#auth" || hash === "#login") {
          setShowAuthModal(true);
        } else if (hash === "#status" || hash === "#stats" || hash === "#system") {
          setShowStatusModal(true);
        } else if (hash === "#arise") {
          setShowAriseModal(true);
        } else {
          setView("today");
        }
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const timer = useCountdown(soundOn);
  const ready = profileReady && sessionReady && historyReady;
  const needsSetup = ready && !profile;
  const activeProfile = profile ?? DEFAULT_PROFILE;

  // Solo Leveling Welcome Experience State
  const [showWelcomeOnboarding, setShowWelcomeOnboarding] = useState(false);
  const [showWelcomeBackModal, setShowWelcomeBackModal] = useState(false);
  const todaySchedule = useMemo(() => getTodaySchedule(activeProfile.workoutDays ?? [1, 3, 5]), [activeProfile.workoutDays]);

  // Solo Leveling System Launch Greeting: First-time Onboarding or Returning Hunter Briefing
  useEffect(() => {
    if (!profileReady) return;
    if (!profile) {
      setShowWelcomeOnboarding(true);
    } else {
      const welcomedThisSession = sessionStorage.getItem("arise_session_welcomed");
      if (!welcomedThisSession) {
        sessionStorage.setItem("arise_session_welcomed", "true");
        setShowWelcomeBackModal(true);
      }
    }
  }, [profileReady, profile]);
  const [goals, setGoals, goalsReady] = useStoredState<UserGoal[]>(KEYS.userGoals, []);
  const [evaluation, setEvaluation, evalReady] = useStoredState<ProgressEvaluation | null>(KEYS.evaluations, null);

  // Initialize goals and evaluation when storage is hydrated
  useEffect(() => {
    if (!goalsReady || !evalReady) return;
    const userId = activeUser?.id ?? "default";
    if (goals.length === 0) {
      setGoals(generateInitialGoals(activeProfile, userId));
    }
    if (!evaluation) {
      setEvaluation(evaluateUserProgress(history, activeProfile, userId));
    }
  }, [goalsReady, evalReady, activeProfile, activeUser?.id, goals.length, evaluation, history, setGoals, setEvaluation]);

  // Supabase Auth session listener & automatic bi-directional cloud data synchronization
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    // 1. Check existing session on mount
    void supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (currentSession?.user) {
        const u = currentSession.user;
        const hunterName =
          (u.user_metadata?.hunter_name as string) ||
          u.email?.split("@")[0] ||
          "Hunter";

        const cloudAccount: UserAccount = {
          id: u.id,
          name: hunterName,
          emailOrHandle: u.email,
          createdAt: new Date(u.created_at).getTime(),
          lastActive: Date.now(),
          profile: activeProfile,
          supabaseUser: true,
        };
        setActiveUser(cloudAccount);

        // Pull full cloud records
        void pullUserCloudData(u.id).then(({ workouts, goals: cloudGoals, evaluations: cloudEvals }) => {
          if (workouts.length > 0) setHistory(workouts);
          if (cloudGoals.length > 0) setGoals(cloudGoals);
          if (cloudEvals.length > 0 && cloudEvals[0]) setEvaluation(cloudEvals[0]);
        });
        void pullPlayerStatsFromSupabase(u.id).then((cloudStats) => {
          if (cloudStats) {
            setPlayerStats(cloudStats);
            savePlayerStats(cloudStats);
          }
        });
        void pullUserProfileFromSupabase(u.id).then((cloudProfile) => {
          if (cloudProfile?.profile) {
            setProfile(cloudProfile.profile);
          }
        });
      }
    });

    // 2. Listen to auth state transitions (Sign in, Sign out, Token Refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && newSession?.user) {
        const u = newSession.user;
        const hunterName =
          (u.user_metadata?.hunter_name as string) ||
          u.email?.split("@")[0] ||
          "Hunter";

        const cloudAccount: UserAccount = {
          id: u.id,
          name: hunterName,
          emailOrHandle: u.email,
          createdAt: new Date(u.created_at).getTime(),
          lastActive: Date.now(),
          profile: activeProfile,
          supabaseUser: true,
        };
        setActiveUser(cloudAccount);

        addSystemToast(
          lang === "bn" ? "[ ক্লাউড অথেন্টিকেশন : সফল ]" : "[ CLOUD AUTHENTICATION : VERIFIED ]",
          lang === "bn"
            ? `স্বাগতম হান্টার ${hunterName}! সুপাবেস ক্লাউডে যুক্ত হয়েছেন।`
            : `Welcome Hunter ${hunterName}! Synchronized with Supabase Cloud.`
        );

        // Pull full cloud data
        const { workouts, goals: cloudGoals, evaluations: cloudEvals } = await pullUserCloudData(u.id);
        if (workouts.length > 0) setHistory(workouts);
        if (cloudGoals.length > 0) setGoals(cloudGoals);
        if (cloudEvals.length > 0 && cloudEvals[0]) setEvaluation(cloudEvals[0]);

        const cloudStats = await pullPlayerStatsFromSupabase(u.id);
        if (cloudStats) {
          setPlayerStats(cloudStats);
          savePlayerStats(cloudStats);
        } else {
          void syncPlayerStatsToSupabase(playerStats, u.id);
        }

        const cloudProfile = await pullUserProfileFromSupabase(u.id);
        if (cloudProfile?.profile) {
          setProfile(cloudProfile.profile);
        } else {
          void syncProfileToSupabase(activeProfile, u.id);
        }
      } else if (event === "SIGNED_OUT") {
        setActiveUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleForceCloudSync = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const userId = activeUser?.id ?? "default";
    await Promise.all([
      syncProfileToSupabase(activeProfile, userId),
      syncPlayerStatsToSupabase(playerStats, userId),
      goals.length > 0 ? syncGoalsToSupabase(goals, userId) : Promise.resolve(true),
      evaluation ? syncEvaluationToSupabase(evaluation, userId) : Promise.resolve(true),
      history[0] ? syncWorkoutToSupabase(history[0], userId) : Promise.resolve(true),
    ]);
  }, [activeProfile, activeUser?.id, evaluation, goals, history, playerStats]);

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

  const saveProfile = (p: Profile, code: string, key?: string, unit?: "metric" | "imperial", l?: Language) => {
    const first = !profile;
    setProfile(p);
    setAccessCode(code);
    if (key !== undefined) setGeminiKey(key);
    if (unit !== undefined) setUnitSystem(unit);
    if (l !== undefined) setLang(l);
    setShowProfile(false);
    if (isSupabaseConfigured()) {
      void syncProfileToSupabase(p, activeUser?.id ?? "default");
    }
    if (first) void generate(p);
  };

  const handleCompleteWelcomeOnboarding = (newProfile: Profile, hunterName: string) => {
    setProfile(newProfile);
    setShowProfile(false);
    setShowWelcomeOnboarding(false);
    setHasVisited(true);
    sessionStorage.setItem("arise_session_welcomed", "true");

    const currentStats = loadPlayerStats();
    const updatedStats: PlayerStats = {
      ...currentStats,
      name: hunterName || currentStats.name,
    };
    savePlayerStats(updatedStats);
    setPlayerStats(updatedStats);

    if (activeUser) {
      const updatedUser: UserAccount = {
        ...activeUser,
        name: hunterName || activeUser.name,
        profile: newProfile,
      };
      setActiveUser(updatedUser);
      setAccounts((prev) => prev.map((a) => (a.id === updatedUser.id ? updatedUser : a)));
    } else if (hunterName) {
      const newAcc: UserAccount = {
        id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: hunterName,
        pin: "1234",
        createdAt: Date.now(),
        lastActive: Date.now(),
        profile: newProfile,
      };
      setAccounts((prev) => [...prev, newAcc]);
      setActiveUser(newAcc);
    }

    if (isSupabaseConfigured()) {
      const currentId = activeUser?.id ?? "default";
      void syncProfileToSupabase(newProfile, currentId);
      void syncPlayerStatsToSupabase(updatedStats, currentId);
    }

    void generate(newProfile);

    setActiveView("app");
    setView("today");
    window.location.hash = "app";

    addSystemToast(
      lang === "bn" ? "[ সিস্টেম এক্টিভেটেড ]" : "[ SYSTEM ACTIVATED ]",
      lang === "bn"
        ? `স্বাগতম খেলোয়াড় ${hunterName}! আপনার দৈনিক মিশন প্রস্তুত।`
        : `Welcome Player ${hunterName}! Daily quest initialized.`
    );
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

    // Solo Leveling System: Award +25 EXP per completed set
    const expResult = addPlayerExp(playerStats, 25);
    setPlayerStats(expResult.stats);
    addSystemToast(
      lang === "bn" ? "[ সিস্টেম নোটিফিকেশন : সতর্কবার্তা ]" : "[ SYSTEM NOTIFICATION : ALERT ]",
      lang === "bn"
        ? `কমব্যাট সেট সম্পন্ন। +২৫ EXP অর্জিত। (${expResult.stats.exp} / ${expResult.stats.expToNext} EXP)`
        : `Combat set complete. +25 EXP acquired. (${expResult.stats.exp} / ${expResult.stats.expToNext} EXP)`
    );
    if (expResult.leveledUp) {
      setAriseModalText({
        title: `LEVEL UP : Lv. ${expResult.stats.level}`,
        subtitle: `HUNTER RANK: ${expResult.stats.rank} · ALL GAUGES RESTORED`,
      });
      setShowAriseModal(true);
    }

    if (t.setsDone + 1 === t.setsTotal) {
      timer.stop();
      if (soundOn) playSound("complete");
      vibrate([100, 50, 100, 50, 200]);
    } else {
      if (soundOn) playSound("set");
      timer.start(pe.restSeconds, `Rest after ${ex.name}`);
    }
  };

  const handleClaimDailyQuest = () => {
    const expResult = addPlayerExp(playerStats, 300);
    const updated: PlayerStats = {
      ...expResult.stats,
      unallocatedPoints: expResult.stats.unallocatedPoints + 3,
      fatigue: 0,
      hp: { ...expResult.stats.hp, current: expResult.stats.hp.max },
      mp: { ...expResult.stats.mp, current: expResult.stats.mp.max },
    };
    savePlayerStats(updated);
    setPlayerStats(updated);
    addSystemToast(
      lang === "bn" ? "[ কোয়েস্ট পুরষ্কার : সম্পন্ন ]" : "[ QUEST REWARD : CLAIMED ]",
      lang === "bn"
        ? "দৈনিক কোয়েস্ট সম্পন্ন! ক্লান্তি ০% এ নামিয়ে আনা হয়েছে। +৩ স্ট্যাট পয়েন্ট যোগ হলো।"
        : "Daily Quest Cleared! Fatigue purged to 0%. +3 Stat Points awarded."
    );
    setAriseModalText({
      title: "DAILY QUEST REWARD CLAIMED",
      subtitle: "STATUS RECOVERY 100% · +3 STAT POINTS ACQUIRED",
    });
    setShowAriseModal(true);
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
    const newHistory = mergeHistory(history, [entry]);
    setHistory(newHistory);

    // Continuous progress evaluation & adaptive goals progression
    const userId = activeUser?.id ?? "default";
    const newEval = evaluateUserProgress(newHistory, activeProfile, userId);
    setEvaluation(newEval);

    const { updatedGoals } = evaluateAndUpdateGoals(goals, newHistory, activeProfile, userId);
    setGoals(updatedGoals);

    // Solo Leveling System: Dungeon Clear +250 EXP!
    const dungeonExp = addPlayerExp(playerStats, 250);
    const updatedStats: PlayerStats = {
      ...dungeonExp.stats,
      totalWorkoutsCleared: (dungeonExp.stats.totalWorkoutsCleared || 0) + 1,
      totalSetsCompleted: (dungeonExp.stats.totalSetsCompleted || 0) + t.setsDone,
    };
    savePlayerStats(updatedStats);
    setPlayerStats(updatedStats);

    // Sync to Supabase cloud database if configured
    if (isSupabaseConfigured()) {
      void syncWorkoutToSupabase(entry, userId);
      void syncProfileToSupabase(activeProfile, userId);
      void syncGoalsToSupabase(updatedGoals, userId);
      void syncEvaluationToSupabase(newEval, userId);
      void syncPlayerStatsToSupabase(updatedStats, userId);
    }
    addSystemToast(
      lang === "bn" ? "[ অন্ধকূপ জয় : ডানজন ক্লিয়ার ]" : "[ DUNGEON CLEARED : CONQUERED ]",
      lang === "bn"
        ? "ডানজন বস পরাজিত! +২৫০ EXP এবং ক্লিয়ার রিওয়ার্ড লিপিবদ্ধ হয়েছে।"
        : "Dungeon Boss Defeated! +250 EXP and clear rewards recorded."
    );

    if (dungeonExp.leveledUp) {
      setAriseModalText({
        title: `DUNGEON CLEARED · LEVEL UP!`,
        subtitle: `NEW LEVEL: Lv. ${updatedStats.level} · RANK: ${updatedStats.rank}`,
      });
      setShowAriseModal(true);
    }

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

  if (activeView === "landing") {
    return (
      <div className="min-h-screen bg-[#020510] text-cyan-100 system-grid-bg">
        <LandingPage
          lang={lang}
          userName={activeUser?.name}
          onLanguageToggle={() => setLang(lang === "bn" ? "en" : "bn")}
          onLaunchApp={() => {
            setHasVisited(true);
            setActiveView("app");
            window.location.hash = "app";
            if (!profile) {
              setShowWelcomeOnboarding(true);
            }
          }}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenDiet={() => setShowDietSheet(true)}
          onOpenExercises={() => setShowLibraryModal(true)}
        />

        <SoloLevelingWelcomeOnboarding
          open={showWelcomeOnboarding}
          initialProfile={activeProfile}
          initialName={activeUser?.name || playerStats.name}
          lang={lang}
          onLanguageChange={setLang}
          onComplete={handleCompleteWelcomeOnboarding}
          onClose={() => setShowWelcomeOnboarding(false)}
        />

        <SoloLevelingWelcomeBackModal
          open={showWelcomeBackModal}
          stats={playerStats}
          quest={dailyQuest}
          isWorkoutDay={todaySchedule.isWorkoutDay}
          focusTitle={lang === "bn" ? `${todaySchedule.bengaliName} · ${todaySchedule.sessionTitle}` : `${todaySchedule.dayName} · ${todaySchedule.sessionTitle}`}
          lang={lang}
          onLanguageChange={setLang}
          onStartWorkout={() => {
            setShowWelcomeBackModal(false);
            setActiveView("app");
            setView("today");
            window.location.hash = "app";
            if (!session) {
              void generate(activeProfile);
            }
          }}
          onOpenQuest={() => {
            setShowWelcomeBackModal(false);
            setActiveView("app");
            setView("today");
            window.location.hash = "app";
            const el = document.getElementById("daily-quest-card");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          onOpenStatus={() => {
            setShowWelcomeBackModal(false);
            setActiveView("app");
            setShowStatusModal(true);
          }}
          onClose={() => setShowWelcomeBackModal(false)}
        />

        <HunterAuthModal
          open={showAuthModal}
          lang={lang}
          activeAccount={activeUser}
          accounts={accounts}
          geminiKey={geminiKey}
          onSaveGeminiKey={setGeminiKey}
          onSelectAccount={(acc) => {
            setActiveUser(acc);
            if (acc?.profile) setProfile(acc.profile);
          }}
          onCreateAccount={(name, pin) => {
            const newAcc: UserAccount = {
              id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              name,
              pin,
              createdAt: Date.now(),
              lastActive: Date.now(),
              profile: activeProfile,
            };
            setAccounts((prev) => [...prev, newAcc]);
            setActiveUser(newAcc);
          }}
          onSyncCloud={handleForceCloudSync}
          onClose={() => setShowAuthModal(false)}
        />

        <DietSheet
          open={showDietSheet}
          weightKg={activeProfile.weightKg}
          heightCm={activeProfile.heightCm}
          bmi={stats.bmi}
          bmiCategory={stats.bmiCategory}
          tdee={stats.tdee}
          initialGoal={activeProfile.dietGoal ?? (activeProfile.goal === "muscle" ? "muscle" : "recomp")}
          lang={lang}
          geminiKey={geminiKey}
          accessCode={accessCode}
          onClose={() => setShowDietSheet(false)}
        />
      </div>
    );
  }

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
      <header className="sticky top-0 z-30 border-b border-cyan-500/30 bg-[#040817]/90 px-4 py-3 backdrop-blur-md shadow-[0_4px_25px_rgba(6,182,212,0.15)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
          {/* Brand Logo & Solo Leveling System Title */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                playSound("system-alert");
                setShowStatusModal(true);
              }}
              title="Open Solo Leveling System Status Window"
              className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
            >
              <div className="relative h-10 w-10 rounded-xl overflow-hidden border-2 border-cyan-400 shadow-md shadow-cyan-500/30 group-hover:scale-105 transition-transform shrink-0">
                <Image
                  src="/images/solo-leveling/system-crest-icon.jpg"
                  alt="Solo Leveling System Crest"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="flex items-center gap-1.5 text-base font-black tracking-wide text-white">
                  ARISE
                  <span className="rounded border border-cyan-400/50 bg-cyan-950/80 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                    [ SYSTEM ]
                  </span>
                </h1>
                <p className="text-[11px] font-mono text-cyan-400/80 flex items-center gap-1">
                  <span>{lang === "bn" ? "স্ট্যাটাস" : "STATUS"} : Lv.{playerStats.level}</span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-purple-300 font-bold">{playerStats.rank}-RANK</span>
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Group (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-1.5">
            {/* System Status Modal Trigger */}
            <button
              id="btn-desktop-system-status"
              type="button"
              onClick={() => {
                playSound("system-alert");
                setShowStatusModal(true);
              }}
              className="flex h-11 items-center gap-2 rounded-xl border border-cyan-500/50 bg-cyan-950/40 px-3 text-xs font-mono font-bold text-cyan-300 hover:border-cyan-400 hover:bg-cyan-900/40 shadow-[0_0_15px_rgba(6,182,212,0.25)] active:scale-95 transition-all"
            >
              <Activity className="h-4 w-4 text-cyan-400" />
              <span>{lang === "bn" ? "[ STATUS : স্ট্যাটাস ]" : "[ STATUS : ATTRIBUTES ]"}</span>
            </button>

            {/* ARISE Awakening Button */}
            <button
              id="btn-desktop-arise"
              type="button"
              onClick={() => {
                playSound("arise");
                vibrate([50, 100, 50]);
                setAriseModalText({
                  title: lang === "bn" ? "ARISE : জাগ্রত হও" : "ARISE : AWAKEN",
                  subtitle: lang === "bn" ? "শ্যাডো মনার্ক জাগ্রত হচ্ছে" : "THE SHADOW MONARCH AWAKENS",
                });
                setShowAriseModal(true);
              }}
              className="flex h-11 items-center gap-1.5 rounded-xl border border-purple-500/50 bg-gradient-to-r from-purple-900/60 to-indigo-950/60 px-3 text-xs font-black text-purple-200 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] active:scale-95 transition-all"
            >
              <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
              <span>ARISE</span>
            </button>

            <button
              id="btn-nav-home"
              type="button"
              onClick={() => {
                setActiveView("landing");
                window.location.hash = "landing";
              }}
              aria-label={tr.navHome}
              title={tr.navHome}
              className="flex h-11 items-center gap-1.5 rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-3 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <Home className="h-4 w-4 text-cyan-400" />
              <span>{tr.navHome}</span>
            </button>

            <button
              id="btn-auth-user"
              type="button"
              onClick={() => setShowAuthModal(true)}
              aria-label={tr.authTitle}
              title={activeUser ? `${activeUser.name} (${activeUser.supabaseUser ? "Supabase Cloud Synced" : "Local"})` : "Guest Profile"}
              className={`flex h-11 items-center gap-1.5 rounded-xl border px-2.5 text-xs font-semibold transition-all ${
                activeUser?.supabaseUser
                  ? "border-emerald-500/50 bg-emerald-950/30 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.25)]"
                  : "border-zinc-700/60 bg-zinc-800/60 text-zinc-200 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              {activeUser?.supabaseUser ? (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              ) : (
                <UserIcon className="h-4 w-4 text-cyan-400" />
              )}
              <span className="max-w-[80px] truncate">
                {activeUser ? activeUser.name : (lang === "bn" ? "গেস্ট" : "Guest")}
              </span>
            </button>

            <button
              id="btn-lang-toggle"
              type="button"
              onClick={() => setLang(lang === "bn" ? "en" : "bn")}
              aria-label={lang === "bn" ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
              title={lang === "bn" ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
              className="flex h-11 items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-zinc-800/80 px-3 text-xs font-bold text-zinc-100 hover:border-cyan-500 hover:bg-zinc-800 shadow-sm transition-colors"
            >
              <span className="text-sm">🌐</span>
              <span className="font-bold text-cyan-400">{lang === "bn" ? "EN" : "বাংলা"}</span>
            </button>

            <button
              id="btn-nav-library"
              onClick={() => setShowLibraryModal(true)}
              aria-label={lang === "bn" ? "হান্টার আর্সেনাল ও অ্যানিমেশন" : "Hunter Arsenal & Animations"}
              title={lang === "bn" ? "সম্পূর্ণ হান্টার আর্সেনাল ও অ্যানিমেশন" : "Browse hunter arsenal & movements"}
              className="flex h-11 items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 active:scale-95 transition-all shadow-sm"
            >
              <Dumbbell className="h-4 w-4 text-cyan-400" />
              <span>{lang === "bn" ? "আর্সেনাল" : "Arsenal"}</span>
            </button>

            <button
              id="btn-bangladeshi-diet"
              onClick={() => setShowDietSheet(true)}
              aria-label={tr.dietBtn}
              title={tr.dietBtn}
              className="flex h-11 items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 text-xs font-semibold text-cyan-400 hover:bg-cyan-500/20 shadow-sm transition-colors"
            >
              <Utensils className="h-4 w-4" />
              <span>{tr.dietBtnShort}</span>
            </button>

            <button
              onClick={() => {
                unlockAudio();
                setSoundOn(!soundOn);
              }}
              aria-label={soundOn ? tr.soundMute : tr.soundUnmute}
              aria-pressed={soundOn}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-700/60 bg-zinc-800/60 hover:bg-zinc-800"
            >
              {soundOn ? <Volume2 className="h-4 w-4 text-cyan-400" /> : <VolumeX className="h-4 w-4 text-zinc-500" />}
            </button>

            <button
              onClick={() => setView(view === "goals" ? "today" : "goals")}
              aria-label="Quests & Hunter Progression"
              aria-pressed={view === "goals"}
              title={lang === "bn" ? "কোয়েস্ট ও হান্টার র‍্যাঙ্ক" : "Quests & Hunter Rank Progression"}
              className={`flex h-11 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-all active:scale-95 ${
                view === "goals"
                  ? "border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow-sm"
                  : "border-zinc-700/60 bg-zinc-800/60 text-zinc-300 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <Target className="h-4 w-4 text-cyan-400" />
              <span>{lang === "bn" ? "কোয়েস্ট ও র‍্যাঙ্ক" : "Quests"}</span>
            </button>

            <button
              onClick={() => setView(view === "history" ? "today" : "history")}
              aria-label={view === "history" ? "Back to today" : tr.historyBtn}
              aria-pressed={view === "history"}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-700/60 bg-zinc-800/60 hover:bg-zinc-800"
            >
              <HistoryIcon className={`h-4 w-4 ${view === "history" ? "text-cyan-400" : "text-zinc-300"}`} />
            </button>

            <button
              onClick={() => setShowProfile(true)}
              aria-label={tr.profileBtn}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile Clean Top Bar */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Mobile Status Pill */}
            <button
              id="btn-mobile-system-status"
              type="button"
              onClick={() => {
                playSound("system-alert");
                setShowStatusModal(true);
              }}
              className="flex h-10 items-center gap-1.5 px-2 rounded-xl bg-cyan-950/60 border border-cyan-400/50 text-cyan-300 text-xs font-mono font-bold active:scale-95 transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)]"
            >
              <span className="text-[11px] font-black">Lv.{playerStats.level}</span>
              <span className="px-1 py-0.5 rounded text-[9px] bg-cyan-500/20 text-cyan-200 border border-cyan-400/40">
                {playerStats.rank}
              </span>
            </button>

            {/* Mobile Arise Button */}
            <button
              id="btn-mobile-arise"
              type="button"
              onClick={() => {
                playSound("arise");
                vibrate([40, 80, 40]);
                setAriseModalText({
                  title: lang === "bn" ? "ARISE : জাগ্রত হও" : "ARISE : AWAKEN",
                  subtitle: lang === "bn" ? "শ্যাডো মনার্ক জাগ্রত হচ্ছে" : "THE SHADOW MONARCH AWAKENS",
                });
                setShowAriseModal(true);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/50 bg-purple-950/60 text-purple-300 active:scale-95 transition-all shadow-[0_0_10px_rgba(168,85,247,0.3)]"
            >
              <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
            </button>

            {/* Mobile Supabase Cloud Sync Button */}
            <button
              id="btn-mobile-supabase-cloud"
              type="button"
              onClick={() => setShowAuthModal(true)}
              aria-label="Supabase Cloud"
              title={isSupabaseConfigured() ? "Supabase Cloud: Connected" : "Configure Supabase"}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border active:scale-95 transition-all ${
                isSupabaseConfigured()
                  ? "border-cyan-500/60 bg-cyan-950/60 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                  : "border-zinc-700/60 bg-zinc-800/60 text-zinc-400"
              }`}
            >
              <Database className={`h-4 w-4 ${isSupabaseConfigured() ? "text-cyan-400" : "text-zinc-500"}`} />
            </button>

            <button
              id="btn-lang-toggle-mobile"
              type="button"
              onClick={() => setLang(lang === "bn" ? "en" : "bn")}
              aria-label={lang === "bn" ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
              className="flex h-10 items-center gap-1 rounded-xl border border-cyan-500/30 bg-zinc-800/80 px-2 text-xs font-bold text-zinc-100 hover:border-cyan-500 active:scale-95 transition-all shadow-sm"
            >
              <span className="text-xs">🌐</span>
              <span className="font-bold text-cyan-400 text-xs">{lang === "bn" ? "EN" : "বাংলা"}</span>
            </button>

            <button
              onClick={() => {
                unlockAudio();
                setSoundOn(!soundOn);
              }}
              aria-label={soundOn ? tr.soundMute : tr.soundUnmute}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700/60 bg-zinc-800/60 active:scale-95"
            >
              {soundOn ? <Volume2 className="h-4 w-4 text-cyan-400" /> : <VolumeX className="h-4 w-4 text-zinc-500" />}
            </button>

            <button
              onClick={() => setShowProfile(true)}
              aria-label={tr.profileBtn}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 active:scale-95"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {view === "today" && session && t && (
          <div className="mx-auto mt-2.5 max-w-3xl">
            <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-zinc-400">
              <span className="flex items-center gap-1">
                <Activity className="h-3.5 w-3.5 text-emerald-400" /> {tr.sessionProgress}
                {elapsedMin !== null && <span className="text-zinc-500">· {elapsedMin} {tr.minIn}</span>}
              </span>
              <span className="font-semibold text-emerald-400">
                {t.setsTotal ? Math.round((t.setsDone / t.setsTotal) * 100) : 0}% ({t.setsDone}/{t.setsTotal} {tr.sets})
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
            lang={lang}
            onExport={exportData}
            onImport={importData}
            onClear={() => setHistory([])}
          />
        ) : view === "goals" ? (
          <GoalsProgressView
            goals={goals}
            evaluation={evaluation}
            history={history}
            profile={activeProfile}
            lang={lang}
            onSyncCloud={async () => {
              const userId = activeUser?.id ?? "default";
              await syncProfileToSupabase(activeProfile, userId);
              for (const h of history) {
                await syncWorkoutToSupabase(h, userId);
              }
              await syncGoalsToSupabase(goals, userId);
              if (evaluation) {
                await syncEvaluationToSupabase(evaluation, userId);
              }
            }}
            onOpenSupabaseConfig={() => setShowAuthModal(true)}
            onAddCustomGoal={(newGoal) => {
              const fullGoal: UserGoal = {
                ...newGoal,
                id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                createdAt: Date.now(),
                currentValue: 0,
                status: "active",
              };
              setGoals((prev) => [fullGoal, ...prev]);
              if (isSupabaseConfigured()) {
                void syncGoalsToSupabase([fullGoal], activeUser?.id ?? "default");
              }
            }}
          />
        ) : !plan || !session ? (
          // ---------------- empty state with Solo Leveling System Quest ----------------
          <section className="space-y-4">
            {saved && (
              <div role="status" className="flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-950/40 p-3 text-sm text-cyan-200">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" /> {saved}
              </div>
            )}

            {/* Solo Leveling Daily System Quest (100 pushups, 100 situps, 100 squats, 10km run) */}
            <DailyQuestCard
              quest={dailyQuest}
              lang={lang}
              onUpdateQuest={setDailyQuest}
              onClaimReward={handleClaimDailyQuest}
            />

            {/* Weekly Schedule & Smart Split Bar */}
            <WeeklyScheduleBar
              workoutDays={activeProfile.workoutDays ?? [1, 3, 5]}
              lang={lang}
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

            {/* Solo Leveling Dungeon Gate Generation Card */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-cyan-500/40 bg-gradient-to-b from-[#050e24]/90 via-[#071330]/80 to-[#040814]/95 p-5 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
              {/* Dungeon Portal Banner */}
              <div className="relative h-32 sm:h-44 w-full rounded-xl overflow-hidden border border-cyan-400/50 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <Image
                  src="/images/solo-leveling/system-monarch-banner.jpg"
                  alt="Solo Leveling System Gate"
                  fill
                  className="object-cover object-top"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-3">
                  <span className="text-[10px] font-mono font-black text-cyan-300 uppercase tracking-widest">[ DUNGEON GATE : SYSTEM PORTAL ]</span>
                  <span className="text-sm font-black text-white">DEFEAT WEAKNESS · CLAIM STAT POINTS</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-wide text-white uppercase">[ DUNGEON MISSION : {tr.readyTitle} ]</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  {playerStats.rank}-RANK
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-zinc-400">
                {tr.readySubtitle}
              </p>

              <div className="mt-4">
                <span className="mb-1.5 block text-xs font-mono font-bold text-cyan-400/90">{tr.focusLabel}</span>
                <div className="flex flex-wrap gap-2">
                  {FOCUSES.map((f) => (
                    <Chip key={f.id} selected={activeProfile.focus === f.id} onClick={() => quickPatch({ focus: f.id })}>
                      {FOCUS_LABELS_I18N[lang]?.[f.id] ?? f.label}
                    </Chip>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <span className="mb-1.5 block text-xs font-mono font-bold text-cyan-400/90">{tr.timeLabel}</span>
                <div className="flex flex-wrap gap-2">
                  {([20, 30, 45, 60] as const).map((m) => (
                    <Chip key={m} selected={activeProfile.minutes === m} onClick={() => quickPatch({ minutes: m })}>
                      {m} {lang === "bn" ? "মি." : "min"}
                    </Chip>
                  ))}
                </div>
              </div>

              <button
                id="btn-generate-ai"
                onClick={() => {
                  unlockAudio();
                  playSound("system-click");
                  void generate(activeProfile);
                }}
                disabled={busy || !profile}
                className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 font-black text-sm uppercase tracking-wider text-black shadow-lg shadow-cyan-500/30 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-black" /> {tr.buildingSessionBtn}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 stroke-[2.5] text-black animate-pulse" /> [ ENTER DUNGEON : {tr.generateWorkoutBtn} ]
                  </>
                )}
              </button>
              <button
                id="btn-generate-offline"
                onClick={() => void generate(activeProfile, { offline: true })}
                disabled={busy || !profile}
                className="mt-2 min-h-[44px] w-full text-xs text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline disabled:opacity-50"
              >
                {tr.offlineBuildBtn}
              </button>
            </div>

            {/* Visual BMI Gauge & Energy / Macro Split Card */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3.5 shadow-md">
              <BmiGauge bmi={stats.bmi} category={stats.bmiCategory} />

              <div className="grid grid-cols-2 gap-2 text-center pt-1 border-t border-zinc-800/60">
                <div className="rounded-xl bg-zinc-950/70 p-2.5 border border-zinc-800/50">
                  <div className="text-[10px] text-zinc-400">{tr.restingBmr}</div>
                  <div className="text-base font-bold text-white font-mono">{stats.bmr} <span className="text-[10px] text-zinc-500 font-normal">kcal</span></div>
                </div>
                <div className="rounded-xl bg-zinc-950/70 p-2.5 border border-zinc-800/50">
                  <div className="text-[10px] text-zinc-400">{tr.dailyTdee}</div>
                  <div className="text-base font-bold text-emerald-400 font-mono">{stats.tdee} <span className="text-[10px] text-zinc-500 font-normal">kcal</span></div>
                </div>
              </div>

              {nutrition && (
                <div className="rounded-xl bg-zinc-950/80 p-3 border border-zinc-800 text-center space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                    <span>{tr.targetCalories(activeProfile.goal)}</span>
                    <strong className="text-white font-mono">{nutrition.targetCalories} kcal/day</strong>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    <div className="bg-zinc-900/90 p-2 rounded-lg border border-zinc-800">
                      <span className="text-emerald-400 font-semibold block text-[10px]">{tr.proteinLabel}</span>
                      <strong className="text-white font-mono">{nutrition.proteinGrams}g</strong>
                    </div>
                    <div className="bg-zinc-900/90 p-2 rounded-lg border border-zinc-800">
                      <span className="text-teal-400 font-semibold block text-[10px]">{tr.carbsLabel}</span>
                      <strong className="text-white font-mono">{nutrition.carbGrams}g</strong>
                    </div>
                    <div className="bg-zinc-900/90 p-2 rounded-lg border border-zinc-800">
                      <span className="text-amber-400 font-semibold block text-[10px]">{tr.fatsLabel}</span>
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
                <span>{tr.viewDietChartBtn}</span>
              </button>
            </div>

            {history[0] && (
              <p className="text-center text-xs text-zinc-500">
                {tr.lastSessionFelt(history[0].title, history[0].difficulty)}
              </p>
            )}
          </section>
        ) : (
          // ---------------- active workout ----------------
          <>
            <section className="relative overflow-hidden rounded-2xl border-2 border-cyan-400/80 bg-gradient-to-b from-[#05112e]/95 via-[#07153a]/90 to-[#030818]/95 p-5 shadow-[0_0_40px_rgba(6,182,212,0.35)] system-scanlines system-grid-bg">
              {/* Corner Luminous Diamonds (Manhwa Accurate) */}
              <div className="absolute top-1.5 left-1.5 text-cyan-400 text-xs font-mono select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>
              <div className="absolute top-1.5 right-1.5 text-cyan-400 text-xs font-mono select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>
              <div className="absolute bottom-1.5 left-1.5 text-cyan-400 text-xs font-mono select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>
              <div className="absolute bottom-1.5 right-1.5 text-cyan-400 text-xs font-mono select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>

              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl" />
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black uppercase bg-cyan-400 text-black shadow-md">
                    {lang === "bn" ? "[ DUNGEON RAID : ডানজন রেইড ]" : "[ DUNGEON RAID : ACTIVE ]"}
                  </span>
                  {plan.source === "ai" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-950/80 px-2.5 py-0.5 text-xs font-mono font-bold text-cyan-300">
                      <Sparkles className="h-3 w-3 text-cyan-400 animate-pulse" /> {tr.aiCoachBadge}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-600 bg-zinc-900 px-2.5 py-0.5 text-xs font-mono font-bold text-zinc-300">
                      <WifiOff className="h-3 w-3" /> {tr.offlineBadge}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black border border-purple-400/50 bg-purple-950/80 text-purple-300">
                    {playerStats.rank}-RANK
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-black/70 px-2.5 py-1 text-xs font-mono text-zinc-300">
                    <HeartPulse className="h-3.5 w-3.5 text-rose-400" /> {tr.bmiLabel} <strong className="text-white font-mono">{session.meta.bmi}</strong>
                  </span>
                </div>
              </div>

              <h2 className="mb-2 text-2xl font-black tracking-wide text-white md:text-3xl uppercase text-glow-cyan">
                {plan.title}
              </h2>
              <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-zinc-300 md:text-sm font-mono">
                <span className="flex items-center gap-1.5">
                  <Dumbbell className="h-4 w-4 text-cyan-400" />
                  <span className="text-cyan-200 font-bold">{FOCUS_LABELS_I18N[lang]?.[plan.focus] ?? focusLabel(plan.focus)}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-cyan-400" /> ~{estimateMinutes(plan)} {lang === "bn" ? "মি." : "min"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-cyan-400" /> {tr.movementsCount(plan.exercises.length)}
                </span>
              </div>

              {plan.coachNote && (
                <div className="flex items-start gap-3 rounded-xl border border-cyan-500/40 bg-black/60 p-3.5 font-mono">
                  <div className="mt-0.5 shrink-0 rounded-lg bg-cyan-500/20 p-1.5 text-cyan-400">
                    <Info className="h-4 w-4" />
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-300 md:text-sm">
                    <strong className="font-bold text-cyan-400 uppercase">[ SYSTEM DIRECTIVE ] </strong>
                    {plan.coachNote}
                  </p>
                </div>
              )}

              {plan.consensus && (
                <div className="mt-3 overflow-hidden rounded-xl border border-teal-500/40 bg-teal-950/30 p-3.5 backdrop-blur-sm font-mono">
                  <div className="flex items-center justify-between gap-2 border-b border-teal-500/30 pb-2">
                    <span className="flex items-center gap-1.5 text-xs font-black text-teal-300 uppercase">
                      <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                      {plan.consensus.verifiedBy}
                    </span>
                    {plan.consensus.safetyScore && (
                      <span className="rounded bg-teal-950 border border-teal-400/50 px-2 py-0.5 text-[10px] font-mono font-bold text-teal-200">
                        {plan.consensus.safetyScore}% Biomechanical Match
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-zinc-300 leading-relaxed">
                    {plan.consensus.summary}
                  </p>
                  {plan.consensus.notes && plan.consensus.notes.length > 0 && (
                    <ul className="mt-2 space-y-1 text-[11px] text-zinc-400">
                      {plan.consensus.notes.map((note, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-teal-400 mt-0.5 shrink-0" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {!session.startedAt && (
                <button
                  onClick={() => {
                    playSound("arise");
                    vibrate([50, 100, 50]);
                    startWorkout();
                  }}
                  className="system-btn-chamfer mt-4 flex min-h-[50px] w-full items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 font-black text-xs uppercase tracking-widest text-black shadow-[0_0_25px_rgba(6,182,212,0.7)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-current stroke-none" /> [ ENGAGE DUNGEON MISSION : {tr.startWorkoutBtn} ]
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
                    <h3 className="text-sm font-semibold text-white">{tr.warmupTitle}</h3>
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
                  <Dumbbell className="h-5 w-5 text-emerald-400" /> {tr.mainWorkTitle(plan.exercises.length)}
                </h3>
                <button onClick={discard} className="flex min-h-[40px] items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200">
                  <RotateCcw className="h-3 w-3" /> {tr.discardBtn}
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
                    lang={lang}
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
                  ? (lang === "bn" ? "সবগুলো সেট সম্পন্ন হয়েছে! সেশনটি কেমন লেগেছে রেট করে সেভ করুন।" : "All sets done. Log how it felt so your next session adapts.")
                  : (lang === "bn" ? "তাড়াতাড়ি শেষ করতে চান? যেকোনো সময় ফিনিশ করে সেশন সেভ করতে পারেন।" : "Done early or short on time? You can finish any time and still log it.")}
              </p>
              <button
                onClick={() => setShowFinish(true)}
                className={`min-h-[48px] w-full rounded-xl font-bold ${allDone ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950" : "border border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700"}`}
              >
                {tr.finishWorkoutBtn}
              </button>
              {session.startedAt && t && (
                <p className="mt-2 text-center text-[11px] text-zinc-500">{tr.estimateKcalBurn(kcalEstimate(activeProfile.weightKg, Math.max(1, elapsedMin ?? 0)))}</p>
              )}
            </section>
          </>
        )}

        <p className="pb-4 text-center text-[11px] leading-relaxed text-zinc-600">
          {tr.medicalDisclaimer}
        </p>
      </main>

      <RestTimer
        state={timer.state}
        seconds={timer.seconds}
        label={timer.label}
        progress={timer.progress}
        lang={lang}
        onPause={timer.pause}
        onResume={timer.resume}
        onAdjust={timer.adjust}
        onStop={timer.stop}
      />

      {(showProfile || (needsSetup && !showWelcomeOnboarding)) && (
        <ProfileSheet
          open
          firstRun={needsSetup}
          profile={activeProfile}
          accessCode={accessCode}
          geminiKey={geminiKey}
          unitSystem={unitSystem}
          lang={lang}
          onLanguageChange={setLang}
          onSave={saveProfile}
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* Solo Leveling Welcome & Hunter Calibration Wizard */}
      <SoloLevelingWelcomeOnboarding
        open={showWelcomeOnboarding}
        initialProfile={activeProfile}
        initialName={activeUser?.name || playerStats.name}
        lang={lang}
        onLanguageChange={setLang}
        onComplete={handleCompleteWelcomeOnboarding}
        onClose={() => setShowWelcomeOnboarding(false)}
      />

      {/* Solo Leveling Welcome Back Returning Hunter Briefing Modal */}
      <SoloLevelingWelcomeBackModal
        open={showWelcomeBackModal}
        stats={playerStats}
        quest={dailyQuest}
        isWorkoutDay={todaySchedule.isWorkoutDay}
        focusTitle={lang === "bn" ? `${todaySchedule.bengaliName} · ${todaySchedule.sessionTitle}` : `${todaySchedule.dayName} · ${todaySchedule.sessionTitle}`}
        lang={lang}
        onLanguageChange={setLang}
        onStartWorkout={() => {
          setShowWelcomeBackModal(false);
          setView("today");
          if (!session) {
            void generate(activeProfile);
          }
        }}
        onOpenQuest={() => {
          setShowWelcomeBackModal(false);
          setView("today");
          const el = document.getElementById("daily-quest-card");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
        onOpenStatus={() => {
          setShowWelcomeBackModal(false);
          setShowStatusModal(true);
        }}
        onClose={() => setShowWelcomeBackModal(false)}
      />

      {showFinish && session && (
        <FinishSheet open session={session} weightKg={activeProfile.weightKg} lang={lang} onSave={finish} onClose={() => setShowFinish(false)} />
      )}

      <DietSheet
        open={showDietSheet}
        weightKg={activeProfile.weightKg}
        heightCm={activeProfile.heightCm}
        bmi={stats.bmi}
        bmiCategory={stats.bmiCategory}
        tdee={stats.tdee}
        initialGoal={activeProfile.dietGoal ?? (activeProfile.goal === "muscle" ? "muscle" : "recomp")}
        lang={lang}
        geminiKey={geminiKey}
        accessCode={accessCode}
        onClose={() => setShowDietSheet(false)}
      />

      <HunterAuthModal
        open={showAuthModal}
        lang={lang}
        activeAccount={activeUser}
        accounts={accounts}
        geminiKey={geminiKey}
        onSaveGeminiKey={setGeminiKey}
        onSelectAccount={(acc) => {
          setActiveUser(acc);
          if (acc?.profile) setProfile(acc.profile);
        }}
        onCreateAccount={(name, pin) => {
          const newAcc: UserAccount = {
            id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name,
            pin,
            createdAt: Date.now(),
            lastActive: Date.now(),
            profile: activeProfile,
          };
          setAccounts((prev) => [...prev, newAcc]);
          setActiveUser(newAcc);
        }}
        onSyncCloud={handleForceCloudSync}
        onClose={() => setShowAuthModal(false)}
      />

      <ExerciseAnimationModal
        exercise={selectedAnimationEx}
        easier={selectedAnimationEx?.easier ? getExercise(selectedAnimationEx.easier) : undefined}
        harder={selectedAnimationEx?.harder ? getExercise(selectedAnimationEx.harder) : undefined}
        lang={lang}
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

      <ExerciseLibraryModal
        open={showLibraryModal}
        lang={lang}
        onSelectExercise={(ex) => {
          setSelectedAnimationEx(ex);
        }}
        onClose={() => setShowLibraryModal(false)}
      />



      {/* Solo Leveling System Status Window Modal */}
      <SoloLevelingStatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        stats={playerStats}
        onUpdateStats={setPlayerStats}
        lang={lang}
        onOpenCalibration={() => {
          setShowStatusModal(false);
          setShowWelcomeOnboarding(true);
        }}
        onTriggerArise={() => {
          setAriseModalText({
            title: lang === "bn" ? "ARISE : জাগ্রত হও" : "ARISE : AWAKEN",
            subtitle: lang === "bn" ? "শ্যাডো মনার্ক জাগ্রত হচ্ছে" : "THE SHADOW MONARCH AWAKENS",
          });
          setShowAriseModal(true);
        }}
      />

      {/* Solo Leveling Arise & Level-Up Awakening Overlay */}
      <AriseAwakeningOverlay
        isOpen={showAriseModal}
        onClose={() => setShowAriseModal(false)}
        title={ariseModalText.title}
        subtitle={ariseModalText.subtitle}
        level={playerStats.level}
        lang={lang}
      />

      {/* Solo Leveling Floating Holographic System Toasts */}
      <SystemNotificationToast
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      {/* Active Workout Mobile Sticky Action Bar */}
      {view === "today" && session && t && (
        <aside
          aria-label="Active session mobile controls"
          className="md:hidden fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] inset-x-3 z-30 mx-auto max-w-lg system-btn-chamfer border border-cyan-500/50 bg-[#020512]/95 p-2.5 backdrop-blur-xl shadow-[0_0_25px_rgba(6,182,212,0.3)] flex items-center justify-between gap-2 transition-all animate-in slide-in-from-bottom-4"
        >
          <div className="flex items-center gap-2 pl-1.5">
            <span className="flex h-8 w-8 items-center justify-center system-btn-chamfer bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold text-xs font-mono">
              {t.setsTotal ? Math.round((t.setsDone / t.setsTotal) * 100) : 0}%
            </span>
            <div className="text-[11px] leading-tight">
              <span className="text-white font-mono font-bold block">{t.setsDone}/{t.setsTotal} {tr.sets}</span>
              <span className="text-cyan-400 font-mono">{t.volumeKg} kg {lang === "bn" ? "ভলিউম" : "vol"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!session.startedAt ? (
              <button
                type="button"
                onClick={startWorkout}
                className="flex min-h-[42px] items-center gap-1.5 system-btn-chamfer bg-gradient-to-r from-cyan-400 via-blue-600 to-purple-600 px-4 text-xs font-mono font-bold text-white active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{tr.startWorkoutBtn}</span>
              </button>
            ) : allDone ? (
              <button
                type="button"
                onClick={() => setShowFinish(true)}
                className="flex min-h-[42px] items-center gap-1.5 system-btn-chamfer bg-gradient-to-r from-cyan-400 via-blue-600 to-purple-600 px-4 text-xs font-mono font-black text-white active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.5)] animate-pulse"
              >
                <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                <span>{tr.finishWorkoutBtn}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowFinish(true)}
                className="flex min-h-[42px] items-center gap-1 system-btn-chamfer border border-cyan-500/40 bg-[#03081a] px-3 text-xs font-mono font-semibold text-cyan-300 hover:text-white active:scale-95"
              >
                <span>{tr.finishWorkoutBtn}</span>
              </button>
            )}
          </div>
        </aside>
      )}

      {/* Mobile Floating Bottom Navigation Dock (Tab Bar) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#020512]/95 backdrop-blur-2xl border-t border-cyan-500/30 px-2 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-5px_25px_rgba(6,182,212,0.15)]"
      >
        <div className="grid grid-cols-5 items-center gap-1 text-center font-mono">
          {/* 1. Today Dungeon Workout */}
          <button
            id="btn-mobile-tab-workout"
            type="button"
            onClick={() => setView("today")}
            aria-pressed={view === "today"}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-all active:scale-90 ${
              view === "today"
                ? "text-cyan-300 font-bold bg-cyan-500/15 shadow-[0_0_10px_rgba(6,182,212,0.2)] border border-cyan-500/30"
                : "text-zinc-400 hover:text-cyan-200"
            }`}
          >
            <Dumbbell className={`h-5 w-5 mb-0.5 ${view === "today" ? "stroke-[2.5]" : ""}`} />
            <span className="text-[10px] tracking-tight truncate max-w-full px-0.5">{lang === "bn" ? "রেইড" : "Dungeon"}</span>
            {view === "today" && <span className="h-1 w-1 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 mt-0.5" />}
          </button>

          {/* 2. Quests & Rank */}
          <button
            id="btn-mobile-tab-goals"
            type="button"
            onClick={() => setView("goals")}
            aria-pressed={view === "goals"}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-all active:scale-90 ${
              view === "goals"
                ? "text-cyan-300 font-bold bg-cyan-500/15 shadow-[0_0_10px_rgba(6,182,212,0.2)] border border-cyan-500/30"
                : "text-zinc-400 hover:text-cyan-200"
            }`}
          >
            <Target className={`h-5 w-5 mb-0.5 ${view === "goals" ? "stroke-[2.5]" : ""}`} />
            <span className="text-[10px] tracking-tight truncate max-w-full px-0.5">{lang === "bn" ? "কোয়েস্ট" : "Quests"}</span>
            {view === "goals" && <span className="h-1 w-1 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 mt-0.5" />}
          </button>

          {/* 3. Arsenal Library */}
          <button
            id="btn-mobile-tab-library"
            type="button"
            onClick={() => setShowLibraryModal(true)}
            className="flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all active:scale-90"
          >
            <Sparkles className="h-5 w-5 mb-0.5 text-teal-400" />
            <span className="text-[10px] tracking-tight truncate max-w-full px-0.5">{lang === "bn" ? "আর্সেনাল" : "Arsenal"}</span>
          </button>

          {/* 4. Hunter Rations */}
          <button
            id="btn-mobile-tab-diet"
            type="button"
            onClick={() => setShowDietSheet(true)}
            className="flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all active:scale-90"
          >
            <Utensils className="h-5 w-5 mb-0.5 text-amber-400" />
            <span className="text-[10px] tracking-tight truncate max-w-full px-0.5">{lang === "bn" ? "রেশন" : "Rations"}</span>
          </button>

          {/* 5. Combat Archives */}
          <button
            id="btn-mobile-tab-history"
            type="button"
            onClick={() => setView("history")}
            aria-pressed={view === "history"}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-all active:scale-90 ${
              view === "history"
                ? "text-cyan-300 font-bold bg-cyan-500/15 shadow-[0_0_10px_rgba(6,182,212,0.2)] border border-cyan-500/30"
                : "text-zinc-400 hover:text-cyan-200"
            }`}
          >
            <HistoryIcon className={`h-5 w-5 mb-0.5 ${view === "history" ? "stroke-[2.5]" : ""}`} />
            <span className="text-[10px] tracking-tight truncate max-w-full px-0.5">{lang === "bn" ? "আর্কাইভ" : "Archives"}</span>
            {view === "history" && <span className="h-1 w-1 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 mt-0.5" />}
          </button>
        </div>
      </nav>
    </div>
  );
}
