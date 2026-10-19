// Dual Language (English / বাংলা) Internationalization Engine

import type { Activity, FocusId, Goal, Level } from "./types";

export type Language = "en" | "bn";

export interface Translations {
  appName: string;
  coachBadge: string;
  tagline: string;
  dietBtn: string;
  dietBtnShort: string;
  historyBtn: string;
  profileBtn: string;
  soundMute: string;
  soundUnmute: string;
  sessionProgress: string;
  minIn: string;
  sets: string;

  // Weekly Schedule
  weeklyRoutineTitle: string;
  daysPpl: string;
  daysFour: string;
  daysFive: string;
  todayLabel: string;
  todayTarget: string;
  todayRest: string;
  trainingDay: string;
  restDay: string;
  restDesc: string;
  programLabel: string;
  applyFocusBtn: string;
  workoutDaysCount: (active: number, rest: number) => string;

  // Generator & Empty State
  readyTitle: string;
  readySubtitle: string;
  focusLabel: string;
  timeLabel: string;
  generateWorkoutBtn: string;
  buildingSessionBtn: string;
  offlineBuildBtn: string;
  tryAgainBtn: string;
  restingBmr: string;
  dailyTdee: string;
  targetCalories: (goal: string) => string;
  proteinLabel: string;
  carbsLabel: string;
  fatsLabel: string;
  waterLabel: string;
  viewDietChartBtn: string;
  lastSessionFelt: (title: string, diff: string) => string;

  // Active Workout View
  aiCoachBadge: string;
  offlineBadge: string;
  bmiLabel: string;
  movementsCount: (count: number) => string;
  coachNotePrefix: string;
  startWorkoutBtn: string;
  warmupTitle: string;
  allWarmupDone: string;
  mainWorkTitle: (count: number) => string;
  discardBtn: string;
  finishWorkoutBtn: string;
  animationBtn: string;
  formVideoBtn: string;
  swapBtn: string;
  easierBtn: (name: string) => string;
  harderBtn: (name: string) => string;
  equipmentPrefix: string;
  cuePrefix: string;
  setsProgress: (done: number, total: number) => string;
  lastWeightPrefix: (wt: number, unit: string) => string;
  swapNotice: string;
  holdBtn: (sec: number) => string;
  restSecLabel: (sec: number) => string;
  estimateKcalBurn: (kcal: number) => string;
  medicalDisclaimer: string;

  // Diet Sheet
  dietSheetTitle: string;
  dietSheetBadge: string;
  dietSheetSubtitle: string;
  tabFatLoss: string;
  tabMuscle: string;
  tabRecomp: string;
  dailyMealsTitle: string;
  copyPlanBtn: string;
  copiedBtn: string;
  closeBtn: string;
  bangladeshiGuidelinesTitle: string;

  // Animation Modal
  tempoLabel: string;
  tempoEccentric: string;
  tempoPause: string;
  tempoConcentric: string;
  stepByStepTitle: string;
  dosTitle: string;
  dontsTitle: string;
  gotItBtn: string;

  // Profile Sheet
  profileSheetTitle: string;
  firstRunTitle: string;
  firstRunNote: string;
  bodyBiometricsTitle: string;
  metricOption: string;
  imperialOption: string;
  sexLabel: string;
  maleOption: string;
  femaleOption: string;
  otherSexOption: string;
  ageLabel: string;
  heightLabelMetric: string;
  heightLabelImperial: string;
  weightLabelMetric: string;
  weightLabelImperial: string;
  activityLabel: string;
  levelLabel: string;
  goalLabel: string;
  sessionLengthLabel: string;
  targetFocusLabel: string;
  weeklyDaysProfileLabel: string;
  dietGoalLabel: string;
  equipmentTitle: string;
  limitationsLabel: string;
  limitationsPlaceholder: string;
  serverAccessTitle: string;
  saveProfileBtn: string;
  languageSelectLabel: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    appName: "ARISE",
    coachBadge: "Coach",
    tagline: "Adaptive personal training",
    dietBtn: "Bangladeshi Diet",
    dietBtnShort: "Diet",
    historyBtn: "History",
    profileBtn: "Profile and settings",
    soundMute: "Mute sounds",
    soundUnmute: "Unmute sounds",
    sessionProgress: "Session",
    minIn: "min in",
    sets: "sets",

