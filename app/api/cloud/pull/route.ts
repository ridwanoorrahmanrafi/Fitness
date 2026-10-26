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
import type { PlayerStats } from "@/lib/systemStats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Missing userId" }, { status: 400 });
    }

    if (!isMongoConfigured()) {
      return NextResponse.json({
        ok: true,
        workouts: [],
        goals: [],
        evaluations: [],
        profile: null,
        playerStats: null,
        name: "Hunter",
        warning: "MongoDB is not configured on server",
      });
    }

    const [workoutDocs, goalDocs, evalDocs, profileDoc, statsDoc] = await Promise.all([
      getWorkoutsCollection()
        .find({ userId })
        .sort({ finishedAt: -1 })
        .limit(200)
        .toArray(),
      getGoalsCollection().find({ userId }).toArray(),
      getEvaluationsCollection()
        .find({ userId })
        .sort({ evaluatedAt: -1 })
        .limit(10)
        .toArray(),
      getProfilesCollection().findOne({ userId }),
      getPlayerStatsCollection().findOne({ userId }),
    ]);

    const workouts: HistoryEntry[] = workoutDocs.map((doc) => ({
      id: doc._id,
      finishedAt: new Date(doc.finishedAt).getTime(),
      title: doc.title,
      focus: (doc.focus as any) ?? "full",
      source: (doc.source as any) ?? "ai",
      minutes: doc.minutes,
      setsDone: doc.setsDone,
      setsTotal: doc.setsTotal,
      volumeKg: doc.volumeKg,
      kcalEstimate: doc.kcalEstimate,
      difficulty: (doc.difficulty as any) ?? "just_right",
      soreMuscles: [],
      notes: doc.notes,
      exercises: (doc.exercisesData as any) ?? [],
    }));

    const goals: UserGoal[] = goalDocs.map((doc) => ({
      id: doc._id,
      userId: doc.userId,
      title: doc.title,
      description: doc.description,
      category: doc.category as any,
      targetValue: doc.targetValue,
      currentValue: doc.currentValue,
      unit: doc.unit as any,
      status: doc.status as any,
      deadline: doc.deadline ? new Date(doc.deadline).getTime() : undefined,
      createdAt: new Date(doc.createdAt).getTime(),
      completedAt: doc.completedAt ? new Date(doc.completedAt).getTime() : undefined,
    }));

    const evaluations: ProgressEvaluation[] = evalDocs.map((doc) => ({
      id: doc._id,
      userId: doc.userId,
      evaluatedAt: new Date(doc.evaluatedAt).getTime(),
      overallScore: doc.overallScore,
      strengthScore: doc.strengthScore,
      consistencyScore: doc.consistencyScore,
      volume7dKg: doc.volume7dKg,
      volume30dKg: doc.volume30dKg,
      sessions7d: doc.sessions7d,
      activeStreakDays: doc.activeStreakDays,
      aiSummary: doc.aiSummary,
      recommendations: doc.recommendations ?? [],
    }));

    let profile: Profile | null = null;
    if (profileDoc) {
      profile = {
        gender: profileDoc.gender as any,
        age: profileDoc.age,
        heightCm: profileDoc.heightCm,
        weightKg: profileDoc.weightKg,
        activity: profileDoc.activity as any,
        level: (profileDoc.level as any) ?? "intermediate",
        goal: profileDoc.goal as any,
        dietGoal: (profileDoc.dietGoal as any) ?? "recomp",
        equipment: (profileDoc.equipment as any) ?? [],
        focus: (profileDoc.focus as any) ?? "full",
        minutes: (profileDoc.minutes as 20 | 30 | 45 | 60) ?? 45,
        lowImpact: true,
        limitations: profileDoc.limitations ?? "",
        workoutDays: profileDoc.workoutDays ?? [1, 3, 5],
      };
    }

    let playerStats: PlayerStats | null = null;
    if (statsDoc) {
      playerStats = {
        name: statsDoc.name,
        job: statsDoc.job,
        title: statsDoc.title,
        level: statsDoc.level,
        exp: statsDoc.exp,
        expToNext: statsDoc.expToNext,
        rank: statsDoc.rank as any,
        hp: statsDoc.hp,
        mp: statsDoc.mp,
        fatigue: statsDoc.fatigue,
        attributes: statsDoc.attributes,
        unallocatedPoints: statsDoc.unallocatedPoints,
        shadowArmyUnlocked: statsDoc.shadowArmyUnlocked,
        totalWorkoutsCleared: statsDoc.totalWorkoutsCleared,
        totalSetsCompleted: statsDoc.totalSetsCompleted,
      };
    }

    return NextResponse.json({
      ok: true,
      workouts,
      goals,
      evaluations,
      profile,
      playerStats,
      name: profileDoc?.name || statsDoc?.name || "Hunter",
    });
  } catch (err) {
    console.error("MongoDB cloud pull error:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
