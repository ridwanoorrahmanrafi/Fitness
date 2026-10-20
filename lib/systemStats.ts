// Solo Leveling System Engine (Player Status, Hunter Ranks, Daily Quest & Shadow Army)

export type HunterRank = "E" | "D" | "C" | "B" | "A" | "S" | "Shadow Monarch";

export interface ShadowSoldier {
  id: string;
  name: string;
  bengaliName: string;
  role: string;
  rank: "Elite Knight" | "Knight" | "General" | "Marshal";
  image: string;
  unlockedLevel: number;
  bonus: string;
}

export interface PlayerStats {
  name: string;
  job: string;
  title: string;
  level: number;
  exp: number;
  expToNext: number;
  expToNextLevel?: number;
  rank: HunterRank;
  coins?: number;
  keys?: number;
  gems?: number;
  hunterClass?: string;
  hp: { current: number; max: number };
  mp: { current: number; max: number };
  fatigue: number; // 0% to 100%
  attributes: {
    str: number; // Strength (increases with heavy resistance sets)
    agi: number; // Agility (increases with high rep / speed sets)
    vit: number; // Vitality (increases max HP & reduces fatigue)
    int: number; // Intelligence (increases Mana & daily quest consistency)
    per: number; // Perception (increases form score & AI accuracy)
  };
  unallocatedPoints: number;
  shadowArmyUnlocked: boolean;
  shadowSoldiers?: ShadowSoldier[];
  totalWorkoutsCleared: number;
  totalSetsCompleted: number;
}

export interface DailySystemQuest {
  title: string;
  subtitle: string;
  warning: string;
  objectives: {
    pushups: { current: number; target: number };
    situps: { current: number; target: number };
    squats: { current: number; target: number };
    runKm: { current: number; target: number };
  };
  completed: boolean;
  rewards: {
    recovery: string;
    statPoints: number;
    lootBox: string;
  };
}

export const INITIAL_SHADOW_SOLDIERS: ShadowSoldier[] = [
  {
    id: "igris",
    name: "Bloodred Commander Igris",
    bengaliName: "রক্তিম সেনাপতি ইগ্রিস",
    role: "Knight Commander",
    rank: "General",
    image: "/images/solo-leveling/shadow-knight-igris.jpg",
    unlockedLevel: 5,
    bonus: "+15% Strength & Form Stability",
  },
  {
    id: "tank",
    name: "Iron Bear Tank",
    bengaliName: "আয়রন বিয়ার ট্যাঙ্ক",
    role: "Vanguard Beast",
    rank: "Knight",
    image: "/images/solo-leveling/system-monarch-banner.jpg",
    unlockedLevel: 10,
    bonus: "+20% Vitality & Muscle Stamina",
  },
  {
    id: "iron",
    name: "Shadow Knight Iron",
    bengaliName: "শ্যাডো নাইট আয়রন",
    role: "Shield Heavy Vanguard",
    rank: "Elite Knight",
    image: "/images/solo-leveling/monarch-player-avatar.jpg",
    unlockedLevel: 15,
    bonus: "+25% Heavy Load Resilience",
  },
  {
    id: "beru",
    name: "Ant King Beru",
    bengaliName: "পিঁপড়া সম্রাট বেরু",
    role: "Supreme Marshal",
    rank: "Marshal",
    image: "/images/solo-leveling/system-crest-icon.jpg",
    unlockedLevel: 25,
    bonus: "+40% Agility & Explosive Power",
  },
];

const STORAGE_KEY = "arise_solo_leveling_player_v1";
const QUEST_STORAGE_KEY = "arise_solo_leveling_quest_v1";

export function getRankFromLevel(level: number): HunterRank {
  if (level >= 30) return "Shadow Monarch";
  if (level >= 20) return "S";
  if (level >= 15) return "A";
  if (level >= 10) return "B";
  if (level >= 7) return "C";
  if (level >= 4) return "D";
  return "E";
}

export function getJobTitleFromLevel(level: number): { job: string; title: string } {
  if (level >= 30) {
    return { job: "Shadow Monarch", title: "Monarch of Shadows" };
  }
  if (level >= 20) {
    return { job: "Necromancer Lord", title: "The One Who Overcame Adversity" };
  }
  if (level >= 10) {
    return { job: "Mage / Necromancer", title: "Wolf Slayer" };
  }
  if (level >= 5) {
    return { job: "Awakened Hunter", title: "D-Rank Specialist" };
  }
  return { job: "None (Candidate)", title: "Weakest Hunter of All Mankind" };
}

export function calculateExpToNext(level: number): number {
  return Math.round(150 * Math.pow(1.22, level - 1));
}

export function getDefaultPlayerStats(): PlayerStats {
  const level = 1;
  const { job, title } = getJobTitleFromLevel(level);
  return {
    name: "Sung Jin-woo",
    job,
    title,
    level,
    exp: 45,
    expToNext: calculateExpToNext(level),
    rank: "E",
    hp: { current: 100, max: 100 },
    mp: { current: 50, max: 50 },
    fatigue: 0,
    attributes: {
      str: 12,
      agi: 10,
      vit: 11,
      int: 10,
      per: 9,
    },
    coins: 1450,
    keys: 3,
    gems: 25,
    hunterClass: "Assassin",
    shadowSoldiers: INITIAL_SHADOW_SOLDIERS,
    unallocatedPoints: 3,
    shadowArmyUnlocked: false,
    totalWorkoutsCleared: 0,
    totalSetsCompleted: 0,
  };
}

