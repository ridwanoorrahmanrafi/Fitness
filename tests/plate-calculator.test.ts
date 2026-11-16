import { describe, it, expect } from "vitest";

function calculatePlates(targetWeight: number, barWeight: number) {
  const AVAILABLE_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
  const weightPerSide = Math.max(0, (targetWeight - barWeight) / 2);
  let remaining = weightPerSide;
  const platesPerSide: number[] = [];

  for (const p of AVAILABLE_PLATES) {
    while (remaining >= p - 0.001) {
      platesPerSide.push(p);
      remaining -= p;
    }
  }

  const actualTotal = barWeight + platesPerSide.reduce((sum, p) => sum + p, 0) * 2;
  return { platesPerSide, actualTotal, weightPerSide };
}

describe("Barbell Plate Calculator Engine", () => {
  it("calculates exact plates needed for 60kg on a 20kg bar", () => {
    // 60kg total = 20kg bar + (20kg per side) -> one 20kg plate per side
    const result = calculatePlates(60, 20);
    expect(result.platesPerSide).toEqual([20]);
    expect(result.actualTotal).toBe(60);
    expect(result.weightPerSide).toBe(20);
  });

  it("calculates complex fractional plate combinations (87.5kg on a 20kg bar)", () => {
    // 87.5kg - 20kg bar = 67.5kg total plates -> 33.75kg per side
    // 33.75kg = 25kg + 5kg + 2.5kg + 1.25kg
    const result = calculatePlates(87.5, 20);
    expect(result.platesPerSide).toEqual([25, 5, 2.5, 1.25]);
    expect(result.actualTotal).toBe(87.5);
  });

  it("handles empty bar safely when target equals bar weight", () => {
    const result = calculatePlates(20, 20);
    expect(result.platesPerSide).toEqual([]);
    expect(result.actualTotal).toBe(20);
  });

  it("handles 15kg technique bar correctly", () => {
    // 45kg total on 15kg bar = 30kg plates -> 15kg per side
    const result = calculatePlates(45, 15);
    expect(result.platesPerSide).toEqual([15]);
    expect(result.actualTotal).toBe(45);
  });
});

