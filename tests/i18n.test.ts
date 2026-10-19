import { describe, expect, it } from "vitest";
import {
  TRANSLATIONS,
  FOCUS_LABELS_I18N,
  GOAL_LABELS_I18N,
  LEVEL_LABELS_I18N,
  ACTIVITY_LABELS_I18N,
  type Language,
} from "../lib/i18n";

describe("Internationalization (i18n) Engine", () => {
  const languages: Language[] = ["en", "bn"];

  it("provides comprehensive translations for both English and Bengali", () => {
    for (const lang of languages) {
      const t = TRANSLATIONS[lang];
      expect(t.appName).toBe("ARISE");
      expect(t.readyTitle).toBeTruthy();
      expect(t.dietSheetTitle).toBeTruthy();
      expect(t.saveProfileBtn).toBeTruthy();
      expect(t.workoutDaysCount(3, 4)).toContain("3");
      expect(t.targetCalories("muscle")).toBeTruthy();
      expect(t.movementsCount(5)).toContain("5");
      expect(t.setsProgress(2, 3)).toContain("2/3");
    }
  });

  it("covers all workout focus IDs in both languages", () => {
    const focusIds = ["full", "chest_tri", "back_bi", "legs_core", "shoulders_arms"] as const;
    for (const lang of languages) {
      for (const id of focusIds) {
        expect(FOCUS_LABELS_I18N[lang][id]).toBeTruthy();
      }
    }
  });

  it("covers all experience levels and goals in both languages", () => {
    const levels = ["beginner", "intermediate", "advanced"] as const;
    const goals = ["muscle", "strength", "endurance"] as const;
    for (const lang of languages) {
      for (const lvl of levels) {
        expect(LEVEL_LABELS_I18N[lang][lvl]).toBeTruthy();
      }
      for (const g of goals) {
        expect(GOAL_LABELS_I18N[lang][g]).toBeTruthy();
      }
    }
  });

  it("covers all daily activity options in both languages", () => {
    const activities = ["sedentary", "light", "moderate", "active", "very_active"] as const;
    for (const lang of languages) {
      for (const act of activities) {
        expect(ACTIVITY_LABELS_I18N[lang][act]).toBeTruthy();
      }
    }
  });
});
