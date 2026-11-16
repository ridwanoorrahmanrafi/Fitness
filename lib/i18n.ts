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
  modeSelectOption: string;
  modeManualOption: string;

  // Navigation & Back
  navHome: string;
  navBack: string;
  navBackToDash: string;
  navLogin: string;
  navProfile: string;

  // Landing Page
  landingBadge: string;
  landingHeroTitle: string;
  landingHeroSubtitle: string;
  landingGetStarted: string;
  landingTryDemo: string;
  landingFeaturesTitle: string;
  landingFeaturesSubtitle: string;
  landingFaqTitle: string;
  landingCalculatorTitle: string;
  landingCalculatorSubtitle: string;
  landingLaunchApp: string;

  // Authentication & Multi-user
  authTitle: string;
  authGuestBtn: string;
  authCreateProfile: string;
  authSwitchProfile: string;
  authNamePlaceholder: string;
  authPinPlaceholder: string;
  authLoggedInAs: (name: string) => string;
  authLogout: string;

  // AI Diet Planner (Gemini)
  aiDietTabTitle: string;
  aiDietBadge: string;
  aiDietSubtitle: string;
  aiDietGenerateBtn: string;
  aiDietGenerating: string;
  aiDietPreferencesTitle: string;
  aiDietPrefBudget: string;
  aiDietPrefOffice: string;
  aiDietPrefHighProtein: string;
  aiDietPrefDiabetes: string;
  aiDietPrefLowOil: string;
  aiDietPrefVeg: string;
  aiDietRestrictionsPlaceholder: string;
  aiDietGroceryTitle: string;
  aiDietChefTipsTitle: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    appName: "ARISE",
    coachBadge: "AI COACH",
    tagline: "Smart AI Workout Coach & Localized Sports Nutrition",
    dietBtn: "Nutrition & Diet Plan",
    dietBtnShort: "Nutrition",
    historyBtn: "Workout History",
    profileBtn: "Profile & Equipment",
    soundMute: "Mute Audio",
    soundUnmute: "Unmute Audio",
    sessionProgress: "Workout Progress",
    minIn: "min in session",
    sets: "sets",

    weeklyRoutineTitle: "Weekly Workout Schedule",
    daysPpl: "3 Days (Push / Pull / Legs)",
    daysFour: "4 Days (Upper / Lower Split)",
    daysFive: "5 Days (Targeted Muscle Split)",
    todayLabel: "TODAY",
    todayTarget: "Target Muscle Group:",
    todayRest: "Rest & Active Recovery:",
    trainingDay: "Workout Day",
    restDay: "Rest & Recovery",
    restDesc: "Rest your muscles, get adequate sleep, hydrate well, and consume protein for optimal recovery.",
    programLabel: "Training Split:",
    applyFocusBtn: "Apply Today's Focus",
    workoutDaysCount: (active, rest) => `${active} Workout Days • ${rest} Rest Days per week`,

    readyTitle: "Ready to start today's workout?",
    readySubtitle: "Select your target muscle group and session length. Your workout adapts to your available equipment and past weights.",
    focusLabel: "TARGET MUSCLE GROUP",
    timeLabel: "SESSION DURATION",
    generateWorkoutBtn: "Build My Workout",
    buildingSessionBtn: "Building Your Custom Plan…",
    offlineBuildBtn: "Build Offline Plan (Instant / No AI)",
    tryAgainBtn: "Try Again",
    restingBmr: "Basal Metabolic Rate (BMR)",
    dailyTdee: "Daily Energy Expenditure (TDEE)",
    targetCalories: (goal) => `Target Daily Intake (${goal}):`,
    proteinLabel: "Protein (Muscle)",
    carbsLabel: "Carbohydrates (Energy)",
    fatsLabel: "Healthy Fats (Hormones)",
    waterLabel: "Hydration Target",
    viewDietChartBtn: "Open Nutrition & Meal Plan",
    lastSessionFelt: (title, diff) => `Previous Workout: ${title}, intensity rated "${diff}". Future workouts adjust automatically.`,

    aiCoachBadge: "AI WORKOUT COACH",
    offlineBadge: "OFFLINE PLAN",
    bmiLabel: "BMI",
    movementsCount: (count) => `${count} Exercises`,
    coachNotePrefix: "Coach Directive:",
    startWorkoutBtn: "Start Workout (Keep Screen Awake)",
    warmupTitle: "Dynamic Warm-Up Routine",
    allWarmupDone: "Warm-Up Complete! Ready for main sets.",
    mainWorkTitle: (count) => `Main Exercises (${count})`,
    discardBtn: "Discard Session",
    finishWorkoutBtn: "Complete & Log Workout",
    animationBtn: "Exercise Guide",
    formVideoBtn: "Video Guide",
    swapBtn: "Swap Exercise",
    easierBtn: (name) => `Easier Option: ${name}`,
    harderBtn: (name) => `Harder Progression: ${name}`,
    equipmentPrefix: "Equipment:",
    cuePrefix: "Form Cue:",
    setsProgress: (done, total) => `Completed Sets: ${done}/${total}`,
    lastWeightPrefix: (wt, unit) => `previous record ${wt} ${unit}`,
    swapNotice: "You can swap exercises before completing your first set.",
    holdBtn: (sec) => `${sec}s Isometric Hold`,
    restSecLabel: (sec) => `${sec}s Rest Period`,
    estimateKcalBurn: (kcal) => `~${kcal} kcal estimated burn`,
    medicalDisclaimer: "Disclaimer: Consult a physician before beginning any strenuous fitness program. Stop immediately if you experience sharp pain or dizziness.",

    dietSheetTitle: "Nutrition & Meal Planner",
    dietSheetBadge: "Bangladeshi Diet",
    dietSheetSubtitle: "Macro calculations calibrated to your body weight and fitness goals",
    tabFatLoss: "⚡ Fat Loss & Cut (-350 kcal)",
    tabMuscle: "💪 Muscle Gain & Bulk (+300 kcal)",
    tabRecomp: "⚖️ Body Recomposition",
    dailyMealsTitle: "Daily Healthy Meal Schedule",
    copyPlanBtn: "Copy Meal Plan",
    copiedBtn: "Plan Copied!",
    closeBtn: "Close",
    bangladeshiGuidelinesTitle: "Essential Bangladeshi Nutrition Guidelines",

    tempoLabel: "Cadence Tempo:",
    tempoEccentric: "3s Controlled Descent (Eccentric)",
    tempoPause: "1s Pause (Isometric)",
    tempoConcentric: "1s Explosive Drive (Concentric)",
    stepByStepTitle: "Biomechanical Exercise Guide",
    dosTitle: "Form Essentials (Do's)",
    dontsTitle: "Common Mistakes (Don'ts)",
    gotItBtn: "Got It",

    profileSheetTitle: "Fitness Profile & Settings",
    firstRunTitle: "Welcome to Arise Fitness Coach",
    firstRunNote: "All biometrics are stored locally on your device for complete privacy. Zero data leakage.",
    bodyBiometricsTitle: "Physical Biometrics",
    metricOption: "Metric (kg / cm)",
    imperialOption: "Imperial (lbs / ft)",
    sexLabel: "Biological Sex (Metabolic Formula)",
    maleOption: "Male",
    femaleOption: "Female",
    otherSexOption: "Other / Undisclosed",
    ageLabel: "Age",
    heightLabelMetric: "Height (cm)",
    heightLabelImperial: "Height (ft & in)",
    weightLabelMetric: "Weight (kg)",
    weightLabelImperial: "Weight (lbs)",
    activityLabel: "Daily Activity Level",
    levelLabel: "Fitness Experience Level",
    goalLabel: "Primary Fitness Goal",
    sessionLengthLabel: "Session Duration",
    targetFocusLabel: "Target Muscle Group",
    weeklyDaysProfileLabel: "Weekly Workout Days",
    dietGoalLabel: "Nutrition Goal",
    equipmentTitle: "Available Equipment",
    limitationsLabel: "Injuries & Limitations (optional)",
    limitationsPlaceholder: "e.g. Lower back sensitivity; avoid heavy overhead pressing",
    serverAccessTitle: "AI Access & API Key (Optional)",
    saveProfileBtn: "Save Profile",
    languageSelectLabel: "Language / ভাষা",
    modeSelectOption: "Select",
    modeManualOption: "Type",

    navHome: "Workout",
    navBack: "Back",
    navBackToDash: "Return to Dashboard",
    navLogin: "Account",
    navProfile: "Profile",

    landingBadge: "Adaptive AI Workout Coach • Localized Bangladeshi Nutrition • 100% Free",
    landingHeroTitle: "YOUR SMART AI WORKOUT & NUTRITION COACH",
    landingHeroSubtitle: "An intelligent fitness coach built for real-world progress: adaptive strength training routines, complete exercise libraries, 1RM calculators, and localized nutrition.",
    landingGetStarted: "Start Working Out",
    landingTryDemo: "View Demo Workout",
    landingFeaturesTitle: "INTELLIGENT COACHING & TOOLS",
    landingFeaturesSubtitle: "Designed to adapt to your schedule, available equipment, and body biometrics with zero paywalls.",
    landingFaqTitle: "FREQUENTLY ASKED QUESTIONS",
    landingCalculatorTitle: "INSTANT CALORIE & MACRO CALCULATOR",
    landingCalculatorSubtitle: "Enter your body stats to calculate your BMR, maintenance TDEE, and optimal Bangladeshi macro target.",
    landingLaunchApp: "Launch Arise Coach",

    authTitle: "Account & Cloud Sync",
    authGuestBtn: "Continue as Guest",
    authCreateProfile: "Create Profile",
    authSwitchProfile: "Switch Profile",
    authNamePlaceholder: "Your Name",
    authPinPlaceholder: "4-Digit Passcode (Optional)",
    authLoggedInAs: (name) => `Signed in as ${name}`,
    authLogout: "Sign Out",

    aiDietTabTitle: "AI Meal Planner",
    aiDietBadge: "Powered by Gemini AI",
    aiDietSubtitle: "Custom Bangladeshi meal plans adapted to your routine, budget, and fitness goals",
    aiDietGenerateBtn: "Generate Meal Plan with AI",
    aiDietGenerating: "Generating your personalized meal plan…",
    aiDietPreferencesTitle: "Dietary Preferences & Lifestyle",
    aiDietPrefBudget: "Budget & Student Mess Friendly",
    aiDietPrefOffice: "Office & Tiffin Friendly",
    aiDietPrefHighProtein: "High Protein (Rui, Katla, Eggs, Chicken)",
    aiDietPrefDiabetes: "Low Glycemic & Blood Sugar Balance",
    aiDietPrefLowOil: "Low Oil & Light Digestion",
    aiDietPrefVeg: "Vegetarian / Lentil & Plant Based",
    aiDietRestrictionsPlaceholder: "e.g. lactose intolerance, avoid beef, allergy to shrimp",
    aiDietGroceryTitle: "Local Grocery Supply Checklist",
    aiDietChefTipsTitle: "Preparation & Nutrient Preservation Tips",
  },

  bn: {
    appName: "ARISE",
    coachBadge: "এআই কোচ",
    tagline: "স্মার্ট এআই ওয়ার্কআউট কোচ ও পুষ্টি নির্দেশিকা",
    dietBtn: "পুষ্টি ও ডায়েট প্ল্যান",
    dietBtnShort: "পুষ্টি",
    historyBtn: "ওয়ার্কআউট ইতিহাস",
    profileBtn: "প্রোফাইল ও সরঞ্জাম",
    soundMute: "সাউন্ড বন্ধ করুন",
    soundUnmute: "সাউন্ড চালু করুন",
    sessionProgress: "ওয়ার্কআউট অগ্রগতি",
    minIn: "মিনিট পার হয়েছে",
    sets: "সেট",

    weeklyRoutineTitle: "সাপ্তাহিক ওয়ার্কআউট রুটিন",
    daysPpl: "৩ দিন (Push / Pull / Legs)",
    daysFour: "৪ দিন (Upper / Lower)",
    daysFive: "৫ দিন (টার্গেটেড স্প্লিট)",
    todayLabel: "আজ",
    todayTarget: "আজকের টার্গেট মাসল:",
    todayRest: "আজ বিশ্রাম ও রিকভারি দিন:",
    trainingDay: "ওয়ার্কআউট দিন",
    restDay: "বিশ্রাম ও রিকভারি",
    restDesc: "পেশি রিকভারির জন্য বিশ্রাম, হালকা হাঁটা, পর্যাপ্ত ঘুম ও প্রোটিন সমৃদ্ধ খাবার নিন।",
    programLabel: "ওয়ার্কআউট স্প্লিট:",
    applyFocusBtn: "আজকের ফোকাস সেট করুন",
    workoutDaysCount: (active, rest) => `সপ্তাহে ${active} দিন ওয়ার্কআউট • ${rest} দিন বিশ্রাম`,

    readyTitle: "আজকের ওয়ার্কআউট শুরু করতে প্রস্তুত?",
    readySubtitle: "টার্গেট মাসল গ্রুপ ও সময় বেছে নিন, আপনার উপলব্ধ সরঞ্জাম অনুযায়ী সেশন সাজানো হবে।",
    focusLabel: "টার্গেট মাসল গ্রুপ",
    timeLabel: "ওয়ার্কআউট সময়সীমা",
    generateWorkoutBtn: "ওয়ার্কআউট তৈরি করুন",
    buildingSessionBtn: "আপনার জন্য প্ল্যান তৈরি হচ্ছে…",
    offlineBuildBtn: "অফলাইন প্ল্যান তৈরি করুন (AI ছাড়া)",
    tryAgainBtn: "পুনরায় চেষ্টা করুন",
    restingBmr: "বেস মেটাবলিক চাহিদা (BMR)",
    dailyTdee: "দৈনিক ক্যালোরি ব্যয় (TDEE)",
    targetCalories: (goal) => `টার্গেট দৈনিক ক্যালোরি (${goal}):`,
    proteinLabel: "প্রোটিন (রিকভারি)",
    carbsLabel: "কার্বোহাইড্রেট (শক্তি)",
    fatsLabel: "ফ্যাট (হরমোন ব্যালেন্স)",
    waterLabel: "পানি পান / হাইড্রেশন",
    viewDietChartBtn: "পুষ্টি ও খাদ্য তালিকা খুলুন",
    lastSessionFelt: (title, diff) => `পূর্ববর্তী সেশন: ${title}, অনুভূতি ছিল "${diff}"। এটি অনুযায়ী নতুন সেশন সমন্বয় করা হয়েছে।`,

    aiCoachBadge: "এআই ওয়ার্কআউট কোচ",
    offlineBadge: "অফলাইন প্ল্যান",
    bmiLabel: "BMI মাপ",
    movementsCount: (count) => `${count}টি ব্যায়াম`,
    coachNotePrefix: "কোচের পরামর্শ:",
    startWorkoutBtn: "ওয়ার্কআউট শুরু করুন (স্ক্রিন অন থাকবে)",
    warmupTitle: "ওয়ার্ম-আপ ও স্ট্রেচিং রুটিন",
    allWarmupDone: "ওয়ার্ম-আপ সম্পন্ন! মূল সেটের জন্য প্রস্তুত।",
    mainWorkTitle: (count) => `মূল ব্যায়াম (${count})`,
    discardBtn: "সেশন বাতিল করুন",
    finishWorkoutBtn: "ওয়ার্কআউট সম্পন্ন ও সেভ করুন",
    animationBtn: "ব্যায়ামের ফর্ম গাইড",
    formVideoBtn: "ভিডিও গাইড",
    swapBtn: "ব্যায়াম পরিবর্তন",
    easierBtn: (name) => `সহজ বিকল্প: ${name}`,
    harderBtn: (name) => `উন্নত বিকল্প: ${name}`,
    equipmentPrefix: "সরঞ্জাম:",
    cuePrefix: "সঠিক টেকনিক:",
    setsProgress: (done, total) => `সম্পন্ন সেট: ${done}/${total}`,
    lastWeightPrefix: (wt, unit) => `আগের রেকর্ড ${wt} ${unit}`,
    swapNotice: "সেট শুরু করার আগ পর্যন্ত ব্যায়াম পরিবর্তন করা যাবে।",
    holdBtn: (sec) => `${sec} সেকেন্ড হোল্ড`,
    restSecLabel: (sec) => `${sec} সেকেন্ড বিশ্রাম`,
    estimateKcalBurn: (kcal) => `~${kcal} ক্যালোরি বার্ন হয়েছে (আনুমানিক)`,
    medicalDisclaimer: "সতর্কতা: তীব্র শারীরিক প্রশিক্ষণ শুরুর পূর্বে চিকিৎসকের পরামর্শ নিন। যেকোনো ধরনের তীব্র ব্যথা অনুভব করলে অবিলম্বে থামুন।",

    dietSheetTitle: "পুষ্টি ও স্বাস্থ্যকর খাদ্য তালিকা",
    dietSheetBadge: "বাঙালি খাবার",
    dietSheetSubtitle: "শারীরিক ওজন ও লক্ষ্য অনুযায়ী পুষ্টির সঠিক হিসাব",
    tabFatLoss: "⚡ ওজন কমানো (-৩৫০ kcal)",
    tabMuscle: "💪 মাসল বৃদ্ধি (+৩০০ kcal)",
    tabRecomp: "⚖️ বডি রিকম্পজিশন",
    dailyMealsTitle: "সারাদিনের স্বাস্থ্যকর খাবারের চার্ট",
    copyPlanBtn: "ডায়েট চার্ট কপি করুন",
    copiedBtn: "কপি হয়েছে!",
    closeBtn: "বন্ধ করুন",
    bangladeshiGuidelinesTitle: "বাঙালি খাদ্যাভ্যাসে ফিটনেসের জরুরি নিয়মাবলী",

    tempoLabel: "টেম্পো ও ছন্দ:",
    tempoEccentric: "৩ সেকেন্ড নামুন (Eccentric)",
    tempoPause: "১ সেকেন্ড থামুন (Isometric)",
    tempoConcentric: "১ সেকেন্ডে উঠুন (Explosive)",
    stepByStepTitle: "ব্যায়ামের বায়োমেকানিক্যাল গাইড",
    dosTitle: "যা অবশ্যই করবেন (Do's)",
    dontsTitle: "সাধারণ ভুল যা এড়াবেন (Don'ts)",
    gotItBtn: "বুঝেছি (Got It)",

    profileSheetTitle: "ফিটনেস প্রোফাইল ও সেটিংস",
    firstRunTitle: "অ্যারাইজ ফিটনেস কোচে স্বাগতম",
    firstRunNote: "সব তথ্য শুধু আপনার ডিভাইসেই সংরক্ষিত থাকবে। হিসাবগুলো লোকালি হবে এবং আপনার বায়োমেট্রিক তথ্য নিরাপদ থাকবে।",
    bodyBiometricsTitle: "শারীরিক পরিমাপ ও বায়োমেট্রিক",
    metricOption: "মেট্রিক (কেজি / সেমি)",
    imperialOption: "ইম্পেরিয়াল (পাউন্ড / ফুট)",
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
    levelLabel: "ফিটনেস অভিজ্ঞতা",
    goalLabel: "মূল ফিটনেস লক্ষ্য",
    sessionLengthLabel: "ওয়ার্কআউট সময়সীমা",
    targetFocusLabel: "টার্গেট মাসল গ্রুপ",
    weeklyDaysProfileLabel: "সাপ্তাহিক ওয়ার্কআউটের দিন",
    dietGoalLabel: "পুষ্টি ও ডায়েটের লক্ষ্য",
    equipmentTitle: "উপলব্ধ সরঞ্জাম",
    limitationsLabel: "শারীরিক সমস্যা বা ইনজুরি (ঐচ্ছিক)",
    limitationsPlaceholder: "যেমন: কোমরের ব্যথা, ভারী লাফানো বর্জনীয়",
    serverAccessTitle: "এআই নেটওয়ার্ক ও এপিআই কি (ঐচ্ছিক)",
    saveProfileBtn: "সংরক্ষণ করুন",
    languageSelectLabel: "ভাষা / Language",
    modeSelectOption: "নির্বাচন",
    modeManualOption: "টাইপ",

    navHome: "ওয়ার্কআউট",
    navBack: "পিছনে",
    navBackToDash: "ড্যাশবোর্ডে ফিরুন",
    navLogin: "লগইন",
    navProfile: "প্রোফাইল",

    landingBadge: "অভিযোজিত এআই ওয়ার্কআউট কোচ • দেশীয় পুষ্টিবিজ্ঞান • সম্পূর্ণ ফ্রি",
    landingHeroTitle: "আপনার ব্যক্তিগত এআই ওয়ার্কআউট ও পুষ্টি কোচ",
    landingHeroSubtitle: "প্রকৃত শারীরিক উন্নতির জন্য তৈরি একটি স্মার্ট ফিটনেস প্ল্যাটফর্ম: অভিযোজিত ওয়ার্কআউট প্ল্যান, সম্পূর্ণ ব্যায়ামের গাইড, পাওয়ারলিফটিং ক্যালকুলেটর এবং দেশীয় সুষম পুষ্টি।",
    landingGetStarted: "ওয়ার্কআউট শুরু করুন",
    landingTryDemo: "ডেমো প্ল্যান দেখুন",
    landingFeaturesTitle: "ফিচারসমূহ ও সক্ষমতা",
    landingFeaturesSubtitle: "আপনার জীবনযাত্রা, সময় এবং উপলব্ধ সরঞ্জামের সাথে সম্পূর্ণ অভিযোজিত।",
    landingFaqTitle: "সাধারণ জিজ্ঞাসা (FAQ)",
    landingCalculatorTitle: "তাৎক্ষণিক ক্যালোরি ও ম্যাক্রো পরিমাপক",
    landingCalculatorSubtitle: "আপনার শারীরিক মাপ দিয়ে এখনই জেনে নিন রেস্টিং BMR, দৈনিক TDEE এবং সঠিক বাঙালি ম্যাক্রো টার্গেট।",
    landingLaunchApp: "অ্যাপে প্রবেশ করুন",

    authTitle: "অ্যাকাউন্ট ও ক্লাউড সিঙ্ক",
    authGuestBtn: "গেস্ট হিসেবে সরাসরি প্রবেশ করুন",
    authCreateProfile: "নতুন প্রোফাইল তৈরি করুন",
    authSwitchProfile: "প্রোফাইল পরিবর্তন",
    authNamePlaceholder: "আপনার নাম",
    authPinPlaceholder: "৪-সংখ্যার পাসকোড (ঐচ্ছিক)",
    authLoggedInAs: (name) => `${name} হিসেবে লগইন আছেন`,
    authLogout: "লগআউট",

    aiDietTabTitle: "এআই মিল প্ল্যানার",
    aiDietBadge: "জেমিনাই এআই চালিত",
    aiDietSubtitle: "আপনার বাজেট, অফিস রুটিন ও পছন্দের ওপর ভিত্তি করে কাস্টমাইজড দেশীয় খাবারের চার্ট",
    aiDietGenerateBtn: "এআই দিয়ে মিল প্ল্যান তৈরি করুন",
    aiDietGenerating: "পুষ্টিকর খাবারের তালিকা তৈরি হচ্ছে…",
    aiDietPreferencesTitle: "বিশেষ পছন্দ ও জীবনযাত্রা",
    aiDietPrefBudget: "বাজেট ও ছাত্র/মেস ফ্রেন্ডলি (সহজলভ্য খাবার)",
    aiDietPrefOffice: "অফিস ও ডেস্ক জব (টিফিন ও সহজে বহনযোগ্য)",
    aiDietPrefHighProtein: "বেশি প্রোটিন ও মাছপ্রেমী (রুই, কাতলা, ডিম, মুরগি)",
    aiDietPrefDiabetes: "ডায়াবেটিস ও লো-গ্লাইসেমিক ইনডেক্স",
    aiDietPrefLowOil: "কম তেলে রান্না ও সহজপাচ্য",
    aiDietPrefVeg: "নিরামিষাশী ও ডাল-শাকসবজি",
    aiDietRestrictionsPlaceholder: "যেমন: গরুর মাংস নিষেধ, দুধে এলার্জি, ইউরিক অ্যাসিড সমস্যা",
    aiDietGroceryTitle: "দেশীয় বাজার তালিকা (Grocery Checklist)",
    aiDietChefTipsTitle: "রান্না ও পুষ্টি সম্পর্কিত জরুরি টিপস",
  },
};

