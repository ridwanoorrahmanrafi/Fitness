"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { authClient } from "@/lib/auth-client";
import { KEYS } from "@/lib/storage";
import type { UserAccount, Profile, HistoryEntry, UserGoal, ProgressEvaluation } from "@/lib/types";
import type { AthleteStats } from "@/lib/athleteStats";
import {
  pullUserCloudDataFromMongo,
  pullAthleteStatsFromMongo,
  pullUserProfileFromMongo,
  syncProfileToMongo,
  syncAthleteStatsToMongo,
  syncGoalsToMongo,
  syncWorkoutToMongo,
  syncEvaluationToMongo,
  isCloudConfigured,
} from "@/lib/mongodb-sync";
import { isGuestMigrated, migrateGuestDataToCloud } from "@/lib/guest-migration";
import { loadAthleteStats, saveAthleteStats } from "@/lib/athleteStats";

export type AuthStatus = "loading" | "authenticated" | "guest" | "unauthenticated";

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  fitnessLevel?: string;
  isCloud: boolean;
}

export type HunterUser = AuthUser;

export interface UseAuthReturn {
  status: AuthStatus;
  user: AuthUser | null;
  activeAccount: UserAccount | null;
  accounts: UserAccount[];
  isCloudSynced: boolean;
  signInEmail: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUpEmail: (email: string, password: string, name: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  createGuestAccount: (name: string, pin?: string) => UserAccount;
  selectAccount: (account: UserAccount | null) => void;
  syncCloudData: (currentData: {
    profile: Profile;
    athleteStats?: AthleteStats;
    playerStats?: AthleteStats;
    goals: UserGoal[];
    evaluation: ProgressEvaluation | null;
    history: HistoryEntry[];
  }) => Promise<boolean>;
}

export type UseHunterAuthReturn = UseAuthReturn;

export function useAuth(): UseAuthReturn {
  const { data: sessionData, isPending } = authClient.useSession();

  const [activeAccount, setActiveAccount] = useState<UserAccount | null>(() => {
    if (typeof localStorage === "undefined") return null;
    try {
      const stored = localStorage.getItem(KEYS.activeUser);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    if (typeof localStorage === "undefined") return [];
    try {
      const stored = localStorage.getItem(KEYS.accounts);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync state changes with localStorage
  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    if (activeAccount) {
      localStorage.setItem(KEYS.activeUser, JSON.stringify(activeAccount));
    } else {
      localStorage.removeItem(KEYS.activeUser);
    }
  }, [activeAccount]);

  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(KEYS.accounts, JSON.stringify(accounts));
  }, [accounts]);

  // Derived user object
  const user: AuthUser | null = useMemo(() => {
    if (sessionData?.user) {
      const u = sessionData.user;
      return {
        id: u.id,
        name: u.name || u.email?.split("@")[0] || "Athlete",
        email: u.email,
        fitnessLevel: (u as { fitnessLevel?: string }).fitnessLevel || "beginner",
        isCloud: true,
      };
    }

    if (activeAccount) {
      return {
        id: activeAccount.id,
        name: activeAccount.name,
        email: activeAccount.emailOrHandle,
        fitnessLevel: "beginner",
        isCloud: Boolean(activeAccount.cloudUser),
      };
    }

    return null;
  }, [sessionData?.user, activeAccount]);

  const status: AuthStatus = useMemo(() => {
    if (isPending) return "loading";
    if (sessionData?.user) return "authenticated";
    if (activeAccount) return "guest";
    return "unauthenticated";
  }, [isPending, sessionData?.user, activeAccount]);

  const isCloudSynced = Boolean(isCloudConfigured() && (sessionData?.user || activeAccount?.cloudUser));

  // Auto-migrate guest data to cloud upon Better Auth login
  useEffect(() => {
    if (!sessionData?.user) return;
    const cloudUserId = sessionData.user.id;

    if (!isGuestMigrated(cloudUserId)) {
      const storedProfile = typeof localStorage !== "undefined" ? localStorage.getItem(KEYS.profile) : null;
      const storedHistory = typeof localStorage !== "undefined" ? localStorage.getItem(KEYS.history) : null;
      const storedGoals = typeof localStorage !== "undefined" ? localStorage.getItem(KEYS.userGoals) : null;
      const storedEvaluations = typeof localStorage !== "undefined" ? localStorage.getItem(KEYS.evaluations) : null;

      void migrateGuestDataToCloud(cloudUserId, {
        profile: storedProfile ? JSON.parse(storedProfile) : null,
        history: storedHistory ? JSON.parse(storedHistory) : [],
        goals: storedGoals ? JSON.parse(storedGoals) : [],
        evaluations: storedEvaluations ? JSON.parse(storedEvaluations) : [],
        athleteStats: loadAthleteStats(),
      });
    }

    // Pull any remote data if available
    void (async () => {
      const [remoteStats, remoteProfile, remoteCloudData] = await Promise.all([
        pullAthleteStatsFromMongo(cloudUserId),
        pullUserProfileFromMongo(cloudUserId),
        pullUserCloudDataFromMongo(cloudUserId),
      ]);

      if (remoteStats) saveAthleteStats(remoteStats);

      if (remoteProfile?.profile && typeof localStorage !== "undefined") {
        localStorage.setItem(KEYS.profile, JSON.stringify(remoteProfile.profile));
      }

      if (remoteCloudData.workouts.length > 0 && typeof localStorage !== "undefined") {
        const localRaw = localStorage.getItem(KEYS.history);
        const localHist: HistoryEntry[] = localRaw ? JSON.parse(localRaw) : [];
        const mergedMap = new Map<string, HistoryEntry>();
        for (const h of [...localHist, ...remoteCloudData.workouts]) mergedMap.set(h.id, h);
        const merged = [...mergedMap.values()].sort((a, b) => b.finishedAt - a.finishedAt);
        localStorage.setItem(KEYS.history, JSON.stringify(merged));
      }
    })();
  }, [sessionData?.user]);

  // Actions
  const signInEmail = useCallback(async (email: string, password: string) => {
    try {
      const res = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (res.error) {
        return { ok: false, error: res.error.message || "Failed to sign in." };
      }

      if (res.data?.user) {
        const u = res.data.user;
        const cloudAcc: UserAccount = {
          id: u.id,
          name: u.name || u.email?.split("@")[0] || "Athlete",
          emailOrHandle: u.email,
          createdAt: u.createdAt ? new Date(u.createdAt).getTime() : Date.now(),
          lastActive: Date.now(),
          cloudUser: true,
        };
        setActiveAccount(cloudAcc);
        return { ok: true };
      }

      return { ok: false, error: "No user returned from authentication service." };
    } catch (err: unknown) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }, []);

  const signUpEmail = useCallback(async (email: string, password: string, name: string) => {
    try {
      const res = await authClient.signUp.email({
        email: email.trim(),
        password,
        name: name.trim() || "Athlete",
      });

      if (res.error) {
        return { ok: false, error: res.error.message || "Failed to register." };
      }

      if (res.data?.user) {
        const u = res.data.user;
        const cloudAcc: UserAccount = {
          id: u.id,
          name: name.trim() || "Athlete",
          emailOrHandle: u.email,
          createdAt: Date.now(),
          lastActive: Date.now(),
          cloudUser: true,
        };
        setActiveAccount(cloudAcc);
        return { ok: true };
      }

      return { ok: false, error: "Registration response incomplete." };
    } catch (err: unknown) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authClient.signOut();
    } catch {
      // ignore
    }
    setActiveAccount(null);
  }, []);

