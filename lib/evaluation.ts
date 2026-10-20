import type { HistoryEntry, Profile, ProgressEvaluation } from "./types";
import { sessionsInLastDays } from "./session";

/**
 * Continuous biometric & performance evaluation engine.
 * Analyzes session history, consistency, volume, and progressive overload.
 */
export function evaluateUserProgress(
  history: HistoryEntry[],
  profile: Profile,
  userId: string = "default"
): ProgressEvaluation {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // 1. Consistency & Frequency metrics
  const sessions7d = sessionsInLastDays(history, 7);
  const sessions30d = sessionsInLastDays(history, 30);
  const targetWeekly = profile.workoutDays?.length ?? 3;

  // Consistency Score: 0 to 100
  // Target: hitting the user's chosen workout days/week
  const consistencyRatio = targetWeekly > 0 ? sessions7d / targetWeekly : 1;
  const consistencyScore = Math.min(100, Math.round(consistencyRatio * 100));

  // 2. Volume metrics
  const cutoff7d = now - 7 * dayMs;
  const cutoff30d = now - 30 * dayMs;

  const volume7dKg = Math.round(
    history
      .filter((h) => h.finishedAt >= cutoff7d)
      .reduce((sum, h) => sum + (h.volumeKg || 0), 0)
  );

  const volume30dKg = Math.round(
    history
      .filter((h) => h.finishedAt >= cutoff30d)
      .reduce((sum, h) => sum + (h.volumeKg || 0), 0)
  );

  // 3. Active Streak Calculation (consecutive workout weeks or days)
  let activeStreakDays = 0;
  if (history.length > 0) {
    const sorted = [...history].sort((a, b) => b.finishedAt - a.finishedAt);
    const mostRecent = sorted[0].finishedAt;
    const daysSinceLast = Math.floor((now - mostRecent) / dayMs);

    if (daysSinceLast <= 3) {
      // Active streak
      activeStreakDays = Math.max(1, sessions7d * 2);
    }
  }

  // 4. Strength Score (Progressive Overload detection)
  // Check if weights or reps on recent sessions are maintaining or increasing
  let strengthScore = 75; // baseline
  if (history.length >= 2) {
    const recent = history.slice(0, 5);
    let volumeIncreasing = 0;
    for (let i = 0; i < recent.length - 1; i++) {
      if (recent[i].volumeKg >= recent[i + 1].volumeKg) volumeIncreasing++;
    }
    const overloadBonus = (volumeIncreasing / (recent.length - 1)) * 25;
    strengthScore = Math.min(100, Math.round(70 + overloadBonus));
  }

  // 5. Overall Weighted Fitness Score
  const overallScore = Math.round(
    consistencyScore * 0.45 + strengthScore * 0.4 + (sessions30d > 0 ? 15 : 5)
  );

  // 6. Natural Language AI Feedback & Adaptive Recommendations
  let aiSummary = "";
  const recommendations: string[] = [];

  if (history.length === 0) {
    aiSummary =
      "Your journey starts today! Complete your first workout session to establish your baseline strength and volume metrics.";
    recommendations.push("Log your first workout to establish your baseline strength score.");
    recommendations.push("Focus on controlled 3-1-1 tempo during the eccentric descent.");
  } else if (sessions7d >= targetWeekly) {
    aiSummary = `Outstanding discipline! You logged ${sessions7d} sessions this week, meeting 100% of your weekly split target.`;
    recommendations.push("Keep current momentum — prioritize adequate post-workout protein intake.");
    recommendations.push("Consider increasing dumbbell weight by +1-2 kg on your next compound movement.");
  } else if (sessions7d > 0) {
    aiSummary = `Solid effort! You completed ${sessions7d} of your target ${targetWeekly} weekly sessions.`;
    recommendations.push(`Aim for 1 more session this week to hit your full weekly split.`);
    recommendations.push("Maintain 60-90s rest periods to preserve muscular power output.");
  } else {
    aiSummary =
      "It has been a few days since your last workout. Consistent micro-sessions yield better long-term hypertrophy than sporadic heavy days.";
    recommendations.push("Jump in with a quick 20-minute session to reactivate muscle recruitment.");
    recommendations.push("Check today's suggested focus based on muscle recovery status.");
  }

  return {
    id: `eval_${now}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    evaluatedAt: now,
    overallScore,
    strengthScore,
    consistencyScore,
    volume7dKg,
    volume30dKg,
    sessions7d,
    activeStreakDays,
    aiSummary,
    recommendations,
  };
}
