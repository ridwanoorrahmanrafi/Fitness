import type { Activity, Gender, Profile } from "./types";

export const LIMITS = {
  age: { min: 14, max: 90 },
  heightCm: { min: 120, max: 230 },
  weightKg: { min: 30, max: 250 },
} as const;

/** BMI = kg / m^2, rounded to 1 decimal. */
export function bmi(weightKg: number, heightCm: number): number {
  if (!(weightKg > 0) || !(heightCm > 0)) return 0;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

/** Standard WHO adult categories. Boundaries are inclusive at the lower edge, so 29.95 is never "Normal". */
export function bmiCategory(value: number): string {
  if (!(value > 0)) return "Unknown";
  if (value < 18.5) return "Underweight";
  if (value < 25) return "Normal weight";
  if (value < 30) return "Overweight";
  return "Obese";
}

/** Mifflin-St Jeor. "other" uses the midpoint of the two sex constants. */
export function bmr(gender: Gender, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const offset = gender === "male" ? 5 : gender === "female" ? -161 : (5 - 161) / 2;
  return Math.round(base + offset);
}

export const ACTIVITY_FACTORS: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_LABELS: Record<Activity, string> = {
  sedentary: "Sedentary (desk, little exercise)",
  light: "Light (1-3 sessions / week)",
  moderate: "Moderate (3-5 sessions / week)",
  active: "Active (6-7 sessions / week)",
  very_active: "Very active (physical job + training)",
};

export function tdee(bmrValue: number, activity: Activity): number {
  return Math.round(bmrValue * ACTIVITY_FACTORS[activity]);
}

export function profileStats(p: Pick<Profile, "gender" | "age" | "heightCm" | "weightKg" | "activity">) {
  const b = bmi(p.weightKg, p.heightCm);
  const r = bmr(p.gender, p.weightKg, p.heightCm, p.age);
  return { bmi: b, bmiCategory: bmiCategory(b), bmr: r, tdee: tdee(r, p.activity) };
}

/**
 * Rough energy estimate for resistance training: MET x kg x hours.
 * MET 4.5 sits between light (3.5) and vigorous (6.0) resistance work. It is an estimate, not a measurement.
 */
export function kcalEstimate(weightKg: number, minutes: number, met = 4.5): number {
  if (!(weightKg > 0) || !(minutes > 0)) return 0;
  return Math.round(met * weightKg * (minutes / 60));
}

export function isProfileInRange(p: Pick<Profile, "age" | "heightCm" | "weightKg">): string | null {
  if (!(p.age >= LIMITS.age.min && p.age <= LIMITS.age.max))
    return `Age must be between ${LIMITS.age.min} and ${LIMITS.age.max}.`;
  if (!(p.heightCm >= LIMITS.heightCm.min && p.heightCm <= LIMITS.heightCm.max))
    return `Height must be between ${LIMITS.heightCm.min} and ${LIMITS.heightCm.max} cm.`;
  if (!(p.weightKg >= LIMITS.weightKg.min && p.weightKg <= LIMITS.weightKg.max))
    return `Weight must be between ${LIMITS.weightKg.min} and ${LIMITS.weightKg.max} kg.`;
  return null;
}

/** Position of BMI on a 15 to 35 visual gauge (clamped 0 to 100%). */
export function bmiScalePercent(value: number): number {
  if (!(value > 0)) return 0;
  return Math.min(100, Math.max(0, Math.round(((value - 15) / (35 - 15)) * 100)));
}

/** Macronutrient split targets calculated deterministically from TDEE and Goal. */
export function macroTargets(tdeeKcal: number, weightKg: number, goal: import("./types").Goal = "muscle") {
  const delta = goal === "muscle" ? 300 : goal === "endurance" ? -350 : 0;
  const targetCalories = Math.max(1200, tdeeKcal + delta);

  // Protein targets based on training goal and bodyweight
  const proteinMultiplier = goal === "muscle" ? 2.0 : goal === "strength" ? 1.8 : 1.6;
  const proteinGrams = Math.round(weightKg * proteinMultiplier);
  const proteinKcal = proteinGrams * 4;

  // Fat targets: 25% of daily energy
  const fatKcal = Math.round(targetCalories * 0.25);
  const fatGrams = Math.round(fatKcal / 9);

  // Carbs: remainder of daily calories
  const carbKcal = Math.max(0, targetCalories - (proteinKcal + fatKcal));
  const carbGrams = Math.round(carbKcal / 4);

  return {
    targetCalories,
    proteinGrams,
    carbGrams,
    fatGrams,
    proteinPercent: Math.round((proteinKcal / targetCalories) * 100),
    carbPercent: Math.round((carbKcal / targetCalories) * 100),
    fatPercent: Math.round((fatKcal / targetCalories) * 100),
  };
}

/** Unit conversion helpers */
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10;
}

export function cmToFtIn(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

export function ftInToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54);
}

/**
 * 1-Repetition Maximum (1RM) Estimator.
 * Computes estimated maximum single-rep load using the validated scientific
 * Epley and Brzycki formulas.
 */
