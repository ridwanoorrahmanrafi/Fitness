import React, { useState, useEffect, useRef } from "react";
import {
  Flame,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Dumbbell,
  Sparkles,
  Info,
  X,
  Trophy,
  Activity,
  HeartPulse,
  RefreshCw,
  Send,
  Zap,
  Scale,
  TrendingDown,
  Calendar,
  Bot,
  ChevronRight,
  Sliders,
  Check,
  Utensils,
  BookOpen,
  Cloud,
  CloudOff,
  Globe,
  User,
  ShieldCheck,
  Plus,
  Minus,
  Search,
  ChevronUp
} from "lucide-react";

// ============================================================================
// BILINGUAL LOCALIZATION DICTIONARY (ENGLISH & BENGALI)
// ============================================================================
const i18n = {
  en: {
    brand: "ARISE AI",
    tagPWA: "PWA v2.0",
    today: "Today",
    coach: "AI Coach",
    library: "Library",
    nutrition: "Nutrition",
    stats: "Stats",
    readiness: "AI Readiness",
    primeOutput: "Prime Output",
    goalWeight: "Goal Weight",
    targetSplit: "Target Split",
    equipmentAccess: "Equipment Access",
    setsCompleted: "Session Sets",
    warmup: "Warm-Up Protocol",
    exercises: "Movements",
    aiSwap: "AI Swap",
    restTimer: "AI Rest Timer",
    sessionCrushed: "Session Crushed!",
    congrats: "All sets completed. Recovery & telemetry synced to MongoDB Atlas.",
    done: "Done",
    askCoach: "Ask AI Coach (e.g., 'Back & Biceps no gear')...",
    tdee: "Daily TDEE",
    proteinGoal: "Protein Goal",
    bmiCategory: "BMI Status",
    bangladeshiPowerfoods: "Local Powerfoods (Bangladesh)",
    waterIntake: "Hydration Tracker",
    searchLibrary: "Search exercises by name or muscle...",
    syncActive: "Cloud Synced",
    syncOffline: "Offline Cache",
    myDetails: "Profile"
  },
  bn: {
    brand: "এরাইজ এআই",
    tagPWA: "পিওয়া ২.০",
    today: "আজকের",
    coach: "এআই কোচ",
    library: "ব্যায়াম তালিকা",
    nutrition: "পুষ্টি",
    stats: "পরিসংখ্যান",
    readiness: "এআই রেডিনেস",
    primeOutput: "সেরা আউটপুট",
    goalWeight: "লক্ষ্য ওজন",
    targetSplit: "ব্যায়ামের ভাগ",
    equipmentAccess: "সরঞ্জাম",
    setsCompleted: "সেট সম্পন্ন",
    warmup: "ওয়ার্ম-আপ প্রোটোকল",
    exercises: "ব্যায়ামসমূহ",
    aiSwap: "এআই পরিবর্তন",
    restTimer: "এআই রেস্ট টাইমার",
    sessionCrushed: "সেশন সফল!",
    congrats: "সব সেট সম্পন্ন হয়েছে। ক্লাউড সার্ভারে ডেটা সংরক্ষিত হয়েছে।",
    done: "সম্পন্ন",
    askCoach: "এআই কোচকে জিজ্ঞেস করুন...",
    tdee: "দৈনিক ক্যালরি",
    proteinGoal: "প্রোটিন লক্ষ্য",
    bmiCategory: "বিএমআই অবস্থা",
    bangladeshiPowerfoods: "দেশীয় পুষ্টিকর খাবার (বাংলাদেশ)",
    waterIntake: "পানি খাওয়ার ট্র্যাক",
    searchLibrary: "ব্যায়াম খুঁজুন...",
    syncActive: "ক্লাউড সংযুক্ত",
    syncOffline: "অফলাইন মোড",
    myDetails: "প্রোফাইল"
  }
};

// ============================================================================
// WEB AUDIO API SYNTHESIZER (ZERO EXTERNAL ASSETS)
// ============================================================================
const playAudioTone = (frequency = 880, duration = 0.14) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    console.warn("Audio unavailable:", err);
  }
};

// ============================================================================
// EXERCISE CATALOG & SWAP POOL
// ============================================================================
const EXERCISE_CATALOG = [
  { id: "ex_1", name: "Decline Tempo Push-ups", category: "Chest", targetMuscle: "Chest, Front Delts & Triceps", equipment: "Bodyweight Only", difficulty: 2, reps: "12 - 15 reps", rest: 60, cues: "3-sec eccentric descent. Keep ribs tucked & glutes braced." },
  { id: "ex_2", name: "Bulgarian Split Squats", category: "Legs", targetMuscle: "Quads & Gluteus Medius", equipment: "Elevated Ledge", difficulty: 3, reps: "10 - 12 / leg", rest: 70, cues: "Vertical lead shin; drive forcefully through front heel." },
  { id: "ex_3", name: "Strict Scapular Pull-ups", category: "Back", targetMuscle: "Lats, Rhomboids & Biceps", equipment: "Pull-up Bar", difficulty: 2, reps: "10 - 12 reps", rest: 60, cues: "Depress shoulders away from ears; squeeze blades at top." },
  { id: "ex_4", name: "Hollow Body Plank Walkouts", category: "Core", targetMuscle: "Deep Core & Serratus", equipment: "Bodyweight Only", difficulty: 2, reps: "45 seconds", rest: 45, cues: "Avoid hip sway; maintain posterior pelvic tilt." },
  { id: "ex_5", name: "Pike Push-ups to Downward Dog", category: "Shoulders", targetMuscle: "Anterior Deltoids & Traps", equipment: "Bodyweight Only", difficulty: 3, reps: "8 - 10 reps", rest: 65, cues: "Look between hands, create tripod path with head." },
  { id: "ex_6", name: "Wall-Sit Isometric Hold", category: "Legs", targetMuscle: "Quad Tendon & Endurance", equipment: "Wall", difficulty: 1, reps: "45 seconds", rest: 55, cues: "Shins vertical at 90 degrees; press lower back into wall." }
];

