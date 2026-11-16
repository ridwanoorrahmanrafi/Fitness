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
  BatteryCharging,
} from "lucide-react";

// Web Audio API Synth Beep Helper (zero external audio assets)
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
    console.warn("Audio feedback unavailable:", err);
  }
};

// AI Exercise Alternative Swap Pool for instant one-tap swaps
const AI_SWAP_ALTERNATIVES = {
  Chest: [
    {
      name: "Archer Calisthenic Push-ups",
      targetMuscle: "Chest & Unilateral Stability",
      equipmentNeeded: "Bodyweight Only",
      repsOrDuration: "8 - 10 / side",
      restSeconds: 60,
      formCues: "Extend non-working arm wide; keep hips level with shoulders.",
    },
    {
      name: "Incline Diamond Tempo Push-ups",
      targetMuscle: "Inner Chest & Triceps",
      equipmentNeeded: "Bench or Ledge",
      repsOrDuration: "12 - 15 reps",
      restSeconds: 50,
      formCues: "3-second lowering phase; flare elbows softly at 45 degrees.",
    },
  ],
  Legs: [
    {
      name: "Tempo Cossack Lateral Squats",
      targetMuscle: "Quads, Adductors & Hip Mobility",
      equipmentNeeded: "Bodyweight Only",
      repsOrDuration: "10 reps / leg",
      restSeconds: 60,
      formCues: "Keep heel planted flat on working side; torso tall.",
    },
    {
      name: "Single-Leg Elevated Hip Thrusts",
      targetMuscle: "Glutes & Hamstrings",
      equipmentNeeded: "Couch / Bench",
      repsOrDuration: "12 - 15 / leg",
      restSeconds: 55,
      formCues: "Posterior pelvic tilt at top; hold peak contraction for 1.5s.",
    },
  ],
  Back: [
    {
      name: "Prone Superman Lat Pull-ins",
      targetMuscle: "Lats, Rear Delts & Erectors",
      equipmentNeeded: "Floor Mat",
      repsOrDuration: "14 - 16 reps",
      restSeconds: 45,
      formCues: "Drive elbows down into back pockets; keep chin tucked.",
    },
    {
      name: "Isometric Towel Doorway Rows",
      targetMuscle: "Rhomboids, Lats & Biceps",
      equipmentNeeded: "Doorframe + Towel",
      repsOrDuration: "10 - 12 reps",
      restSeconds: 60,
      formCues: "Initiate pull with scapular retraction before flexing arms.",
    },
  ],
  Shoulders: [
    {
      name: "Elevated Pike Shoulder Presses",
      targetMuscle: "Anterior & Medial Deltoids",
      equipmentNeeded: "Low Step / Chair",
      repsOrDuration: "8 - 10 reps",
      restSeconds: 65,
      formCues: "Stack hips directly over wrists; tap crown of head gently.",
    },
  ],
  Core: [
    {
      name: "Dead-Bug Anti-Extension Holds",
      targetMuscle: "Transverse Abdominis",
      equipmentNeeded: "Floor Mat",
      repsOrDuration: "45 seconds",
      restSeconds: 40,
      formCues: "Glue lumbar spine into floor; exhale forcefully on reach.",
    },
  ],
};

