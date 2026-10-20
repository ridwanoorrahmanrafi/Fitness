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
    coachBadge: "THE SYSTEM",
    tagline: "The System · Solo Leveling Hunter Conditioning",
    dietBtn: "Hunter Rations & Elixirs",
    dietBtnShort: "Rations",
    historyBtn: "Combat Archives",
    profileBtn: "Hunter Arsenal & Attributes",
    soundMute: "Mute System Audio",
    soundUnmute: "Unmute System Audio",
    sessionProgress: "Dungeon Raid Progress",
    minIn: "min in combat",
    sets: "combat sets",

    weeklyRoutineTitle: "Weekly Dungeon Raid Schedule",
    daysPpl: "3 Days (PPL Gate)",
    daysFour: "4 Days (Raid Split)",
    daysFive: "5 Days (Hunter Awakening)",
    todayLabel: "TODAY",
    todayTarget: "Target Dungeon Zone:",
    todayRest: "Mana Regeneration Day:",
    trainingDay: "Dungeon Raid",
    restDay: "Mana Recharge",
    restDesc: "Rest your physical vessel, consume elixirs & high protein rations, and regenerate MP.",
    programLabel: "Combat Protocol:",
    applyFocusBtn: "Lock Today's Zone",
    workoutDaysCount: (active, rest) => `${active} Dungeon Raids • ${rest} Mana Recharge Days per week`,

    readyTitle: "INITIALIZE DUNGEON RAID",
    readySubtitle: "[ SYSTEM DIRECTIVE ] Select target combat zone and raid duration. Calibrated from your available weaponry.",
    focusLabel: "TARGET COMBAT ZONE",
    timeLabel: "RAID DURATION",
    generateWorkoutBtn: "ENTER DUNGEON GATE",
    buildingSessionBtn: "SYSTEM CALIBRATING DUNGEON…",
    offlineBuildBtn: "ENTER OFFLINE GATE (NO AI)",
    tryAgainBtn: "RE-ENGAGE GATE",
    restingBmr: "BASE METABOLIC CONSUMPTION (BMR)",
    dailyTdee: "TOTAL ENERGY EXPENDITURE (TDEE)",
    targetCalories: (goal) => `Target Rations Intake (${goal}):`,
    proteinLabel: "Protein (Recovery)",
    carbsLabel: "Carbs (Combat Fuel)",
    fatsLabel: "Fats (Hormonal Balance)",
    waterLabel: "Hydration / Water",
    viewDietChartBtn: "[ OPEN HUNTER RATIONS & ELIXIRS ARCHIVE ]",
    lastSessionFelt: (title, diff) => `Previous Raid: ${title}, intensity rated "${diff}". System has calibrated adjustments.`,

    aiCoachBadge: "SYSTEM AI COACH",
    offlineBadge: "OFFLINE COMBAT PROTOCOL",
    bmiLabel: "VESSEL BMI",
    movementsCount: (count) => `${count} Combat Movements`,
    coachNotePrefix: "[ SYSTEM DIRECTIVE ]",
    startWorkoutBtn: "ENGAGE DUNGEON MISSION",
    warmupTitle: "[ PRIMING & MOBILITY PROTOCOL ]",
    allWarmupDone: "MOBILITY PROTOCOL CLEARED!",
    mainWorkTitle: (count) => `CORE COMBAT MOVEMENTS (${count})`,
    discardBtn: "RETREAT FROM DUNGEON",
    finishWorkoutBtn: "CLEAR RAID & CLAIM EXP",
    animationBtn: "SYSTEM FORM HOLOGRAM",
    formVideoBtn: "COMBAT FOOTAGE",
    swapBtn: "SWITCH WEAPON / MOVE",
    easierBtn: (name) => `LOWER DIFFICULTY: ${name}`,
    harderBtn: (name) => `INCREASE DIFFICULTY: ${name}`,
    equipmentPrefix: "HUNTER GEAR:",
    cuePrefix: "SYSTEM TECHNIQUE:",
    setsProgress: (done, total) => `Sets Conquered: ${done}/${total}`,
    lastWeightPrefix: (wt, unit) => `previous record ${wt} ${unit}`,
    swapNotice: "Tactical swap available before first set is engaged.",
    holdBtn: (sec) => `${sec}s Isometric Hold`,
    restSecLabel: (sec) => `${sec}s MP Recovery`,
    estimateKcalBurn: (kcal) => `~${kcal} kcal combat burn (estimate)`,
    medicalDisclaimer: "[ SYSTEM NOTICE ] Physical parameters are calibrated for Hunter conditioning. Cease immediately if sharp pain occurs; seek medical attention for injuries.",

    dietSheetTitle: "[ HUNTER NUTRITION & ELIXIR ARCHIVES ]",
    dietSheetBadge: "Hunter Rations",
    dietSheetSubtitle: "System-calibrated macro intake calibrated to Hunter rank and body mass",
    tabFatLoss: "⚡ Agile Shred (-350 kcal)",
    tabMuscle: "⚔️ Titan Bulk (+300 kcal)",
    tabRecomp: "👑 Shadow Monarch Form",
    dailyMealsTitle: "Daily 5 Tactical Meals & Rations",
    copyPlanBtn: "Copy Rations Plan",
    copiedBtn: "Rations Plan Copied!",
    closeBtn: "Acknowledge & Close",
    bangladeshiGuidelinesTitle: "Essential Bangladeshi Hunter Nutrition Rules",

    tempoLabel: "Holographic Cadence Tempo:",
    tempoEccentric: "3s Controlled Descent (Eccentric)",
    tempoPause: "1s Isometric Lock",
    tempoConcentric: "1s Explosive Drive",
    stepByStepTitle: "System Biomechanical Hologram Guide",
    dosTitle: "Optimal Kinematics (Do's)",
    dontsTitle: "Critical Flaws & Penalties (Don'ts)",
    gotItBtn: "Acknowledge Protocol",

    profileSheetTitle: "[ HUNTER BIOMETRICS & ARSENAL : SYSTEM PROFILE ]",
    firstRunTitle: "[ HUNTER AWAKENING PROTOCOL : SYSTEM INITIALIZATION ]",
    firstRunNote: "All Hunter parameters remain secured within local memory. Zero biometric telemetry is leaked.",
    bodyBiometricsTitle: "Physical Vessel & Biometrics",
    metricOption: "Metric (kg / cm)",
    imperialOption: "Imperial (lbs / ft)",
    sexLabel: "Vessel Gender (Metabolic Formula)",
    maleOption: "Male Hunter",
    femaleOption: "Female Hunter",
    otherSexOption: "Undisclosed",
    ageLabel: "Age",
    heightLabelMetric: "Height (cm)",
    heightLabelImperial: "Height (ft & in)",
    weightLabelMetric: "Weight (kg)",
    weightLabelImperial: "Weight (lbs)",
    activityLabel: "Daily Energy Expended Factor",
    levelLabel: "Hunter Experience Rank",
    goalLabel: "Primary Quest Objective",
    sessionLengthLabel: "Raid Duration",
    targetFocusLabel: "Target Combat Zone",
    weeklyDaysProfileLabel: "Weekly Dungeon Raid Days",
    dietGoalLabel: "Hunter Nutrition Target",
    equipmentTitle: "Hunter Arsenal & Weaponry",
    limitationsLabel: "Vessel Injuries & Debuffs (optional)",
    limitationsPlaceholder: "e.g. Lower back sensitivity; avoid jumping impact",
    serverAccessTitle: "Hunter Network & AI Key (Optional)",
    saveProfileBtn: "Save & Calibrate System",
    languageSelectLabel: "Language / ভাষা",

    navHome: "Gate",
    navBack: "Retreat",
    navBackToDash: "Return to System HUD",
    navLogin: "Hunter Auth",
    navProfile: "Hunter Profile",

    landingBadge: "Solo Leveling Hunter System • Gemini AI • Bangladeshi Nutrition",
    landingHeroTitle: "THE SYSTEM HAS CHOSEN YOU. ARISE AND CONQUER YOUR LIMITS.",
    landingHeroSubtitle: "An adaptive AI Hunter conditioning system designed to forge you into an S-Rank warrior with precision biomechanics, intelligent progression, and culturally calibrated nutrition.",
    landingGetStarted: "ENTER SYSTEM GATE",
    landingTryDemo: "ENGAGE DEMO RAID",
    landingFeaturesTitle: "SYSTEM CAPABILITIES & HUNTER ARSENAL",
    landingFeaturesSubtitle: "Engineered exclusively for real-world Hunters, adaptive to your available weapons and daily routine.",
    landingFaqTitle: "HUNTER GUILD FAQ",
    landingCalculatorTitle: "INSTANT BIOMETRIC & VESSEL CALORIE ESTIMATOR",
    landingCalculatorSubtitle: "Input your physical stats to evaluate exact BMR, maintenance TDEE, and optimal Bangladeshi macro target.",
    landingLaunchApp: "INITIALIZE SYSTEM HUD",

    authTitle: "[ HUNTER IDENTIFICATION : SYSTEM ACCESS ]",
    authGuestBtn: "ENTER AS GUEST HUNTER",
    authCreateProfile: "CREATE HUNTER AVATAR",
    authSwitchProfile: "SWITCH HUNTER PROFILE",
    authNamePlaceholder: "Hunter Call-Sign (e.g. Sung Jin-Woo)",
    authPinPlaceholder: "4-Digit Hunter Security Passcode (Optional)",
    authLoggedInAs: (name) => `Authenticated as Hunter ${name}`,
    authLogout: "SEVER CONNECTION (LOGOUT)",

    aiDietTabTitle: "AI Hunter Rations Generator",
    aiDietBadge: "Gemini AI Tactical Nutrition",
    aiDietSubtitle: "Custom tactical Bangladeshi nutrition plan engineered for your routine, budget, and recovery requirements",
    aiDietGenerateBtn: "[ GENERATE HUNTER RATIONS : GEMINI AI ]",
    aiDietGenerating: "SYSTEM SYNTHESIZING HUNTER RATIONS…",
    aiDietPreferencesTitle: "Tactical Preferences & Daily Routine",
    aiDietPrefBudget: "Budget & Student Mess Protocol",
    aiDietPrefOffice: "Desk Job & Tactical Tiffin Pack",
    aiDietPrefHighProtein: "High Protein Marine & Poultry (Rui, Katla, Eggs, Chicken)",
    aiDietPrefDiabetes: "Low Glycemic & Blood Sugar Stability",
    aiDietPrefLowOil: "Low Oil & Accelerated Digestion",
    aiDietPrefVeg: "Plant & Lentil Based Protocol",
    aiDietRestrictionsPlaceholder: "e.g. lactose intolerance, avoid beef, allergy to shrimp",
    aiDietGroceryTitle: "Tactical Grocery Supply Requisition",
    aiDietChefTipsTitle: "Culinary Prep & Nutrient Preservation Protocols",
  },

  bn: {
    appName: "ARISE",
    coachBadge: "দ্য সিস্টেম",
    tagline: "দ্য সিস্টেম · সোলো লেভেলিং হান্টার ট্রেনিং",
    dietBtn: "হান্টার খাদ্য ও রেশন",
    dietBtnShort: "রেশন",
    historyBtn: "কমব্যাট আর্কাইভ",
    profileBtn: "হান্টার আর্সেনাল ও স্ট্যাটাস",
    soundMute: "সিস্টেম সাউন্ড বন্ধ করুন",
    soundUnmute: "সিস্টেম সাউন্ড চালু করুন",
    sessionProgress: "ডেনজন রেইড অগ্রগতি",
    minIn: "মিনিট কমব্যাটে",
    sets: "কমব্যাট সেট",

    weeklyRoutineTitle: "সাপ্তাহিক রেইড সূচি (Raid Schedule)",
    daysPpl: "৩ দিন (PPL গেট)",
    daysFour: "৪ দিন (রেইড স্প্লিট)",
    daysFive: "৫ দিন (হান্টার ট্রেনিং)",
    todayLabel: "আজ",
    todayTarget: "আজকের টার্গেট জোন:",
    todayRest: "আজ মানা রিকভারি দিন:",
    trainingDay: "ডেনজন রেইড",
    restDay: "মানা রিচার্জ ও বিশ্রাম",
    restDesc: "পেশি ও শক্তির রিকভারির জন্য বিশ্রাম, হালকা হাঁটা ও পর্যাপ্ত প্রোটিন নিন।",
    programLabel: "কমব্যাট প্রোটোকল:",
    applyFocusBtn: "আজকের জোন লক করুন",
    workoutDaysCount: (active, rest) => `সপ্তাহে ${active} দিন ডেনজন রেইড • ${rest} দিন মানা রিচার্জ`,

    readyTitle: "ডেনজন রেইড শুরু করতে প্রস্তুত?",
    readySubtitle: "[ সিস্টেম নির্দেশ ] টার্গেট কমব্যাট জোন ও সময় বেছে নিন, আপনার উপলব্ধ অস্ত্র ও সরঞ্জাম অনুযায়ী রেইড সাজানো হবে।",
    focusLabel: "টার্গেট কমব্যাট জোন",
    timeLabel: "রেইড সময়সীমা",
    generateWorkoutBtn: "ডেনজন গেটে প্রবেশ করুন",
    buildingSessionBtn: "সিস্টেম ডেনজন প্রস্তুত করছে…",
    offlineBuildBtn: "অফলাইন গেটে প্রবেশ করুন (AI ছাড়া)",
    tryAgainBtn: "পুনরায় চেষ্টা করুন",
    restingBmr: "বেস মেটাবলিক চাহিদা (BMR)",
    dailyTdee: "দৈনিক ক্যালোরি ব্যয় (TDEE)",
    targetCalories: (goal) => `টার্গেট রেশন ক্যালোরি (${goal}):`,
    proteinLabel: "প্রোটিন (রিকভারি)",
    carbsLabel: "কার্বোহাইড্রেট (শক্তি)",
    fatsLabel: "ফ্যাট (হরমোন ব্যালেন্স)",
    waterLabel: "পানি পান / হাইড্রেটিং",
    viewDietChartBtn: "[ হান্টার খাদ্য ও পুষ্টি তালিকা খুলুন ]" ,
    lastSessionFelt: (title, diff) => `পূর্ববর্তী রেইড: ${title}, অনুভূতি ছিল "${diff}"। সিস্টেম এটি অনুসারে সমন্বয় করেছে।`,

    aiCoachBadge: "সিস্টেম AI কোচ",
    offlineBadge: "অফলাইন কমব্যাট প্রোটোকল",
    bmiLabel: "BMI মাপ",
    movementsCount: (count) => `${count}টি কমব্যাট মুভ`,
    coachNotePrefix: "[ সিস্টেম নির্দেশ ]",
    startWorkoutBtn: "ডেনজন মিশন শুরু করুন (স্ক্রিন অন থাকবে)",
    warmupTitle: "[ প্রাইমিং ও ওয়ার্ম-আপ প্রোটোকল ]",
    allWarmupDone: "ওয়ার্ম-আপ প্রোটোকল সম্পন্ন!",
    mainWorkTitle: (count) => `মূল কমব্যাট মুভ (${count})`,
    discardBtn: "ডেনজন থেকে পিছু হটুন",
    finishWorkoutBtn: "রেইড ক্লিয়ার ও EXP গ্রহণ করুন",
    animationBtn: "হলোগ্রাফিক মুভমেন্ট গাইড",
    formVideoBtn: "কমব্যাট ভিডিও গাইড",
    swapBtn: "মুভ পরিবর্তন করুন",
    easierBtn: (name) => `সহজ লেভেল: ${name}`,
    harderBtn: (name) => `কঠিন লেভেল: ${name}`,
    equipmentPrefix: "হান্টার গিয়ার:",
    cuePrefix: "সিস্টেম টেকনিক:",
    setsProgress: (done, total) => `সম্পন্ন সেট: ${done}/${total}`,
    lastWeightPrefix: (wt, unit) => `আগের রেকর্ড ${wt} ${unit}`,
    swapNotice: "সেট শুরু করার আগ পর্যন্ত মুভ পরিবর্তন করা যাবে।",
    holdBtn: (sec) => `${sec} সেকেন্ড হোল্ড`,
    restSecLabel: (sec) => `${sec} সেকেন্ড মানা রিকভারি`,
    estimateKcalBurn: (kcal) => `~${kcal} ক্যালোরি বার্ন হয়েছে (আনুমানিক)`,
    medicalDisclaimer: "[ সিস্টেম নোটিশ ] হান্টারদের শারীরিক শক্তি বৃদ্ধির জন্য এই নির্দেশিকা। কোনো তীব্র ব্যথা অনুভব করলে অবিলম্বে থামুন এবং উপযুক্ত চিকিৎসা নিন।",

    dietSheetTitle: "[ HUNTER NUTRITION : হান্টার পুষ্টি ও খাদ্য তালিকা ]",
    dietSheetBadge: "বাঙালি খাবার",
    dietSheetSubtitle: "হান্টার র‍্যাঙ্ক ও শারীরিক ওজন অনুযায়ী পুষ্টির সঠিক হিসাব",
    tabFatLoss: "⚡ ওজন কমানো (-৩৫০ kcal)",
    tabMuscle: "⚔️ মাসল বৃদ্ধি (+৩০০ kcal)",
    tabRecomp: "👑 এস্থেটিক বডি",
    dailyMealsTitle: "সারাদিনের ৫টি ট্যাকটিক্যাল খাবারের চার্ট",
    copyPlanBtn: "রেশন চার্ট কপি করুন",
    copiedBtn: "কপি হয়েছে!",
    closeBtn: "ঠিক আছে (বন্ধ করুন)",
    bangladeshiGuidelinesTitle: "বাঙালি খাদ্যাভ্যাসে হান্টারদের জরুরি নিয়মাবলী",

    tempoLabel: "হলোগ্রাফিক রিদম ও টেম্পো:",
    tempoEccentric: "৩ সেকেন্ড নামুন (Eccentric)",
    tempoPause: "১ সেকেন্ড থামুন (Isometric)",
    tempoConcentric: "১ সেকেন্ডে উঠুন (Explosive)",
    stepByStepTitle: "সিস্টেম বায়োমেকানিক্যাল গাইড",
    dosTitle: "যা অবশ্যই করবেন (Do's)",
    dontsTitle: "পেনাল্টি ও সাধারণ ভুল যা এড়াবেন (Don'ts)",
    gotItBtn: "বুঝেছি (Got It)",

    profileSheetTitle: "[ HUNTER BIOMETRICS : হান্টার প্রোফাইল ও বায়োমেট্রিক্স ]",
    firstRunTitle: "[ HUNTER AWAKENING : হান্টার অ্যাক্টিভেশন সিস্টেম ]",
    firstRunNote: "সব তথ্য শুধু আপনার ডিভাইসেই সংরক্ষিত থাকবে। হিসাবগুলো লোকালি হবে এবং আপনার বায়োমেট্রিক তথ্য কখনো AI-তে পাঠানো হবে না।",
    bodyBiometricsTitle: "শারীরিক পরিমাপ ও বায়োমেট্রিক",
    metricOption: "মেট্রিক (কেজি / সেমি)",
    imperialOption: "ইম্পেরিয়াল (পাউন্ড / ফুট)",
    sexLabel: "লিঙ্গ (মিফলিন-সেন্ট জিওর ফর্মুলা)",
    maleOption: "পুরুষ হান্টার",
    femaleOption: "নারী হান্টার",
    otherSexOption: "অন্যান্য",
    ageLabel: "বয়স",
    heightLabelMetric: "উচ্চতা (সেমি)",
    heightLabelImperial: "উচ্চতা (ফুট ও ইঞ্চি)",
    weightLabelMetric: "ওজন (কেজি)",
    weightLabelImperial: "ওজন (পাউন্ড)",
    activityLabel: "দৈনিক অ্যাক্টিভিটি লেভেল",
    levelLabel: "হান্টার র‍্যাঙ্ক ও অভিজ্ঞতা",
    goalLabel: "মূল কোয়েস্ট লক্ষ্য",
    sessionLengthLabel: "রেইড সময়সীমা",
    targetFocusLabel: "টার্গেট কমব্যাট জোন",
    weeklyDaysProfileLabel: "সাপ্তাহিক রেইডের দিন",
    dietGoalLabel: "পুষ্টি ও রেশনের লক্ষ্য",
    equipmentTitle: "উপলব্ধ অস্ত্র ও সরঞ্জাম",
    limitationsLabel: "শারীরিক সমস্যা বা ইনজুরি (ঐচ্ছিক)",
    limitationsPlaceholder: "যেমন: কোমরের ব্যথা, ভারী লাফানো বর্জনীয়",
    serverAccessTitle: "হান্টার নেটওয়ার্ক ও এআই কি (ঐচ্ছিক)",
    saveProfileBtn: "সংরক্ষণ ও সিস্টেম সক্রিয় করুন",
    languageSelectLabel: "ভাষা / Language",

    navHome: "গেট",
    navBack: "পিছনে",
    navBackToDash: "সিস্টেম HUD-এ ফিরুন",
    navLogin: "লগইন",
    navProfile: "প্রোফাইল",

    landingBadge: "সোলো লেভেলিং হান্টার সিস্টেম • জেমিনাই এআই • দেশীয় পুষ্টিবিজ্ঞান",
    landingHeroTitle: "সিস্টেম আপনাকে বেছে নিয়েছে। জাগ্রত হোন এবং সীমাকে ছাড়িয়ে যান।",
    landingHeroSubtitle: "একটি অভিযোজিত এআই হান্টার কন্ডিশনিং সিস্টেম যা নিখুঁত বায়োমেকানিক্স, বুদ্ধিমান অগ্রগতি এবং দেশীয় পুষ্টির মাধ্যমে আপনাকে এস-র‍্যাঙ্ক যোদ্ধায় রূপান্তরিত করবে।",
    landingGetStarted: "সিস্টেম গেটে প্রবেশ করুন",
    landingTryDemo: "ডেমো রেইড দেখুন",
    landingFeaturesTitle: "সিস্টেমের ক্ষমতা ও হান্টার আর্সেনাল",
    landingFeaturesSubtitle: "প্রকৃত হান্টারদের জন্য বিশেষভাবে তৈরি, যা আপনার উপলব্ধ সরঞ্জাম এবং দৈনন্দিন রুটিনের সাথে অভিযোজিত।",
    landingFaqTitle: "হান্টার গিল্ড সাধারণ জিজ্ঞাসা (FAQ)",
    landingCalculatorTitle: "তাৎক্ষণিক শারীরিক শক্তি ও ক্যালোরি পরিমাপক",
    landingCalculatorSubtitle: "আপনার শারীরিক মাপ দিয়ে এখনই জেনে নিন রেস্টিং BMR, দৈনিক TDEE এবং সঠিক বাঙালি ম্যাক্রো টার্গেট।",
    landingLaunchApp: "সিস্টেম HUD চালু করুন",

    authTitle: "[ HUNTER IDENTIFICATION : সিস্টেম লগইন ]",
    authGuestBtn: "গেস্ট হান্টার হিসেবে সরাসরি প্রবেশ করুন",
    authCreateProfile: "নতুন হান্টার প্রোফাইল তৈরি করুন",
    authSwitchProfile: "হান্টার প্রোফাইল পরিবর্তন",
    authNamePlaceholder: "আপনার হান্টার নাম (যেমন: সুং জিন-উ / রাফি)",
    authPinPlaceholder: "৪-সংখ্যার হান্টার পাসকোড (ঐচ্ছিক)",
    authLoggedInAs: (name) => `হান্টার ${name} হিসেবে লগইন আছেন`,
    authLogout: "সংযোগ বিচ্ছিন্ন (লগআউট)",

    aiDietTabTitle: "এআই মিল প্ল্যানার",
    aiDietBadge: "জেমিনাই এআই চালিত",
    aiDietSubtitle: "আপনার বাজেট, অফিস রুটিন ও পছন্দের ওপর ভিত্তি করে কাস্টমাইজড দেশীয় খাবারের চার্ট",
    aiDietGenerateBtn: "[ এআই দিয়ে কাস্টম চার্ট তৈরি করুন : Gemini ]",
    aiDietGenerating: "সিস্টেম পুষ্টিকর খাবারের তালিকা তৈরি করছে…",
    aiDietPreferencesTitle: "বিশেষ পছন্দ ও জীবনযাত্রা",
    aiDietPrefBudget: "বাজেট ও ছাত্র/মেস ফ্রেন্ডলি (সহজলভ্য খাবার)",
    aiDietPrefOffice: "অফিস ও ডেস্ক জব (টিফিন ও সহজে বহনযোগ্য)",
    aiDietPrefHighProtein: "বেশি প্রোটিন ও মাছপ্রেমী (রুই, কাতলা, ডিম, মুরগি)",
    aiDietPrefDiabetes: "ডায়াবেটিস ও লো-গ্লাইসেমিক ইনডেক্স",
    aiDietPrefLowOil: "কম তেলে রান্না ও সহজপাচ্য",
    aiDietPrefVeg: "নিরামিষাশী ও ডাল-শাকসবজি",
    aiDietRestrictionsPlaceholder: "যেমন: গরুর মাংস নিষেধ, দুধে এলার্জি, ইউরিক অ্যাসিড সমস্যা",
    aiDietGroceryTitle: "দেশীয় বাজার তালিকা (Supply Checklist)",
    aiDietChefTipsTitle: "রান্না ও পুষ্টি সম্পর্কিত জরুরি টিপস",
  },
};

