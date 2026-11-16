import { NextResponse } from "next/server";
import {
  getProfilesCollection,
  getWorkoutsCollection,
  getGoalsCollection,
  getEvaluationsCollection,
  getPlayerStatsCollection,
  isMongoConfigured,
} from "@/lib/server/mongodb";
import type { HistoryEntry, Profile, UserGoal, ProgressEvaluation } from "@/lib/types";
import type { AthleteStats } from "@/lib/athleteStats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SyncPayload {
  userId: string;
  profile?: Profile;
  workout?: HistoryEntry;
  goals?: UserGoal[];
  evaluation?: ProgressEvaluation;
  athleteStats?: AthleteStats;
  playerStats?: any;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SyncPayload;
    const { userId, profile, workout, goals, evaluation, athleteStats, playerStats } = body;

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Missing userId" }, { status: 400 });
    }

    if (!isMongoConfigured()) {
      return NextResponse.json(
        { ok: false, error: "MongoDB is not configured on server (check MONGODB_URI)." },
        { status: 503 }
      );
    }

    const synced: string[] = [];

    // 1. Sync Profile
    if (profile) {
      const col = getProfilesCollection();
      await col.updateOne(
        { _id: `prof_${userId}` },
        {
          $set: {
            userId,
            name: "Athlete",
            gender: profile.gender,
            age: profile.age,
            heightCm: profile.heightCm,
            weightKg: profile.weightKg,
            activity: profile.activity,
            goal: profile.goal,
            dietGoal: profile.dietGoal ?? "recomp",
            level: profile.level,
            minutes: profile.minutes,
            focus: profile.focus,
            equipment: profile.equipment,
            limitations: profile.limitations ?? "",
            workoutDays: profile.workoutDays ?? [1, 3, 5],
            updatedAt: new Date().toISOString(),
          },
        },
        { upsert: true }
      );
      synced.push("profile");
    }

    // 2. Sync Workout
    if (workout) {
      const col = getWorkoutsCollection();
      await col.updateOne(
        { _id: workout.id },
        {
          $set: {
            userId,
            finishedAt: new Date(workout.finishedAt).toISOString(),
            title: workout.title,
            focus: workout.focus,
            difficulty: workout.difficulty,
            notes: workout.notes ?? "",
            minutes: workout.minutes,
            setsDone: workout.setsDone,
            setsTotal: workout.setsTotal,
            volumeKg: workout.volumeKg,
            kcalEstimate: workout.kcalEstimate,
            source: workout.source,
            exercisesData: workout.exercises,
            createdAt: new Date().toISOString(),
          },
        },
        { upsert: true }
      );
      synced.push("workout");
    }

    // 3. Sync Goals
    if (goals && Array.isArray(goals) && goals.length > 0) {
      const col = getGoalsCollection();
      for (const g of goals) {
        await col.updateOne(
          { _id: g.id },
          {
            $set: {
              userId,
              title: g.title,
              description: g.description ?? "",
              category: g.category,
              targetValue: g.targetValue,
              currentValue: g.currentValue,
              unit: g.unit,
              status: g.status,
              deadline: g.deadline ? new Date(g.deadline).toISOString() : null,
              createdAt: new Date(g.createdAt).toISOString(),
              completedAt: g.completedAt ? new Date(g.completedAt).toISOString() : null,
            },
          },
          { upsert: true }
        );
      }
      synced.push(`goals:${goals.length}`);
    }

    // 4. Sync Evaluation
    if (evaluation) {
      const col = getEvaluationsCollection();
      await col.updateOne(
        { _id: evaluation.id },
        {
          $set: {
            userId,
            evaluatedAt: new Date(evaluation.evaluatedAt).toISOString(),
            overallScore: evaluation.overallScore,
            strengthScore: evaluation.strengthScore,
            consistencyScore: evaluation.consistencyScore,
            volume7dKg: evaluation.volume7dKg,
            volume30dKg: evaluation.volume30dKg,
            sessions7d: evaluation.sessions7d,
            activeStreakDays: evaluation.activeStreakDays,
            aiSummary: evaluation.aiSummary,
            recommendations: evaluation.recommendations,
            createdAt: new Date().toISOString(),
          },
        },
        { upsert: true }
      );
      synced.push("evaluation");
    }

    // 5. Sync Athletic Performance Stats
    const statsData = athleteStats || playerStats;
    if (statsData) {
      const col = getPlayerStatsCollection();
      await col.updateOne(
        { _id: `stats_${userId}` },
        {
          $set: {
            userId,
            totalWorkouts: statsData.totalWorkouts ?? statsData.totalWorkoutsCleared ?? 0,
            totalVolumeKg: statsData.totalVolumeKg ?? 0,
            totalSets: statsData.totalSets ?? statsData.totalSetsCompleted ?? 0,
            currentStreak: statsData.currentStreak ?? 0,
            bestStreak: statsData.bestStreak ?? 0,
            lastWorkoutDate: statsData.lastWorkoutDate,
            personalRecords: statsData.personalRecords ?? {},
            fitnessLevel: statsData.fitnessLevel ?? "beginner",
            updatedAt: new Date().toISOString(),
          },
        },
        { upsert: true }
      );
      synced.push("athleteStats");
    }

    return NextResponse.json({ ok: true, synced });
  } catch (err) {
    console.error("MongoDB cloud sync error:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
