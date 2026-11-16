import { describe, it, expect } from "vitest";
import { EXERCISES, WARMUPS, getExercise, WARMUP_MAP } from "../lib/exercises";
import { getExerciseMedia } from "../lib/exerciseMedia";
import { EQUIPMENT_IDS, MUSCLES, type Pattern } from "../lib/types";

const VALID_PATTERNS: Pattern[] = [
  "squat",
  "lunge",
  "hinge",
  "push_h",
  "push_v",
  "pull_h",
  "pull_v",
  "core",
  "isolation",
];

describe("Exercise Movement Catalog & Biomechanical Audit", () => {
  it("contains unique IDs across all exercises", () => {
    const ids = EXERCISES.map((e) => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("ensures every exercise has valid biomechanical metadata", () => {
    for (const ex of EXERCISES) {
      expect(ex.id, `Invalid ID in exercise: ${JSON.stringify(ex)}`).toBeTruthy();
      expect(ex.name, `Missing name in exercise ${ex.id}`).toBeTruthy();
      expect(ex.muscles.length, `Missing muscles in exercise ${ex.id}`).toBeGreaterThan(0);
      for (const m of ex.muscles) {
        expect(MUSCLES, `Invalid muscle ${m} in ${ex.id}`).toContain(m);
      }
      expect(VALID_PATTERNS, `Invalid pattern ${ex.pattern} in ${ex.id}`).toContain(ex.pattern);
      expect([1, 2, 3], `Invalid level ${ex.level} in ${ex.id}`).toContain(ex.level);
      expect(typeof ex.lowImpact, `lowImpact must be boolean in ${ex.id}`).toBe("boolean");
      expect(ex.cues.length, `Missing coaching cues in ${ex.id}`).toBeGreaterThan(10);

      // Equipment requirements check
      for (const eq of ex.requires) {
        expect(EQUIPMENT_IDS, `Invalid equipment ${eq} in ${ex.id}`).toContain(eq);
      }
    }
  });

  it("verifies progression & regression pointer integrity (no dangling pointers)", () => {
    for (const ex of EXERCISES) {
      if (ex.easier) {
        const easierEx = getExercise(ex.easier);
        expect(
          easierEx,
          `Exercise '${ex.id}' points to non-existent easier variation: '${ex.easier}'`
        ).toBeDefined();
      }

      if (ex.harder) {
        const harderEx = getExercise(ex.harder);
        expect(
          harderEx,
          `Exercise '${ex.id}' points to non-existent harder variation: '${ex.harder}'`
        ).toBeDefined();
      }
    }
  });

  it("verifies exercise media resolution for 100% of movements without crashing", () => {
    for (const ex of EXERCISES) {
      const media = getExerciseMedia(ex.id);
      expect(media.id).toBe(ex.id);
      expect(media.localGif).toContain(ex.id);
      expect(media.remoteFallbackGif).toMatch(/^https?:\/\//);
      expect(media.keyBreathingCue.length).toBeGreaterThan(10);
      expect(media.tempo.eccentric).toBeGreaterThanOrEqual(1);
    }
  });

  it("verifies all warm-up routines have valid durations and regions", () => {
    expect(WARMUPS.length).toBeGreaterThanOrEqual(10);
    for (const wu of WARMUPS) {
      expect(wu.id).toBeTruthy();
      expect(wu.name).toBeTruthy();
      expect(wu.seconds).toBeGreaterThanOrEqual(20);
      expect(wu.regions.length).toBeGreaterThan(0);
      expect(wu.notes.length).toBeGreaterThan(10);
      expect(WARMUP_MAP[wu.id]).toBeDefined();
    }
  });
});
