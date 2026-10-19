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
