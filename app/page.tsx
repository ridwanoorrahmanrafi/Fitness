"use client";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BatteryCharging,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Dumbbell,
  ExternalLink,
  Flame,
  HeartPulse,
  History as HistoryIcon,
  Home,
  Info,
  Loader2,
  Menu,
  Package,
  Pause,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Scale,
  Search,
  Send,
  Shield,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  Target,
  Timer,
  TrendingDown,
  TrendingUp,
  Trophy,
  User as UserIcon,
  Utensils,
  Volume2,
  VolumeX,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExerciseCard } from "@/components/ExerciseCard";
import { FinishSheet, type FinishResult } from "@/components/FinishSheet";
import { HistoryView } from "@/components/HistoryView";
import { ProfileSheet } from "@/components/ProfileSheet";
import { BmiGauge } from "@/components/BmiGauge";
import { DietSheet } from "@/components/DietSheet";
import { WeeklyScheduleBar } from "@/components/WeeklyScheduleBar";
import { ExerciseAnimationModal } from "@/components/ExerciseAnimationModal";
import { ExerciseLibraryModal } from "@/components/ExerciseLibraryModal";
import { GoalsProgressView } from "@/components/GoalsProgressView";
import { StrengthCalculatorCard } from "@/components/StrengthCalculatorCard";
import { PlateCalculatorModal } from "@/components/PlateCalculatorModal";
import { PersonalRecordsCard } from "@/components/PersonalRecordsCard";
import { MuscleVolumeHeatmap } from "@/components/MuscleVolumeHeatmap";
import { WaterTrackerCard } from "@/components/WaterTrackerCard";
import { LandingPage } from "@/components/LandingPage";
import { AuthModal } from "@/components/AuthModal";
import { authClient } from "@/lib/auth-client";
import { migrateGuestDataToCloud } from "@/lib/guest-migration";
import { Chip } from "@/components/Sheet";
import { getTodaySchedule } from "@/lib/schedule";
import { useStoredState } from "@/hooks/useStoredState";
import { useWakeLock } from "@/hooks/useWakeLock";
import { playSound, unlockAudio, vibrate, playAudioTone } from "@/lib/audio";
import { alternativesFor, buildOfflinePlan, estimateMinutes, focusLabel } from "@/lib/builder";
import { kcalEstimate, profileStats, macroTargets } from "@/lib/calc";
import { EXERCISES, WARMUP_MAP, getExercise, hasEquipment, MUSCLE_LABEL } from "@/lib/exercises";
import { getExerciseMedia } from "@/lib/exerciseMedia";
import { buildFeedback, initSets, lastWeights, lastExerciseSets, normalizeHistory, normalizeSession, totals } from "@/lib/session";
import { KEYS, makeBackup, mergeHistory, parseProfile, readBackup } from "@/lib/storage";
import { evaluateUserProgress } from "@/lib/evaluation";
import { generateInitialGoals, evaluateAndUpdateGoals } from "@/lib/goals";
import {
  syncWorkoutToMongo,
  syncProfileToMongo,
  syncGoalsToMongo,
  syncEvaluationToMongo,
  pullUserCloudDataFromMongo,
} from "@/lib/mongodb-sync";
import { type Language, TRANSLATIONS, FOCUS_LABELS_I18N, GOAL_LABELS_I18N } from "@/lib/i18n";
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
  type Muscle,
  type FocusId,
  type Equipment,
} from "@/lib/types";

// Supported tabs matching the fitness_workout_tracker design
type ActiveTab = "today" | "coach" | "exercises" | "nutrition" | "analytics";
type ActiveView = "landing" | "app";

// Preset AI Coach Prompts from the design template
const AI_QUICK_PROMPTS = [
  {
    label: "⚡ 20-Min Express Burn",
    prompt: "I only have 20 mins right now, give me a fast high-intensity bodyweight session.",
    presetFocus: "full" as FocusId,
    customTitle: "20-Min Express Metabolic Circuit",
    duration: 20,
    exercises: [
      {
        uid: "exp_1",
        exerciseId: "pushup",
        sets: 3,
        reps: "15 reps",
        restSeconds: 35,
        note: "Fast concentric drive, controlled 2s descent.",
      },
      {
        uid: "exp_2",
        exerciseId: "reverse_lunge",
        sets: 3,
        reps: "20 total reps",
        restSeconds: 35,
        note: "Stay upright; tap rear knee softly.",
      },
      {
        uid: "exp_3",
        exerciseId: "plank",
        sets: 3,
        reps: "40 seconds",
        restSeconds: 30,
        note: "Keep shoulders stacked directly over wrists.",
      },
    ],
  },
  {
    label: "🦵 Knee-Friendly Low Impact",
    prompt: "Give me a knee-friendly low-impact lower body & core session with zero jumping.",
    presetFocus: "legs_core" as FocusId,
    customTitle: "Zero-Impact Joint-Safe Lower Body",
    duration: 28,
    exercises: [
      {
        uid: "kf_1",
        exerciseId: "glute_bridge",
        sets: 4,
        reps: "16 total reps",
        restSeconds: 50,
        note: "Zero patellar shear force; squeeze glutes firmly.",
      },
      {
        uid: "kf_2",
        exerciseId: "bodyweight_squat",
        sets: 3,
        reps: "12 - 15 reps",
        restSeconds: 55,
        note: "Shins vertical at 90 degrees; press heels into floor.",
      },
      {
        uid: "kf_3",
        exerciseId: "dead_bug",
        sets: 3,
        reps: "12 / side",
        restSeconds: 40,
        note: "Keep body in one straight lateral plane.",
      },
    ],
  },
  {
    label: "💪 Chest & Triceps Pump",
    prompt: "Target Chest & Triceps with strict hypertrophy tempo using bodyweight.",
    presetFocus: "chest_tri" as FocusId,
    customTitle: "Chest & Triceps Hypertrophy Sculpt",
    duration: 32,
    exercises: [
      {
        uid: "ct_1",
        exerciseId: "diamond_pushup",
        sets: 4,
        reps: "12 reps",
        restSeconds: 60,
        note: "Shift load smoothly across triceps and inner pec fibers.",
      },
      {
        uid: "ct_2",
        exerciseId: "bench_dip",
        sets: 3,
        reps: "12 - 15 reps",
        restSeconds: 50,
        note: "Keep elbows pinned inward; extend fully at lockout.",
      },
    ],
  },
];

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  suggestedPlan?: WorkoutPlan | null;
}

