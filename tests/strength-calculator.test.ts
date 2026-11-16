import { describe, expect, it } from "vitest";
import { oneRepMax, dotsScore, strengthClassification, kgToLbs, lbsToKg } from "../lib/calc";

describe("Strength Science & Powerlifting Integrations", () => {
  it("accurately calculates 1RM using Epley and Brzycki equations", () => {
    // 100kg for 5 reps:
    // Epley: 100 * (1 + 5/30) = 116.7kg
    // Brzycki: 100 * (36 / 32) = 112.5kg
    // Average: 114.6kg
    const calc = oneRepMax(100, 5);
    expect(calc.epley).toBe(116.7);
    expect(calc.brzycki).toBe(112.5);
    expect(calc.average).toBe(114.6);
  });

  it("calculates accurate training percentage loads from 1RM", () => {
    const calc = oneRepMax(100, 5);
    const max = calc.average; // 114.6
    const ninetyPercent = Math.round(max * 0.9 * 10) / 10;
    const seventyPercent = Math.round(max * 0.7 * 10) / 10;
    
    expect(ninetyPercent).toBe(103.1);
    expect(seventyPercent).toBe(80.2);
  });

  it("computes IPF DOTS coefficient and assigns correct competitive tier", () => {
    // 80kg male lifting 450kg total (Squat + Bench + Deadlift)
    const dots = dotsScore("male", 80, 450);
    expect(dots).toBeGreaterThan(290);
    expect(dots).toBeLessThan(340);

    const classification = strengthClassification(dots);
    expect(["Intermediate", "Advanced"]).toContain(classification);
  });

  it("handles imperial to metric unit conversions reversibly", () => {
    const kg = 100;
    const lbs = kgToLbs(kg);
    expect(lbs).toBe(220.5);

    const backToKg = lbsToKg(lbs);
    expect(Math.round(backToKg)).toBe(100);
  });

  it("renders StrengthCalculatorCard into HTML without crashing", async () => {
    const React = (await import("react")).default;
    const { renderToString } = await import("react-dom/server");
    const { StrengthCalculatorCard } = await import("../components/StrengthCalculatorCard");
    const html = renderToString(
      React.createElement(StrengthCalculatorCard, {
        lang: "en",
        defaultGender: "male",
        defaultBodyweightKg: 75,
      })
    );
    expect(html).toContain("1-Rep Max");
    expect(html).toContain("IPF DOTS Score");
  });
});