const AI_SWAP_ALTERNATIVES = {
  Chest: [
    { name: "Archer Calisthenic Push-ups", targetMuscle: "Chest & Unilateral Stability", equipment: "Bodyweight Only", reps: "8 - 10 / side", rest: 60, cues: "Extend non-working arm wide; keep hips level with shoulders." },
    { name: "Incline Diamond Tempo Push-ups", targetMuscle: "Inner Chest & Triceps", equipment: "Bench or Ledge", reps: "12 - 15 reps", rest: 50, cues: "3-second lowering phase; flare elbows softly at 45 degrees." }
  ],
  Legs: [
    { name: "Tempo Cossack Lateral Squats", targetMuscle: "Quads, Adductors & Mobility", equipment: "Bodyweight Only", reps: "10 reps / leg", rest: 60, cues: "Keep heel planted flat on working side; torso tall." },
    { name: "Single-Leg Elevated Hip Thrusts", targetMuscle: "Glutes & Hamstrings", equipment: "Couch / Bench", reps: "12 - 15 / leg", rest: 55, cues: "Posterior pelvic tilt at top; hold peak contraction for 1.5s." }
  ],
  Back: [
    { name: "Prone Superman Lat Pull-ins", targetMuscle: "Lats, Rear Delts & Erectors", equipment: "Floor Mat", reps: "14 - 16 reps", rest: 45, cues: "Drive elbows down into back pockets; keep chin tucked." },
    { name: "Isometric Towel Doorway Rows", targetMuscle: "Rhomboids, Lats & Biceps", equipment: "Doorframe + Towel", reps: "10 - 12 reps", rest: 60, cues: "Initiate pull with scapular retraction before flexing arms." }
  ],
  Shoulders: [
    { name: "Elevated Pike Shoulder Presses", targetMuscle: "Anterior & Medial Deltoids", equipment: "Low Step / Chair", reps: "8 - 10 reps", rest: 65, cues: "Stack hips directly over wrists; tap crown of head gently." }
  ],
  Core: [
    { name: "Dead-Bug Anti-Extension Holds", targetMuscle: "Transverse Abdominis", equipment: "Floor Mat", reps: "45 seconds", rest: 40, cues: "Glue lumbar spine into floor; exhale forcefully on reach." }
  ]
};

// ============================================================================
// WORKOUT PLAN BUILDER
// ============================================================================
const buildWorkoutPlan = ({ targetFocus, equipment, gender, bmi }) => {
  const isHighBmi = bmi >= 25.5;
  const filtered = EXERCISE_CATALOG.filter((ex) => {
    if (targetFocus !== "Full Body" && ex.category !== targetFocus) return false;
    return true;
  });

  const exercises = filtered.length > 0 ? filtered : EXERCISE_CATALOG.slice(0, 4);

  return {
    workoutTitle: `${targetFocus} Obsidian Kinetic Protocol`,
    targetFocus,
    estimatedDurationMinutes: exercises.length * 8,
    coachingAdvice: `${
      gender === "female" ? "Optimized posterior-chain focus." : "High mechanical tension progression."
    } ${isHighBmi ? "Joint-safe low-impact mechanics prioritized." : "Strict 3-second eccentric tempo."}`,
    exercises: exercises.map((ex, idx) => ({
      ...ex,
      id: `ex_gen_${idx}_${Date.now()}`,
      sets: 4
    }))
  };
};