// Structured Workout Presets by Target Focus & Equipment
const buildWorkoutPlan = ({ targetFocus, equipment, gender, bmi }) => {
  const isBodyweightOnly =
    equipment.length === 1 && equipment[0] === "Bodyweight Only";
  const isHighBmi = bmi >= 25.5;

  const catalog = {
    "Full Body": [
      {
        id: "fb_1",
        category: "Chest",
        name: isBodyweightOnly
          ? "Decline Tempo Push-ups"
          : "Dumbbell Floor Press",
        targetMuscle: "Chest, Front Delts & Triceps",
        equipmentNeeded: isBodyweightOnly ? "Bodyweight Only" : equipment.join(", "),
        sets: 4,
        repsOrDuration: "12 - 15 reps",
        restSeconds: 60,
        formCues: "3-sec eccentric descent. Keep ribs tucked & glutes braced.",
      },
      {
        id: "fb_2",
        category: "Legs",
        name: isHighBmi
          ? "Controlled Reverse Step Lunges"
          : "Bulgarian Split Squats",
        targetMuscle: "Quads & Gluteus Medius",
        equipmentNeeded: isBodyweightOnly ? "Elevated Ledge" : equipment.join(", "),
        sets: 4,
        repsOrDuration: "10 - 12 / leg",
        restSeconds: 70,
        formCues: isHighBmi
          ? "Low-impact step back; keep 80% load on front midfoot."
          : "Vertical lead shin; drive forcefully through front heel.",
      },
      {
        id: "fb_3",
        category: "Back",
        name: equipment.includes("Pull-up Bar")
          ? "Strict Scapular Pull-ups"
          : "Doorway Towel Isometric Rows",
        targetMuscle: "Lats, Rhomboids & Biceps",
        equipmentNeeded: equipment.includes("Pull-up Bar")
          ? "Pull-up Bar"
          : "Bodyweight / Towel",
        sets: 3,
        repsOrDuration: "10 - 12 reps",
        restSeconds: 60,
        formCues: "Depress shoulders away from ears; squeeze blades at top.",
      },
      {
        id: "fb_4",
        category: "Core",
        name: "Hollow Body Plank Walkouts",
        targetMuscle: "Deep Core & Serratus",
        equipmentNeeded: "Bodyweight Only",
        sets: 3,
        repsOrDuration: "45 seconds",
        restSeconds: 45,
        formCues: "Avoid hip sway; maintain posterior pelvic tilt.",
      },
    ],
    Push: [
      {
        id: "push_1",
        category: "Chest",
        name: "Deficit Deep Push-ups",
        targetMuscle: "Pectoralis Major",
        equipmentNeeded: isBodyweightOnly ? "Bodyweight Only" : equipment.join(", "),
        sets: 4,
        repsOrDuration: "12 - 14 reps",
        restSeconds: 60,
        formCues: "Pause 1s in deep stretch; explode upward smoothly.",
      },
      {
        id: "push_2",
        category: "Shoulders",
        name: "Pike Push-ups to Downward Dog",
        targetMuscle: "Anterior Deltoids & Traps",
        equipmentNeeded: "Bodyweight Only",
        sets: 4,
        repsOrDuration: "8 - 10 reps",
        restSeconds: 65,
        formCues: "Look between hands, create tripod path with head.",
      },
      {
        id: "push_3",
        category: "Chest",
        name: "Diamond Tricep Press-ups",
        targetMuscle: "Triceps & Inner Chest",
        equipmentNeeded: "Bodyweight Only",
        sets: 3,
        repsOrDuration: "10 - 12 reps",
        restSeconds: 50,
        formCues: "Keep elbows grazing ribcage throughout full range.",
      },
    ],
    Pull: [
      {
        id: "pull_1",
        category: "Back",
        name: equipment.includes("Pull-up Bar")
          ? "Wide-Grip Chin-ups"
          : "Under-Table Inverted Rows",
        targetMuscle: "Latissimus Dorsi & Biceps",
        equipmentNeeded: equipment.includes("Pull-up Bar")
          ? "Pull-up Bar"
          : "Bodyweight Only",
        sets: 4,
        repsOrDuration: "8 - 12 reps",
        restSeconds: 65,
        formCues: "Lead with chest toward anchor; control 2s negative.",
      },
      {
        id: "pull_2",
        category: "Back",
        name: "Prone Y-T-W Scapular Raises",
        targetMuscle: "Rear Delts & Mid-Traps",
        equipmentNeeded: "Bodyweight Only",
        sets: 3,
        repsOrDuration: "40 seconds",
        restSeconds: 45,
        formCues: "Thumbs pointed toward ceiling; keep forehead rested.",
      },
      {
        id: "pull_3",
        category: "Core",
        name: "Reverse Hollow Crunch & Hold",
        targetMuscle: "Lower Abs & Hip Flexors",
        equipmentNeeded: "Bodyweight Only",
        sets: 3,
        repsOrDuration: "15 reps",
        restSeconds: 45,
        formCues: "Curl pelvis off mat with zero momentum.",
      },
    ],
    Legs: [
      {
        id: "legs_1",
        category: "Legs",
        name: "3-1-1 Tempo Bodyweight Squats",
        targetMuscle: "Quadriceps & Glutes",
        equipmentNeeded: isBodyweightOnly ? "Bodyweight Only" : equipment.join(", "),
        sets: 4,
        repsOrDuration: "15 reps",
        restSeconds: 60,
        formCues: "3s down, 1s pause at parallel, drive knees over 2nd toe.",
      },
      {
        id: "legs_2",
        category: "Legs",
        name: "Single-Leg Glute Bridges",
        targetMuscle: "Hamstrings & Glute Max",
        equipmentNeeded: "Bodyweight Only",
        sets: 4,
        repsOrDuration: "12 / leg",
        restSeconds: 50,
        formCues: "Drive through heel; avoid lumbar hyperextension.",
      },
      {
        id: "legs_3",
        category: "Legs",
        name: "Elevated Single-Leg Calf Raises",
        targetMuscle: "Gastrocnemius & Soleus",
        equipmentNeeded: "Step / Ledge",
        sets: 3,
        repsOrDuration: "18 / leg",
        restSeconds: 40,
        formCues: "Full ankle dorsiflexion stretch at bottom.",
      },
    ],
  };

  const exercises = catalog[targetFocus] || catalog["Full Body"];
  const genderNote =
    gender === "female"
      ? "Calibrated with higher posterior-chain & pelvic stability emphasis."
      : "Calibrated with progressive upper-lower mechanical tension.";

  return {
    workoutTitle: `${targetFocus} Adaptive AI Protocol`,
    targetFocus,
    estimatedDurationMinutes: exercises.length * 9,
    coachingAdvice: `${genderNote} ${
      isHighBmi
        ? "Joint-friendly low-impact movements prioritized for your BMI."
        : "Focus on strict 3-second eccentric control on every rep."
    }`,
    exercises,
  };
};

