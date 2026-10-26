import { describe, expect, it } from "vitest";
import {
  isMongoConfigured,
  mongoClient,
  mongoDb,
  getProfilesCollection,
  getWorkoutsCollection,
  getGoalsCollection,
  getEvaluationsCollection,
  getPlayerStatsCollection,
  getExercisesCollection,
} from "../lib/server/mongodb";
import { auth } from "../lib/auth";

describe("MongoDB Database Integration", () => {
  it("initializes MongoDB client and database instances", () => {
    expect(mongoClient).toBeTruthy();
    expect(mongoDb).toBeTruthy();
    expect(mongoDb.databaseName).toBe("fitness");
  });

  it("exposes properly named collections for all core data entities", () => {
    expect(getProfilesCollection().collectionName).toBe("profiles");
    expect(getWorkoutsCollection().collectionName).toBe("workout_sessions");
    expect(getGoalsCollection().collectionName).toBe("user_goals");
    expect(getEvaluationsCollection().collectionName).toBe("progress_evaluations");
    expect(getPlayerStatsCollection().collectionName).toBe("player_stats");
    expect(getExercisesCollection().collectionName).toBe("exercises");
  });

  it("accurately detects placeholder password in MONGODB_URI", () => {
    // Current .env has '<db_password>' placeholder
    expect(isMongoConfigured()).toBe(false);
  });

  it("initializes Better Auth server instance with MongoDB adapter", () => {
    expect(auth).toBeTruthy();
    expect(auth.api).toBeTruthy();
    expect(typeof auth.handler).toBe("function");
  });
});