  const createGuestAccount = useCallback((name: string, pin?: string): UserAccount => {
    const acc: UserAccount = {
      id: `local_${Date.now()}`,
      name: name.trim() || "Guest Athlete",
      pin: pin ? pin.trim() : undefined,
      createdAt: Date.now(),
      lastActive: Date.now(),
    };
    setAccounts((prev) => [...prev, acc]);
    setActiveAccount(acc);
    return acc;
  }, []);

  const selectAccount = useCallback((account: UserAccount | null) => {
    setActiveAccount(account);
  }, []);

  const syncCloudData = useCallback(
    async (currentData: {
      profile: Profile;
      athleteStats?: AthleteStats;
      playerStats?: AthleteStats;
      goals: UserGoal[];
      evaluation: ProgressEvaluation | null;
      history: HistoryEntry[];
    }): Promise<boolean> => {
      const targetId = user?.id;
      if (!targetId || !isCloudConfigured()) return false;

      try {
        const stats = currentData.athleteStats || currentData.playerStats || loadAthleteStats();
        await Promise.all([
          syncProfileToMongo(currentData.profile, targetId),
          syncAthleteStatsToMongo(stats, targetId),
          currentData.goals.length > 0 ? syncGoalsToMongo(currentData.goals, targetId) : Promise.resolve(true),
          currentData.evaluation ? syncEvaluationToMongo(currentData.evaluation, targetId) : Promise.resolve(true),
          currentData.history[0] ? syncWorkoutToMongo(currentData.history[0], targetId) : Promise.resolve(true),
        ]);
        return true;
      } catch (err) {
        console.warn("Manual cloud sync failed:", err);
        return false;
      }
    },
    [user?.id]
  );

  return {
    status,
    user,
    activeAccount,
    accounts,
    isCloudSynced,
    signInEmail,
    signUpEmail,
    signOut,
    createGuestAccount,
    selectAccount,
    syncCloudData,
  };
}

export const useHunterAuth = useAuth;