// Initial Chat Messages for AI Coach Tab
const INITIAL_CHAT_HISTORY = [
  {
    id: "m_1",
    sender: "ai",
    text: "Morning! Your readiness score is 92% based on yesterday's recovery. Need a quick 20-minute express burn, knee-friendly adjustments, or a targeted muscle split?",
    suggestedPlan: null,
  },
];

// Preset AI Coach Prompts
const AI_QUICK_PROMPTS = [
  {
    label: "⚡ 20-Min Express Burn",
    prompt: "I only have 20 mins right now, give me a fast high-intensity bodyweight session.",
    presetFocus: "Full Body",
    customTitle: "20-Min Express Metabolic Circuit",
    duration: 20,
    exercises: [
      {
        id: "exp_1",
        category: "Chest",
        name: "Explosive Tempo Push-ups",
        targetMuscle: "Chest & Triceps",
        equipmentNeeded: "Bodyweight Only",
        sets: 3,
        repsOrDuration: "15 reps",
        restSeconds: 35,
        formCues: "Fast concentric drive, controlled 2s descent.",
      },
      {
        id: "exp_2",
        category: "Legs",
        name: "Alternating Speed Reverse Lunges",
        targetMuscle: "Quads & Glutes",
        equipmentNeeded: "Bodyweight Only",
        sets: 3,
        repsOrDuration: "20 total reps",
        restSeconds: 35,
        formCues: "Stay upright; tap rear knee softly.",
      },
      {
        id: "exp_3",
        category: "Core",
        name: "Mountain Climber Cross-Taps",
        targetMuscle: "Core & Conditioning",
        equipmentNeeded: "Bodyweight Only",
        sets: 3,
        repsOrDuration: "40 seconds",
        restSeconds: 30,
        formCues: "Keep shoulders stacked directly over wrists.",
      },
    ],
  },
  {
    label: "🦵 Knee-Friendly Low Impact",
    prompt: "Give me a knee-friendly low-impact lower body & core session with zero jumping.",
    presetFocus: "Legs",
    customTitle: "Zero-Impact Joint-Safe Lower Body",
    duration: 28,
    exercises: [
      {
        id: "kf_1",
        category: "Legs",
        name: "Elevated Glute Bridge March",
        targetMuscle: "Glutes & Hamstrings",
        equipmentNeeded: "Bodyweight Only",
        sets: 4,
        repsOrDuration: "16 total reps",
        restSeconds: 50,
        formCues: "Zero patellar shear force; squeeze glutes firmly.",
      },
      {
        id: "kf_2",
        category: "Legs",
        name: "Wall-Sit Isometric Hold",
        targetMuscle: "Quad Tendon & Endurance",
        equipmentNeeded: "Wall",
        sets: 3,
        repsOrDuration: "45 seconds",
        restSeconds: 55,
        formCues: "Shins vertical at 90 degrees; press lower back into wall.",
      },
      {
        id: "kf_3",
        category: "Core",
        name: "Side Plank Hip Dips",
        targetMuscle: "Obliques & Glute Medius",
        equipmentNeeded: "Floor Mat",
        sets: 3,
        repsOrDuration: "12 / side",
        restSeconds: 40,
        formCues: "Keep body in one straight lateral plane.",
      },
    ],
  },
  {
    label: "💪 Chest & Triceps Pump",
    prompt: "Target Chest & Triceps with strict hypertrophy tempo using bodyweight.",
    presetFocus: "Push",
    customTitle: "Chest & Triceps Hypertrophy Sculpt",
    duration: 32,
    exercises: [
      {
        id: "ct_1",
        category: "Chest",
        name: "Wide-to-Narrow Staggered Push-ups",
        targetMuscle: "Pectoralis Major",
        equipmentNeeded: "Bodyweight Only",
        sets: 4,
        repsOrDuration: "12 reps",
        restSeconds: 60,
        formCues: "Shift load smoothly across pec fibers.",
      },
      {
        id: "ct_2",
        category: "Chest",
        name: "Bodyweight Tricep Skullcrushers",
        targetMuscle: "Triceps Long Head",
        equipmentNeeded: "Low Ledge / Wall",
        sets: 3,
        repsOrDuration: "12 - 15 reps",
        restSeconds: 50,
        formCues: "Keep elbows pinned inward; extend fully at lockout.",
      },
    ],
  },
];