export default function App() {
  // Locale State
  const [lang, setLang] = useState("en");
  const t = i18n[lang];

  // Navigation Tab State ("today" | "coach" | "library" | "nutrition" | "stats")
  const [activeTab, setActiveTab] = useState("today");

  // Sync State
  const [isSynced, setIsSynced] = useState(true);

  // Biometrics State
  const [biometrics, setBiometrics] = useState({
    gender: "male",
    age: 26,
    heightCm: 178,
    weightKg: 74.5,
    targetWeightKg: 71.0,
    activityMultiplier: 1.55
  });

  // Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Active Filter State on Today Tab
  const [selectedFocus, setSelectedFocus] = useState("Full Body");
  const [selectedEquipment, setSelectedEquipment] = useState(["Bodyweight Only"]);

  // Calculate BMI & TDEE deterministically
  const heightMeters = biometrics.heightCm / 100;
  const bmi = +(biometrics.weightKg / (heightMeters * heightMeters)).toFixed(1);
  const bmiCategory =
    bmi < 18.5 ? "Underweight" : bmi < 25 ? "Optimal" : bmi < 30 ? "Overweight" : "Obese";

  const bmr =
    biometrics.gender === "female"
      ? 10 * biometrics.weightKg + 6.25 * biometrics.heightCm - 5 * biometrics.age - 161
      : 10 * biometrics.weightKg + 6.25 * biometrics.heightCm - 5 * biometrics.age + 5;
  const tdee = Math.round(bmr * biometrics.activityMultiplier);

  // Active Workout State
  const [workout, setWorkout] = useState(() =>
    buildWorkoutPlan({
      targetFocus: "Full Body",
      equipment: ["Bodyweight Only"],
      gender: "male",
      bmi: 23.5
    })
  );

  // Set Completion State: { [exerciseId]: [bool, bool, ...] }
  const [completedSets, setCompletedSets] = useState(() => {
    const map = {};
    workout.exercises.forEach((ex) => {
      map[ex.id] = new Array(ex.sets).fill(false);
    });
    return map;
  });

  // Swapping Animation ID
  const [swappingId, setSwappingId] = useState(null);

  // Rest Timer State
  const [timerActive, setTimerActive] = useState(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(0);
  const [timerTotalDuration, setTimerTotalDuration] = useState(60);
  const [activeRestExercise, setActiveRestExercise] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timerRef = useRef(null);

  // Celebration Modal State
  const [showCelebration, setShowCelebration] = useState(false);

  // AI Coach Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      id: "m_1",
      sender: "ai",
      text: "Readiness score is 92%. Want a 20-min express burn, joint-friendly lower body, or chest hypertrophy protocol?",
      suggestedPlan: null
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Water Tracker State
  const [waterMl, setWaterMl] = useState(1750);

  // Library Search State
  const [librarySearch, setLibrarySearch] = useState("");
  const [libraryFilter, setLibraryFilter] = useState("All");

  // Regenerate routine when focus or equipment changes
  const regenerateRoutine = (focus, equipmentList) => {
    const plan = buildWorkoutPlan({
      targetFocus: focus,
      equipment: equipmentList,
      gender: biometrics.gender,
      bmi
    });
    setWorkout(plan);
    const freshSets = {};
    plan.exercises.forEach((ex) => {
      freshSets[ex.id] = new Array(ex.sets).fill(false);
    });
    setCompletedSets(freshSets);
    setTimerActive(false);
    setTimerSecondsLeft(0);
    setShowCelebration(false);
  };

  const handleFocusSelect = (focus) => {
    setSelectedFocus(focus);
    regenerateRoutine(focus, selectedEquipment);
  };

  const handleEquipmentToggle = (eq) => {
    let updated;
    if (eq === "Bodyweight Only") {
      updated = ["Bodyweight Only"];
    } else {
      const withoutBw = selectedEquipment.filter((i) => i !== "Bodyweight Only");
      updated = withoutBw.includes(eq) ? withoutBw.filter((i) => i !== eq) : [...withoutBw, eq];
      if (updated.length === 0) updated = ["Bodyweight Only"];
    }
    setSelectedEquipment(updated);
    regenerateRoutine(selectedFocus, updated);
  };

  // Instant AI Exercise Swap
  const handleQuickAiSwap = (exerciseIndex) => {
    const currentEx = workout.exercises[exerciseIndex];
    setSwappingId(currentEx.id);

    setTimeout(() => {
      const pool = AI_SWAP_ALTERNATIVES[currentEx.category] || AI_SWAP_ALTERNATIVES.Chest;
      const alternative = pool.find((alt) => alt.name !== currentEx.name) || pool[0];

      const updatedExercises = [...workout.exercises];
      updatedExercises[exerciseIndex] = {
        ...currentEx,
        name: alternative.name,
        targetMuscle: alternative.targetMuscle,
        equipment: alternative.equipment,
        reps: alternative.reps,
        rest: alternative.rest,
        cues: alternative.cues
      };

      setWorkout((prev) => ({ ...prev, exercises: updatedExercises }));
      setSwappingId(null);
      if (soundEnabled) playAudioTone(660, 0.09);
    }, 300);
  };

  // Toggle Set Pill & Launch Rest Timer
  const handleToggleSet = (exId, setIdx, restSec, exName) => {
    const prevArr = completedSets[exId] || [];
    const nextArr = [...prevArr];
    const isNowDone = !nextArr[setIdx];
    nextArr[setIdx] = isNowDone;

    setCompletedSets((prev) => ({ ...prev, [exId]: nextArr }));

    if (isNowDone) {
      setTimerTotalDuration(restSec);
      setTimerSecondsLeft(restSec);
      setActiveRestExercise(exName);
      setTimerActive(true);
      if (soundEnabled) playAudioTone(820, 0.1);
    }
  };

  // Session Completion Metrics
  const totalSets = Object.values(completedSets).reduce((sum, arr) => sum + arr.length, 0);
  const doneSets = Object.values(completedSets).reduce((sum, arr) => sum + arr.filter(Boolean).length, 0);
  const completionPct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;

  useEffect(() => {
    if (totalSets > 0 && doneSets === totalSets) {
      setShowCelebration(true);
      if (soundEnabled) {
        playAudioTone(523.25, 0.16);
        setTimeout(() => playAudioTone(659.25, 0.16), 160);
        setTimeout(() => playAudioTone(783.99, 0.3), 320);
      }
    }
  }, [doneSets, totalSets]);

  // Rest Countdown Interval
  useEffect(() => {
    if (timerActive && timerSecondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerActive(false);
            if (soundEnabled) {
              playAudioTone(1046.5, 0.25);
              setTimeout(() => playAudioTone(1046.5, 0.35), 280);
            }
            return 0;
          }
          if (prev <= 4 && soundEnabled) {
            playAudioTone(587.33, 0.07);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, timerSecondsLeft, soundEnabled]);

  // AI Chat Prompt Handler
  const handleSendCoachPrompt = (promptText, presetPlan = null) => {
    const trimmed = promptText.trim();
    if (!trimmed && !presetPlan) return;

    const userMsg = {
      id: `u_${Date.now()}`,
      sender: "user",
      text: trimmed || "Deploy preset protocol"
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsAiTyping(true);

    setTimeout(() => {
      let generatedPlan;
      let replyText = "";

      if (presetPlan) {
        generatedPlan = presetPlan;
        replyText = `Protocol deployed: **${presetPlan.workoutTitle}**. Calibrated for your ${bmi} BMI.`;
      } else {
        generatedPlan = buildWorkoutPlan({
          targetFocus: "Full Body",
          equipment: selectedEquipment,
          gender: biometrics.gender,
          bmi
        });
        replyText = `Analyzed your prompt ("${trimmed}"). Built an obsidian kinetic session tailored to your biometrics.`;
      }

      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: replyText,
        suggestedPlan: generatedPlan
      };

      setChatMessages((prev) => [...prev, aiMsg]);
      setIsAiTyping(false);
    }, 600);
  };

  const deployPlanToToday = (plan) => {
    setWorkout(plan);
    setSelectedFocus(plan.targetFocus);
    const freshSets = {};
    plan.exercises.forEach((ex) => {
      freshSets[ex.id] = new Array(ex.sets).fill(false);
    });
    setCompletedSets(freshSets);
    setTimerActive(false);
    setTimerSecondsLeft(0);
    setShowCelebration(false);
    setActiveTab("today");
    if (soundEnabled) playAudioTone(784, 0.14);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAiTyping]);

  const startWeight = 78.0;
  const weightLost = Math.max(0, startWeight - biometrics.weightKg);
  const totalGoal = Math.max(0.5, startWeight - biometrics.targetWeightKg);
  const goalProgressPct = Math.min(100, Math.round((weightLost / totalGoal) * 100));
  const bmiMarkerPct = Math.min(96, Math.max(4, ((bmi - 15) / 20) * 100));

  return (
    <div className="min-h-screen w-full bg-[#050507] text-zinc-100 flex items-center justify-center sm:p-4 md:p-6 font-sans antialiased selection:bg-lime-400 selection:text-zinc-950">
      {/* Mobile Shell Frame */}
      <div className="relative w-full sm:w-[412px] h-[100dvh] sm:h-[852px] bg-[#050507] sm:rounded-[44px] sm:border-[6px] sm:border-zinc-800/90 sm:shadow-[0_0_90px_rgba(163,230,53,0.12)] flex flex-col overflow-hidden">
        
        {/* Simulated Mobile Notch on Desktop */}
        <div className="hidden sm:flex items-center justify-between px-7 pt-3 pb-1 text-[11px] font-semibold text-zinc-400 bg-[#050507] select-none shrink-0">
          <span>9:41</span>
          <div className="w-24 h-5 bg-black rounded-full border border-zinc-800/80 flex items-center justify-end px-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-lime-400 font-bold">5G</span>
            <div className="w-3.5 h-3.5 rounded-full border border-zinc-400 flex items-center justify-center text-[8px] font-bold">✓</div>
          </div>
        </div>

        {/* Sticky Shrink-on-Scroll Header */}
        <header className="px-4 pt-3 pb-2.5 bg-[#050507]/90 backdrop-blur-xl border-b border-white/10 shrink-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-lime-400/20">
                <Flame className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold tracking-tight text-white">{t.brand}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-lime-400/15 text-lime-400 border border-lime-400/30">
                    {t.tagPWA}
                  </span>
                </div>
                {/* MongoDB Sync Indicator */}
                <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
                  {isSynced ? (
                    <>
                      <Cloud className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">{t.syncActive}</span>
                    </>
                  ) : (
                    <>
                      <CloudOff className="w-3 h-3 text-amber-400" />
                      <span className="text-amber-400">{t.syncOffline}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Live BMI Quick Badge */}
              <button
                onClick={() => setActiveTab("stats")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-surface text-xs hover:border-lime-400/50 transition-colors"
              >
                <HeartPulse className="w-3.5 h-3.5 text-lime-400" />
                <span className="font-bold text-white">{bmi}</span>
                <span className="text-[10px] text-zinc-400">BMI</span>
              </button>

              {/* Language Toggle (EN / বাং) */}
              <button
                onClick={() => setLang(lang === "en" ? "bn" : "en")}
                className="px-2 py-1.5 rounded-xl glass-surface text-[11px] font-extrabold text-lime-400 border border-lime-400/30 active:scale-95 transition-transform"
                title="Switch Language"
              >
                {lang === "en" ? "বাং" : "EN"}
              </button>

              {/* Profile / Details Trigger */}
              <button
                onClick={() => setShowProfileModal(true)}
                className="p-2 rounded-xl glass-surface text-zinc-300 hover:text-white active:scale-95 transition-transform"
                title={t.myDetails}
              >
                <User className="w-4 h-4 text-lime-400" />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Main Viewport */}
        <main className="flex-1 overflow-y-auto px-4 pt-3 pb-36 space-y-4 scroll-smooth">
          
          {/* ========================================================= */}
          {/* TAB 1: TODAY (COMMAND CENTER & ACTIVE WORKOUT)            */}
          {/* ========================================================= */}
          {activeTab === "today" && (
            <>
              {/* Concentric AI Readiness Rings */}
              <section className="grid grid-cols-2 gap-2.5">
                <div className="rounded-3xl glass-surface p-3 flex items-center gap-3">
                  <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
                    <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#27272a" strokeWidth="3.5" />
                      <circle
                        cx="18" cy="18" r="14"
                        fill="none" stroke="#a3e635" strokeWidth="3.5"
                        strokeDasharray="88" strokeDashoffset={88 - (88 * 92) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-extrabold text-white">92%</span>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">{t.readiness}</div>
                    <div className="text-xs font-bold text-lime-400">{t.primeOutput}</div>
                    <div className="text-[10px] text-zinc-500">{tdee} kcal TDEE</div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab("stats")}
                  className="rounded-3xl glass-surface p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
                    <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#27272a" strokeWidth="3.5" />
                      <circle
                        cx="18" cy="18" r="14"
                        fill="none" stroke="#10b981" strokeWidth="3.5"
                        strokeDasharray="88" strokeDashoffset={88 - (88 * goalProgressPct) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-extrabold text-white">{goalProgressPct}%</span>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">{t.goalWeight}</div>
                    <div className="text-xs font-bold text-white">{biometrics.weightKg} → {biometrics.targetWeightKg}kg</div>
                    <div className="text-[10px] text-emerald-400">{bmiCategory} ({bmi})</div>
                  </div>
                </div>
              </section>

              {/* AI Adaptive Coach Hero Card */}
              <section className="rounded-3xl glass-surface p-4 shadow-xl relative overflow-hidden border border-white/10">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-lime-400/15 text-lime-400 border border-lime-400/30">
                    <Sparkles className="w-3 h-3" /> Obsidian Kinetic AI
                  </span>
                  <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    {workout.estimatedDurationMinutes}m
                  </span>
                </div>

                <h1 className="text-lg font-extrabold text-white tracking-tight leading-snug">
                  {workout.workoutTitle}
                </h1>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  {workout.coachingAdvice}
                </p>

                {/* Target Split Quick Filter Chips */}
                <div className="mt-3.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">{t.targetSplit}</div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {["Full Body", "Push", "Pull", "Legs"].map((focus) => {
                      const active = selectedFocus === focus;
                      return (
                        <button
                          key={focus}
                          onClick={() => handleFocusSelect(focus)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                            active
                              ? "bg-lime-400 text-zinc-950 shadow-md shadow-lime-400/30"
                              : "bg-black/40 text-zinc-400 border border-white/5 hover:text-zinc-200"
                          }`}
                        >
                          {focus}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Equipment Chips */}
                <div className="mt-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">{t.equipmentAccess}</div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {["Bodyweight Only", "Dumbbells", "Pull-up Bar", "Full Gym"].map((eq) => {
                      const active = selectedEquipment.includes(eq);
                      return (
                        <button
                          key={eq}
                          onClick={() => handleEquipmentToggle(eq)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap border transition-all active:scale-95 ${
                            active
                              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                              : "bg-black/40 border-white/5 text-zinc-500"
                          }`}
                        >
                          {eq}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Session Completion Meter */}
                <div className="mt-3.5 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="text-zinc-400 font-medium">{t.setsCompleted}</span>
                    <span className="font-bold text-lime-400">{doneSets}/{totalSets} Sets ({completionPct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-lime-400 to-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                </div>
              </section>

              {/* Interactive Exercise Cards */}
              <section className="space-y-3">
                <div className="flex items-center justify-between px-0.5">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-lime-400" />
                    {t.exercises} ({workout.exercises.length})
                  </h2>
                  <button
                    onClick={() => regenerateRoutine(selectedFocus, selectedEquipment)}
                    className="text-[11px] font-semibold text-zinc-400 hover:text-lime-400 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                {workout.exercises.map((exercise, idx) => {
                  const setsState = completedSets[exercise.id] || [];
                  const allSetsDone = setsState.length > 0 && setsState.every(Boolean);
                  const isSwapping = swappingId === exercise.id;

                  return (
                    <div
                      key={exercise.id}
                      className={`rounded-3xl glass-surface p-4 transition-all border ${
                        allSetsDone ? "border-emerald-500/40 bg-zinc-900/60" : "border-white/10"
                      } ${isSwapping ? "opacity-50 scale-[0.99]" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-zinc-300">
                              #{idx + 1}
                            </span>
                            <span className="text-[11px] font-semibold text-emerald-400 truncate">
                              {exercise.targetMuscle}
                            </span>
                          </div>
                          <h3 className="text-base font-extrabold text-white leading-snug">
                            {exercise.name}
                          </h3>
                        </div>

                        {/* Instant AI Swap Button */}
                        <button
                          onClick={() => handleQuickAiSwap(idx)}
                          disabled={isSwapping}
                          className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-black/60 hover:bg-black border border-white/10 text-[11px] font-bold text-lime-400 active:scale-95 transition-all"
                        >
                          <RefreshCw className={`w-3 h-3 ${isSwapping ? "animate-spin" : ""}`} />
                          <span>{t.aiSwap}</span>
                        </button>
                      </div>

                      {/* Reps & Rest Metadata */}
                      <div className="flex items-center gap-2 mt-2.5 text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-black/50 border border-white/5 font-bold text-zinc-200">
                          {exercise.sets} × {exercise.reps}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-black/50 border border-white/5 text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-lime-400" />
                          {exercise.rest}s rest
                        </span>
                      </div>

                      {/* Form Cue */}
                      <div className="mt-2.5 px-3 py-2 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-lime-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-zinc-400 leading-relaxed">{exercise.cues}</p>
                      </div>

                      {/* Thumb-Friendly Set Completion Pills */}
                      <div className="grid grid-cols-4 gap-2 mt-3.5">
                        {setsState.map((isDone, setIdx) => (
                          <button
                            key={setIdx}
                            onClick={() => handleToggleSet(exercise.id, setIdx, exercise.rest, exercise.name)}
                            className={`py-2.5 px-2 rounded-2xl text-xs font-extrabold flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90 ${
                              isDone
                                ? "bg-gradient-to-br from-lime-400 to-emerald-500 text-zinc-950 shadow-md shadow-lime-400/20"
                                : "bg-black/60 text-zinc-300 border border-white/10 hover:border-white/20"
                            }`}
                          >
                            <CheckCircle2 className={`w-4 h-4 ${isDone ? "text-zinc-950 stroke-[2.75]" : "text-zinc-600"}`} />
                            <span className="text-[11px]">Set {setIdx + 1}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </section>
            </>
          )}

          {/* ========================================================= */}
          {/* TAB 2: AI COACH (NEURAL STREAM & PROMPTS)                 */}
          {/* ========================================================= */}
          {activeTab === "coach" && (
            <div className="flex flex-col h-full space-y-3">
              <div className="rounded-3xl glass-surface p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-lime-400" />
                  Neural Routine Presets
                </div>
                <div className="flex flex-col gap-1.5">
                  {[
                    {
                      label: "⚡ 20-Min Express Metabolic Burn",
                      prompt: "20 min full body burn",
                      presetPlan: {
                        workoutTitle: "20-Min Express Metabolic Circuit",
                        targetFocus: "Full Body",
                        estimatedDurationMinutes: 20,
                        coachingAdvice: "High heart rate retention interval protocol.",
                        exercises: [
                          { id: "e1", name: "Explosive Push-ups", targetMuscle: "Chest", reps: "15 reps", rest: 35, sets: 3, cues: "Fast concentric drive." },
                          { id: "e2", name: "Reverse Jump Lunges", targetMuscle: "Legs", reps: "20 reps", rest: 35, sets: 3, cues: "Land softly." }
                        ]
                      }
                    },
                    {
                      label: "🦵 Knee-Friendly Low Impact",
                      prompt: "Knee safe lower body",
                      presetPlan: {
                        workoutTitle: "Joint-Safe Lower Body",
                        targetFocus: "Legs",
                        estimatedDurationMinutes: 25,
                        coachingAdvice: "Zero patellar shear force.",
                        exercises: [
                          { id: "kf1", name: "Glute Bridge Marches", targetMuscle: "Glutes", reps: "16 reps", rest: 50, sets: 4, cues: "Squeeze glutes firmly." },
                          { id: "kf2", name: "Wall Sit Hold", targetMuscle: "Quads", reps: "45s", rest: 50, sets: 3, cues: "Shins vertical at 90 deg." }
                        ]
                      }
                    }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => handleSendCoachPrompt(preset.prompt, preset.presetPlan)}
                      className="w-full text-left px-3 py-2.5 rounded-2xl bg-black/60 hover:bg-black border border-white/10 flex items-center justify-between text-xs font-semibold text-zinc-200 active:scale-[0.99] transition-all"
                    >
                      <span>{preset.label}</span>
                      <ChevronRight className="w-4 h-4 text-lime-400" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Stream */}
              <div className="space-y-3 pb-2">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-lime-400 text-zinc-950 font-semibold rounded-br-sm"
                          : "glass-surface text-zinc-200 rounded-bl-sm border border-white/10"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {msg.suggestedPlan && (
                      <div className="w-full mt-2 rounded-3xl bg-zinc-900 border border-lime-400/40 p-3.5 shadow-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400">Ready to Deploy</span>
                          <span className="text-[11px] text-zinc-400">{msg.suggestedPlan.estimatedDurationMinutes} mins</span>
                        </div>
                        <h4 className="text-sm font-extrabold text-white mb-2">{msg.suggestedPlan.workoutTitle}</h4>
                        <button
                          onClick={() => deployPlanToToday(msg.suggestedPlan)}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-lime-400 to-emerald-500 text-zinc-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-lime-400/20 active:scale-95 transition-transform"
                        >
                          <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Push to Today's Workout</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {isAiTyping && (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl glass-surface text-xs text-lime-400 border border-white/10">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Neural inference in progress...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Prompt Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendCoachPrompt(chatInput);
                }}
                className="sticky bottom-0 pt-2 bg-[#050507]"
              >
                <div className="flex items-center gap-2 glass-surface rounded-2xl p-1.5 border border-white/10 focus-within:border-lime-400/60">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={t.askCoach}
                    className="flex-1 bg-transparent px-2.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                  <button type="submit" className="p-2.5 rounded-xl bg-lime-400 text-zinc-950 font-bold active:scale-90 transition-transform">
                    <Send className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: MOVEMENT LIBRARY                                   */}
          {/* ========================================================= */}
          {activeTab === "library" && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder={t.searchLibrary}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400/50"
                />
              </div>

              {/* Filter Chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {["All", "Chest", "Legs", "Back", "Shoulders", "Core"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setLibraryFilter(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      libraryFilter === cat ? "bg-lime-400 text-zinc-950" : "glass-surface text-zinc-400 border border-white/5"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-2.5">
                {EXERCISE_CATALOG.filter((ex) => {
                  if (libraryFilter !== "All" && ex.category !== libraryFilter) return false;
                  if (librarySearch && !ex.name.toLowerCase().includes(librarySearch.toLowerCase())) return false;
                  return true;
                }).map((ex) => (
                  <div key={ex.id} className="rounded-3xl glass-surface p-3.5 border border-white/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-emerald-400">{ex.targetMuscle}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-zinc-300">Level {ex.difficulty}</span>
                    </div>
                    <h4 className="text-sm font-extrabold text-white mb-1">{ex.name}</h4>
                    <p className="text-[11px] text-zinc-400">{ex.cues}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: NUTRITION & BANGLADESHI POWERFOODS                 */}
          {/* ========================================================= */}
          {activeTab === "nutrition" && (
            <div className="space-y-4">
              {/* Hydration Tracker */}
              <div className="rounded-3xl glass-surface p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    <Utensils className="w-4 h-4 text-lime-400" />
                    {t.waterIntake}
                  </h3>
                  <span className="text-xs font-bold text-lime-400">{(waterMl / 1000).toFixed(1)} / 3.0 L</span>
                </div>
                <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-cyan-400 rounded-full transition-all" style={{ width: `${Math.min(100, (waterMl / 3000) * 100)}%` }} />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setWaterMl((m) => Math.max(0, m - 250))}
                    className="flex-1 py-2 rounded-xl bg-black/50 border border-white/10 text-xs font-bold text-zinc-300 active:scale-95"
                  >
                    -250 ml
                  </button>
                  <button
                    onClick={() => setWaterMl((m) => m + 250)}
                    className="flex-1 py-2 rounded-xl bg-cyan-400 text-zinc-950 text-xs font-extrabold active:scale-95"
                  >
                    +250 ml Glass
                  </button>
                </div>
              </div>

              {/* Bangladeshi Sports Nutrition Powerfoods Dashboard */}
              <div className="rounded-3xl glass-surface p-4 border border-white/10 space-y-3">
                <div>
                  <h3 className="text-sm font-extrabold text-white">{t.bangladeshiPowerfoods}</h3>
                  <p className="text-[11px] text-zinc-400">Affordable high-protein local staples for athletic growth.</p>
                </div>

                <div className="space-y-2.5">
                  {[
                    { name: "রুই ও কাতলা মাছ (Rohu & Katla Fish)", protein: "18-20g / 100g", note: "Rich in Omega-3 & lean muscle protein." },
                    { name: "দেশি ও ফার্মের ডিম (Country & Farm Eggs)", protein: "6g / egg", note: "Complete amino acid profile + choline." },
                    { name: "মুগ ও মসুর ডাল (Moong & Red Lentils)", protein: "12g / cooked cup", note: "Essential plant protein, iron & complex carbs." },
                    { name: "মুরগির মাংস (Chicken Breast)", protein: "31g / 100g", note: "Maximum purity lean protein for hypertrophy." }
                  ].map((food, i) => (
                    <div key={i} className="rounded-2xl bg-black/50 border border-white/5 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-extrabold text-white">{food.name}</span>
                        <span className="text-[11px] font-bold text-lime-400">{food.protein}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">{food.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: BODY & STATS (BIOMETRICS, 1RM, HEATMAP)            */}
          {/* ========================================================= */}
          {activeTab === "stats" && (
            <div className="space-y-4">
              <section className="rounded-3xl glass-surface p-4 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400">Biometric Engine</span>
                    <h2 className="text-base font-extrabold text-white">BMI & Daily TDEE Telemetry</h2>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-lime-400 leading-none">{bmi}</div>
                    <div className="text-[11px] font-semibold text-emerald-400 mt-0.5">{bmiCategory}</div>
                  </div>
                </div>

                {/* BMI Bar */}
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

                {/* Sliders */}
                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400">Height</span>
                      <span className="font-bold text-white">{biometrics.heightCm} cm</span>
                    </div>
                    <input
                      type="range"
                      min="140"
                      max="210"
                      value={biometrics.heightCm}
                      onChange={(e) => setBiometrics({ ...biometrics, heightCm: Number(e.target.value) })}
                      className="w-full accent-lime-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400">Current Weight</span>
                      <span className="font-bold text-white">{biometrics.weightKg} kg</span>
                    </div>
                    <input
                      type="range"
                      min="42"
                      max="140"
                      step="0.5"
                      value={biometrics.weightKg}
                      onChange={(e) => setBiometrics({ ...biometrics, weightKg: Number(e.target.value) })}
                      className="w-full accent-lime-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400">Age</span>
                      <span className="font-bold text-white">{biometrics.age} yrs</span>
                    </div>
                    <input
                      type="range"
                      min="16"
                      max="75"
                      value={biometrics.age}
                      onChange={(e) => setBiometrics({ ...biometrics, age: Number(e.target.value) })}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Telemetry Summary */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
                  <div className="rounded-2xl bg-black/50 p-2.5 border border-white/5">
                    <div className="text-[10px] text-zinc-500 uppercase">{t.tdee}</div>
                    <div className="text-sm font-extrabold text-white mt-0.5">{tdee}</div>
                    <div className="text-[10px] text-lime-400">kcal/day</div>
                  </div>
                  <div className="rounded-2xl bg-black/50 p-2.5 border border-white/5">
                    <div className="text-[10px] text-zinc-500 uppercase">{t.proteinGoal}</div>
                    <div className="text-sm font-extrabold text-white mt-0.5">{Math.round(biometrics.weightKg * 1.9)}g</div>
                    <div className="text-[10px] text-emerald-400">Hypertrophy</div>
                  </div>
                  <div className="rounded-2xl bg-black/50 p-2.5 border border-white/5">
                    <div className="text-[10px] text-zinc-500 uppercase">Cut Target</div>
                    <div className="text-sm font-extrabold text-white mt-0.5">{tdee - 350}</div>
                    <div className="text-[10px] text-zinc-400">-350 kcal</div>
                  </div>
                </div>
              </section>

              {/* Consistency Heatmap */}
              <section className="rounded-3xl glass-surface p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-lime-400" />
                    28-Day Consistency Heatmap
                  </h3>
                  <span className="text-xs font-bold text-lime-400">19 / 28 Active</span>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {[3, 2, 0, 3, 2, 1, 0, 3, 3, 2, 0, 3, 2, 1, 2, 3, 3, 2, 0, 3, 2, 3, 0, 2, 3, 3, 2, 3].map((intensity, i) => {
                    const bg =
                      intensity === 3
                        ? "bg-lime-400 text-zinc-950 font-bold"
                        : intensity === 2
                        ? "bg-emerald-500/70 text-zinc-950 font-bold"
                        : intensity === 1
                        ? "bg-emerald-900/80 text-zinc-400"
                        : "bg-black/60 text-zinc-600 border border-white/5";
                    return (
                      <div key={i} className={`h-7 rounded-lg ${bg} flex items-center justify-center text-[10px]`}>
                        {i + 1}
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}
        </main>

        {/* ========================================================= */}
        {/* FLOATING "DYNAMIC ISLAND" REST TIMER HUD                    */}
        {/* ========================================================= */}
        {timerSecondsLeft > 0 && (
          <div className="absolute bottom-[86px] left-3.5 right-3.5 z-40 rounded-3xl glass-surface p-3 border border-lime-400/40 shadow-[0_15px_45px_rgba(0,0,0,0.85)]">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-lime-400">{t.restTimer}</span>
                </div>
                <div className="text-[11px] text-zinc-400 truncate">{activeRestExercise}</div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xl font-black font-mono text-white mr-1">
                  {Math.floor(timerSecondsLeft / 60)}:{(timerSecondsLeft % 60).toString().padStart(2, "0")}
                </span>
                <button onClick={() => setTimerSecondsLeft((s) => Math.max(0, s - 15))} className="px-2 py-1.5 rounded-xl bg-black/60 text-[11px] font-bold text-zinc-200 active:scale-90">-15s</button>
                <button onClick={() => setTimerSecondsLeft((s) => s + 15)} className="px-2 py-1.5 rounded-xl bg-black/60 text-[11px] font-bold text-zinc-200 active:scale-90">+15s</button>
                <button onClick={() => setTimerActive(!timerActive)} className="p-2 rounded-xl bg-lime-400 text-zinc-950 font-bold active:scale-90">
                  {timerActive ? <Pause className="w-3.5 h-3.5 stroke-[2.75]" /> : <Play className="w-3.5 h-3.5 stroke-[2.75]" />}
                </button>
                <button onClick={() => { setTimerActive(false); setTimerSecondsLeft(0); }} className="p-2 rounded-xl bg-black/60 text-zinc-400 hover:text-white active:scale-90">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="w-full h-1 bg-black/60 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-lime-400 transition-all duration-300"
                style={{ width: `${timerTotalDuration > 0 ? (timerSecondsLeft / timerTotalDuration) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5-TAB THUMB-ZONE BOTTOM NAVIGATION DOCK                   */}
        {/* ========================================================= */}
        <nav aria-label="Primary Navigation" className="shrink-0 px-4 pt-2 pb-4 sm:pb-5 bg-[#050507]/95 backdrop-blur-2xl border-t border-white/10 z-30">
          <div className="grid grid-cols-5 gap-1 glass-surface p-1.5 rounded-3xl border border-white/10">
            {[
              { id: "today", label: t.today, icon: Flame },
              { id: "coach", label: t.coach, icon: Bot },
              { id: "library", label: t.library, icon: BookOpen },
              { id: "nutrition", label: t.nutrition, icon: Utensils },
              { id: "stats", label: t.stats, icon: Activity }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
                    isActive ? "bg-lime-400 text-zinc-950 font-extrabold shadow-sm shadow-lime-400/30" : "text-zinc-400 hover:text-zinc-200 font-semibold"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
                  <span className="text-[10px] truncate max-w-full">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* ========================================================= */}
        {/* CELEBRATION MODAL                                         */}
        {/* ========================================================= */}
        {showCelebration && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end p-4">
            <div className="w-full rounded-3xl glass-surface border border-lime-400/40 p-6 text-center shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 mx-auto flex items-center justify-center text-zinc-950 mb-3 shadow-lg shadow-lime-400/20">
                <Trophy className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black text-white">{t.sessionCrushed}</h3>
              <p className="text-xs text-zinc-400 mt-1 mb-5">{t.congrats}</p>
              <button
                onClick={() => setShowCelebration(false)}
                className="w-full py-3 rounded-2xl bg-lime-400 text-zinc-950 font-extrabold text-sm active:scale-95 transition-transform"
              >
                {t.done}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PROFILE MODAL                                             */}
        {/* ========================================================= */}
        {showProfileModal && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-3xl glass-surface border border-white/10 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-lime-400" /> Athlete Profile
                </h3>
                <button onClick={() => setShowProfileModal(false)} className="p-1.5 rounded-xl bg-black/50 text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-400 font-medium">Gender Calibration</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {["male", "female"].map((g) => (
                      <button
                        key={g}
                        onClick={() => setBiometrics({ ...biometrics, gender: g })}
                        className={`py-2 rounded-xl font-bold capitalize border ${
                          biometrics.gender === g ? "bg-lime-400/15 border-lime-400 text-lime-400" : "bg-black/50 border-white/5 text-zinc-400"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 font-medium">Target Goal Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={biometrics.targetWeightKg}
                    onChange={(e) => setBiometrics({ ...biometrics, targetWeightKg: Number(e.target.value) })}
                    className="w-full mt-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full py-3 rounded-2xl bg-lime-400 text-zinc-950 font-extrabold text-xs active:scale-95"
              >
                Save & Sync
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}