    weeklyRoutineTitle: "Weekly Workout Days",
    daysPpl: "3 Days (PPL)",
    daysFour: "4 Days",
    daysFive: "5 Days",
    todayLabel: "TODAY",
    todayTarget: "Today's Target:",
    todayRest: "Today is Rest Day:",
    trainingDay: "Training",
    restDay: "Rest & Recover",
    restDesc: "Focus on rest, active mobility walking, and protein synthesis.",
    programLabel: "Program:",
    applyFocusBtn: "Apply Today's Focus",
    workoutDaysCount: (active, rest) => `${active} Training Days • ${rest} Rest Days per week`,

    readyTitle: "Ready for today's session?",
    readySubtitle: "Pick a focus and length, and your coach builds it from the equipment you have.",
    focusLabel: "Focus",
    timeLabel: "Time",
    generateWorkoutBtn: "Generate workout",
    buildingSessionBtn: "Building your session…",
    offlineBuildBtn: "Build without AI (works offline)",
    tryAgainBtn: "Try again",
    restingBmr: "Resting BMR",
    dailyTdee: "Daily Maintenance",
    targetCalories: (goal) => `Target Calories (${goal}):`,
    proteinLabel: "Protein",
    carbsLabel: "Carbs",
    fatsLabel: "Fats",
    waterLabel: "Water",
    viewDietChartBtn: "View Full Bangladeshi Diet Chart",
    lastSessionFelt: (title, diff) => `Last session: ${title}, felt "${diff}". Your coach will use that.`,

    aiCoachBadge: "AI coach",
    offlineBadge: "Offline plan (no AI)",
    bmiLabel: "BMI",
    movementsCount: (count) => `${count} movements`,
    coachNotePrefix: "Coach:",
    startWorkoutBtn: "Start workout (keeps the screen on)",
    warmupTitle: "Warm-up (mobility & priming)",
    allWarmupDone: "All warm-up moves completed!",
    mainWorkTitle: (count) => `Main work (${count})`,
    discardBtn: "Discard",
    finishWorkoutBtn: "Finish workout",
    animationBtn: "Animation & How-To",
    formVideoBtn: "Form Video",
    swapBtn: "Swap",
    easierBtn: (name) => `Easier: ${name}`,
    harderBtn: (name) => `Harder: ${name}`,
    equipmentPrefix: "Equipment:",
    cuePrefix: "Cue:",
    setsProgress: (done, total) => `Sets ${done}/${total}`,
    lastWeightPrefix: (wt, unit) => `last time ${wt} ${unit}`,
    swapNotice: "Swapping is available until you complete a set.",
    holdBtn: (sec) => `${sec}s hold`,
    restSecLabel: (sec) => `${sec}s rest`,
    estimateKcalBurn: (kcal) => `~${kcal} kcal so far (estimate)`,
    medicalDisclaimer: "Training suggestions only, not medical advice. Stop if something hurts, and check with a professional if you have a condition or injury.",

    dietSheetTitle: "Bangladeshi Diet Chart",
    dietSheetBadge: "Local Nutrition",
    dietSheetSubtitle: "Calibrated to your exact weight and BMI needs",
    tabFatLoss: "📉 Fat Loss",
    tabMuscle: "💪 Muscle Gain",
    tabRecomp: "🌟 Aesthetic Fit",
    dailyMealsTitle: "Daily 5 Meals Chart",
    copyPlanBtn: "Copy Diet Plan",
    copiedBtn: "Copied!",
    closeBtn: "Close",
    bangladeshiGuidelinesTitle: "Essential Bangladeshi Nutrition Habits",

    tempoLabel: "Cadence Tempo:",
    tempoEccentric: "3s Down (Eccentric)",
    tempoPause: "1s Pause",
    tempoConcentric: "1s Drive Up",
    stepByStepTitle: "Step-by-Step Biomechanical Form",
    dosTitle: "Key Alignment (Do's)",
    dontsTitle: "Common Mistakes (Don'ts)",
    gotItBtn: "Got It",

