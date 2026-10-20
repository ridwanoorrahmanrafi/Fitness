"use client";

import {
  Activity,
  AlertTriangle,
  Bell,
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
  Menu,
  Package,
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
import { LevelingQuestCarouselCard } from "@/components/LevelingQuestCarouselCard";
import { LevelingStatisticsView } from "@/components/LevelingStatisticsView";
import { LevelingInventoryView } from "@/components/LevelingInventoryView";
import { LevelingStatusView } from "@/components/LevelingStatusView";
import { AchievementsModal } from "@/components/AchievementsModal";
import { GuildHubModal } from "@/components/GuildHubModal";
import { LevelingSettingsDrawer } from "@/components/LevelingSettingsDrawer";
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
  const [unitSystem, setUnitSystem] = useStoredState<"metric" | "imperial">(KEYS.unitSystem, "metric");
  const [lang, setLang] = useStoredState<Language>(KEYS.language, "bn");
  const [soundOn, setSoundOn] = useStoredState<boolean>(KEYS.sound, true);
  const [hasVisited, setHasVisited, hasVisitedReady] = useStoredState<boolean>(KEYS.hasVisited, false);
  const [activeUser, setActiveUser] = useStoredState<UserAccount | null>(KEYS.activeUser, null);
  const [accounts, setAccounts] = useStoredState<UserAccount[]>(KEYS.accounts, []);

  const tr = TRANSLATIONS[lang] ?? TRANSLATIONS.bn;

  const [activeView, setActiveView] = useState<ActiveView>("app");
  const [view, setView] = useState<View>("today");
  const [activeTab, setActiveTab] = useState<"home" | "stats" | "inventory" | "status">("home");
  const [showProfile, setShowProfile] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFinish, setShowFinish] = useState(false);
  const [showDietSheet, setShowDietSheet] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showGuildHubModal, setShowGuildHubModal] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [hapticsOn, setHapticsOn] = useState(true);

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

  // Formatted date string for Leveling header: "TODAY, 21 OCT"
  const headerDateString = useMemo(() => {
    const now = new Date();
    if (lang === "bn") {
      const monthNamesBn = ["জানু", "ফেব্রু", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টে", "অক্টো", "নভে", "ডিসে"];
      return `আজ, ${now.getDate()} ${monthNamesBn[now.getMonth()]}`.toUpperCase();
    }
    const monthNamesEn = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return `TODAY, ${now.getDate()} ${monthNamesEn[now.getMonth()]}`;
  }, [lang]);

  // URL Hash & return visitor synchronization for intuitive forward/back browser navigation
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === "#landing") {
        setActiveView("landing");
      } else if (hash === "#onboarding" || hash === "#welcome") {
        setActiveView("app");
        setShowWelcomeOnboarding(true);
      } else {
        setActiveView("app");
        if (hash === "#stats" || hash === "#history" || hash === "#activities") {
          setActiveTab("stats");
        } else if (hash === "#inventory" || hash === "#items" || hash === "#shop") {
          setActiveTab("inventory");
        } else if (hash === "#status" || hash === "#player" || hash === "#attributes") {
          setActiveTab("status");
        } else if (hash === "#achievements") {
          setShowAchievementsModal(true);
        } else if (hash === "#guild" || hash === "#guilds") {
          setShowGuildHubModal(true);
        } else if (hash === "#settings" || hash === "#drawer") {
          setShowSettingsDrawer(true);
        } else if (hash === "#diet") {
          setShowDietSheet(true);
        } else if (hash === "#library" || hash === "#exercises" || hash === "#animations") {
          setShowLibraryModal(true);
        } else if (hash === "#auth" || hash === "#login") {
          setShowAuthModal(true);
        } else if (hash === "#arise") {
          setShowAriseModal(true);
        } else {
          setActiveTab("home");
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
    [accessCode, applyPlan, history],
  );

  const saveProfile = (p: Profile, code: string, _key?: string, unit?: "metric" | "imperial", l?: Language) => {
    const first = !profile;
    setProfile(p);
    setAccessCode(code);
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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          {/* Left: Brand Logo & Solo Leveling System Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              id="btn-header-crest"
              onClick={() => {
                playSound("system-alert");
                vibrate(20);
                setActiveTab("status");
              }}
              title="Open Solo Leveling System Status Window"
              className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer text-left focus:outline-none shrink-0 whitespace-nowrap"
            >
              <div className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl overflow-hidden border-2 border-cyan-400 shadow-md shadow-cyan-500/30 group-hover:scale-105 transition-transform shrink-0">
                <Image
                  src="/images/solo-leveling/system-crest-icon.jpg"
                  alt="Solo Leveling System Crest"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="shrink-0">
                <h1 className="flex items-center gap-1.5 text-sm sm:text-base font-black tracking-wide text-white whitespace-nowrap">
                  ARISE
                  <span className="rounded border border-cyan-400/50 bg-cyan-950/80 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.4)] shrink-0 whitespace-nowrap">
                    [ SYSTEM ]
                  </span>
                </h1>
                <p className="text-[10px] sm:text-[11px] font-mono text-cyan-400/80 flex items-center gap-1 whitespace-nowrap">
                  <span>{lang === "bn" ? "স্ট্যাটাস" : "STATUS"} : Lv.{playerStats.level}</span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-purple-300 font-bold">{playerStats.rank}-RANK</span>
                </p>
              </div>
            </button>
          </div>

          {/* Center: Desktop Navigation Tabs (Hidden on mobile) */}
          <nav
            aria-label="Desktop Tab Navigation"
            className="hidden md:flex items-center gap-0.5 lg:gap-1.5 rounded-2xl border border-cyan-500/30 bg-[#030712]/80 p-1 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.15)] shrink-0"
          >
            <button
              type="button"
              id="desktop-nav-home"
              onClick={() => {
                playSound("system-click");
                vibrate(15);
                setActiveTab("home");
              }}
              className={`flex items-center gap-1.5 lg:gap-2 rounded-xl px-2 lg:px-3.5 py-1.5 lg:py-2 text-[10px] lg:text-xs font-mono font-bold uppercase whitespace-nowrap transition-all duration-200 ${
                activeTab === "home"
                  ? "bg-gradient-to-r from-cyan-500/30 via-blue-500/25 to-indigo-500/30 text-cyan-200 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
              }`}
            >
              <Home className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-cyan-400 shrink-0" />
              <span className="hidden xl:inline">[ {lang === "bn" ? "কোয়েস্ট" : "QUESTS"} ]</span>
              <span className="inline xl:hidden">{lang === "bn" ? "কোয়েস্ট" : "QUESTS"}</span>
            </button>

            <button
              type="button"
              id="desktop-nav-stats"
              onClick={() => {
                playSound("system-click");
                vibrate(15);
                setActiveTab("stats");
              }}
              className={`flex items-center gap-1.5 lg:gap-2 rounded-xl px-2 lg:px-3.5 py-1.5 lg:py-2 text-[10px] lg:text-xs font-mono font-bold uppercase whitespace-nowrap transition-all duration-200 ${
                activeTab === "stats"
                  ? "bg-gradient-to-r from-cyan-500/30 via-blue-500/25 to-indigo-500/30 text-cyan-200 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
              }`}
            >
              <Activity className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-cyan-400 shrink-0" />
              <span className="hidden xl:inline">[ {lang === "bn" ? "পরিসংখ্যান" : "STATISTICS"} ]</span>
              <span className="inline xl:hidden">{lang === "bn" ? "রেকর্ড" : "STATS"}</span>
            </button>

            <button
              type="button"
              id="desktop-nav-inventory"
              onClick={() => {
                playSound("system-click");
                vibrate(15);
                setActiveTab("inventory");
              }}
              className={`flex items-center gap-1.5 lg:gap-2 rounded-xl px-2 lg:px-3.5 py-1.5 lg:py-2 text-[10px] lg:text-xs font-mono font-bold uppercase whitespace-nowrap transition-all duration-200 ${
                activeTab === "inventory"
                  ? "bg-gradient-to-r from-cyan-500/30 via-blue-500/25 to-indigo-500/30 text-cyan-200 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
              }`}
            >
              <Package className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-cyan-400 shrink-0" />
              <span className="hidden xl:inline">[ {lang === "bn" ? "ইনভেন্টরি" : "INVENTORY"} ]</span>
              <span className="inline xl:hidden">{lang === "bn" ? "গিয়ার" : "ITEMS"}</span>
            </button>

            <button
              type="button"
              id="desktop-nav-status"
              onClick={() => {
                playSound("system-click");
                vibrate(15);
                setActiveTab("status");
              }}
              className={`flex items-center gap-1.5 lg:gap-2 rounded-xl px-2 lg:px-3.5 py-1.5 lg:py-2 text-[10px] lg:text-xs font-mono font-bold uppercase whitespace-nowrap transition-all duration-200 ${
                activeTab === "status"
                  ? "bg-gradient-to-r from-cyan-500/30 via-blue-500/25 to-indigo-500/30 text-cyan-200 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
              }`}
            >
              <UserIcon className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-cyan-400 shrink-0" />
              <span className="hidden xl:inline">[ {lang === "bn" ? "স্ট্যাটাস" : "STATUS"} ]</span>
              <span className="inline xl:hidden">{lang === "bn" ? "স্ট্যাটাস" : "STATUS"}</span>
              {playerStats.unallocatedPoints > 0 && (
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
              )}
            </button>
          </nav>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Desktop Awakening Trigger */}
            <button
              id="btn-desktop-arise"
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
              aria-label="Trigger Arise Awakening"
              title="Trigger Arise Awakening"
              className="hidden xl:flex h-9 lg:h-10 items-center gap-1.5 rounded-xl border border-purple-500/50 bg-gradient-to-r from-purple-900/60 to-indigo-950/60 px-2.5 lg:px-3 text-xs font-black text-purple-200 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] active:scale-95 transition-all shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-purple-400 animate-pulse" />
              <span className="tracking-wider">ARISE</span>
            </button>

            {/* Arsenal / Exercise Library shortcut (Large screens) */}
            <button
              id="btn-desktop-arsenal"
              type="button"
              onClick={() => {
                playSound("system-click");
                setShowLibraryModal(true);
              }}
              aria-label="Open Exercise Arsenal"
              title="Open Exercise Arsenal"
              className="hidden 2xl:flex h-10 items-center gap-1.5 rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-3 text-xs font-semibold text-zinc-200 hover:border-cyan-500/40 hover:text-white transition-colors shrink-0"
            >
              <Dumbbell className="h-3.5 w-3.5 text-cyan-400" />
              <span>{lang === "bn" ? "অস্ত্রাগার" : "Arsenal"}</span>
            </button>

            {/* Diet Sheet shortcut (Large screens) */}
            <button
              id="btn-desktop-rations"
              type="button"
              onClick={() => {
                playSound("system-click");
                setShowDietSheet(true);
              }}
              aria-label="Open Nutrition Rations"
              title="Open Nutrition Rations"
              className="hidden 2xl:flex h-10 items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-3 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/40 transition-colors shrink-0"
            >
              <Utensils className="h-3.5 w-3.5 text-emerald-400" />
              <span>{lang === "bn" ? "ডায়েট চার্ট" : "Rations"}</span>
            </button>

            {/* Language Switcher */}
            <button
              id="btn-lang-switcher"
              type="button"
              onClick={() => {
                playSound("system-click");
                const nextLang = lang === "bn" ? "en" : "bn";
                setLang(nextLang);
                addSystemToast(
                  nextLang === "bn" ? "[ ভাষা পরিবর্তন : বাংলা ]" : "[ LANGUAGE : ENGLISH ]",
                  nextLang === "bn" ? "সিস্টেম ইন্টারফেস বাংলায় রূপান্তরিত হয়েছে।" : "System interface set to English."
                );
              }}
              aria-label="Switch Language"
              title={lang === "bn" ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
              className="flex h-9 sm:h-10 items-center gap-1 rounded-xl border border-cyan-500/30 bg-cyan-950/40 px-2 sm:px-2.5 text-xs font-mono font-bold text-cyan-300 hover:border-cyan-400 hover:bg-cyan-900/40 shadow-[0_0_10px_rgba(6,182,212,0.2)] active:scale-95 transition-all shrink-0"
            >
              <span className="text-sm">🌐</span>
              <span className="font-mono text-[11px] font-black">{lang === "bn" ? "EN" : "বাং"}</span>
            </button>

            {/* Audio Toggle */}
            <button
              id="btn-sound-toggle"
              type="button"
              onClick={() => {
                const next = !soundOn;
                setSoundOn(next);
                if (next) playSound("system-click");
              }}
              aria-label={soundOn ? "Mute System Audio" : "Unmute System Audio"}
              title={soundOn ? "Sound: ON" : "Sound: MUTED"}
              className="hidden sm:flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-zinc-700/60 bg-zinc-800/60 text-zinc-300 hover:border-cyan-500/40 hover:text-white transition-colors shrink-0"
            >
              {soundOn ? <Volume2 className="h-4 w-4 text-cyan-400" /> : <VolumeX className="h-4 w-4 text-zinc-500" />}
            </button>

            {/* Bell System Notification */}
            <button
              type="button"
              id="btn-leveling-bell"
              onClick={() => {
                playSound("system-alert");
                vibrate(25);
                addSystemToast(
                  lang === "bn" ? "[ সিস্টেম স্ট্যাটাস : সক্রিয় ]" : "[ SYSTEM STATUS : ACTIVE ]",
                  lang === "bn"
                    ? `খেলোয়াড় ${playerStats.name}: কোনো বকেয়া পেনাল্টি নেই। দৈনিক অগ্রগতি সর্বোত্তম।`
                    : `Player ${playerStats.name}: No pending penalties. Progression optimal.`
                );
              }}
              aria-label="System Notifications"
              title="System Notifications"
              className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 hover:border-cyan-400 hover:text-cyan-100 transition-colors shrink-0"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)] animate-pulse" />
            </button>

            {/* Menu Drawer button */}
            <button
              type="button"
              id="btn-leveling-menu"
              onClick={() => {
                playSound("system-click");
                setShowSettingsDrawer(true);
              }}
              aria-label="Settings and System Menu"
              title="System Settings & Hub"
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/60 to-[#040817] text-cyan-300 hover:border-cyan-400 hover:text-cyan-100 shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-all cursor-pointer shrink-0"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Active workout progress indicator */}
        {activeTab === "home" && session && t && (
          <div className="mx-auto mt-2 max-w-7xl">
            <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-cyan-300/80">
              <span className="flex items-center gap-1 font-mono">
                <Activity className="h-3.5 w-3.5 text-cyan-400 animate-pulse" /> {tr.sessionProgress}
                {elapsedMin !== null && <span className="text-zinc-500">· {elapsedMin} {tr.minIn}</span>}
              </span>
              <span className="font-mono font-bold text-cyan-300">
                {t.setsTotal ? Math.round((t.setsDone / t.setsTotal) * 100) : 0}% ({t.setsDone}/{t.setsTotal} {tr.sets})
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-900 border border-cyan-500/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-[width] duration-300 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                style={{ width: `${t.setsTotal ? (t.setsDone / t.setsTotal) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 pt-6">
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

        {/* 1. Statistics Tab */}
        {activeTab === "stats" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <LevelingStatisticsView
              lang={lang}
              history={history}
              profile={activeProfile}
              onOpenAchievements={() => setShowAchievementsModal(true)}
              workoutDurationMinutes={history.reduce((acc, h) => acc + (h.minutes || 0), 0)}
              xpEarnedToday={playerStats.exp}
              distanceKmToday={dailyQuest.objectives.runKm.current}
              caloriesBurnedToday={history.reduce((acc, h) => acc + (h.kcalEstimate || 0), 0)}
            />
          </div>
        )}

        {/* 2. Inventory & Gear Tab */}
        {activeTab === "inventory" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <LevelingInventoryView
              lang={lang}
              goldCount={playerStats.coins ?? 1450}
              keysCount={playerStats.keys ?? 3}
              gemsCount={playerStats.gems ?? 25}
              unlockedEquipment={activeProfile.equipment}
              onEquipChange={(eq) => quickPatch({ equipment: eq })}
              onOpenArsenal={() => setShowLibraryModal(true)}
            />
          </div>
        )}

        {/* 3. Player Status Tab */}
        {activeTab === "status" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <LevelingStatusView
              lang={lang}
              stats={playerStats}
              onUpdateStats={(updated) => {
                setPlayerStats(updated);
                savePlayerStats(updated);
                if (isSupabaseConfigured()) {
                  void syncPlayerStatsToSupabase(updated, activeUser?.id ?? "default");
                }
              }}
              onTriggerArise={() => {
                playSound("arise");
                vibrate([40, 80, 40]);
                setAriseModalText({
                  title: lang === "bn" ? "ARISE : জাগ্রত হও" : "ARISE : AWAKEN",
                  subtitle: lang === "bn" ? "শ্যাডো মনার্ক জাগ্রত হচ্ছে" : "THE SHADOW MONARCH AWAKENS",
                });
                setShowAriseModal(true);
              }}
              onOpenCalibration={() => setShowWelcomeOnboarding(true)}
              goldCount={playerStats.coins ?? 1450}
              keysCount={playerStats.keys ?? 3}
            />
          </div>
        )}

        {/* 4. Home / Quests & Dungeon Tab */}
        {activeTab === "home" && (
          <>
            {!plan || !session ? (
              // ---------------- Responsive 2-Column Dashboard ----------------
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start max-w-3xl lg:max-w-none mx-auto">
                {/* Left Column (8 cols): Quests, Schedule & Dungeon Gate */}
                <div className="lg:col-span-8 space-y-6">
                  {saved && (
                    <div role="status" className="flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-950/40 p-3 text-sm text-cyan-200">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" /> {saved}
                    </div>
                  )}

                  {/* Leveling Quest Carousel (Daily, Focus, Urgent, Custom) */}
                  <LevelingQuestCarouselCard
                    dailyQuest={dailyQuest}
                    onUpdateDailyQuest={setDailyQuest}
                    onClaimDailyQuest={handleClaimDailyQuest}
                    focusPlan={plan}
                    onStartFocusWorkout={() => {
                      if (!session) {
                        void generate(activeProfile);
                      } else {
                        startWorkout();
                      }
                    }}
                    onOpenExerciseAnimation={(ex) => setSelectedAnimationEx(ex)}
                    lang={lang}
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
                    <div className="relative h-36 sm:h-48 w-full rounded-xl overflow-hidden border border-cyan-400/50 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                      <Image
                        src="/images/solo-leveling/system-monarch-banner.jpg"
                        alt="Solo Leveling System Gate"
                        fill
                        className="object-cover object-top"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-3 sm:p-4">
                        <span className="text-[10px] sm:text-xs font-mono font-black text-cyan-300 uppercase tracking-widest">[ DUNGEON GATE : SYSTEM PORTAL ]</span>
                        <span className="text-sm sm:text-base font-black text-white">DEFEAT WEAKNESS · CLAIM STAT POINTS</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-xl sm:text-2xl font-black tracking-wide text-white uppercase">[ DUNGEON MISSION : {tr.readyTitle} ]</h2>
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm">
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

                    {history[0] && (
                      <p className="mt-3 text-center text-xs text-zinc-500 border-t border-zinc-800/80 pt-3">
                        {tr.lastSessionFelt(history[0].title, history[0].difficulty)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column (4 cols): Hunter Vitality HUD, BMI & Rations, Gear Vault */}
                <div className="lg:col-span-4 space-y-6">
                  {/* 1. Hunter Vitality HUD Card */}
                  <div className="rounded-2xl border-2 border-cyan-500/30 bg-[#060b18]/90 p-4 shadow-[0_4px_25px_rgba(6,182,212,0.12)] space-y-3.5 backdrop-blur-md">
                    <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-lg overflow-hidden border border-cyan-400/60 relative">
                          <Image src="/images/solo-leveling/system-crest-icon.jpg" alt="Hunter" fill className="object-cover" />
                        </div>
                        <div>
                          <div className="text-xs font-mono font-black text-white">{playerStats.name || "Sung Jin-Woo"}</div>
                          <div className="text-[10px] font-mono text-purple-300 font-semibold">{playerStats.title || "Shadow Monarch"}</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-cyan-950/80 text-cyan-300 border border-cyan-400/40">
                        {playerStats.rank}-RANK
                      </span>
                    </div>

                    {/* Level & Exp */}
                    <div>
                      <div className="flex justify-between text-[11px] font-mono mb-1">
                        <span className="text-cyan-300 font-bold">LEVEL {playerStats.level}</span>
                        <span className="text-zinc-400">{playerStats.exp} / {playerStats.expToNext || 500} EXP</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-900 border border-cyan-500/30 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.round((playerStats.exp / (playerStats.expToNext || 500)) * 100))}%` }}
                        />
                      </div>
                    </div>

                    {/* HP & MP gauges */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-2">
                        <div className="flex justify-between text-red-300 font-bold mb-1">
                          <span>HP</span>
                          <span>{playerStats.hp?.current ?? 100}/{playerStats.hp?.max ?? 100}</span>
                        </div>
                        <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 w-full" />
                        </div>
                      </div>
                      <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-xl p-2">
                        <div className="flex justify-between text-cyan-300 font-bold mb-1">
                          <span>MP</span>
                          <span>{playerStats.mp?.current ?? 100}/{playerStats.mp?.max ?? 100}</span>
                        </div>
                        <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-400 w-full" />
                        </div>
                      </div>
                    </div>

                    {/* Unallocated Stat Points Banner */}
                    {playerStats.unallocatedPoints > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          playSound("system-click");
                          setActiveTab("status");
                        }}
                        className="w-full py-2 px-3 rounded-xl border border-amber-400/60 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-amber-300 text-xs font-mono font-bold flex items-center justify-between hover:bg-amber-500/30 transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)] animate-pulse"
                      >
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                          <span>+{playerStats.unallocatedPoints} STAT POINTS AVAILABLE</span>
                        </span>
                        <span className="text-[10px] underline">ASSIGN &gt;</span>
                      </button>
                    )}

                    {/* Quick Attributes Row */}
                    <div className="grid grid-cols-5 gap-1 text-center font-mono text-[10px]">
                      <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-zinc-500 block text-[9px]">STR</span>
                        <strong className="text-red-400 font-bold">{playerStats.attributes?.str ?? 10}</strong>
                      </div>
                      <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-zinc-500 block text-[9px]">AGI</span>
                        <strong className="text-emerald-400 font-bold">{playerStats.attributes?.agi ?? 10}</strong>
                      </div>
                      <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-zinc-500 block text-[9px]">VIT</span>
                        <strong className="text-amber-400 font-bold">{playerStats.attributes?.vit ?? 10}</strong>
                      </div>
                      <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-zinc-500 block text-[9px]">INT</span>
                        <strong className="text-blue-400 font-bold">{playerStats.attributes?.int ?? 10}</strong>
                      </div>
                      <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-zinc-500 block text-[9px]">PER</span>
                        <strong className="text-purple-400 font-bold">{playerStats.attributes?.per ?? 10}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        playSound("system-click");
                        setActiveTab("status");
                      }}
                      className="w-full py-2 text-center text-xs font-mono font-bold text-cyan-300 hover:text-cyan-100 hover:underline border border-cyan-500/20 rounded-xl bg-cyan-950/20 transition-colors"
                    >
                      [ {lang === "bn" ? "পূর্ণাঙ্গ স্ট্যাটাস ও স্কিল দেখুন" : "VIEW FULL STATUS & SKILLS"} ]
                    </button>
                  </div>

                  {/* 2. Visual BMI Gauge & Energy / Macro Split Card */}
                  <div className="rounded-2xl border border-zinc-800 bg-[#060b18]/90 p-4 space-y-3.5 shadow-md backdrop-blur-md">
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

                  {/* 3. Hunter Vault & Arsenal Preview */}
                  <div className="rounded-2xl border border-cyan-500/20 bg-[#060b18]/90 p-4 space-y-3 backdrop-blur-md">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-400">
                      <span className="flex items-center gap-1.5 text-cyan-300">
                        <Package className="h-3.5 w-3.5" /> [ HUNTER VAULT ]
                      </span>
                      <span className="text-amber-400 font-mono">🪙 {playerStats.coins ?? 1450}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
                      <div className="bg-zinc-950/70 p-2 rounded-xl border border-zinc-800/80">
                        <span className="text-zinc-500 block text-[9px]">GOLD</span>
                        <strong className="text-amber-400">{playerStats.coins ?? 1450}</strong>
                      </div>
                      <div className="bg-zinc-950/70 p-2 rounded-xl border border-zinc-800/80">
                        <span className="text-zinc-500 block text-[9px]">DUNGEON KEYS</span>
                        <strong className="text-cyan-400">{playerStats.keys ?? 3}</strong>
                      </div>
                      <div className="bg-zinc-950/70 p-2 rounded-xl border border-zinc-800/80">
                        <span className="text-zinc-500 block text-[9px]">MANA GEMS</span>
                        <strong className="text-purple-400">{playerStats.gems ?? 25}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        playSound("system-click");
                        setActiveTab("inventory");
                      }}
                      className="w-full py-2 text-center text-xs font-mono font-bold text-cyan-300 hover:text-cyan-100 hover:underline border border-cyan-500/20 rounded-xl bg-cyan-950/20 transition-colors"
                    >
                      [ {lang === "bn" ? "ইনভেন্টরি ও গিয়ার সজ্জিত করুন" : "MANAGE GEAR & ARSENAL"} ]
                    </button>
                  </div>
                </div>
              </div>
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
        accessCode={accessCode}
        onClose={() => setShowDietSheet(false)}
      />

      <HunterAuthModal
        open={showAuthModal}
        lang={lang}
        activeAccount={activeUser}
        accounts={accounts}
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

      {/* Leveling Achievements Modal */}
      <AchievementsModal
        open={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
        lang={lang}
        questsCompletedCount={playerStats.totalWorkoutsCleared || 0}
        totalRepsCount={playerStats.totalSetsCompleted || 0}
        totalTimeHours={Math.round((history.reduce((acc, h) => acc + (h.minutes || 0), 0) / 60) * 10) / 10}
        onClaim={({ xp, coins: c, gems: g }) => {
          const expResult = addPlayerExp(playerStats, xp);
          const updated: PlayerStats = {
            ...expResult.stats,
            coins: (expResult.stats.coins ?? 1450) + c,
            gems: (expResult.stats.gems ?? 25) + (g ?? 0),
          };
          savePlayerStats(updated);
          setPlayerStats(updated);
          addSystemToast(
            lang === "bn" ? "[ অর্জন পুরষ্কার : সম্পন্ন ]" : "[ ACHIEVEMENT CLAIMED ]",
            lang === "bn"
              ? `+${xp} EXP এবং +${c} গোল্ড আপনার অ্যাকাউন্টে জমা হয়েছে!`
              : `+${xp} EXP and +${c} Gold acquired!`
          );
        }}
      />

      {/* Leveling Guild Hub Modal */}
      <GuildHubModal
        open={showGuildHubModal}
        onClose={() => setShowGuildHubModal(false)}
        lang={lang}
      />

      {/* Leveling Settings Drawer */}
      <LevelingSettingsDrawer
        open={showSettingsDrawer}
        onClose={() => setShowSettingsDrawer(false)}
        lang={lang}
        onLanguageChange={setLang}
        soundOn={soundOn}
        onToggleSound={() => {
          unlockAudio();
          setSoundOn(!soundOn);
        }}
        hapticsOn={hapticsOn}
        onToggleHaptics={() => setHapticsOn(!hapticsOn)}
        playerStats={playerStats}
        activeAccount={activeUser}
        profile={activeProfile}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenDiet={() => setShowDietSheet(true)}
        onOpenArsenal={() => setShowLibraryModal(true)}
        onOpenAchievements={() => setShowAchievementsModal(true)}
        onOpenGuildHub={() => setShowGuildHubModal(true)}
        onExportData={exportData}
        onResetData={() => {
          if (confirm(lang === "bn" ? "স্থানীয় ডাটা রিসেট করবেন?" : "Reset local data?")) {
            localStorage.clear();
            window.location.reload();
          }
        }}
      />

      {/* Active Workout Sticky Action Bar */}
      {activeTab === "home" && session && t && (
        <aside
          aria-label="Active session controls"
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] inset-x-3 z-30 mx-auto max-w-lg leveling-card p-2.5 backdrop-blur-xl flex items-center justify-between gap-2 transition-all animate-in slide-in-from-bottom-4 shadow-[0_0_25px_rgba(6,182,212,0.3)]"
        >
          <div className="flex items-center gap-2 pl-1.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold text-xs font-mono">
              {t.setsTotal ? Math.round((t.setsDone / t.setsTotal) * 100) : 0}%
            </span>
            <div className="text-[11px] leading-tight font-mono">
              <span className="text-white font-bold block">{t.setsDone}/{t.setsTotal} {tr.sets}</span>
              <span className="text-cyan-400">{t.volumeKg} kg {lang === "bn" ? "ভলিউম" : "vol"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!session.startedAt ? (
              <button
                type="button"
                onClick={startWorkout}
                className="flex min-h-[42px] items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-600 to-indigo-600 px-4 text-xs font-mono font-bold text-white active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{tr.startWorkoutBtn}</span>
              </button>
            ) : allDone ? (
              <button
                type="button"
                onClick={() => setShowFinish(true)}
                className="flex min-h-[42px] items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-600 to-purple-600 px-4 text-xs font-mono font-black text-white active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.5)] animate-pulse"
              >
                <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                <span>{tr.finishWorkoutBtn}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowFinish(true)}
                className="flex min-h-[42px] items-center gap-1 rounded-xl border border-cyan-500/40 bg-[#03081a] px-3 text-xs font-mono font-semibold text-cyan-300 hover:text-white active:scale-95"
              >
                <span>{tr.finishWorkoutBtn}</span>
              </button>
            )}
          </div>
        </aside>
      )}

      {/* Floating Bottom Navigation Dock (Leveling Dock - Mobile Only) */}
      <nav
        aria-label="Main Navigation Dock"
        className="md:hidden fixed bottom-3 sm:bottom-4 inset-x-0 z-40 flex justify-center pointer-events-none px-4 pb-[max(0.25rem,env(safe-area-inset-bottom))]"
      >
        <div className="leveling-dock pointer-events-auto flex items-center justify-between gap-1 px-3 py-2 w-full max-w-xs sm:max-w-sm">
          {/* 1. Home / Quests & Dungeon */}
          <button
            type="button"
            id="nav-tab-home"
            onClick={() => {
              playSound("system-click");
              vibrate(15);
              setActiveTab("home");
            }}
            aria-label="Quests & Workout"
            title={lang === "bn" ? "কোয়েস্ট ও ডানজন" : "Quests & Workout"}
            className={`flex flex-col items-center justify-center h-12 w-12 rounded-full transition-all duration-300 active:scale-90 ${
              activeTab === "home"
                ? "leveling-dock-active text-cyan-200"
                : "text-zinc-400 hover:text-cyan-200"
            }`}
          >
            <Home className="h-5 w-5" />
          </button>

          {/* 2. Statistics / Activities */}
          <button
            type="button"
            id="nav-tab-stats"
            onClick={() => {
              playSound("system-click");
              vibrate(15);
              setActiveTab("stats");
            }}
            aria-label="Statistics & Activities"
            title={lang === "bn" ? "পরিসংখ্যান ও রেকর্ড" : "Statistics & Activities"}
            className={`flex flex-col items-center justify-center h-12 w-12 rounded-full transition-all duration-300 active:scale-90 ${
              activeTab === "stats"
                ? "leveling-dock-active text-cyan-200"
                : "text-zinc-400 hover:text-cyan-200"
            }`}
          >
            <Activity className="h-5 w-5" />
          </button>

          {/* 3. Inventory & Gear */}
          <button
            type="button"
            id="nav-tab-inventory"
            onClick={() => {
              playSound("system-click");
              vibrate(15);
              setActiveTab("inventory");
            }}
            aria-label="Inventory & Shop"
            title={lang === "bn" ? "ইনভেন্টরি ও শপ" : "Inventory & Shop"}
            className={`flex flex-col items-center justify-center h-12 w-12 rounded-full transition-all duration-300 active:scale-90 ${
              activeTab === "inventory"
                ? "leveling-dock-active text-cyan-200"
                : "text-zinc-400 hover:text-cyan-200"
            }`}
          >
            <Package className="h-5 w-5" />
          </button>

          {/* 4. Player Status */}
          <button
            type="button"
            id="nav-tab-status"
            onClick={() => {
              playSound("system-click");
              vibrate(15);
              setActiveTab("status");
            }}
            aria-label="Player Status"
            title={lang === "bn" ? "খেলোয়াড়ের স্ট্যাটাস" : "Player Status"}
            className={`flex flex-col items-center justify-center h-12 w-12 rounded-full transition-all duration-300 active:scale-90 ${
              activeTab === "status"
                ? "leveling-dock-active text-cyan-200"
                : "text-zinc-400 hover:text-cyan-200"
            }`}
          >
            <UserIcon className="h-5 w-5" />
          </button>
        </div>
      </nav>
    </div>
  );
}
