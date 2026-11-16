import { describe, it, expect } from "vitest";
import {
  oneRepMax,
  dotsScore,
  strengthClassification,
  kgToLbs,
  lbsToKg,
  cmToFtIn,
  ftInToCm,
  bmi,
  bmiCategory,
  macroTargets,
} from "../lib/calc";

describe("Scientific Strength & 1RM Calculators", () => {
  it("calculates 1RM accurately using Epley and Brzycki equations", () => {
    // 1 rep of 100kg is exactly 100kg
    const single = oneRepMax(100, 1);
    expect(single.epley).toBe(100);
    expect(single.brzycki).toBe(100);
    expect(single.average).toBe(100);

    // 10 reps with 100kg
    // Epley: 100 * (1 + 10/30) = 133.3kg
    // Brzycki: 100 * (36 / (37 - 10)) = 100 * (36 / 27) = 133.3kg
    const tenReps = oneRepMax(100, 10);
    expect(tenReps.epley).toBe(133.3);
    expect(tenReps.brzycki).toBe(133.3);
    expect(tenReps.average).toBe(133.3);

    // Zero or negative handling
    expect(oneRepMax(0, 5).average).toBe(0);
    expect(oneRepMax(100, 0).average).toBe(0);
  });

  it("calculates DOTS strength scores for male and female athletes", () => {
    // Male: 80kg bodyweight lifting 500kg total
    const maleDots = dotsScore("male", 80, 500);
    expect(maleDots).toBeGreaterThan(320);
    expect(maleDots).toBeLessThan(360);
    expect(strengthClassification(maleDots)).toBe("Advanced");

    // Female: 60kg bodyweight lifting 350kg total
    const femaleDots = dotsScore("female", 60, 350);
    expect(femaleDots).toBeGreaterThan(350);
    expect(strengthClassification(femaleDots)).toBe("Master / Elite");

    // Boundary & zero handling
    expect(dotsScore("male", 0, 500)).toBe(0);
    expect(dotsScore("female", 60, 0)).toBe(0);
  });

  it("classifies DOTS performance into athletic tiers", () => {
    expect(strengthClassification(180)).toBe("Novice");
    expect(strengthClassification(250)).toBe("Intermediate");
    expect(strengthClassification(350)).toBe("Advanced");
    expect(strengthClassification(420)).toBe("Master / Elite");
    expect(strengthClassification(500)).toBe("International / S-Rank Elite");
  });

  it("handles high-rep 1RM without divide-by-zero errors in Brzycki formula", () => {
    // 40 reps (> 37): should fall back safely to Epley without throwing or returning Infinity
    const highReps = oneRepMax(50, 40);
    expect(highReps.epley).toBeGreaterThan(50);
    expect(Number.isFinite(highReps.brzycki)).toBe(true);
    expect(highReps.average).toBe(highReps.epley);
  });

  it("converts units accurately between Metric and Imperial", () => {
    expect(kgToLbs(100)).toBe(220.5);
    expect(lbsToKg(220.5)).toBe(100);

    const ftIn = cmToFtIn(175);
    expect(ftIn.feet).toBe(5);
    expect(ftIn.inches).toBe(9);
    expect(ftInToCm(5, 9)).toBe(175);
  });

  it("calculates BMI and handles boundary edges according to WHO criteria", () => {
    expect(bmi(70, 175)).toBe(22.9);
    expect(bmiCategory(18.4)).toBe("Underweight");
    expect(bmiCategory(18.5)).toBe("Normal weight");
    expect(bmiCategory(24.9)).toBe("Normal weight");
    expect(bmiCategory(25.0)).toBe("Overweight");
    expect(bmiCategory(29.9)).toBe("Overweight");
    expect(bmiCategory(30.0)).toBe("Obese");
    expect(bmiCategory(0)).toBe("Unknown");
  });

  it("computes macro targets with appropriate goal caloric deltas", () => {
    const muscle = macroTargets(2200, 75, "muscle");
    expect(muscle.targetCalories).toBe(2500); // +300 kcal
    expect(muscle.proteinGrams).toBe(150); // 75kg * 2.0g

    const endurance = macroTargets(2200, 75, "endurance");
    expect(endurance.targetCalories).toBe(1850); // -350 kcal
    expect(endurance.proteinGrams).toBe(120); // 75kg * 1.6g
  });
});

