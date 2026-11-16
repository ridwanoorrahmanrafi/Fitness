"use client";

import { useState } from "react";
import {
  Target,
  Sparkles,
  Trophy,
  Activity,
  Flame,
  CheckCircle2,
  Calendar,
  Zap,
  TrendingUp,
  Database,
  Cloud,
  RefreshCw,
  Plus,
  X,
} from "lucide-react";
import type { HistoryEntry, Profile, UserGoal, ProgressEvaluation } from "@/lib/types";
import type { Language } from "@/lib/i18n";
import { isCloudConfigured } from "@/lib/mongodb-sync";
import { playSound } from "@/lib/audio";

interface Props {
  goals: UserGoal[];
  evaluation: ProgressEvaluation | null;
  history: HistoryEntry[];
  profile: Profile;
  lang?: Language;
  onSyncCloud: () => Promise<void>;
  onOpenCloudConfig?: () => void;
  onAddCustomGoal: (goal: Omit<UserGoal, "id" | "createdAt" | "currentValue" | "status">) => void;
}

export function GoalsProgressView({
  goals,
  evaluation,
  history,
  profile,
  lang = "bn",
  onSyncCloud,
  onOpenCloudConfig,
  onAddCustomGoal,
}: Props) {
  const isBn = lang === "bn";
  const isConnected = isCloudConfigured();
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New goal form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<UserGoal["category"]>("strength");
  const [newTarget, setNewTarget] = useState(10);
  const [newUnit, setNewUnit] = useState<UserGoal["unit"]>("reps");

  const handleSync = async () => {
    setSyncing(true);
    setSyncSuccess(false);
    await onSyncCloud();
    setSyncing(false);
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 3000);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddCustomGoal({
      userId: "default",
      title: newTitle.trim(),
      category: newCategory,
      targetValue: Number(newTarget),
      unit: newUnit,
    });
    setNewTitle("");
    setShowAddModal(false);
  };

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  return (
    <div className="space-y-6 text-zinc-100">
      {/* 1. Cloud Sync Banner */}
      <div className="rounded-3xl glass-surface border border-white/10 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
              isConnected
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-zinc-700 bg-zinc-800/60 text-zinc-400"
            }`}
          >
            <Database className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {isConnected ? "Cloud Sync: Connected" : "Local Device Storage"}
              </span>
              <span
                className={`h-2 w-2 rounded-full ${
                  isConnected ? "bg-emerald-400 shadow-sm shadow-emerald-400" : "bg-amber-400"
                }`}
              />
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isConnected
                ? isBn
                  ? "সমস্ত ওয়ার্কআউট ও লক্ষ্য ডাটাবেসে সুরক্ষিতভাবে সিঙ্ক হচ্ছে"
                  : "All workout history and goals are automatically synced to the cloud"
                : isBn
                  ? "লোকাল মেমোরিতে সেভ আছে। ক্লাউড ব্যাকআপের জন্য একাউন্ট কানেক্ট করুন"
                  : "Saved offline. Connect an account to sync your fitness records across devices"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConnected && (
            <button
              type="button"
              onClick={() => {
                playSound("click");
                void handleSync();
              }}
              disabled={syncing}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 transition-all cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
              <span>{syncSuccess ? "SYNCED" : syncing ? "SYNCING..." : "SYNC NOW"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              playSound("click");
              if (onOpenCloudConfig) onOpenCloudConfig();
            }}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <Cloud className="h-3.5 w-3.5 text-zinc-400" />
            <span>{isBn ? "ক্লাউড একাউন্ট" : "Cloud Account"}</span>
          </button>
        </div>
      </div>

      {/* 2. Fitness Progress Evaluation */}
      {evaluation && (
        <section className="rounded-3xl glass-surface border border-white/10 p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                  <Activity className="h-4 w-4" />
                </span>
                <h3 className="text-base font-bold text-white">
                  {isBn ? "প্রগ্রেস ও পারফরম্যান্স মূল্যায়ন" : "Performance & Consistency Score"}
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isBn
                  ? "আপনার সাম্প্রতিক সেশন, ভলিউম ও ধারাবাহিকতার স্বয়ংক্রিয় বিশ্লেষণ"
                  : "Real-time evaluation of progressive overload, consistency, and training load"}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2">
              <span className="text-xs font-medium text-zinc-400">Overall Readiness:</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {evaluation.overallScore}
                <span className="text-xs text-zinc-500 font-normal"> / 100</span>
              </span>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3.5">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                <span>Strength Index</span>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-1 text-2xl font-bold text-white font-mono">
                {evaluation.strengthScore}%
              </div>
              <div className="text-[11px] text-emerald-400/90 font-medium mt-0.5">
                {isBn ? "প্রগ্রেসিভ ওভারলোড সক্রিয়" : "Progressive overload active"}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3.5">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                <span>7-Day Consistency</span>
                <Calendar className="h-4 w-4 text-sky-400" />
              </div>
              <div className="mt-1 text-2xl font-bold text-sky-400 font-mono">
                {evaluation.consistencyScore}%
              </div>
              <div className="text-[11px] text-zinc-400 font-medium mt-0.5">
                {evaluation.sessions7d} {isBn ? "টি সেশন সম্পন্ন" : "workouts this week"}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3.5">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                <span>7-Day Volume Load</span>
                <Flame className="h-4 w-4 text-amber-400" />
              </div>
              <div className="mt-1 text-2xl font-bold text-amber-400 font-mono">
                {evaluation.volume7dKg.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">kg</span>
              </div>
              <div className="text-[11px] text-zinc-400 font-medium mt-0.5">
                {isBn ? "মোট উত্তোলিত ওজন" : "Total mechanical volume"}
              </div>
            </div>
          </div>

          {/* AI Coach Summary Verdict */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5 text-xs text-zinc-300 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-400 block mb-0.5 font-semibold">
                {isBn ? "কোচের বিশ্লেষণ:" : "AI Coach Assessment:"}
              </strong>
              {evaluation.aiSummary}
            </div>
          </div>
        </section>
      )}

      {/* 3. Goals Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              {isBn ? "ফিটনেস গোল ও মাইলফলক" : "Fitness Goals & Milestones"}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => {
              playSound("click");
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{isBn ? "নতুন লক্ষ্য যোগ করুন" : "Add New Goal"}</span>
          </button>
        </div>

        {/* Active Goals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {activeGoals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.currentValue / Math.max(1, goal.targetValue)) * 100));

            return (
              <div
                key={goal.id}
                className="rounded-2xl border border-white/10 glass-surface p-4 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400 mb-1.5 inline-block">
                      {goal.category}
                    </span>
                    <h4 className="text-sm font-bold text-white">{goal.title}</h4>
                    {goal.description && <p className="text-xs text-zinc-400 mt-0.5">{goal.description}</p>}
                  </div>
                  <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-400 font-mono shrink-0">
                    {percent}%
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                    <span>Current: {goal.currentValue.toLocaleString()} {goal.unit}</span>
                    <span>Target: {goal.targetValue.toLocaleString()} {goal.unit}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completed Goals Showcase */}
        {completedGoals.length > 0 && (
          <div className="mt-4 pt-3 border-t border-zinc-800 space-y-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-amber-400" />
              {isBn ? "সম্পন্ন হওয়া লক্ষ্যসমূহ" : "Completed Milestones"}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {completedGoals.map((cg) => (
                <div
                  key={cg.id}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-3 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-zinc-200 line-through opacity-80">{cg.title}</span>
                  </div>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 shrink-0">
                    COMPLETED
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Add Custom Goal Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-3xl border border-white/10 glass-surface p-6 shadow-xl space-y-4 text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  {isBn ? "নতুন ফিটনেস লক্ষ্য নির্ধারণ করুন" : "Set New Fitness Goal"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  {isBn ? "লক্ষ্যের নাম" : "Goal Title / Target"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bench press 100 kg or 20 pull-ups"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="strength">Strength</option>
                    <option value="volume">Volume</option>
                    <option value="consistency">Consistency</option>
                    <option value="exercise">Exercise Technique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Target Value</label>
                  <input
                    type="number"
                    min="1"
                    value={newTarget}
                    onChange={(e) => setNewTarget(Number(e.target.value))}
                    className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 text-sm font-bold text-white focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  {isBn ? "পরিমাপের একক" : "Measurement Unit"}
                </label>
                <select
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value as any)}
                  className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="reps">{isBn ? "রেপস (Reps)" : "Reps"}</option>
                  <option value="kg">{isBn ? "কেজি ওজন (kg lifted)" : "kg lifted"}</option>
                  <option value="sessions">{isBn ? "সেশন সংখ্যা (Workout Sessions)" : "Workout Sessions"}</option>
                  <option value="days">{isBn ? "ধারাবাহিক দিন (Consecutive Days)" : "Consecutive Days"}</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-bold text-black shadow-md hover:brightness-105 transition-all"
              >
                {isBn ? "লক্ষ্য সংরক্ষণ করুন" : "Save Fitness Goal"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
