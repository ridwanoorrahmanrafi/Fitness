import { describe, expect, it } from "vitest";
import {
  getRankFromLevel,
  getJobTitleFromLevel,
  calculateExpToNext,
  getDefaultPlayerStats,
  addPlayerExp,
  allocateStatPoint,
  getTodaySystemQuest,
  INITIAL_SHADOW_SOLDIERS,
  type PlayerStats,
  type DailySystemQuest,
} from "../lib/systemStats";

describe("Solo Leveling System Engine", () => {
  it("determines correct Hunter Ranks from Level", () => {
    expect(getRankFromLevel(1)).toBe("E");
    expect(getRankFromLevel(3)).toBe("E");
    expect(getRankFromLevel(4)).toBe("D");
    expect(getRankFromLevel(7)).toBe("C");
    expect(getRankFromLevel(10)).toBe("B");
    expect(getRankFromLevel(15)).toBe("A");
    expect(getRankFromLevel(20)).toBe("S");
    expect(getRankFromLevel(30)).toBe("Shadow Monarch");
  });

  it("determines iconic job titles based on level", () => {
    const candidate = getJobTitleFromLevel(1);
    expect(candidate.job).toContain("Candidate");
    expect(candidate.title).toContain("Weakest Hunter");

    const necro = getJobTitleFromLevel(10);
    expect(necro.job).toContain("Necromancer");

    const monarch = getJobTitleFromLevel(30);
    expect(monarch.job).toBe("Shadow Monarch");
    expect(monarch.title).toContain("Monarch of Shadows");
  });

  it("levels up player and restores gauges upon reaching exp target", () => {
    const initial = getDefaultPlayerStats();
    expect(initial.level).toBe(1);
    expect(initial.unallocatedPoints).toBe(3);

    // Add enough EXP to trigger level up
    const res = addPlayerExp(initial, 300);
    expect(res.leveledUp).toBe(true);
    expect(res.stats.level).toBeGreaterThan(1);
    expect(res.stats.unallocatedPoints).toBeGreaterThan(3);
    expect(res.stats.fatigue).toBe(0); // Fatigue reset on level up
  });

  it("allocates stat points to STR, AGI, VIT, INT, PER", () => {
    const initial = getDefaultPlayerStats();
    const startStr = initial.attributes.str;
    const startPoints = initial.unallocatedPoints;

    const updated = allocateStatPoint(initial, "str");
    expect(updated.attributes.str).toBe(startStr + 1);
    expect(updated.unallocatedPoints).toBe(startPoints - 1);
  });

  it("increases max HP when allocating Vitality and max MP when allocating Intelligence", () => {
    const initial = getDefaultPlayerStats();
    const startHp = initial.hp.max;
    const startMp = initial.mp.max;

    const withVit = allocateStatPoint(initial, "vit");
    expect(withVit.hp.max).toBe(startHp + 10);

    const withInt = allocateStatPoint(withVit, "int");
    expect(withInt.mp.max).toBe(startMp + 8);
  });

  it("initializes Daily Quest with 100 pushups, 100 situps, 100 squats, 10km run", () => {
    const quest = getTodaySystemQuest();
    expect(quest.objectives.pushups.target).toBe(100);
    expect(quest.objectives.situps.target).toBe(100);
    expect(quest.objectives.squats.target).toBe(100);
    expect(quest.objectives.runKm.target).toBe(10);
    expect(quest.warning).toContain("Penalty Quest: Survival");
  });

  it("has Bloodred Commander Igris in shadow army roster with proper localization and zero Korean", () => {
    const igris = INITIAL_SHADOW_SOLDIERS.find((s) => s.id === "igris");
    expect(igris).toBeDefined();
    expect(igris?.name).toContain("Igris");
    expect(igris?.rank).toBe("General");
    expect(igris?.bengaliName).toBeDefined();

    // Verify all shadow soldiers have bengali names and 0 Korean characters
    const koreanRegex = /[\uac00-\ud7a3]/;
    INITIAL_SHADOW_SOLDIERS.forEach((soldier) => {
      expect(soldier.name).not.toMatch(koreanRegex);
      expect(soldier.bengaliName).toBeDefined();
      expect(soldier.bengaliName).not.toMatch(koreanRegex);
      expect(soldier.bonus).not.toMatch(koreanRegex);
    });
  });

  it("provides valid weekly schedule deployment briefing for returning hunters", () => {
    const initial = getDefaultPlayerStats();
    expect(initial.name).toBe("Sung Jin-woo");
    expect(initial.rank).toBe("E");
    expect(initial.level).toBe(1);
    expect(initial.hp.current).toBe(100);
    expect(initial.mp.current).toBe(50);
    expect(initial.fatigue).toBe(0);
  });
});