const MUSCLE_FILTER_OPTIONS: { id: string; label: string; labelBn: string; muscles: Muscle[] }[] = [
  { id: "all", label: "All Muscles", labelBn: "সব মাসল", muscles: [] },
  { id: "chest", label: "Chest", labelBn: "চেস্ট (বুক)", muscles: ["chest"] },
  { id: "back", label: "Back", labelBn: "ব্যাক (পিঠ)", muscles: ["back"] },
  { id: "legs", label: "Legs", labelBn: "লেগস (পা)", muscles: ["quads", "glutes", "hamstrings", "calves"] },
  { id: "shoulders", label: "Shoulders", labelBn: "শোল্ডার (কাঁধ)", muscles: ["shoulders"] },
  { id: "arms", label: "Arms", labelBn: "আর্মস (হাত)", muscles: ["biceps", "triceps"] },
  { id: "core", label: "Core", labelBn: "কোর (অ্যাবস)", muscles: ["core"] },
];

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
  const isBn = lang === "bn";

  const [activeView, setActiveView] = useState<ActiveView>("app");
  const [activeTab, setActiveTab] = useState<ActiveTab>("today");
  const [analyticsSubTab, setAnalyticsSubTab] = useState<"biometrics" | "history" | "records" | "strength" | "goals">("biometrics");

  // Rest Timer State
  const [timerActive, setTimerActive] = useState(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(0);
  const [timerTotalDuration, setTimerTotalDuration] = useState(60);
  const [activeRestExercise, setActiveRestExercise] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Workout Celebration Banner Modal
  const [showCelebration, setShowCelebration] = useState(false);

  // Modals & Sheets
  const [showProfile, setShowProfile] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFinish, setShowFinish] = useState(false);
  const [showDietSheet, setShowDietSheet] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [selectedAnimationEx, setSelectedAnimationEx] = useState<Exercise | null>(null);
  const [plateCalcTarget, setPlateCalcTarget] = useState<{ open: boolean; weight: number; uid?: string } | null>(null);

  // UI state
  const [warmupOpen, setWarmupOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());

  // Exercise Library search & filters
  const [exerciseQuery, setExerciseQuery] = useState("");
  const [selectedMuscleCategory, setSelectedMuscleCategory] = useState("all");

  // AI Coach Chat Stream State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "m_init",
      sender: "ai",
      text: isBn
        ? "শুভ দিন! আপনার শরীরচর্চা ও রিকভারি অনুযায়ী আমি প্রস্তুত। ২০ মিনিটের এক্সপ্রেস ওয়ার্কআউট চান, জয়েন্ট-ফ্রেন্ডলি রুটিন, নাকি নির্দিষ্ট কোনো পেশি নিয়ে কাজ করবেন?"
        : "Morning! Your readiness score is high based on your physical calibration. Need a fast 20-minute express burn, knee-friendly adjustments, or a targeted muscle split?",
      suggestedPlan: null,
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const ready = profileReady && sessionReady && historyReady;
  const needsSetup = ready && !profile;
  const activeProfile = profile ?? DEFAULT_PROFILE;

  // Goals and evaluation
  const [goals, setGoals, goalsReady] = useStoredState<UserGoal[]>(KEYS.userGoals, []);
  const [evaluation, setEvaluation, evalReady] = useStoredState<ProgressEvaluation | null>(KEYS.evaluations, null);

  // URL Hash synchronization
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === "#landing") {
        setActiveView("landing");
      } else {
        setActiveView("app");
        if (hash === "#coach" || hash === "#ai") {
          setActiveTab("coach");
        } else if (hash === "#exercises" || hash === "#library") {
          setActiveTab("exercises");
        } else if (hash === "#analytics" || hash === "#stats" || hash === "#progress" || hash === "#history") {
          setActiveTab("analytics");
        } else if (hash === "#nutrition" || hash === "#diet") {
          setActiveTab("nutrition");
        } else if (hash === "#profile" || hash === "#details" || hash === "#settings") {
          setShowProfile(true);
        } else if (hash === "#auth" || hash === "#login") {
          setShowAuthModal(true);
        } else {
          setActiveTab("today");
        }
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // Biometric statistics and nutrition targets
  const stats = useMemo(() => profileStats(activeProfile), [activeProfile]);
  const nutrition = useMemo(
    () => macroTargets(stats.tdee, activeProfile.weightKg, activeProfile.goal),
    [stats.tdee, activeProfile.weightKg, activeProfile.goal]
  );
  const weights = useMemo(() => lastWeights(history), [history]);
  const previousSetsMap = useMemo(() => lastExerciseSets(history), [history]);
  const t = useMemo(() => (session ? totals(session) : null), [session]);

  const allDone = useMemo(() => {
    if (!session) return false;
    const lists = Object.values(session.sets);
    if (!lists.length) return false;
    return lists.every((arr) => arr.length > 0 && arr.every((s) => s.done));
  }, [session]);

  // Auth & Cloud Sync
  useEffect(() => {
    void authClient.getSession().then(({ data: authSession }) => {
      if (authSession?.user) {
        const u = authSession.user;
        const displayName = u.name || u.email?.split("@")[0] || "User";
        const cloudAccount: UserAccount = {
          id: u.id,
          name: displayName,
          emailOrHandle: u.email,
          createdAt: u.createdAt ? new Date(u.createdAt).getTime() : Date.now(),
          lastActive: Date.now(),
          profile: activeProfile,
          cloudUser: true,
        };
        setActiveUser(cloudAccount);

        try {
          const rawHist = typeof localStorage !== "undefined" ? localStorage.getItem(KEYS.history) : null;
          const localHist = rawHist ? JSON.parse(rawHist) : [];
          if (localHist.length > 0) {
            void migrateGuestDataToCloud(u.id, {
              profile: activeProfile,
              history: localHist,
              goals,
              evaluations: evaluation ? [evaluation] : [],
            });
          }
        } catch {}

        void pullUserCloudDataFromMongo(u.id).then(({ workouts, goals: cloudGoals, evaluations: cloudEvals }) => {
          if (workouts.length > 0) setHistory(workouts);
          if (cloudGoals.length > 0) setGoals(cloudGoals);
          if (cloudEvals.length > 0 && cloudEvals[0]) setEvaluation(cloudEvals[0]);
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Goals and Evaluation auto initialization
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

  // Timer interval for elapsed session minutes
  useEffect(() => {
    if (!session?.startedAt) return;
    const id = window.setInterval(() => setNowTick(Date.now()), 30000);
    return () => window.clearInterval(id);
  }, [session?.startedAt]);

  const wakeLockActive = Boolean(session?.startedAt);
  useWakeLock(wakeLockActive);

  // Rest Timer Countdown logic with Web Audio synth beeps
  useEffect(() => {
    if (timerActive && timerSecondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setTimerActive(false);
            if (soundOn) {
              playAudioTone(1046.5, 0.25);
              setTimeout(() => playAudioTone(1046.5, 0.35), 280);
            }
            return 0;
          }
          if (prev <= 4 && soundOn) {
            playAudioTone(587.33, 0.07);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timerSecondsLeft, soundOn]);

  // Celebration trigger when 100% of sets are completed
  const totalSetsCount = t?.setsTotal ?? 0;
  const doneSetsCount = t?.setsDone ?? 0;
  useEffect(() => {
    if (totalSetsCount > 0 && doneSetsCount === totalSetsCount) {
      setShowCelebration(true);
      if (soundOn) {
        playSound("complete");
      }
    }
  }, [doneSetsCount, totalSetsCount, soundOn]);

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAiTyping]);

  // Quick Profile Patch helper
  const quickPatch = (patch: Partial<Profile>) => {
    setProfile((prev) => {
      const base = prev ?? DEFAULT_PROFILE;
      const next = { ...base, ...patch };
      if (activeUser?.id) {
        void syncProfileToMongo(next, activeUser.id);
      }
      return next;
    });
  };

  const saveProfile = (p: Profile) => {
    setProfile(p);
    setShowProfile(false);
    if (p.name) {
      setActiveUser((u) =>
        u
          ? { ...u, name: p.name! }
          : {
              id: "athlete_local",
              name: p.name!,
              createdAt: Date.now(),
              lastActive: Date.now(),
              profile: p,
              cloudUser: false,
            }
      );
    }
    if (activeUser?.id) {
      void syncProfileToMongo(p, activeUser.id);
    }
  };

  // Build / Generate Routine
  const generate = async (p: Profile, opts: { offline?: boolean; focusOverride?: FocusId; equipOverride?: Equipment[] } = {}) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    setSaved(null);

    const targetProfile: Profile = {
      ...p,
      focus: opts.focusOverride ?? p.focus,
      equipment: opts.equipOverride ?? p.equipment,
    };

    const prevFeedback = history.length > 0 ? buildFeedback(history) : undefined;
    const historyPayload = history.slice(0, 3).map((h) => ({
      focus: h.focus,
      minutes: h.minutes,
      finishedAt: h.finishedAt,
      exercises: h.exercises.map((e) => ({
        exerciseId: e.exerciseId,
        setsDone: e.sets.filter((s) => s.done).length,
        setsTotal: e.sets.length,
      })),
    }));

    if (opts.offline) {
      const { plan: offlinePlan } = buildOfflinePlan(targetProfile, prevFeedback, Date.now());
      setSession({
        plan: offlinePlan,
        startedAt: undefined,
        sets: initSets(offlinePlan),
        warmupDone: {},
        meta: profileStats(targetProfile),
      });
      setBusy(false);
      return;
    }

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessCode) headers["x-access-code"] = accessCode;

      const res = await fetch("/api/generate-workout", {
        method: "POST",
        headers,
        body: JSON.stringify({
          profile: targetProfile,
          previous: prevFeedback,
          history: historyPayload,
          language: lang,
        }),
      });

      const data: GenerateResponse = await res.json();
      if (!data.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setSession({
        plan: data.plan,
        startedAt: undefined,
        sets: initSets(data.plan),
        warmupDone: {},
        meta: data.meta,
      });

      if (data.warning) setNotice(data.warning);
    } catch {
      const { plan: offlinePlan } = buildOfflinePlan(targetProfile, prevFeedback, Date.now());
      setSession({
        plan: offlinePlan,
        startedAt: undefined,
        sets: initSets(offlinePlan),
        warmupDone: {},
        meta: profileStats(targetProfile),
      });
      setNotice(isBn ? "ইন্টারনেট না থাকায় অফলাইন প্ল্যান তৈরি করা হয়েছে।" : "Built an offline plan based on your profile.");
    } finally {
      setBusy(false);
    }
  };

  // Auto initialize default session if empty on first load
  useEffect(() => {
    if (ready && !session) {
      void generate(activeProfile, { offline: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const startWorkout = () => {
    unlockAudio();
    playSound("click");
    vibrate(20);
    setSession((s) => (s ? { ...s, startedAt: Date.now() } : null));
  };

  const discard = () => {
    const promptText = isBn
      ? "বর্তমান সেশন বাতিল করবেন? সেভ করা হবে না।"
      : "Discard the current session? Changes will not be saved.";
    if (!window.confirm(promptText)) return;
    playSound("warning");
    setSession(null);
  };

  const finish = (result: FinishResult) => {
    if (!session) return;
    playSound("click");
    vibrate(40);

    const now = Date.now();
    const minutes = session.startedAt
      ? Math.max(1, Math.round((now - session.startedAt) / 60000))
      : estimateMinutes(session.plan);
    const statsCalc = totals(session);

    const entry: HistoryEntry = {
      id: `session_${now}`,
      finishedAt: now,
      title: session.plan.title,
      focus: session.plan.focus,
      minutes,
      difficulty: result.difficulty,
      soreMuscles: [],
      notes: result.notes,
      volumeKg: statsCalc.volumeKg,
      setsDone: statsCalc.setsDone,
      setsTotal: statsCalc.setsTotal,
      source: session.plan.source ?? "ai",
      kcalEstimate: kcalEstimate(activeProfile.weightKg, minutes),
      exercises: session.plan.exercises.map((pe) => ({
        exerciseId: pe.exerciseId,
        sets: session.sets[pe.uid] ?? [],
      })),
    };

    const newHistory = [entry, ...history];
    setHistory(newHistory);
    setSession(null);
    setShowFinish(false);
    setShowCelebration(false);
    setSaved(isBn ? "ওয়ার্কআউট সফলভাবে সংরক্ষিত হয়েছে!" : "Workout logged successfully!");

    const userId = activeUser?.id ?? "default";
    const newEval = evaluateUserProgress(newHistory, activeProfile, userId);
    setEvaluation(newEval);
    const { updatedGoals } = evaluateAndUpdateGoals(goals, newHistory, activeProfile, userId);
    setGoals(updatedGoals);

    if (activeUser?.id) {
      void syncWorkoutToMongo(entry, userId);
      void syncGoalsToMongo(updatedGoals, userId);
      void syncEvaluationToMongo(newEval, userId);
    }
  };

  const toggleSet = (uid: string, idx: number, restSeconds = 60, exName = "") => {
    setSession((s) => {
      if (!s) return null;
      const cur = s.sets[uid] ?? [];
      const willBeDone = !cur[idx]?.done;
      if (willBeDone) {
        playSound("set");
        vibrate([30, 50, 30]);
        if (restSeconds > 0) {
          unlockAudio();
          setTimerTotalDuration(restSeconds);
          setTimerSecondsLeft(restSeconds);
          setActiveRestExercise(exName);
          setTimerActive(true);
        }
      } else {
        playSound("click");
        vibrate(15);
      }
      const updated = cur.map((set, i) => (i === idx ? { ...set, done: !set.done } : set));
      return { ...s, sets: { ...s.sets, [uid]: updated } };
    });
  };

  const changeSet = (uid: string, idx: number, patch: Partial<SetLog>) => {
    setSession((s) => {
      if (!s) return null;
      const cur = s.sets[uid] ?? [];
      const updated = cur.map((set, i) => (i === idx ? { ...set, ...patch } : set));
      return { ...s, sets: { ...s.sets, [uid]: updated } };
    });
  };

  const swapExercise = (uid: string, newExerciseId: string) => {
    setSession((s) => {
      if (!s) return null;
      const target = getExercise(newExerciseId);
      if (!target) return s;

      const exercises = s.plan.exercises.map((pe) => {
        if (pe.uid !== uid) return pe;
        return {
          ...pe,
          exerciseId: target.id,
          reps: target.timed ? "30-45s" : pe.reps,
          note: undefined,
        };
      });

      const updatedPlan = { ...s.plan, exercises };
      const newSets = target.timed
        ? Array.from({ length: 3 }, () => ({ reps: 0, done: false }))
        : Array.from({ length: 3 }, () => ({ reps: 10, done: false }));

      return {
        ...s,
        plan: updatedPlan,
        sets: { ...s.sets, [uid]: newSets },
      };
    });
  };

  const toggleWarmup = (moveId: string) => {
    playSound("click");
    vibrate(15);
    setSession((s) => {
      if (!s) return null;
      const cur = Boolean(s.warmupDone[moveId]);
      return { ...s, warmupDone: { ...s.warmupDone, [moveId]: !cur } };
    });
  };

  // AI Coach Prompt Send Handler
  const handleSendCoachPrompt = (promptText: string, presetObj: (typeof AI_QUICK_PROMPTS)[number] | null = null) => {
    const trimmed = promptText.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: "user",
      text: trimmed,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsAiTyping(true);

    setTimeout(() => {
      let generatedPlan: WorkoutPlan;
      let replyText = "";

      if (presetObj) {
        generatedPlan = {
          id: `preset_${Date.now()}`,
          createdAt: Date.now(),
          title: presetObj.customTitle,
          focus: presetObj.presetFocus,
          coachNote: `Tailored to your request: "${presetObj.label}". Keep rest crisp to maintain metabolic intensity.`,
          warmup: [
            { moveId: "jumping_jacks", seconds: 60 },
            { moveId: "arm_circles", seconds: 45 },
          ],
          exercises: presetObj.exercises.map((ex) => ({
            uid: ex.uid,
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            reps: ex.reps,
            restSeconds: ex.restSeconds,
            note: ex.note,
          })),
          source: "ai",
        };
        replyText = isBn
          ? `আপনার বিএমআই (${stats.bmi}) অনুযায়ী **${presetObj.customTitle}** (${presetObj.duration} মিনিট) প্রস্তুত করা হয়েছে। সরাসরি আজকের ওয়ার্কআউটে লোড করতে নিচের বাটনে চাপ দিন।`
          : `I've built your **${presetObj.customTitle}** (${presetObj.duration} mins) calibrated for your ${stats.bmi} BMI. Tap below to load it straight into your Today tracker.`;
      } else {
        const lower = trimmed.toLowerCase();
        const inferredFocus: FocusId = lower.includes("chest") || lower.includes("push")
          ? "chest_tri"
          : lower.includes("back") || lower.includes("pull")
          ? "back_bi"
          : lower.includes("leg") || lower.includes("knee") || lower.includes("squat")
          ? "legs_core"
          : "full";

        const { plan: offlinePlan } = buildOfflinePlan({ ...activeProfile, focus: inferredFocus }, undefined, Date.now());
        generatedPlan = {
          ...offlinePlan,
          title: `AI Custom: ${focusLabel(inferredFocus)} Protocol`,
          coachNote: `Generated from your prompt: "${trimmed}". Calibrated for ${activeProfile.gender} profile (${stats.bmi} BMI).`,
        };

        replyText = isBn
          ? `আপনার শারীরিক তথ্য (${stats.bmi} BMI) ও উপলব্ধ সরঞ্জাম বিবেচনা করে আমি একটি লক্ষভিত্তিক **${focusLabel(inferredFocus)}** রুটিন সাজিয়েছি। এখনই শুরু করতে চান?`
          : `Got it! Based on your biometrics (${stats.bmi} BMI) and available gear, I structured a targeted **${focusLabel(inferredFocus)}** routine. Ready to start?`;
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: replyText,
        suggestedPlan: generatedPlan,
      };

      setChatMessages((prev) => [...prev, aiMsg]);
      setIsAiTyping(false);
    }, 600);
  };

  // Push Suggested AI Workout directly to Today Tab
  const deployPlanToToday = (planToDeploy: WorkoutPlan) => {
    setSession({
      plan: planToDeploy,
      startedAt: undefined,
      sets: initSets(planToDeploy),
      warmupDone: {},
      meta: profileStats(activeProfile),
    });
    setTimerActive(false);
    setTimerSecondsLeft(0);
    setShowCelebration(false);
    setActiveTab("today");
    if (soundOn) playAudioTone(784, 0.14);
  };

  // Filtered Exercises for the Library Tab
  const filteredLibraryExercises = useMemo(() => {
    return EXERCISES.filter((ex) => {
      if (exerciseQuery.trim()) {
        const q = exerciseQuery.toLowerCase();
        const matchesName = ex.name.toLowerCase().includes(q);
        const matchesMuscles = ex.muscles.some((m) =>
          (MUSCLE_LABEL[m] ?? m).toLowerCase().includes(q)
        );
        const matchesEquip = ex.requires.some((r) => r.toLowerCase().includes(q));
        if (!matchesName && !matchesMuscles && !matchesEquip) return false;
      }
      if (selectedMuscleCategory !== "all") {
        const filter = MUSCLE_FILTER_OPTIONS.find((f) => f.id === selectedMuscleCategory);
        if (filter && filter.muscles.length > 0) {
          const hasMuscle = ex.muscles.some((m) => filter.muscles.includes(m));
          if (!hasMuscle) return false;
        }
      }
      return true;
    });
  }, [exerciseQuery, selectedMuscleCategory]);

  // Backup actions
  const exportData = () => {
    const backup = makeBackup(profile, history);
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arise-fitness-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (text: string): string => {
    const b = readBackup(text);
    if (!b) return "Invalid backup file.";
    setHistory((h) => mergeHistory(h, b.history));
    if (b.profile && !profile) setProfile(b.profile);
    return `Imported ${b.history.length} session${b.history.length === 1 ? "" : "s"}.`;
  };

  // Metrics for Weight Goal Ring and Spectrum
  const targetWeight = activeProfile.goal === "endurance" ? activeProfile.weightKg - 4 : activeProfile.goal === "muscle" ? activeProfile.weightKg + 4 : activeProfile.weightKg;
  const startWeightRef = activeProfile.weightKg + (activeProfile.goal === "endurance" ? 4 : -3);
  const weightDeltaSoFar = Math.abs(startWeightRef - activeProfile.weightKg);
  const totalGoalDelta = Math.max(1, Math.abs(startWeightRef - targetWeight));
  const goalProgressPct = Math.min(100, Math.max(10, Math.round((weightDeltaSoFar / totalGoalDelta) * 100)));
  const bmiMarkerPct = Math.min(96, Math.max(4, ((stats.bmi - 15) / 20) * 100));

  const plan = session?.plan;
  const elapsedMin = session?.startedAt ? Math.max(0, Math.round((nowTick - session.startedAt) / 60000)) : null;
  const sessionCompletionPct = totalSetsCount > 0 ? Math.round((doneSetsCount / totalSetsCount) * 100) : 0;

  // View router
  if (activeView === "landing") {
    return (
      <LandingPage
        lang={lang}
        userName={activeUser?.name}
        onLanguageToggle={() => setLang(lang === "bn" ? "en" : "bn")}
        onLaunchApp={() => {
          setHasVisited(true);
          setActiveView("app");
          window.location.hash = "app";
          if (!profile) {
            setShowProfile(true);
          }
        }}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenDiet={() => setShowDietSheet(true)}
        onOpenExercises={() => setShowLibraryModal(true)}
      />
    );
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500 bg-[#09090B]" aria-busy="true">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-lime-400" /> Loading Arise Fitness...
      </main>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-zinc-100 flex items-center justify-center sm:p-4 md:p-6 font-sans antialiased selection:bg-lime-400 selection:text-zinc-950">
      {/* Sleek Mobile Phone Viewport Frame on Desktop / Full-Bleed on Mobile */}
      <div className="relative w-full sm:w-[440px] md:w-[480px] lg:w-[520px] h-[100dvh] sm:h-[890px] bg-[#09090B] sm:rounded-[44px] sm:border-[6px] sm:border-zinc-800/90 sm:shadow-[0_0_80px_rgba(163,230,53,0.12)] flex flex-col overflow-hidden">
        
        {/* Simulated Mobile Top Island on Desktop Frame */}
        <div className="hidden sm:flex items-center justify-between px-7 pt-3 pb-1 text-[11px] font-semibold text-zinc-400 bg-[#09090B] select-none shrink-0">
          <span>9:41</span>
          <div className="w-24 h-5 bg-black rounded-full border border-zinc-800/80 flex items-center justify-end px-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-lime-400 font-bold">5G</span>
            <BatteryCharging className="w-4 h-4 text-zinc-300" />
          </div>
        </div>

        {/* Top Sticky Header */}
        <header className="px-4 pt-3 pb-2.5 bg-[#09090B]/95 backdrop-blur-md border-b border-zinc-800/70 shrink-0 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center shadow-md shadow-lime-400/20 shrink-0">
                <Flame className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold tracking-tight text-white">
                    ARISE AI
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-lime-400/15 text-lime-400 border border-lime-400/30">
                    PWA
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate">
                  {activeTab === "today"
                    ? (isBn ? "স্মার্ট কমান্ড সেন্টার" : "Adaptive Command Center")
                    : activeTab === "coach"
                    ? (isBn ? "এআই রুটিন আর্কিটেক্ট" : "Neural Routine Architect")
                    : activeTab === "analytics"
                    ? (isBn ? "বায়োমেট্রিক্স ও অ্যানালিটিক্স" : "Biometrics & Telemetry")
                    : activeTab === "nutrition"
                    ? (isBn ? "পুষ্টি ও ডায়েট প্ল্যানার" : "Nutrition & Diet Planner")
                    : (isBn ? "ব্যায়াম ও টেকনিক লাইব্রেরি" : "Movement & Form Library")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Live BMI Quick Badge */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("analytics");
                  setAnalyticsSubTab("biometrics");
                }}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs hover:border-zinc-700 transition-colors cursor-pointer"
                title="View BMI & Biometrics Telemetry"
              >
                <HeartPulse className="w-3.5 h-3.5 text-lime-400" />
                <span className="font-bold text-white">{stats.bmi}</span>
                <span className="text-[10px] text-zinc-400">BMI</span>
              </button>

              {/* Audio Feedback Toggle */}
              <button
                type="button"
                onClick={() => {
                  unlockAudio();
                  setSoundOn(!soundOn);
                }}
                aria-label="Toggle Sound"
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 active:scale-95 transition-transform cursor-pointer"
              >
                {soundOn ? (
                  <Volume2 className="w-4 h-4 text-lime-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-zinc-500" />
                )}
              </button>

              {/* Language Switch */}
              <button
                type="button"
                onClick={() => setLang(lang === "bn" ? "en" : "bn")}
                className="px-2 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Toggle Language / ভাষা পরিবর্তন"
              >
                {lang === "bn" ? "বাং" : "EN"}
              </button>

              {/* My Details Modal Button */}
              <button
                type="button"
                id="btn-header-my-details"
                onClick={() => setShowProfile(true)}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-lime-400/50 transition-colors cursor-pointer"
                title={isBn ? "আমার শারীরিক বিবরণ" : "My Details"}
              >
                <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              </button>

              {/* Account Modal Button */}
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Account & Cloud Sync"
              >
                <UserIcon className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Screen Body */}
        <main className="flex-1 overflow-y-auto px-4 pt-3 pb-36 space-y-4 scroll-smooth no-scrollbar">
          {error && (
            <div role="alert" className="rounded-2xl border border-red-900/60 bg-red-950/40 p-3.5 text-xs text-red-200 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {saved && (
            <div role="status" className="flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-xs font-semibold text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-lime-400" /> {saved}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 1: TODAY (AI COMMAND CENTER & ACTIVE WORKOUT)         */}
          {/* ========================================================= */}
          {activeTab === "today" && (
            <>
              {/* Biometric Readiness & Target Weight Ring Strip */}
              <section className="grid grid-cols-2 gap-2.5">
                <div className="rounded-2xl bg-[#18181B] border border-zinc-800/80 p-3 flex items-center gap-3">
                  {/* SVG Readiness Ring */}
                  <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
                    <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#27272a"
                        strokeWidth="3.5"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#a3e635"
                        strokeWidth="3.5"
                        strokeDasharray="88"
                        strokeDashoffset={88 - (88 * 92) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-extrabold text-white">
                      92%
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold truncate">
                      AI Readiness
                    </div>
                    <div className="text-xs font-bold text-lime-400 truncate">
                      Prime Output
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate">
                      {stats.tdee} kcal TDEE
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setActiveTab("analytics");
                    setAnalyticsSubTab("biometrics");
                  }}
                  className="rounded-2xl bg-[#18181B] border border-zinc-800/80 p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                >
                  {/* SVG Weight Goal Ring */}
                  <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
                    <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#27272a"
                        strokeWidth="3.5"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3.5"
                        strokeDasharray="88"
                        strokeDashoffset={88 - (88 * goalProgressPct) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-extrabold text-white">
                      {goalProgressPct}%
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold truncate">
                      Goal Weight
                    </div>
                    <div className="text-xs font-bold text-white truncate">
                      {activeProfile.weightKg} → {targetWeight}kg
                    </div>
                    <div className="text-[10px] text-emerald-400 truncate">
                      {stats.bmiCategory} ({stats.bmi})
                    </div>
                  </div>
                </div>
              </section>

              {/* AI Adaptive Coach Hero Card */}
              <section className="rounded-3xl bg-gradient-to-b from-zinc-900 to-[#18181B] border border-zinc-800/90 p-4 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-lime-400/15 text-lime-400 border border-lime-400/30">
                    <Sparkles className="w-3 h-3" /> AI Adaptive Coach
                  </span>
                  <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    {plan ? `~${estimateMinutes(plan)}m` : `${activeProfile.minutes}m`}
                  </span>
                </div>

                <h1 className="text-lg font-extrabold text-white tracking-tight leading-snug">
                  {plan?.title || `${focusLabel(activeProfile.focus)} Adaptive Protocol`}
                </h1>

                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  {plan?.coachNote || (isBn
                    ? "আপনার শারীরিক বিএমআই ও লক্ষ্য অনুযায়ী মুভমেন্ট ক্যালিব্রেট করা হয়েছে। কঠোর ফর্ম ও টেম্পো বজায় রাখুন।"
                    : "Calibrated with progressive upper-lower mechanical tension. Focus on strict eccentric control on every rep.")}
                </p>

                {/* Target Split Quick Filter Chips */}
                <div className="mt-3.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Target Body Split
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {FOCUSES.map((f) => {
                      const active = activeProfile.focus === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            quickPatch({ focus: f.id });
                            void generate(activeProfile, { focusOverride: f.id });
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                            active
                              ? "bg-lime-400 text-zinc-950 shadow-sm shadow-lime-400/30"
                              : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200"
                          }`}
                        >
                          {FOCUS_LABELS_I18N[lang]?.[f.id] ?? f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Available Equipment Quick Chips */}
                <div className="mt-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Equipment Access
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {([
                      { id: "bodyweight", label: "Bodyweight Only" },
                      { id: "dumbbells", label: "Dumbbells" },
                      { id: "pullup_bar", label: "Pull-up Bar" },
                      { id: "barbell", label: "Barbell & Gym" },
                    ] as const).map((eq) => {
                      const active = eq.id === "bodyweight"
                        ? activeProfile.equipment.length === 0
                        : activeProfile.equipment.includes(eq.id as Equipment);
                      return (
                        <button
                          key={eq.id}
                          type="button"
                          onClick={() => {
                            let nextEquip: Equipment[];
                            if (eq.id === "bodyweight") {
                              nextEquip = [];
                            } else {
                              const targetId = eq.id as Equipment;
                              nextEquip = active
                                ? activeProfile.equipment.filter((i) => i !== targetId)
                                : [...activeProfile.equipment, targetId];
                            }
                            quickPatch({ equipment: nextEquip });
                            void generate(activeProfile, { equipOverride: nextEquip });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap border transition-all active:scale-95 cursor-pointer ${
                            active
                              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                              : "bg-zinc-950/80 border-zinc-800 text-zinc-500"
                          }`}
                        >
                          {eq.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Session Completion Meter */}
                <div className="mt-3.5 pt-3 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="text-zinc-400 font-medium">
                      Session Sets Completed
                    </span>
                    <span className="font-bold text-lime-400">
                      {doneSetsCount}/{totalSetsCount} Sets ({sessionCompletionPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-lime-400 to-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${sessionCompletionPct}%` }}
                    />
                  </div>
                </div>
              </section>

              {/* Warm-Up Accordion */}
              {plan?.warmup && plan.warmup.length > 0 && session && (
                <section className="rounded-2xl border border-zinc-800 bg-[#18181B] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setWarmupOpen(!warmupOpen)}
                    className="flex min-h-[50px] w-full items-center justify-between p-3.5 text-left hover:bg-zinc-800/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-400/15 text-lime-400">
                        <Flame className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">{tr.warmupTitle}</h3>
                        <p className="text-[11px] text-zinc-400">
                          {plan.warmup.filter((w) => session.warmupDone[w.moveId]).length} of {plan.warmup.length} completed
                        </p>
                      </div>
                    </div>
                    {warmupOpen ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
                  </button>

                  {warmupOpen && (
                    <ul className="space-y-2 border-t border-zinc-800 p-3 pt-2">
                      {plan.warmup.map((w) => {
                        const move = WARMUP_MAP[w.moveId];
                        if (!move) return null;
                        const done = Boolean(session.warmupDone[w.moveId]);
                        return (
                          <li
                            key={w.moveId}
                            className={`flex items-start gap-3 rounded-xl border p-2.5 transition-all ${
                              done ? "border-emerald-500/30 bg-emerald-950/15 opacity-70" : "border-zinc-800 bg-zinc-950"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => toggleWarmup(w.moveId)}
                              aria-label={`Mark ${move.name} done`}
                              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md cursor-pointer ${
                                done ? "bg-lime-400 text-zinc-950" : "border border-zinc-700 bg-zinc-900"
                              }`}
                            >
                              {done && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                            </button>
                            <div className="min-w-0 flex-1">
                              <div className={`text-xs font-semibold ${done ? "text-zinc-500 line-through" : "text-white"}`}>
                                {move.name}
                              </div>
                              <p className="text-[10px] text-zinc-400">{move.notes}</p>
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono self-center">
                              {w.seconds}s
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              )}

              {/* Interactive Exercise Cards */}
              <section className="space-y-3">
                <div className="flex items-center justify-between px-0.5">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-lime-400" />
                    Today&apos;s Movements ({plan?.exercises.length ?? 0})
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void generate(activeProfile, { offline: true })}
                      disabled={busy}
                      className="text-[11px] font-semibold text-zinc-400 hover:text-lime-400 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  </div>
                </div>

                {plan && session && plan.exercises.map((pe, idx) => {
                  const ex = getExercise(pe.exerciseId);
                  if (!ex) return null;
                  const owned = activeProfile.equipment;
                  const easier = ex.easier ? getExercise(ex.easier) : undefined;
                  const harder = ex.harder ? getExercise(ex.harder) : undefined;
                  const inPlan = plan.exercises.map((x) => x.exerciseId);

                  return (
                    <ExerciseCard
                      key={pe.uid}
                      index={idx}
                      planExercise={pe}
                      exercise={ex}
                      sets={session.sets[pe.uid] ?? []}
                      lastWeightKg={weights[ex.id]}
                      previousSets={previousSetsMap[ex.id]}
                      easier={easier && hasEquipment(easier, owned) && !inPlan.includes(easier.id) ? easier : undefined}
                      harder={harder && hasEquipment(harder, owned) && !inPlan.includes(harder.id) ? harder : undefined}
                      alternatives={alternativesFor(ex.id, activeProfile, inPlan)}
                      unitSystem={unitSystem}
                      lang={lang}
                      onToggleSet={(setIdx) => toggleSet(pe.uid, setIdx, pe.restSeconds, ex.name)}
                      onChangeSet={(setIdx, patch) => changeSet(pe.uid, setIdx, patch)}
                      onSwap={(id) => swapExercise(pe.uid, id)}
                      onStartHold={(secs, label) => {
                        unlockAudio();
                        setTimerTotalDuration(secs);
                        setTimerSecondsLeft(secs);
                        setActiveRestExercise(`Hold: ${label}`);
                        setTimerActive(true);
                      }}
                      onOpenAnimation={() => setSelectedAnimationEx(ex)}
                      onOpenPlateCalculator={(w) => setPlateCalcTarget({ open: true, weight: w, uid: pe.uid })}
                    />
                  );
                })}

                {/* Session Actions: Start or Finish Workout */}
                {session && (
                  <div className="pt-2 space-y-2">
                    {!session.startedAt ? (
                      <button
                        type="button"
                        onClick={startWorkout}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-lime-400 to-emerald-500 text-zinc-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-lime-400/20 active:scale-95 transition-transform cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>{tr.startWorkoutBtn}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowFinish(true)}
                        className={`w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
                          allDone
                            ? "bg-gradient-to-r from-lime-400 to-emerald-500 text-zinc-950 shadow-lg shadow-lime-400/20"
                            : "bg-zinc-800 text-white hover:bg-zinc-700"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{tr.finishWorkoutBtn}</span>
                      </button>
                    )}
                  </div>
                )}
              </section>
            </>
          )}

          {/* ========================================================= */}
          {/* TAB 2: AI COACH (NEURAL ROUTINE ARCHITECT & CHAT STREAM)  */}
          {/* ========================================================= */}
          {activeTab === "coach" && (
            <div className="flex flex-col h-full space-y-3">
              {/* Quick Preset Prompt Chips */}
              <div className="rounded-2xl bg-[#18181B] border border-zinc-800/80 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-lime-400" />
                  One-Tap AI Routine Presets
                </div>
                <div className="flex flex-col gap-1.5">
                  {AI_QUICK_PROMPTS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleSendCoachPrompt(preset.prompt, preset)}
                      className="w-full text-left px-3 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs font-semibold text-zinc-200 active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <span>{preset.label}</span>
                      <ChevronRight className="w-4 h-4 text-lime-400" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Conversation Stream */}
              <div className="space-y-3 pb-2">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-lime-400 text-zinc-950 font-semibold rounded-br-sm"
                          : "bg-[#18181B] border border-zinc-800 text-zinc-200 rounded-bl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Generated Routine Action Card inside Chat */}
                    {msg.suggestedPlan && (
                      <div className="w-full mt-2 rounded-2xl bg-zinc-900 border border-lime-400/40 p-3.5 shadow-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400">
                            Ready to Deploy
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            ~{estimateMinutes(msg.suggestedPlan)} mins • {msg.suggestedPlan.exercises.length} moves
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-white mb-2">
                          {msg.suggestedPlan.title}
                        </h4>
                        <div className="space-y-1 mb-3">
                          {msg.suggestedPlan.exercises.map((pe, i) => {
                            const ex = getExercise(pe.exerciseId);
                            return (
                              <div
                                key={i}
                                className="text-[11px] text-zinc-400 flex justify-between"
                              >
                                <span>• {ex?.name || pe.exerciseId}</span>
                                <span className="text-zinc-300 font-semibold">
                                  {pe.sets}×{pe.reps}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={() => deployPlanToToday(msg.suggestedPlan!)}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-lime-400 to-emerald-500 text-zinc-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-lime-400/20 active:scale-95 transition-transform cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Load Into Today&apos;s Workout</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {isAiTyping && (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#18181B] border border-zinc-800 text-xs text-lime-400">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Calibrating routine for {stats.bmi} BMI...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Custom Prompt Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendCoachPrompt(chatInput);
                }}
                className="sticky bottom-0 pt-2 bg-[#09090B]"
              >
                <div className="flex items-center gap-2 bg-[#18181B] border border-zinc-800 rounded-2xl p-1.5 focus-within:border-lime-400/60">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask AI Coach (e.g., 'Back & Biceps no gear')..."
                    className="flex-1 bg-transparent px-2.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl bg-lime-400 text-zinc-950 font-bold active:scale-90 transition-transform cursor-pointer"
                  >
                    <Send className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: BODY & STATS (BIOMETRICS & TELEMETRY)               */}
          {/* ========================================================= */}
          {activeTab === "analytics" && (
            <div className="space-y-4">
              {/* Analytics Sub-Tab Navigation Bar */}
              <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: "biometrics", label: "Biometrics & Engine" },
                  { id: "history", label: "Workout History" },
                  { id: "records", label: "PR Hall of Fame" },
                  { id: "strength", label: "1RM Strength" },
                  { id: "goals", label: "Goals & Milestones" },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setAnalyticsSubTab(st.id as typeof analyticsSubTab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      analyticsSubTab === st.id
                        ? "bg-lime-400 text-zinc-950 shadow-sm"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {analyticsSubTab === "biometrics" && (
                <>
                  {/* Live BMI & Calorie Calculator Card */}
                  <section className="rounded-3xl bg-[#18181B] border border-zinc-800/80 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400">
                          Live Biometric Engine
                        </span>
                        <h2 className="text-base font-extrabold text-white">
                          BMI & Daily TDEE Telemetry
                        </h2>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-lime-400 leading-none">
                          {stats.bmi}
                        </div>
                        <div className="text-[11px] font-semibold text-emerald-400 mt-0.5">
                          {stats.bmiCategory}
                        </div>
                      </div>
                    </div>

                    {/* Visual BMI Spectrum Bar */}
                    <div>
                      <div className="relative h-2.5 w-full rounded-full bg-gradient-to-r from-sky-400 via-lime-400 via-amber-400 to-rose-500">
                        <div
                          className="absolute -top-1.5 w-5 h-5 rounded-full bg-white border-4 border-zinc-950 shadow-md transition-all duration-200"
                          style={{ left: `calc(${bmiMarkerPct}% - 10px)` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-zinc-500 font-semibold mt-1.5">
                        <span>15 Under</span>
                        <span>18.5 Optimal</span>
                        <span>25 Over</span>
                        <span>30+</span>
                      </div>
                    </div>

                    {/* Gender Pill Switch */}
                    <div className="grid grid-cols-2 gap-2">
                      {(["male", "female"] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => quickPatch({ gender: g })}
                          className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer ${
                            activeProfile.gender === g
                              ? "bg-lime-400/15 border-lime-400 text-lime-400"
                              : "bg-zinc-950 border-zinc-800 text-zinc-400"
                          }`}
                        >
                          {g} Calibration
                        </button>
                      ))}
                    </div>

                    {/* Interactive Sliders */}
                    <div className="space-y-3 pt-1">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-zinc-400">Height</span>
                          <span className="font-bold text-white font-mono">
                            {activeProfile.heightCm} cm
                          </span>
                        </div>
                        <input
                          type="range"
                          min="140"
                          max="210"
                          value={activeProfile.heightCm}
                          onChange={(e) => quickPatch({ heightCm: Number(e.target.value) })}
                          className="w-full accent-lime-400 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-zinc-400">Current Weight</span>
                          <span className="font-bold text-white font-mono">
                            {activeProfile.weightKg} kg
                          </span>
                        </div>
                        <input
                          type="range"
                          min="42"
                          max="140"
                          step="0.5"
                          value={activeProfile.weightKg}
                          onChange={(e) => quickPatch({ weightKg: Number(e.target.value) })}
                          className="w-full accent-lime-400 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-zinc-400">Age</span>
                          <span className="font-bold text-white font-mono">
                            {activeProfile.age} yrs
                          </span>
                        </div>
                        <input
                          type="range"
                          min="16"
                          max="75"
                          value={activeProfile.age}
                          onChange={(e) => quickPatch({ age: Number(e.target.value) })}
                          className="w-full accent-emerald-400 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Daily Calorie / Macro Summary Strip */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80 text-center">
                      <div className="rounded-xl bg-zinc-950 p-2.5 border border-zinc-800/70">
                        <div className="text-[10px] text-zinc-500 uppercase">
                          Daily TDEE
                        </div>
                        <div className="text-sm font-extrabold text-white mt-0.5 font-mono">
                          {stats.tdee}
                        </div>
                        <div className="text-[10px] text-lime-400">kcal/day</div>
                      </div>
                      <div className="rounded-xl bg-zinc-950 p-2.5 border border-zinc-800/70">
                        <div className="text-[10px] text-zinc-500 uppercase">
                          Protein Goal
                        </div>
                        <div className="text-sm font-extrabold text-white mt-0.5 font-mono">
                          {nutrition.proteinGrams}g
                        </div>
                        <div className="text-[10px] text-emerald-400">Hypertrophy</div>
                      </div>
                      <div className="rounded-xl bg-zinc-950 p-2.5 border border-zinc-800/70">
                        <div className="text-[10px] text-zinc-500 uppercase">
                          Cut Target
                        </div>
                        <div className="text-sm font-extrabold text-white mt-0.5 font-mono">
                          {stats.tdee - 350}
                        </div>
                        <div className="text-[10px] text-zinc-400">-350 kcal</div>
                      </div>
                    </div>
                  </section>

                  {/* Weight Trajectory SVG Area Chart */}
                  <section className="rounded-3xl bg-[#18181B] border border-zinc-800/80 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                          <TrendingDown className="w-4 h-4 text-emerald-400" />
                          6-Week Weight Trajectory
                        </h3>
                        <p className="text-[11px] text-zinc-400">
                          Trending steadily toward {targetWeight} kg
                        </p>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-400">
                        Active
                      </span>
                    </div>

                    <svg viewBox="0 0 320 110" className="w-full h-28 overflow-visible">
                      <defs>
                        <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a3e635" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="25" x2="320" y2="25" stroke="#27272a" strokeDasharray="3 3" />
                      <line x1="0" y1="60" x2="320" y2="60" stroke="#27272a" strokeDasharray="3 3" />
                      <line x1="0" y1="95" x2="320" y2="95" stroke="#27272a" strokeDasharray="3 3" />

                      <path
                        d="M 10 22 L 70 34 L 130 42 L 190 56 L 250 66 L 310 78 L 310 100 L 10 100 Z"
                        fill="url(#weightGrad)"
                      />
                      <path
                        d="M 10 22 L 70 34 L 130 42 L 190 56 L 250 66 L 310 78"
                        fill="none"
                        stroke="#a3e635"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {[
                        [10, 22, `${activeProfile.weightKg + 3}`],
                        [70, 34, `${activeProfile.weightKg + 2.2}`],
                        [130, 42, `${activeProfile.weightKg + 1.5}`],
                        [190, 56, `${activeProfile.weightKg + 0.8}`],
                        [250, 66, `${activeProfile.weightKg + 0.3}`],
                        [310, 78, `${activeProfile.weightKg}`],
                      ].map(([cx, cy, label], i) => (
                        <g key={i}>
                          <circle
                            cx={Number(cx)}
                            cy={Number(cy)}
                            r="4"
                            fill="#09090B"
                            stroke="#a3e635"
                            strokeWidth="2.5"
                          />
                          <text
                            x={Number(cx)}
                            y={Number(cy) - 9}
                            textAnchor="middle"
                            fill="#a1a1aa"
                            fontSize="9"
                            fontWeight="bold"
                          >
                            {label}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </section>

                  {/* 28-Day Consistency Heatmap */}
                  <section className="rounded-3xl bg-[#18181B] border border-zinc-800/80 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-lime-400" />
                        28-Day Consistency Heatmap
                      </h3>
                      <span className="text-xs font-bold text-lime-400">
                        {Math.min(28, history.length + 12)} / 28 Active
                      </span>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5">
                      {[
                        3, 2, 0, 3, 2, 1, 0,
                        3, 3, 2, 0, 3, 2, 1,
                        2, 3, 3, 2, 0, 3, 2,
                        3, 0, 2, 3, 3, 2, 3,
                      ].map((intensity, i) => {
                        const bg =
                          intensity === 3
                            ? "bg-lime-400"
                            : intensity === 2
                            ? "bg-emerald-500/70"
                            : intensity === 1
                            ? "bg-emerald-900/80"
                            : "bg-zinc-900 border border-zinc-800";
                        return (
                          <div
                            key={i}
                            className={`h-7 rounded-lg ${bg} flex items-center justify-center text-[10px] font-bold ${
                              intensity === 3 ? "text-zinc-950" : "text-zinc-500"
                            }`}
                          >
                            {i + 1}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </>
              )}

              {analyticsSubTab === "history" && (
                <div className="space-y-4">
                  <MuscleVolumeHeatmap history={history} lang={lang} />
                  <HistoryView
                    history={history}
                    lang={lang}
                    onExport={exportData}
                    onImport={importData}
                    onClear={() => {
                      setHistory([]);
                      setSaved(isBn ? "হিস্ট্রি সফলভাবে মুছে ফেলা হয়েছে।" : "History cleared.");
                    }}
                  />
                </div>
              )}

              {analyticsSubTab === "records" && (
                <div className="space-y-4">
                  <PersonalRecordsCard
                    history={history}
                    lang={lang}
                    unitSystem={unitSystem}
                  />
                  <MuscleVolumeHeatmap history={history} lang={lang} />
                </div>
              )}

              {analyticsSubTab === "strength" && (
                <div className="space-y-4">
                  <StrengthCalculatorCard
                    lang={lang}
                    defaultBodyweightKg={activeProfile.weightKg}
                    defaultGender={activeProfile.gender}
                  />
                </div>
              )}

              {analyticsSubTab === "goals" && (
                <GoalsProgressView
                  goals={goals}
                  evaluation={evaluation}
                  history={history}
                  profile={activeProfile}
                  lang={lang}
                  onSyncCloud={async () => {
                    if (activeUser?.id) {
                      await syncGoalsToMongo(goals, activeUser.id);
                      if (evaluation) await syncEvaluationToMongo(evaluation, activeUser.id);
                    }
                  }}
                  onOpenCloudConfig={() => setShowAuthModal(true)}
                  onAddCustomGoal={(newG) => {
                    const fullG: UserGoal = {
                      ...newG,
                      id: `goal_${Date.now()}`,
                      createdAt: Date.now(),
                      currentValue: 0,
                      status: "active",
                    };
                    setGoals((prev) => [...prev, fullG]);
                    if (activeUser?.id) {
                      void syncGoalsToMongo([...goals, fullG], activeUser.id);
                    }
                  }}
                />
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: NUTRITION & DIET                                  */}
          {/* ========================================================= */}
          {activeTab === "nutrition" && (
            <div className="space-y-4">
              {/* Daily Hydration Tracking Widget */}
              <WaterTrackerCard lang={lang} />

              <div className="rounded-3xl bg-[#18181B] border border-zinc-800/80 p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400">
                      Sports Nutrition
                    </span>
                    <h2 className="text-base font-extrabold text-white">
                      {isBn ? "বাঙালি পুষ্টিবিজ্ঞান ও সুষম খাদ্য" : "Bangladeshi Sports Nutrition & Meals"}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowDietSheet(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-lime-400 to-emerald-500 text-zinc-950 font-bold text-xs shadow-md shadow-lime-400/20 active:scale-95 transition-transform cursor-pointer"
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>{isBn ? "পূর্ণাঙ্গ মিল চার্ট" : "Full Meal Plan"}</span>
                  </button>
                </div>

                {/* Energy & Macros Display */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-zinc-950 p-2.5 border border-zinc-800">
                    <span className="text-[10px] text-lime-400 uppercase font-semibold block">{tr.proteinLabel}</span>
                    <strong className="text-sm font-extrabold text-white font-mono">{nutrition.proteinGrams}g</strong>
                    <span className="text-[9px] text-zinc-500 block">Hypertrophy</span>
                  </div>
                  <div className="rounded-2xl bg-zinc-950 p-2.5 border border-zinc-800">
                    <span className="text-[10px] text-sky-400 uppercase font-semibold block">{tr.carbsLabel}</span>
                    <strong className="text-sm font-extrabold text-white font-mono">{nutrition.carbGrams}g</strong>
                    <span className="text-[9px] text-zinc-500 block">Energy</span>
                  </div>
                  <div className="rounded-2xl bg-zinc-950 p-2.5 border border-zinc-800">
                    <span className="text-[10px] text-amber-400 uppercase font-semibold block">{tr.fatsLabel}</span>
                    <strong className="text-sm font-extrabold text-white font-mono">{nutrition.fatGrams}g</strong>
                    <span className="text-[9px] text-zinc-500 block">Hormones</span>
                  </div>
                </div>

                {/* Key Bangladeshi Foods Checklist */}
                <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    {isBn ? "সেরা দেশীয় প্রোটিন ও খাবার" : "Essential Local Powerfoods"}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-zinc-950 p-2.5 border border-zinc-800">
                      <div className="font-bold text-white">🐟 রুই ও কাতলা মাছ</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">প্রতি ১০০ গ্রামে ১৮-২০ গ্রাম প্রোটিন</div>
                    </div>
                    <div className="rounded-xl bg-zinc-950 p-2.5 border border-zinc-800">
                      <div className="font-bold text-white">🥚 দেশি ও ফার্মের ডিম</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">প্রতি ডিমে ৬ গ্রাম প্রোটিন ও কোলিন</div>
                    </div>
                    <div className="rounded-xl bg-zinc-950 p-2.5 border border-zinc-800">
                      <div className="font-bold text-white">🍗 মুরগির মাংস</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">কম ফ্যাটে উচ্চমানের লীন প্রোটিন</div>
                    </div>
                    <div className="rounded-xl bg-zinc-950 p-2.5 border border-zinc-800">
                      <div className="font-bold text-white">🥣 মুগ ও মসুর ডাল</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">সহজলভ্য প্রোটিন, ফাইবার ও আয়রন</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: EXERCISES LIBRARY                                 */}
          {/* ========================================================= */}
          {activeTab === "exercises" && (
            <div className="space-y-4">
              <div className="rounded-3xl bg-[#18181B] border border-zinc-800/80 p-4 space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400">
                    Exercise Catalog
                  </span>
                  <h2 className="text-base font-extrabold text-white">
                    {isBn ? "ব্যায়াম লাইব্রেরি ও মুভমেন্ট গাইড" : "Movement & Form Guide"}
                  </h2>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder={isBn ? "ব্যায়ামের নাম, পেশি বা সরঞ্জাম দিয়ে খুঁজুন..." : "Search exercises by name, muscle, or gear..."}
                    value={exerciseQuery}
                    onChange={(e) => setExerciseQuery(e.target.value)}
                    className="h-10 w-full rounded-2xl border border-zinc-800 bg-zinc-950 pl-9 pr-8 text-xs text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none"
                  />
                  {exerciseQuery && (
                    <button
                      type="button"
                      onClick={() => setExerciseQuery("")}
                      className="absolute right-3 top-3 text-zinc-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Muscle Filter Chips */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {MUSCLE_FILTER_OPTIONS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedMuscleCategory(f.id)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedMuscleCategory === f.id
                          ? "bg-lime-400 text-zinc-950 shadow-sm"
                          : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {isBn ? f.labelBn : f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Movement Cards Grid */}
              <div className="space-y-3">
                {filteredLibraryExercises.map((ex) => {
                  const media = getExerciseMedia(ex.id);
                  return (
                    <div
                      key={ex.id}
                      onClick={() => setSelectedAnimationEx(ex)}
                      className="rounded-3xl bg-[#18181B] border border-zinc-800/80 p-3.5 flex items-center justify-between gap-3 hover:border-lime-400/50 transition-all cursor-pointer active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                          <img
                            src={media.localGif}
                            alt={ex.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lime-400 text-zinc-950 shadow">
                              <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
                            </span>
                          </div>
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-extrabold text-white text-sm truncate">
                            {ex.name}
                          </h3>
                          <p className="text-[11px] font-semibold text-emerald-400 truncate mt-0.5">
                            {ex.muscles.map((m) => MUSCLE_LABEL[m]).join(" · ")}
                          </p>
                          <span className="text-[10px] text-zinc-500 uppercase mt-0.5 block truncate">
                            {ex.requires.length ? ex.requires.join(", ").replace("_", " ") : "bodyweight"}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>

        {/* ========================================================= */}
        {/* FLOATING GLASSMORPHIC AI REST COUNTDOWN TIMER PILL        */}
        {/* ========================================================= */}
        {timerSecondsLeft > 0 && (
          <div className="absolute bottom-[84px] left-3.5 right-3.5 z-30 rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-lime-400/40 p-3 shadow-[0_10px_35px_rgba(0,0,0,0.85)] animate-in slide-in-from-bottom-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-lime-400">
                    AI Rest Timer
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 truncate">
                  {activeRestExercise || "Next Set Interval"}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xl font-black font-mono text-white mr-1">
                  {Math.floor(timerSecondsLeft / 60)}:
                  {(timerSecondsLeft % 60).toString().padStart(2, "0")}
                </span>

                <button
                  type="button"
                  onClick={() => setTimerSecondsLeft((s) => Math.max(0, s - 15))}
                  className="px-2 py-1.5 rounded-xl bg-zinc-800 text-[11px] font-bold text-zinc-200 active:scale-90 cursor-pointer"
                >
                  -15s
                </button>
                <button
                  type="button"
                  onClick={() => setTimerSecondsLeft((s) => s + 15)}
                  className="px-2 py-1.5 rounded-xl bg-zinc-800 text-[11px] font-bold text-zinc-200 active:scale-90 cursor-pointer"
                >
                  +15s
                </button>
                <button
                  type="button"
                  onClick={() => setTimerActive(!timerActive)}
                  className="p-2 rounded-xl bg-lime-400 text-zinc-950 font-bold active:scale-90 cursor-pointer"
                >
                  {timerActive ? (
                    <Pause className="w-3.5 h-3.5 stroke-[2.75]" />
                  ) : (
                    <Play className="w-3.5 h-3.5 stroke-[2.75]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimerActive(false);
                    setTimerSecondsLeft(0);
                  }}
                  aria-label="Skip Rest"
                  className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white active:scale-90 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Rest Progress Bar */}
            <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-lime-400 transition-all duration-300"
                style={{
                  width: `${
                    timerTotalDuration > 0
                      ? (timerSecondsLeft / timerTotalDuration) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* THUMB-ZONE FLOATING BOTTOM NAVIGATION BAR                 */}
        {/* ========================================================= */}
        <nav
          aria-label="Primary Mobile Navigation"
          className="shrink-0 px-4 pt-2 pb-4 sm:pb-5 bg-[#09090B]/95 backdrop-blur-lg border-t border-zinc-800/80 z-30"
        >
          <div className="grid grid-cols-5 gap-1 bg-[#18181B] p-1.5 rounded-2xl border border-zinc-800/90">
            {[
              { id: "today", label: isBn ? "আজকের" : "Today", icon: Flame },
              { id: "coach", label: isBn ? "কোচ" : "AI Coach", icon: Bot },
              { id: "exercises", label: isBn ? "ব্যায়াম" : "Library", icon: Dumbbell },
              { id: "nutrition", label: isBn ? "পুষ্টি" : "Diet", icon: Utensils },
              { id: "analytics", label: isBn ? "বডি" : "Body", icon: Activity },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 cursor-pointer ${
                    isActive
                      ? "bg-lime-400 text-zinc-950 font-extrabold shadow-sm shadow-lime-400/25"
                      : "text-zinc-400 hover:text-zinc-200 font-semibold"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "stroke-[2.5]" : "stroke-[2]"
                    }`}
                  />
                  <span className="text-[10px] truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* ========================================================= */}
        {/* WORKOUT COMPLETION CELEBRATION MODAL                      */}
        {/* ========================================================= */}
        {showCelebration && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end p-4 animate-in fade-in">
            <div className="w-full rounded-3xl bg-[#18181B] border border-lime-400/40 p-6 text-center shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 mx-auto flex items-center justify-center text-zinc-950 mb-3 shadow-lg shadow-lime-400/20">
                <Trophy className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black text-white">
                Session Crushed!
              </h3>
              <p className="text-xs text-zinc-400 mt-1 mb-5">
                All {totalSetsCount} sets completed. Your recovery & progressive
                overload metrics have been updated.
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCelebration(false);
                    setShowFinish(true);
                  }}
                  className="w-full py-3 rounded-2xl bg-lime-400 text-zinc-950 font-extrabold text-sm active:scale-95 transition-transform cursor-pointer"
                >
                  Save & Log Session
                </button>
                <button
                  type="button"
                  onClick={() => setShowCelebration(false)}
                  className="w-full py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs hover:text-white"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODALS & DRAWERS                                          */}
        {/* ========================================================= */}
        {(showProfile || needsSetup) && (
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

        {showFinish && session && (
          <FinishSheet
            open
            session={session}
            weightKg={activeProfile.weightKg}
            lang={lang}
            onLanguageChange={setLang}
            onSave={finish}
            onClose={() => setShowFinish(false)}
          />
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
          onLanguageChange={setLang}
          accessCode={accessCode}
          onClose={() => setShowDietSheet(false)}
        />

        <AuthModal
          open={showAuthModal}
          lang={lang}
          onLanguageChange={setLang}
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
          onSyncCloud={async () => {
            if (activeUser?.id) {
              await syncProfileToMongo(activeProfile, activeUser.id);
              await syncGoalsToMongo(goals, activeUser.id);
              if (evaluation) await syncEvaluationToMongo(evaluation, activeUser.id);
            }
          }}
          onClose={() => setShowAuthModal(false)}
        />

        <ExerciseAnimationModal
          exercise={selectedAnimationEx}
          easier={selectedAnimationEx?.easier ? getExercise(selectedAnimationEx.easier) : undefined}
          harder={selectedAnimationEx?.harder ? getExercise(selectedAnimationEx.harder) : undefined}
          lang={lang}
          onLanguageChange={setLang}
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

        <PlateCalculatorModal
          open={Boolean(plateCalcTarget?.open)}
          initialWeightKg={plateCalcTarget?.weight || 60}
          lang={lang}
          onApplyWeight={(w) => {
            if (plateCalcTarget?.uid && session) {
              setSession((s) => {
                if (!s) return null;
                const curSets = s.sets[plateCalcTarget.uid!] ?? [];
                const updated = curSets.map((set) => (set.done ? set : { ...set, weightKg: w }));
                return { ...s, sets: { ...s.sets, [plateCalcTarget.uid!]: updated } };
              });
            }
          }}
          onClose={() => setPlateCalcTarget(null)}
        />

        <ExerciseLibraryModal
          open={showLibraryModal}
          lang={lang}
          onLanguageChange={setLang}
          onSelectExercise={(ex) => setSelectedAnimationEx(ex)}
          onClose={() => setShowLibraryModal(false)}
        />
      </div>
    </div>
  );
}
