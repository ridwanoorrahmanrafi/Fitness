import { ProfileSchema } from "./schemas";
import { normalizeHistory } from "./session";
import type { HistoryEntry, Profile } from "./types";

export const KEYS = {
  profile: "arise.v1.profile",
  session: "arise.v1.session",
  history: "arise.v1.history",
  access: "arise.v1.access",
  sound: "arise.v1.sound",
  geminiKey: "arise.v1.gemini_key",
  unitSystem: "arise.v1.unit_system",
} as const;

export function parseProfile(v: unknown): Profile | null {
  const r = ProfileSchema.safeParse(v);
  return r.success ? (r.data as Profile) : null;
}

export interface Backup {
  app: "arise-coach";
  version: 1;
  exportedAt: number;
  profile: Profile | null;
  history: HistoryEntry[];
}

export function makeBackup(profile: Profile | null, history: HistoryEntry[]): Backup {
  return { app: "arise-coach", version: 1, exportedAt: Date.now(), profile, history };
}

/** Parses a backup file; returns null if it is not one of ours. Merges by id so importing twice is harmless. */
export function readBackup(text: string): { profile: Profile | null; history: HistoryEntry[] } | null {
  try {
    const raw = JSON.parse(text);
    if (!raw || raw.app !== "arise-coach" || raw.version !== 1) return null;
    return { profile: parseProfile(raw.profile), history: normalizeHistory(raw.history) };
  } catch {
    return null;
  }
}

export function mergeHistory(current: HistoryEntry[], incoming: HistoryEntry[]): HistoryEntry[] {
  const byId = new Map<string, HistoryEntry>();
  for (const h of [...current, ...incoming]) byId.set(h.id, h);
  return [...byId.values()].sort((a, b) => b.finishedAt - a.finishedAt).slice(0, 500);
}