    profileSheetTitle: "Your profile",
    firstRunTitle: "Set up your coach",
    firstRunNote: "Everything is saved on this device only. The calculators run locally, and body measurements are never sent to the AI.",
    bodyBiometricsTitle: "Body & Biometrics",
    metricOption: "Metric (kg/cm)",
    imperialOption: "Imperial (lbs/ft)",
    sexLabel: "Sex (Mifflin-St Jeor formula)",
    maleOption: "Male",
    femaleOption: "Female",
    otherSexOption: "Prefer not to say",
    ageLabel: "Age",
    heightLabelMetric: "Height (cm)",
    heightLabelImperial: "Height (ft & in)",
    weightLabelMetric: "Weight (kg)",
    weightLabelImperial: "Weight (lbs)",
    activityLabel: "Daily activity factor",
    levelLabel: "Experience Level",
    goalLabel: "Primary Goal",
    sessionLengthLabel: "Session length",
    targetFocusLabel: "Target Focus",
    weeklyDaysProfileLabel: "Weekly Workout Days",
    dietGoalLabel: "Bangladeshi Diet Target",
    equipmentTitle: "Available Equipment",
    limitationsLabel: "Injuries or limitations (optional)",
    limitationsPlaceholder: "e.g. Mild lower back sensitivity; avoid heavy jumping",
    serverAccessTitle: "Server Access & AI Key (Optional)",
    saveProfileBtn: "Save & Apply",
    languageSelectLabel: "Language / ভাষা",
  },

  bn: {
    appName: "ARISE",
    coachBadge: "কোচ",
    tagline: "অভিযোজিত পার্সোনাল ট্রেইনার",
    dietBtn: "বাঙালি ডায়েট",
    dietBtnShort: "ডায়েট",
    historyBtn: "ইতিহাস",
    profileBtn: "প্রোফাইল ও সেটিংস",
    soundMute: "সাউন্ড বন্ধ করুন",
    soundUnmute: "সাউন্ড চালু করুন",
    sessionProgress: "সেশন",
    minIn: "মিনিট পার",
    sets: "সেট",

    weeklyRoutineTitle: "সাপ্তাহিক রুটিন (Weekly Workout Days)",
    daysPpl: "৩ দিন (PPL)",
    daysFour: "৪ দিন",
    daysFive: "৫ দিন",
    todayLabel: "আজ",
    todayTarget: "আজকের টার্গেট:",
    todayRest: "আজ বিশ্রাম দিন:",
    trainingDay: "ট্রেনিং",
    restDay: "বিশ্রাম ও রিকভারি",
    restDesc: "পেশি রিকভারির জন্য বিশ্রাম, হালকা হাঁটা ও পর্যাপ্ত প্রোটিন নিন।",
    programLabel: "প্রোগ্রাম:",
    applyFocusBtn: "আজকের ফোকাস সেট করুন",
    workoutDaysCount: (active, rest) => `সপ্তাহে ${active} দিন ব্যায়াম • ${rest} দিন বিশ্রাম`,

    readyTitle: "আজকের সেশনের জন্য প্রস্তুত?",
    readySubtitle: "টার্গেট ফোকাস ও সময় বেছে নিন, আপনার কোচ সরঞ্জাম অনুযায়ী সেশন সাজিয়ে দেবে।",
    focusLabel: "টার্গেট ফোকাস",
    timeLabel: "সময়",
    generateWorkoutBtn: "ব্যায়াম তৈরি করুন",
    buildingSessionBtn: "সেশন সাজানো হচ্ছে…",
    offlineBuildBtn: "AI ছাড়া তৈরি করুন (অফলাইন)",
    tryAgainBtn: "আবার চেষ্টা করুন",
    restingBmr: "রেস্টিং BMR",
    dailyTdee: "দৈনিক শক্তি চাহিদা",
    targetCalories: (goal) => `টার্গেট ক্যালোরি (${goal}):`,
    proteinLabel: "প্রোটিন",
    carbsLabel: "কার্বোহাইড্রেট",
    fatsLabel: "ফ্যাট",
    waterLabel: "পানি পান",
    viewDietChartBtn: "দেশীয় খাবারের সম্পূর্ণ ডায়েট চার্ট দেখুন",
    lastSessionFelt: (title, diff) => `গত সেশন: ${title}, অনুভূতি ছিল "${diff}"। কোচ এটি মাথায় রাখবে।`,

    aiCoachBadge: "AI কোচ",
    offlineBadge: "অফলাইন প্ল্যান (no AI)",
    bmiLabel: "BMI",
    movementsCount: (count) => `${count}টি ব্যায়াম`,
    coachNotePrefix: "কোচ:",
    startWorkoutBtn: "ব্যায়াম শুরু করুন (স্ক্রিন অন রাখবে)",
    warmupTitle: "ওয়ার্ম-আপ ও স্ট্রেচিং",
    allWarmupDone: "সবগুলো ওয়ার্ম-আপ মুভ শেষ হয়েছে!",
    mainWorkTitle: (count) => `মূল ব্যায়াম (${count})`,
    discardBtn: "বাতিল করুন",
    finishWorkoutBtn: "ব্যায়াম সম্পন্ন করুন",
    animationBtn: "অ্যানিমেশন ও নিয়ম",
    formVideoBtn: "ভিডিও গাইড",
    swapBtn: "বদলান",
    easierBtn: (name) => `সহজ: ${name}`,
    harderBtn: (name) => `কঠিন: ${name}`,
    equipmentPrefix: "সরঞ্জাম:",
    cuePrefix: "নির্দেশ:",
    setsProgress: (done, total) => `সেট ${done}/${total}`,
    lastWeightPrefix: (wt, unit) => `গতবার ${wt} ${unit}`,
    swapNotice: "সেট শুরু করার আগ পর্যন্ত ব্যায়াম বদলানো যাবে।",
    holdBtn: (sec) => `${sec} সেকেন্ড হোল্ড`,
    restSecLabel: (sec) => `${sec} সেকেন্ড বিশ্রাম`,
    estimateKcalBurn: (kcal) => `~${kcal} ক্যালোরি বার্ন হয়েছে (আনুমানিক)`,
    medicalDisclaimer: "এটি স্বাস্থ্যকর শরীরচর্চার সাধারণ পরামর্শ, কোনো চিকিৎসা নির্দেশিকা নয়। ব্যথা অনুভূত হলে থামুন এবং চিকিৎসকের পরামর্শ নিন।",

    dietSheetTitle: "দেশীয় ডায়েট চার্ট",
    dietSheetBadge: "বাঙালি খাবার",
    dietSheetSubtitle: "আপনার ওজন ও বিএমআই অনুযায়ী সঠিক খাবারের হিসাব",
    tabFatLoss: "📉 ওজন কমানো",
    tabMuscle: "💪 মাসল বৃদ্ধি",
    tabRecomp: "🌟 এস্থেটিক বডি",
    dailyMealsTitle: "সারাদিনের ৫টি খাবারের চার্ট (Daily Meals)",
    copyPlanBtn: "চার্ট কপি করুন (Copy Plan)",
    copiedBtn: "কপি হয়েছে!",
    closeBtn: "ঠিক আছে (Close)",
    bangladeshiGuidelinesTitle: "বাঙালি খাদ্যাভ্যাসে জরুরি নিয়মাবলী",

    tempoLabel: "রিদম ও টেম্পো:",
    tempoEccentric: "৩ সেকেন্ড নামুন",
    tempoPause: "১ সেকেন্ড থামুন",
    tempoConcentric: "১ সেকেন্ডে উঠুন",
    stepByStepTitle: "ব্যায়ামটি সঠিকভাবে করার নিয়মাবলী (Step-by-Step Form)",
    dosTitle: "যা অবশ্যই করবেন (Do's)",
    dontsTitle: "সাধারণ ভুল যা এড়িয়ে চলবেন (Don'ts)",
    gotItBtn: "বুঝেছি (Got It)",

    profileSheetTitle: "আপনার প্রোফাইল",
    firstRunTitle: "আপনার কোচের সেটআপ",
    firstRunNote: "সব তথ্য শুধু আপনার ডিভাইসেই সংরক্ষিত থাকবে। হিসাবগুলো লোকালি হবে এবং আপনার বায়োমেট্রিক তথ্য কখনো AI-তে পাঠানো হবে না।",
    bodyBiometricsTitle: "শারীরিক পরিমাপ ও বায়োমেট্রিক",
    metricOption: "মেট্রিক (কেজি/সেমি)",
    imperialOption: "ইম্পেরিয়াল (পাউন্ড/ফুট)",
    sexLabel: "লিঙ্গ (মিফলিন-সেন্ট জিওর ফর্মুলা)",
    maleOption: "পুরুষ",
    femaleOption: "নারী",
    otherSexOption: "অন্যান্য",
    ageLabel: "বয়স",
    heightLabelMetric: "উচ্চতা (সেমি)",
    heightLabelImperial: "উচ্চতা (ফুট ও ইঞ্চি)",
    weightLabelMetric: "ওজন (কেজি)",
    weightLabelImperial: "ওজন (পাউন্ড)",
    activityLabel: "দৈনিক অ্যাক্টিভিটি লেভেল",
    levelLabel: "দক্ষতার লেভেল",
    goalLabel: "মূল লক্ষ্য",
    sessionLengthLabel: "সেশনের সময়সীমা",
    targetFocusLabel: "টার্গেট ফোকাস",
    weeklyDaysProfileLabel: "সাপ্তাহিক ব্যায়ামের দিন",
    dietGoalLabel: "বাঙালি ডায়েট লক্ষ্য",
    equipmentTitle: "উপলব্ধ সরঞ্জাম",
    limitationsLabel: "শারীরিক সমস্যা বা ইনজুরি (ঐচ্ছিক)",
    limitationsPlaceholder: "যেমন: কোমরের ব্যথা, ভারী লাফানো বর্জনীয়",
    serverAccessTitle: "সার্ভার অ্যাক্সেস ও এআই কি (ঐচ্ছিক)",
    saveProfileBtn: "সংরক্ষণ ও প্রয়োগ করুন",
    languageSelectLabel: "ভাষা / Language",
  },
};

