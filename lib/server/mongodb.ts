import dns from "node:dns";
import { MongoClient, type Db, type Collection } from "mongodb";

// Ensure Windows/ISP local resolvers can resolve MongoDB Atlas SRV records reliably
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // ignore in sandboxed environments
}

const uri =
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL ||
  "mongodb://127.0.0.1:27017/fitness";

const dbName = process.env.MONGODB_DB_NAME || "fitness";

/**
 * Check if a valid production/cluster MongoDB URI is configured
 * (i.e. not empty and does not contain the unreplaced placeholder '<db_password>').
 */
export function isMongoConfigured(): boolean {
  const currentUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!currentUri) return false;
  if (currentUri.includes("<db_password>")) return false;
  return Boolean(currentUri.startsWith("mongodb://") || currentUri.startsWith("mongodb+srv://"));
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientInstance: MongoClient | undefined;
}

// Global cached client instance for Next.js Fast Refresh in development
export const mongoClient: MongoClient =
  global._mongoClientInstance ||
  new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });

if (process.env.NODE_ENV !== "production") {
  global._mongoClientInstance = mongoClient;
}

export const mongoDb: Db = mongoClient.db(dbName);

/**
 * Explicitly connects to MongoDB and tests the connection with a ping.
 */
export async function connectToMongoDB(): Promise<MongoClient> {
  try {
    await mongoClient.connect();
    // Confirm connection with a ping
    await mongoDb.command({ ping: 1 });
    console.log("You successfully connected to MongoDB!");
    return mongoClient;
  } catch (err) {
    console.dir(err);
    throw err;
  }
}

/**
 * Disconnects from MongoDB (call when your application terminates).
 */
export async function disconnectFromMongoDB(): Promise<void> {
  await mongoClient.close();
}

/**
 * Get MongoDB Database instance (ensures client is connected if needed)
 */
export async function getMongoDb(): Promise<Db> {
  if (!isMongoConfigured()) {
    console.warn("MongoDB is not fully configured (check MONGODB_URI in .env).");
  }
  return mongoDb;
}

// Type definitions for Collections in MongoDB
export interface MongoProfileDoc {
  _id: string; // "prof_<userId>"
  userId: string;
  name: string;
  gender: string;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: string;
  goal: string;
  dietGoal: string;
  level: string;
  minutes: number;
  focus: string;
  equipment: string[];
  limitations?: string;
  workoutDays: number[];
  updatedAt: string;
}

export interface MongoWorkoutDoc {
  _id: string; // workout entry id
  userId: string;
  finishedAt: string;
  title: string;
  focus: string;
  difficulty: string;
  notes?: string;
  minutes: number;
  setsDone: number;
  setsTotal: number;
  volumeKg: number;
  kcalEstimate: number;
  source: string;
  exercisesData: unknown[];
  createdAt: string;
}

export interface MongoGoalDoc {
  _id: string; // goal id
  userId: string;
  title: string;
  description?: string;
  category: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: string;
  deadline?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

export interface MongoEvaluationDoc {
  _id: string; // eval id
  userId: string;
  evaluatedAt: string;
  overallScore: number;
  strengthScore: number;
  consistencyScore: number;
  volume7dKg: number;
  volume30dKg: number;
  sessions7d: number;
  activeStreakDays: number;
  aiSummary: string;
  recommendations: string[];
  createdAt: string;
}

export interface MongoPlayerStatsDoc {
  _id: string; // "stats_<userId>"
  userId: string;
  name: string;
  job: string;
  title: string;
  level: number;
  exp: number;
  expToNext: number;
  rank: string;
  hp: { current: number; max: number };
  mp: { current: number; max: number };
  fatigue: number;
  attributes: {
    str: number;
    agi: number;
    vit: number;
    int: number;
    per: number;
  };
  unallocatedPoints: number;
  shadowArmyUnlocked: boolean;
  totalWorkoutsCleared: number;
  totalSetsCompleted: number;
  updatedAt: string;
}

export function getProfilesCollection(): Collection<MongoProfileDoc> {
  return mongoDb.collection<MongoProfileDoc>("profiles");
}

export function getWorkoutsCollection(): Collection<MongoWorkoutDoc> {
  return mongoDb.collection<MongoWorkoutDoc>("workout_sessions");
}

export function getGoalsCollection(): Collection<MongoGoalDoc> {
  return mongoDb.collection<MongoGoalDoc>("user_goals");
}

export function getEvaluationsCollection(): Collection<MongoEvaluationDoc> {
  return mongoDb.collection<MongoEvaluationDoc>("progress_evaluations");
}

export function getPlayerStatsCollection(): Collection<MongoPlayerStatsDoc> {
  return mongoDb.collection<MongoPlayerStatsDoc>("player_stats");
}

export function getExercisesCollection(): Collection<any> {
  return mongoDb.collection("exercises");
}
