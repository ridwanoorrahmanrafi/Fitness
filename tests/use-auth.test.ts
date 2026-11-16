import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { useAuth } from "../lib/hooks/useAuth";

// Mock Better Auth client
const mockUseSession = vi.fn().mockReturnValue({ data: null, isPending: false });
const mockSignInEmail = vi.fn().mockResolvedValue({ data: { user: { id: "u_1", name: "Alex Athlete", email: "alex@arise.fit" } } });
const mockSignUpEmail = vi.fn().mockResolvedValue({ data: { user: { id: "u_2", name: "Jordan Power", email: "jordan@arise.fit" } } });
const mockSignOut = vi.fn().mockResolvedValue({});

vi.mock("../lib/auth-client", () => ({
  authClient: {
    useSession: () => mockUseSession(),
    signIn: { email: (...args: unknown[]) => mockSignInEmail(...args) },
    signUp: { email: (...args: unknown[]) => mockSignUpEmail(...args) },
    signOut: () => mockSignOut(),
  },
}));

vi.mock("../lib/mongodb-sync", () => ({
  isCloudConfigured: vi.fn().mockReturnValue(true),
  syncProfileToMongo: vi.fn().mockResolvedValue(true),
  syncAthleteStatsToMongo: vi.fn().mockResolvedValue(true),
  syncPlayerStatsToMongo: vi.fn().mockResolvedValue(true),
  syncGoalsToMongo: vi.fn().mockResolvedValue(true),
  syncWorkoutToMongo: vi.fn().mockResolvedValue(true),
  syncEvaluationToMongo: vi.fn().mockResolvedValue(true),
  pullUserCloudDataFromMongo: vi.fn().mockResolvedValue({ workouts: [], goals: [], evaluations: [] }),
  pullAthleteStatsFromMongo: vi.fn().mockResolvedValue(null),
  pullPlayerStatsFromMongo: vi.fn().mockResolvedValue(null),
  pullUserProfileFromMongo: vi.fn().mockResolvedValue(null),
}));

// In-memory localStorage mock for Node test environment
const memoryStore = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => memoryStore.get(key) ?? null,
  setItem: (key: string, val: string) => memoryStore.set(key, String(val)),
  removeItem: (key: string) => memoryStore.delete(key),
  clear: () => memoryStore.clear(),
};
Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("useAuth Hook State Machine", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    mockUseSession.mockReturnValue({ data: null, isPending: false });
  });

  function renderHookHelper<T>(hookFn: () => T): { current: T } {
    let result!: T;
    function TestComponent() {
      result = hookFn();
      return null;
    }
    renderToString(React.createElement(TestComponent));
    return { current: result };
  }

  it("initializes with unauthenticated status when no session exists", () => {
    const { current } = renderHookHelper(() => useAuth());
    expect(current.status).toBe("unauthenticated");
    expect(current.user).toBeNull();
  });

  it("reflects authenticated status when Better Auth session is active", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: "cloud_athlete_1",
          name: "Alex Athlete",
          email: "alex@arise.fit",
          fitnessLevel: "intermediate",
        },
      },
      isPending: false,
    });

    const { current } = renderHookHelper(() => useAuth());
    expect(current.status).toBe("authenticated");
    expect(current.user?.name).toBe("Alex Athlete");
    expect(current.user?.fitnessLevel).toBe("intermediate");
    expect(current.user?.isCloud).toBe(true);
  });

  it("handles email sign-in integration smoothly", async () => {
    const { current } = renderHookHelper(() => useAuth());
    const res = await current.signInEmail("test@example.com", "secret123");
    expect(res.ok).toBe(true);
    expect(mockSignInEmail).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "secret123",
    });
  });

  it("handles email registration integration smoothly", async () => {
    const { current } = renderHookHelper(() => useAuth());
    const res = await current.signUpEmail("jordan@arise.fit", "fitnessPass123", "Jordan Power");
    expect(res.ok).toBe(true);
    expect(mockSignUpEmail).toHaveBeenCalledWith({
      email: "jordan@arise.fit",
      password: "fitnessPass123",
      name: "Jordan Power",
    });
  });

  it("handles sign out cleanly", async () => {
    const { current } = renderHookHelper(() => useAuth());
    await current.signOut();
    expect(mockSignOut).toHaveBeenCalled();
  });
});