export function loadPlayerStats(): PlayerStats {
  if (typeof window === "undefined") return getDefaultPlayerStats();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultPlayerStats();
    const parsed = JSON.parse(raw) as PlayerStats;
    parsed.rank = getRankFromLevel(parsed.level);
    const jt = getJobTitleFromLevel(parsed.level);
    if (!parsed.job || parsed.job === "None") parsed.job = jt.job;
    if (!parsed.title) parsed.title = jt.title;
    if (parsed.coins === undefined) parsed.coins = 1450;
    if (parsed.keys === undefined) parsed.keys = 3;
    if (parsed.gems === undefined) parsed.gems = 25;
    if (!parsed.hunterClass) parsed.hunterClass = "Assassin";
    if (!parsed.shadowSoldiers || parsed.shadowSoldiers.length === 0) {
      parsed.shadowSoldiers = INITIAL_SHADOW_SOLDIERS;
    }
    parsed.expToNext = calculateExpToNext(parsed.level);
    return parsed;
  } catch {
    return getDefaultPlayerStats();
  }
}

export function savePlayerStats(stats: PlayerStats): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    /* ignore */
  }
}

export interface ExpGainResult {
  stats: PlayerStats;
  leveledUp: boolean;
  levelsGained: number;
}

export function addPlayerExp(current: PlayerStats, expGain: number): ExpGainResult {
  const stats: PlayerStats = {
    ...current,
    exp: current.exp + expGain,
    attributes: { ...current.attributes },
    hp: { ...current.hp },
    mp: { ...current.mp },
  };

  let levelsGained = 0;
  while (stats.exp >= stats.expToNext) {
    stats.exp -= stats.expToNext;
    stats.level += 1;
    levelsGained += 1;
    stats.unallocatedPoints += 3;
    stats.expToNext = calculateExpToNext(stats.level);
    // Level up restores full vitality and increases max gauges
    stats.hp.max += 25;
    stats.hp.current = stats.hp.max;
    stats.mp.max += 15;
    stats.mp.current = stats.mp.max;
    stats.fatigue = 0; // fatigue reset on level up!
  }

  if (levelsGained > 0) {
    stats.rank = getRankFromLevel(stats.level);
    const jt = getJobTitleFromLevel(stats.level);
    stats.job = jt.job;
    stats.title = jt.title;
    if (stats.level >= 5) {
      stats.shadowArmyUnlocked = true;
    }
  }

  savePlayerStats(stats);
  return { stats, leveledUp: levelsGained > 0, levelsGained };
}

export function allocateStatPoint(
  current: PlayerStats,
  attribute: keyof PlayerStats["attributes"]
): PlayerStats {
  if (current.unallocatedPoints <= 0) return current;
  const updated: PlayerStats = {
    ...current,
    unallocatedPoints: current.unallocatedPoints - 1,
    attributes: {
      ...current.attributes,
      [attribute]: current.attributes[attribute] + 1,
    },
  };

  // Vitality increases max HP
  if (attribute === "vit") {
    updated.hp.max += 10;
    updated.hp.current += 10;
  }
  // Intelligence increases max MP
  if (attribute === "int") {
    updated.mp.max += 8;
    updated.mp.current += 8;
  }

  savePlayerStats(updated);
  return updated;
}

export function getTodaySystemQuest(customObjectives?: Partial<DailySystemQuest["objectives"]>): DailySystemQuest {
  const defaultObjectives = {
    pushups: { current: 0, target: 100 },
    situps: { current: 0, target: 100 },
    squats: { current: 0, target: 100 },
    runKm: { current: 0, target: 10 },
  };

  if (typeof window === "undefined") {
    return {
      title: "[DAILY QUEST: PREPARATION TO BECOME STRONG]",
      subtitle: "QUEST: PREPARATION TO BECOME STRONG • শক্তিশালী হওয়ার প্রস্তুতি",
      warning: "WARNING: Failure to complete within today will trigger Penalty Quest: Survival (4 Hours)!",
      objectives: { ...defaultObjectives, ...customObjectives },
      completed: false,
      rewards: {
        recovery: "Status Recovery: HP/MP 100% Restored",
        statPoints: 3,
        lootBox: "Random Crate / Shadow Extraction Key",
      },
    };
  }

  const todayKey = new Date().toISOString().slice(0, 10);
  try {
    const raw = localStorage.getItem(`${QUEST_STORAGE_KEY}_${todayKey}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    /* ignore */
  }

  const quest: DailySystemQuest = {
    title: "[DAILY QUEST: PREPARATION TO BECOME STRONG]",
    subtitle: "QUEST: PREPARATION TO BECOME STRONG • শক্তিশালী হওয়ার প্রস্তুতি",
    warning: "WARNING: Failure to complete within today will trigger Penalty Quest: Survival (4 Hours)!",
    objectives: { ...defaultObjectives, ...customObjectives },
    completed: false,
    rewards: {
      recovery: "Status Recovery: HP/MP 100% Restored",
      statPoints: 3,
      lootBox: "Random Crate / Shadow Extraction Key",
    },
  };

  try {
    localStorage.setItem(`${QUEST_STORAGE_KEY}_${todayKey}`, JSON.stringify(quest));
  } catch {
    /* ignore */
  }
  return quest;
}

export function saveTodaySystemQuest(quest: DailySystemQuest): void {
  if (typeof window === "undefined") return;
  const todayKey = new Date().toISOString().slice(0, 10);
  try {
    localStorage.setItem(`${QUEST_STORAGE_KEY}_${todayKey}`, JSON.stringify(quest));
  } catch {
    /* ignore */
  }
}