export const FOCUS_LABELS_I18N: Record<Language, Record<FocusId, string>> = {
  en: {
    full: "Full Vessel Conditioning",
    chest_tri: "Vanguard Armor (Chest & Triceps)",
    back_bi: "Shadow Wings (Back & Biceps)",
    legs_core: "Iron Foundation (Legs & Core)",
    shoulders_arms: "Titan Pauldrons (Shoulders & Arms)",
  },
  bn: {
    full: "ফুল বডি কন্ডিশনিং",
    chest_tri: "বুক ও ট্রাইসেপ্স (চেস্ট ও ট্রাই)",
    back_bi: "পিঠ ও বাইসেপ্স (ব্যাক ও বাই)",
    legs_core: "পা ও কোর (লেগস ও কোর)",
    shoulders_arms: "শোল্ডার ও হাত (কাঁধ ও হাত)",
  },
};

export const GOAL_LABELS_I18N: Record<Language, Record<Goal, string>> = {
  en: {
    muscle: "Titan Muscle & Hypertrophy (+300 kcal)",
    strength: "Strength & Stat Maximization (Maintain)",
    endurance: "Agility & Speed Shred (-350 kcal)",
  },
  bn: {
    muscle: "টাইটান মাসল বৃদ্ধি (+৩০০ kcal)",
    strength: "শক্তি ও স্ট্যাটাস বৃদ্ধি (মেইনটেইন)",
    endurance: "গতি ও ক্ষিপ্রতা / ফ্যাট লস (-৩৫০ kcal)",
  },
};