export function oneRepMax(weightKg: number, reps: number): {
  epley: number;
  brzycki: number;
  average: number;
} {
  if (weightKg <= 0 || reps <= 0) {
    return { epley: 0, brzycki: 0, average: 0 };
  }
  if (reps === 1) {
    return { epley: weightKg, brzycki: weightKg, average: weightKg };
  }

  // Epley: weight * (1 + reps / 30)
  const epley = Math.round(weightKg * (1 + reps / 30) * 10) / 10;

  // Brzycki: weight * (36 / (37 - reps))
  const brzycki =
    reps < 37
      ? Math.round(weightKg * (36 / (37 - reps)) * 10) / 10
      : epley;

  const average = Math.round(((epley + brzycki) / 2) * 10) / 10;
  return { epley, brzycki, average };
}

export function estimate1Rm(weightKg: number, reps: number): number {
  return oneRepMax(weightKg, reps).average;
}

/**
 * DOTS Formula (International Powerlifting Federation Standard).
 * Normalizes strength output across diverse bodyweights.
 */
export function dotsScore(
  gender: Gender,
  bodyweightKg: number,
  totalWeightLiftedKg: number
): number {
  if (bodyweightKg <= 0 || totalWeightLiftedKg <= 0) return 0;

  const w = Math.min(220, Math.max(40, bodyweightKg));
  const isFemale = gender === "female";

  // Polynomial coefficients
  const a = isFemale ? -0.0000010706 : -0.000001093;
  const b = isFemale ? 0.0005158568 : 0.0007391293;
  const c = isFemale ? -0.1126655495 : -0.1918759221;
  const d = isFemale ? 13.6175032 : 24.0900756;
  const e = isFemale ? -57.96288 : -307.75076;

  const denom = a * Math.pow(w, 4) + b * Math.pow(w, 3) + c * Math.pow(w, 2) + d * w + e;
  if (denom <= 0) return 0;

  const score = (totalWeightLiftedKg * 500) / denom;
  return Math.round(score * 100) / 100;
}

/**
 * Categorizes DOTS score into standardized athletic powerlifting classes.
 */
export function strengthClassification(dots: number): string {
  if (dots < 200) return "Novice";
  if (dots < 300) return "Intermediate";
  if (dots < 380) return "Advanced";
  if (dots < 450) return "Master / Elite";
  return "International / S-Rank Elite";
}

/** Precomputed discrete option lists for biometric select dropdowns */
export const AGE_OPTIONS = Array.from(
  { length: LIMITS.age.max - LIMITS.age.min + 1 },
  (_, i) => LIMITS.age.min + i
); // 14 to 90

export const HEIGHT_CM_OPTIONS = Array.from(
  { length: 220 - 120 + 1 },
  (_, i) => 120 + i
); // 120 to 220 cm

export const HEIGHT_FEET_OPTIONS = [4, 5, 6, 7];

export const HEIGHT_INCHES_OPTIONS = Array.from({ length: 12 }, (_, i) => i); // 0 to 11

export const WEIGHT_KG_OPTIONS = Array.from(
  { length: 200 - 35 + 1 },
  (_, i) => 35 + i
); // 35 to 200 kg

export const WEIGHT_LBS_OPTIONS = Array.from(
  { length: 440 - 75 + 1 },
  (_, i) => 75 + i
); // 75 to 440 lbs

export function toBengaliDigits(val: number | string): string {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(val).replace(/[0-9]/g, (d) => bnDigits[Number(d)] ?? d);
}

export function formatAgeOption(age: number, lang: "en" | "bn" = "en"): string {
  if (lang === "bn") {
    return `${toBengaliDigits(age)} বছর`;
  }
  return `${age} years`;
}

export function formatHeightCmOption(cm: number, lang: "en" | "bn" = "en"): string {
  const ftIn = cmToFtIn(cm);
  if (lang === "bn") {
    return `${toBengaliDigits(cm)} সেমি (${toBengaliDigits(ftIn.feet)}'${toBengaliDigits(ftIn.inches)}")`;
  }
  return `${cm} cm (${ftIn.feet}'${ftIn.inches}")`;
}

export function formatHeightFtOption(ft: number, lang: "en" | "bn" = "en"): string {
  if (lang === "bn") {
    return `${toBengaliDigits(ft)} ফুট`;
  }
  return `${ft} ft`;
}

export function formatHeightInOption(inches: number, lang: "en" | "bn" = "en"): string {
  if (lang === "bn") {
    return `${toBengaliDigits(inches)} ইঞ্চি`;
  }
  return `${inches} in`;
}

export function formatWeightKgOption(kg: number, lang: "en" | "bn" = "en"): string {
  const lbs = kgToLbs(kg);
  if (lang === "bn") {
    return `${toBengaliDigits(kg)} কেজি (${toBengaliDigits(lbs)} পাউন্ড)`;
  }
  return `${kg} kg (${lbs} lbs)`;
}

export function formatWeightLbsOption(lbs: number, lang: "en" | "bn" = "en"): string {
  const kg = lbsToKg(lbs);
  if (lang === "bn") {
    return `${toBengaliDigits(lbs)} পাউন্ড (${toBengaliDigits(kg)} কেজি)`;
  }
  return `${lbs} lbs (${kg} kg)`;
}