export const FOCUS_LABELS_I18N: Record<Language, Record<FocusId, string>> = {
  en: {
    full: "Full Body Workout",
    chest_tri: "Chest & Triceps (Push)",
    back_bi: "Back & Biceps (Pull)",
    legs_core: "Legs & Core",
    shoulders_arms: "Shoulders & Arms",
  },
  bn: {
    full: "ফুল বডি ওয়ার্কআউট",
    chest_tri: "বুক ও ট্রাইসেপ্স (Push)",
    back_bi: "পিঠ ও বাইসেপ্স (Pull)",
    legs_core: "পা ও কোর (Legs & Core)",
    shoulders_arms: "শোল্ডার ও হাত (Shoulders & Arms)",
  },
};

export const GOAL_LABELS_I18N: Record<Language, Record<Goal, string>> = {
  en: {
    muscle: "Muscle Building & Hypertrophy (+300 kcal)",
    strength: "Strength & Powerlifting (Maintenance)",
    endurance: "Fat Loss & Conditioning (-350 kcal)",
  },
  bn: {
    muscle: "পেশি বৃদ্ধি ও হাইপারট্রফি (+৩০০ kcal)",
    strength: "শক্তি ও পাওয়ারলিফটিং (মেইনটেইন)",
    endurance: "ফ্যাট লস ও কন্ডিশনিং (-৩৫০ kcal)",
  },
};