export const FOCUS_LABELS_I18N: Record<Language, Record<FocusId, string>> = {
  en: {
    full: "Full body",
    chest_tri: "Chest & triceps",
    back_bi: "Back & biceps",
    legs_core: "Legs & core",
    shoulders_arms: "Shoulders & arms",
  },
  bn: {
    full: "ফুল বডি",
    chest_tri: "বুক ও ট্রাইসেপ্স",
    back_bi: "পিঠ ও বাইসেপ্স",
    legs_core: "পা ও কোর",
    shoulders_arms: "শোল্ডার ও হাত",
  },
};

export const GOAL_LABELS_I18N: Record<Language, Record<Goal, string>> = {
  en: {
    muscle: "Build muscle (+300 kcal)",
    strength: "Strength (maintain)",
    endurance: "Fat loss / Endurance (-350 kcal)",
  },
  bn: {
    muscle: "মাসল বৃদ্ধি (+৩০০ kcal)",
    strength: "শক্তি বৃদ্ধি (মেইনটেইন)",
    endurance: "ওজন কমানো (-৩৫০ kcal)",
  },
};

export const LEVEL_LABELS_I18N: Record<Language, Record<Level, string>> = {
  en: {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
  },
  bn: {
    beginner: "বিগিনার",
    intermediate: "মাঝারি",
    advanced: "অ্যাডভান্সড",
  },
};

export const ACTIVITY_LABELS_I18N: Record<Language, Record<Activity, string>> = {
  en: {
    sedentary: "Sedentary (desk job, little exercise)",
    light: "Light (1-3 sessions / week)",
    moderate: "Moderate (3-5 sessions / week)",
    active: "Active (6-7 sessions / week)",
    very_active: "Very active (physical job + training)",
  },
  bn: {
    sedentary: "বসে থাকা জীবন (ডেস্ক কাজ, কম নড়াচড়া)",
    light: "হালকা সক্রিয় (সপ্তাহে ১-৩ দিন সেশন)",
    moderate: "মাঝারি সক্রিয় (সপ্তাহে ৩-৫ দিন সেশন)",
    active: "বেশ সক্রিয় (সপ্তাহে ৬-৭ দিন সেশন)",
    very_active: "অতিরিক্ত সক্রিয় (শারীরিক পরিশ্রম ও ভারী ট্রেনিং)",
  },
};
