import type { HistoryEntry, Profile, UserGoal } from "./types";
import { sessionsInLastDays } from "./session";

/**
 * Seed initial baseline goals based on user profile and workout frequency.
 */
export function generateInitialGoals(profile: Profile, userId: string): UserGoal[] {
  const now = Date.now();
  const targetWeekly = profile.workoutDays?.length ?? 3;

  return [
    {
      id: `goal_consistency_${now}`,
      userId,
      title: `Complete ${targetWeekly} workouts this week`,
      description: "Consistency is the single highest predictor of fitness transformation.",
      category: "consistency",
      targetValue: targetWeekly,
      currentValue: 0,
      unit: "sessions",
      status: "active",
      createdAt: now,
    },
    {
      id: `goal_volume_${now}`,
      userId,
      title: "Reach 1,500 kg weekly volume",
      description: "Accumulate total mechanical tension across all sets and reps.",
      category: "volume",
      targetValue: 1500,
      currentValue: 0,
      unit: "kg",
      status: "active",
      createdAt: now,
    },
    {
      id: `goal_streak_${now}`,
      userId,
      title: "Achieve a 2-week active workout streak",
      description: "Build workout habit loops that stick effortlessly.",
      category: "consistency",
      targetValue: 14,
      currentValue: 1,
      unit: "days",
      status: "active",
      createdAt: now,
    },
  ];
}

/**
 * Evaluate all goals against updated session history, updating currentValues and marking completed goals.
 * Also generates new adaptive goals as older ones are conquered!
 */
export function evaluateAndUpdateGoals(
  existingGoals: UserGoal[],
  history: HistoryEntry[],
  profile: Profile,
  userId: string
): { updatedGoals: UserGoal[]; newlyCompleted: UserGoal[] } {
  const now = Date.now();
  const weekSessions = sessionsInLastDays(history, 7);
  const cutoff7d = now - 7 * 24 * 60 * 60 * 1000;
  const weekVolume = Math.round(
    history.filter((h) => h.finishedAt >= cutoff7d).reduce((sum, h) => sum + (h.volumeKg || 0), 0)
  );

  const newlyCompleted: UserGoal[] = [];

  // Update existing goals
  const updatedGoals = existingGoals.map((goal) => {
    if (goal.status === "completed") return goal;

    let newVal = goal.currentValue;

    if (goal.category === "consistency" && goal.unit === "sessions") {
      newVal = weekSessions;
    } else if (goal.category === "volume" && goal.unit === "kg") {
      newVal = weekVolume;
    } else if (goal.category === "consistency" && goal.unit === "days") {
      newVal = Math.min(goal.targetValue, Math.max(1, weekSessions * 2));
    }

    const isNowDone = newVal >= goal.targetValue;
    if (isNowDone && goal.status === "active") {
      const finishedGoal: UserGoal = {
        ...goal,
        currentValue: newVal,
        status: "completed",
        completedAt: now,
      };
      newlyCompleted.push(finishedGoal);
      return finishedGoal;
    }

    return {
      ...goal,
      currentValue: newVal,
    };
  });

  // Ensure user always has at least 3 active goals
  const activeCount = updatedGoals.filter((g) => g.status === "active").length;
  if (activeCount < 3) {
    // Generate adaptive progression goal based on history
    const highestTotalVolume = history.reduce((max, h) => Math.max(max, h.volumeKg || 0), 0);
    const nextVolumeTarget = Math.max(2000, Math.round((highestTotalVolume * 1.25) / 500) * 500);

    const nextGoal: UserGoal = {
      id: `goal_adapt_${now}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      title: `Hit ${nextVolumeTarget.toLocaleString()} kg session volume milestone`,
      description: "Progressive mechanical overload to trigger new muscle adaptation.",
      category: "volume",
      targetValue: nextVolumeTarget,
      currentValue: highestTotalVolume,
      unit: "kg",
      status: "active",
      createdAt: now,
    };

    updatedGoals.unshift(nextGoal);
  }

  return { updatedGoals, newlyCompleted };
}