export const LEVEL_LABELS_I18N: Record<Language, Record<Level, string>> = {
  en: {
    beginner: "Beginner (0 - 1 Year)",
    intermediate: "Intermediate (1 - 3 Years)",
    advanced: "Advanced (3+ Years)",
  },
  bn: {
    beginner: "বিগিনার (০ - ১ বছর)",
    intermediate: "মাঝারি (১ - ৩ বছর)",
    advanced: "অভিজ্ঞ (৩+ বছর)",
  },
};

export const ACTIVITY_LABELS_I18N: Record<Language, Record<Activity, string>> = {
  en: {
    sedentary: "Sedentary (Desk Job / Little Exercise)",
    light: "Light (1-3 Workouts / week)",
    moderate: "Moderate (3-5 Workouts / week)",
    active: "Active (6-7 Workouts / week)",
    very_active: "Extremely Active (Athlete / Physical Labor)",
  },
  bn: {
    sedentary: "বসে থাকা জীবন (ডেস্ক কাজ, কম নড়াচড়া)",
    light: "হালকা সক্রিয় (সপ্তাহে ১-৩ দিন ব্যায়াম)",
    moderate: "মাঝারি সক্রিয় (সপ্তাহে ৩-৫ দিন ব্যায়াম)",
    active: "বেশ সক্রিয় (সপ্তাহে ৬-৭ দিন ব্যায়াম)",
    very_active: "অত্যন্ত সক্রিয় (ভারী শারীরিক পরিশ্রম ও অ্যাথলেট)",
  },
};