export const LEVEL_LABELS_I18N: Record<Language, Record<Level, string>> = {
  en: {
    beginner: "E-Rank Hunter (Beginner)",
    intermediate: "B-Rank Hunter (Intermediate)",
    advanced: "S-Rank Hunter (Advanced)",
  },
  bn: {
    beginner: "E-র‍্যাঙ্ক হান্টার (বিগিনার)",
    intermediate: "B-র‍্যাঙ্ক হান্টার (মাঝারি)",
    advanced: "S-র‍্যাঙ্ক হান্টার (অ্যাডভান্সড)",
  },
};

export const ACTIVITY_LABELS_I18N: Record<Language, Record<Activity, string>> = {
  en: {
    sedentary: "Sedentary (Desk Job / Resting Vessel)",
    light: "Light (1-3 Combat Raids / week)",
    moderate: "Moderate (3-5 Combat Raids / week)",
    active: "Active (6-7 Combat Raids / week)",
    very_active: "S-Rank Physical Output (Intense Daily Conditioning)",
  },
  bn: {
    sedentary: "বসে থাকা জীবন (ডেস্ক কাজ, কম নড়াচড়া)",
    light: "হালকা সক্রিয় (সপ্তাহে ১-৩ দিন রেইড)",
    moderate: "মাঝারি সক্রিয় (সপ্তাহে ৩-৫ দিন রেইড)",
    active: "বেশ সক্রিয় (সপ্তাহে ৬-৭ দিন রেইড)",
    very_active: "এস-র‍্যাঙ্ক সক্রিয় (ভারী শারীরিক পরিশ্রম ও দৈনিক ট্রেনিং)",
  },
};