export default function App() {
  // Navigation Tab State ("today" | "coach" | "progress")
  const [activeTab, setActiveTab] = useState("today");

  // User Biometrics State
  const [biometrics, setBiometrics] = useState({
    gender: "male",
    age: 26,
    heightCm: 178,
    weightKg: 74.5,
    targetWeightKg: 71.0,
    activityMultiplier: 1.55,
  });

  // Active Filter State on Today Tab
  const [selectedFocus, setSelectedFocus] = useState("Full Body");
  const [selectedEquipment, setSelectedEquipment] = useState(["Bodyweight Only"]);

  // Calculate BMI & TDEE deterministically
  const heightMeters = biometrics.heightCm / 100;
  const bmi = +(biometrics.weightKg / (heightMeters * heightMeters)).toFixed(1);
  const bmiCategory =
    bmi < 18.5
      ? "Underweight"
      : bmi < 25
      ? "Optimal"
      : bmi < 30
      ? "Overweight"
      : "Obese";

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
      bmi: 23.5,
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

  // Celebration Banner State
  const [showCelebration, setShowCelebration] = useState(false);

  // AI Coach Chat State
  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT_HISTORY);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Sync workout whenever focus or equipment chips change
  const regenerateRoutine = (focus, equipmentList) => {
    const plan = buildWorkoutPlan({
      targetFocus: focus,
      equipment: equipmentList,
      gender: biometrics.gender,
      bmi,
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
      updated = withoutBw.includes(eq)
        ? withoutBw.filter((i) => i !== eq)
        : [...withoutBw, eq];
      if (updated.length === 0) updated = ["Bodyweight Only"];
    }
    setSelectedEquipment(updated);
    regenerateRoutine(selectedFocus, updated);
  };

  // Instant AI Exercise Swap on Individual Card
  const handleQuickAiSwap = (exerciseIndex) => {
    const currentEx = workout.exercises[exerciseIndex];
    setSwappingId(currentEx.id);

    setTimeout(() => {
      const pool =
        AI_SWAP_ALTERNATIVES[currentEx.category] || AI_SWAP_ALTERNATIVES.Chest;
      const alternative =
        pool.find((alt) => alt.name !== currentEx.name) || pool[0];

      const updatedExercises = [...workout.exercises];
      updatedExercises[exerciseIndex] = {
        ...currentEx,
        name: alternative.name,
        targetMuscle: alternative.targetMuscle,
        equipmentNeeded: alternative.equipmentNeeded,
        repsOrDuration: alternative.repsOrDuration,
        restSeconds: alternative.restSeconds,
        formCues: alternative.formCues,
      };

      setWorkout((prev) => ({
        ...prev,
        exercises: updatedExercises,
      }));
      setSwappingId(null);
      if (soundEnabled) playAudioTone(660, 0.09);
    }, 320);
  };

  // Toggle Set Pill & Launch Rest Timer
  const handleToggleSet = (exId, setIdx, restSec, exName) => {
    const prevArr = completedSets[exId] || [];
    const nextArr = [...prevArr];
    const isNowDone = !nextArr[setIdx];
    nextArr[setIdx] = isNowDone;

    setCompletedSets((prev) => ({
      ...prev,
      [exId]: nextArr,
    }));

    if (isNowDone) {
      setTimerTotalDuration(restSec);
      setTimerSecondsLeft(restSec);
      setActiveRestExercise(exName);
      setTimerActive(true);
      if (soundEnabled) playAudioTone(820, 0.1);
    }
  };

  // Calculate Session Completion Metrics
  const totalSets = Object.values(completedSets).reduce(
    (sum, arr) => sum + arr.length,
    0
  );
  const doneSets = Object.values(completedSets).reduce(
    (sum, arr) => sum + arr.filter(Boolean).length,
    0
  );
  const completionPct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;

  // Trigger Celebration when 100% completed
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

  // Countdown Interval Logic
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

  // AI Coach Prompt Handler
  const handleSendCoachPrompt = (promptText, presetObj = null) => {
    const trimmed = promptText.trim();
    if (!trimmed) return;

    const userMsg = {
      id: `u_${Date.now()}`,
      sender: "user",
      text: trimmed,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsAiTyping(true);

    setTimeout(() => {
      let generatedPlan;
      let replyText = "";

      if (presetObj) {
        generatedPlan = {
          workoutTitle: presetObj.customTitle,
          targetFocus: presetObj.presetFocus,
          estimatedDurationMinutes: presetObj.duration,
          coachingAdvice: `Tailored to your request: "${presetObj.label}". Keep rest crisp to maintain metabolic intensity.`,
          exercises: presetObj.exercises,
        };
        replyText = `I've built your **${presetObj.customTitle}** (${presetObj.duration} mins) calibrated for your ${bmi} BMI. Tap below to load it straight into your Today tracker.`;
      } else {
        const lower = trimmed.toLowerCase();
        const inferredFocus = lower.includes("chest") || lower.includes("push")
          ? "Push"
          : lower.includes("back") || lower.includes("pull")
          ? "Pull"
          : lower.includes("leg") || lower.includes("knee") || lower.includes("squat")
          ? "Legs"
          : "Full Body";

        const base = buildWorkoutPlan({
          targetFocus: inferredFocus,
          equipment: selectedEquipment,
          gender: biometrics.gender,
          bmi,
        });

        generatedPlan = {
          ...base,
          workoutTitle: `AI Custom: ${inferredFocus} Session`,
          coachingAdvice: `Generated from your prompt: "${trimmed}". Calibrated for ${biometrics.gender} profile (${bmi} BMI).`,
        };

        replyText = `Got it! Based on your biometrics (${bmi} BMI) and available gear, I structured a targeted **${inferredFocus}** routine. Ready to start?`;
      }

      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: replyText,
        suggestedPlan: generatedPlan,
      };

      setChatMessages((prev) => [...prev, aiMsg]);
      setIsAiTyping(false);
    }, 650);
  };

  // Push Suggested AI Workout directly to Today Tab
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

  // Weight Goal Ring Progress
  const startWeight = 78.0;
  const weightLostSoFar = Math.max(0, startWeight - biometrics.weightKg);
  const totalWeightGoal = Math.max(0.5, startWeight - biometrics.targetWeightKg);
  const goalProgressPct = Math.min(
    100,
    Math.round((weightLostSoFar / totalWeightGoal) * 100)
  );

  // BMI Marker Position on 15 - 35 Spectrum
  const bmiMarkerPct = Math.min(96, Math.max(4, ((bmi - 15) / 20) * 100));

  return (
    <div className="min-h-screen w-full bg-black text-zinc-100 flex items-center justify-center sm:p-4 md:p-6 font-sans antialiased selection:bg-lime-400 selection:text-zinc-950">
      {/* Sleek Mobile Phone Viewport Frame on Desktop / Full-Bleed on Mobile */}
      <div className="relative w-full sm:w-[412px] h-[100dvh] sm:h-[852px] bg-[#09090B] sm:rounded-[44px] sm:border-[6px] sm:border-zinc-800/90 sm:shadow-[0_0_80px_rgba(163,230,53,0.12)] flex flex-col overflow-hidden">
        {/* Simulated Mobile Notch / Dynamic Island on Desktop Frame */}
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

        {/* Top Sticky Mobile Header */}
        <header className="px-4 pt-3 pb-2.5 bg-[#09090B]/90 backdrop-blur-md border-b border-zinc-800/70 shrink-0 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center shadow-md shadow-lime-400/20">
                <Flame className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold tracking-tight text-white">
                    ARISE AI
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-lime-400/15 text-lime-400 border border-lime-400/30">
                    PWA
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  {activeTab === "today"
                    ? "Adaptive Command Center"
                    : activeTab === "coach"
                    ? "Neural Routine Architect"
                    : "Biometrics & Telemetry"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Live BMI Quick Badge */}
              <button
                onClick={() => setActiveTab("progress")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs hover:border-zinc-700 transition-colors"
              >
                <HeartPulse className="w-3.5 h-3.5 text-lime-400" />
                <span className="font-bold text-white">{bmi}</span>
                <span className="text-[10px] text-zinc-400">BMI</span>
              </button>

              {/* Audio Feedback Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                aria-label="Toggle Timer Sound"
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 active:scale-95 transition-transform"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-lime-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-zinc-500" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Screen Body */}
        <main className="flex-1 overflow-y-auto px-4 pt-3 pb-36 space-y-4 scroll-smooth">
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
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                      AI Readiness
                    </div>
                    <div className="text-xs font-bold text-lime-400">
                      Prime Output
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      {tdee} kcal TDEE
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab("progress")}
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
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                      Goal Weight
                    </div>
                    <div className="text-xs font-bold text-white">
                      {biometrics.weightKg} → {biometrics.targetWeightKg}kg
                    </div>
                    <div className="text-[10px] text-emerald-400">
                      {bmiCategory} ({bmi})
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
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Target Body Split
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {["Full Body", "Push", "Pull", "Legs"].map((focus) => {
                      const active = selectedFocus === focus;
                      return (
                        <button
                          key={focus}
                          onClick={() => handleFocusSelect(focus)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                            active
                              ? "bg-lime-400 text-zinc-950 shadow-sm shadow-lime-400/30"
                              : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200"
                          }`}
                        >
                          {focus}
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
                    {[
                      "Bodyweight Only",
                      "Dumbbells",
                      "Pull-up Bar",
                      "Full Gym",
                    ].map((eq) => {
                      const active = selectedEquipment.includes(eq);
                      return (
                        <button
                          key={eq}
                          onClick={() => handleEquipmentToggle(eq)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap border transition-all active:scale-95 ${
                            active
                              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                              : "bg-zinc-950/80 border-zinc-800 text-zinc-500"
                          }`}
                        >
                          {eq}
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
                      {doneSets}/{totalSets} Sets ({completionPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
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
                    Today's Movements ({workout.exercises.length})
                  </h2>
                  <button
                    onClick={() =>
                      regenerateRoutine(selectedFocus, selectedEquipment)
                    }
                    className="text-[11px] font-semibold text-zinc-400 hover:text-lime-400 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                {workout.exercises.map((exercise, idx) => {
                  const setsState = completedSets[exercise.id] || [];
                  const allSetsDone =
                    setsState.length > 0 && setsState.every(Boolean);
                  const isSwapping = swappingId === exercise.id;

                  return (
                    <div
                      key={exercise.id}
                      className={`rounded-3xl bg-[#18181B] border p-4 transition-all ${
                        allSetsDone
                          ? "border-emerald-500/40 bg-zinc-900/60"
                          : "border-zinc-800/80"
                      } ${isSwapping ? "opacity-50 scale-[0.99]" : ""}`}
                    >
                      {/* Top Row: Index + Title + Quick AI Swap Button */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
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

                        {/* Quick AI Swap Button */}
                        <button
                          onClick={() => handleQuickAiSwap(idx)}
                          disabled={isSwapping}
                          title="Instant AI Exercise Swap"
                          className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-bold text-lime-400 active:scale-95 transition-all"
                        >
                          <RefreshCw
                            className={`w-3 h-3 ${
                              isSwapping ? "animate-spin" : ""
                            }`}
                          />
                          <span>AI Swap</span>
                        </button>
                      </div>

                      {/* Sets x Reps & Rest Metadata */}
                      <div className="flex items-center gap-2 mt-2.5 text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800/90 font-bold text-zinc-200">
                          {exercise.sets} × {exercise.repsOrDuration}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800/90 text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-lime-400" />
                          {exercise.restSeconds}s rest
                        </span>
                      </div>

                      {/* Form Cue Pill */}
                      <div className="mt-2.5 px-3 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800/70 flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-lime-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          {exercise.formCues}
                        </p>
                      </div>

                      {/* Thumb-Friendly Set Completion Pills */}
                      <div className="grid grid-cols-4 gap-2 mt-3.5">
                        {setsState.map((isDone, setIdx) => (
                          <button
                            key={setIdx}
                            onClick={() =>
                              handleToggleSet(
                                exercise.id,
                                setIdx,
                                exercise.restSeconds,
                                exercise.name
                              )
                            }
                            className={`py-2.5 px-2 rounded-2xl text-xs font-extrabold flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90 ${
                              isDone
                                ? "bg-gradient-to-br from-lime-400 to-emerald-500 text-zinc-950 shadow-md shadow-lime-400/20"
                                : "bg-zinc-950 text-zinc-300 border border-zinc-800 hover:border-zinc-700"
                            }`}
                          >
                            <CheckCircle2
                              className={`w-4 h-4 ${
                                isDone
                                  ? "text-zinc-950 stroke-[2.75]"
                                  : "text-zinc-600"
                              }`}
                            />
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
          {/* TAB 2: AI COACH (INTERACTIVE PROMPT & INSTANT GENERATOR)  */}
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
                      onClick={() =>
                        handleSendCoachPrompt(preset.prompt, preset)
                      }
                      className="w-full text-left px-3 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs font-semibold text-zinc-200 active:scale-[0.99] transition-all"
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
                            {msg.suggestedPlan.estimatedDurationMinutes} mins •{" "}
                            {msg.suggestedPlan.exercises.length} moves
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-white mb-2">
                          {msg.suggestedPlan.workoutTitle}
                        </h4>
                        <div className="space-y-1 mb-3">
                          {msg.suggestedPlan.exercises.map((ex, i) => (
                            <div
                              key={i}
                              className="text-[11px] text-zinc-400 flex justify-between"
                            >
                              <span>• {ex.name}</span>
                              <span className="text-zinc-300 font-semibold">
                                {ex.sets}×{ex.repsOrDuration}
                              </span>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => deployPlanToToday(msg.suggestedPlan)}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-lime-400 to-emerald-500 text-zinc-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-lime-400/20 active:scale-95 transition-transform"
                        >
                          <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Load Into Today's Workout</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {isAiTyping && (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#18181B] border border-zinc-800 text-xs text-lime-400">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Calibrating routine for {bmi} BMI...</span>
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
                    className="p-2.5 rounded-xl bg-lime-400 text-zinc-950 font-bold active:scale-90 transition-transform"
                  >
                    <Send className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: BODY & PROGRESS (BIOMETRICS & ANALYTICS)           */}
          {/* ========================================================= */}
          {activeTab === "progress" && (
            <div className="space-y-4">
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
                      {bmi}
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-400 mt-0.5">
                      {bmiCategory}
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
                  {["male", "female"].map((g) => (
                    <button
                      key={g}
                      onClick={() =>
                        setBiometrics((prev) => ({ ...prev, gender: g }))
                      }
                      className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                        biometrics.gender === g
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
                      <span className="font-bold text-white">
                        {biometrics.heightCm} cm
                      </span>
                    </div>
                    <input
                      type="range"
                      min="140"
                      max="210"
                      value={biometrics.heightCm}
                      onChange={(e) =>
                        setBiometrics({
                          ...biometrics,
                          heightCm: Number(e.target.value),
                        })
                      }
                      className="w-full accent-lime-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400">Current Weight</span>
                      <span className="font-bold text-white">
                        {biometrics.weightKg} kg
                      </span>
                    </div>
                    <input
                      type="range"
                      min="42"
                      max="140"
                      step="0.5"
                      value={biometrics.weightKg}
                      onChange={(e) =>
                        setBiometrics({
                          ...biometrics,
                          weightKg: Number(e.target.value),
                        })
                      }
                      className="w-full accent-lime-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400">Age</span>
                      <span className="font-bold text-white">
                        {biometrics.age} yrs
                      </span>
                    </div>
                    <input
                      type="range"
                      min="16"
                      max="75"
                      value={biometrics.age}
                      onChange={(e) =>
                        setBiometrics({
                          ...biometrics,
                          age: Number(e.target.value),
                        })
                      }
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
                    <div className="text-sm font-extrabold text-white mt-0.5">
                      {tdee}
                    </div>
                    <div className="text-[10px] text-lime-400">kcal/day</div>
                  </div>
                  <div className="rounded-xl bg-zinc-950 p-2.5 border border-zinc-800/70">
                    <div className="text-[10px] text-zinc-500 uppercase">
                      Protein Goal
                    </div>
                    <div className="text-sm font-extrabold text-white mt-0.5">
                      {Math.round(biometrics.weightKg * 1.9)}g
                    </div>
                    <div className="text-[10px] text-emerald-400">Hypertrophy</div>
                  </div>
                  <div className="rounded-xl bg-zinc-950 p-2.5 border border-zinc-800/70">
                    <div className="text-[10px] text-zinc-500 uppercase">
                      Cut Target
                    </div>
                    <div className="text-sm font-extrabold text-white mt-0.5">
                      {tdee - 350}
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
                      Trending steadily toward {biometrics.targetWeightKg} kg
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-400">
                    -3.5 kg
                  </span>
                </div>

                {/* Responsive SVG Area Sparkline */}
                <svg viewBox="0 0 320 110" className="w-full h-28 overflow-visible">
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a3e635" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  <line x1="0" y1="25" x2="320" y2="25" stroke="#27272a" strokeDasharray="3 3" />
                  <line x1="0" y1="60" x2="320" y2="60" stroke="#27272a" strokeDasharray="3 3" />
                  <line x1="0" y1="95" x2="320" y2="95" stroke="#27272a" strokeDasharray="3 3" />

                  {/* Area fill */}
                  <path
                    d="M 10 22 L 70 34 L 130 42 L 190 56 L 250 66 L 310 78 L 310 100 L 10 100 Z"
                    fill="url(#weightGrad)"
                  />
                  {/* Trajectory Line */}
                  <path
                    d="M 10 22 L 70 34 L 130 42 L 190 56 L 250 66 L 310 78"
                    fill="none"
                    stroke="#a3e635"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Data Nodes */}
                  {[
                    [10, 22, "78.0"],
                    [70, 34, "77.1"],
                    [130, 42, "76.4"],
                    [190, 56, "75.6"],
                    [250, 66, "75.0"],
                    [310, 78, `${biometrics.weightKg}`],
                  ].map(([cx, cy, label], i) => (
                    <g key={i}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r="4"
                        fill="#09090B"
                        stroke="#a3e635"
                        strokeWidth="2.5"
                      />
                      <text
                        x={cx}
                        y={cy - 9}
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

              {/* Weekly Consistency Heatmap */}
              <section className="rounded-3xl bg-[#18181B] border border-zinc-800/80 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-lime-400" />
                    28-Day Consistency Heatmap
                  </h3>
                  <span className="text-xs font-bold text-lime-400">
                    19 / 28 Active
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
            </div>
          )}
        </main>

        {/* ========================================================= */}
        {/* FLOATING GLASSMORPHIC AI REST COUNTDOWN TIMER PILL        */}
        {/* ========================================================= */}
        {timerSecondsLeft > 0 && (
          <div className="absolute bottom-[82px] left-3.5 right-3.5 z-30 rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-lime-400/40 p-3 shadow-[0_10px_35px_rgba(0,0,0,0.85)]">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-lime-400">
                    AI Rest Timer
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 truncate">
                  {activeRestExercise}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xl font-black font-mono text-white mr-1">
                  {Math.floor(timerSecondsLeft / 60)}:
                  {(timerSecondsLeft % 60).toString().padStart(2, "0")}
                </span>

                <button
                  onClick={() =>
                    setTimerSecondsLeft((s) => Math.max(0, s - 15))
                  }
                  className="px-2 py-1.5 rounded-xl bg-zinc-800 text-[11px] font-bold text-zinc-200 active:scale-90"
                >
                  -15s
                </button>
                <button
                  onClick={() => setTimerSecondsLeft((s) => s + 15)}
                  className="px-2 py-1.5 rounded-xl bg-zinc-800 text-[11px] font-bold text-zinc-200 active:scale-90"
                >
                  +15s
                </button>
                <button
                  onClick={() => setTimerActive(!timerActive)}
                  className="p-2 rounded-xl bg-lime-400 text-zinc-950 font-bold active:scale-90"
                >
                  {timerActive ? (
                    <Pause className="w-3.5 h-3.5 stroke-[2.75]" />
                  ) : (
                    <Play className="w-3.5 h-3.5 stroke-[2.75]" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setTimerActive(false);
                    setTimerSecondsLeft(0);
                  }}
                  aria-label="Skip Rest"
                  className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white active:scale-90"
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
          <div className="grid grid-cols-3 gap-1.5 bg-[#18181B] p-1.5 rounded-2xl border border-zinc-800/90">
            {[
              { id: "today", label: "Today", icon: Flame },
              { id: "coach", label: "AI Coach", icon: Bot },
              { id: "progress", label: "Body & Stats", icon: Activity },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-2 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
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
                  <span className="text-[11px]">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* ========================================================= */}
        {/* WORKOUT COMPLETION CELEBRATION BOTTOM SHEET               */}
        {/* ========================================================= */}
        {showCelebration && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end p-4">
            <div className="w-full rounded-3xl bg-[#18181B] border border-lime-400/40 p-6 text-center shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 mx-auto flex items-center justify-center text-zinc-950 mb-3 shadow-lg shadow-lime-400/20">
                <Trophy className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black text-white">
                Session Crushed!
              </h3>
              <p className="text-xs text-zinc-400 mt-1 mb-5">
                All {totalSets} sets completed. Your recovery & progressive
                overload metrics have been updated.
              </p>
              <button
                onClick={() => setShowCelebration(false)}
                className="w-full py-3 rounded-2xl bg-lime-400 text-zinc-950 font-extrabold text-sm active:scale-95 transition-transform"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}