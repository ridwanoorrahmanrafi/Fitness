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
  ArrowRight,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";
import type { HistoryEntry, Profile, UserGoal, ProgressEvaluation } from "@/lib/types";
import type { Language } from "@/lib/i18n";
import { isSupabaseConfigured } from "@/lib/supabase";
import { playSound } from "@/lib/audio";

interface Props {
  goals: UserGoal[];
  evaluation: ProgressEvaluation | null;
  history: HistoryEntry[];
  profile: Profile;
  lang?: Language;
  onSyncCloud: () => Promise<void>;
  onOpenSupabaseConfig: () => void;
  onAddCustomGoal: (goal: Omit<UserGoal, "id" | "createdAt" | "currentValue" | "status">) => void;
}

export function GoalsProgressView({
  goals,
  evaluation,
  history,
  profile,
  lang = "bn",
  onSyncCloud,
  onOpenSupabaseConfig,
  onAddCustomGoal,
}: Props) {
  const isBn = lang === "bn";
  const isConnected = isSupabaseConfigured();
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
    <div className="space-y-5 animate-in fade-in duration-300 font-mono text-zinc-100">
      {/* 1. Supabase Cloud Core Connection Banner */}
      <div className="relative rounded-2xl border-2 border-cyan-500/40 bg-gradient-to-r from-cyan-950/80 via-black to-purple-950/70 p-4 shadow-[0_0_25px_rgba(6,182,212,0.25)] flex flex-wrap items-center justify-between gap-3 system-scanlines system-grid-bg">
        <div className="absolute top-1.5 left-1.5 text-cyan-400 text-[10px] select-none">◆</div>
        <div className="absolute top-1.5 right-1.5 text-cyan-400 text-[10px] select-none">◆</div>

        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
              isConnected
                ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                : "border-purple-500/30 bg-purple-950/40 text-purple-300"
            }`}
          >
            <Database className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white uppercase tracking-wider text-glow-cyan">
                {isConnected ? "[ SUPABASE CLOUD CORE : CONNECTED ]" : "[ LOCAL SYSTEM MEMORY ]"}
              </span>
              <span
                className={`h-2 w-2 rounded-full ${
                  isConnected ? "bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" : "bg-purple-400"
                }`}
              />
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {isConnected
                ? isBn
                  ? "সমস্ত ওয়ার্কআউট, ব্যায়াম ডাটা ও প্রগ্রেস ক্লাউডে সিঙ্ক হচ্ছে"
                  : "All hunter quests, logs, and progression synced to cloud database"
                : isBn
                ? "লোকাল মেমোরিতে সেভ আছে। ক্লাউড সিঙ্ক করতে Supabase কানেক্ট করুন"
                : "Saved offline. Connect Supabase to sync Hunter biometrics across all devices"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConnected && (
            <button
              onClick={() => {
                playSound("system-click");
                void handleSync();
              }}
              disabled={syncing}
              className="system-btn-chamfer flex min-h-[38px] items-center gap-1.5 bg-cyan-400/20 border border-cyan-400/60 px-3.5 text-xs font-black uppercase text-cyan-200 hover:bg-cyan-400/30 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.3)]"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
              <span>{syncSuccess ? "SYNCED!" : syncing ? "SYNCING..." : "SYNC NOW"}</span>
            </button>
          )}

          <button
            onClick={() => {
              playSound("system-click");
              onOpenSupabaseConfig();
            }}
            className="system-btn-chamfer flex min-h-[38px] items-center gap-1.5 border border-zinc-700 bg-black/60 px-3.5 text-xs font-black uppercase text-zinc-300 hover:text-white hover:border-cyan-400 active:scale-95 transition-all cursor-pointer"
          >
            <Cloud className="h-3.5 w-3.5 text-cyan-400" />
            <span>{isBn ? "ডাটাবেস সেটিংস" : "DATABASE CONFIG"}</span>
          </button>
        </div>
      </div>

      {/* 2. Continuous Biometric & Performance Evaluation Snapshot */}
      {evaluation && (
        <section className="relative overflow-hidden rounded-2xl border-2 border-cyan-400/70 bg-gradient-to-b from-[#05112e]/95 via-[#07153a]/90 to-[#030818]/95 p-5 shadow-[0_0_35px_rgba(6,182,212,0.3)] space-y-4 system-scanlines system-grid-bg">
          <div className="absolute top-1.5 left-1.5 text-cyan-400 text-[10px] select-none">◆</div>
          <div className="absolute top-1.5 right-1.5 text-cyan-400 text-[10px] select-none">◆</div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-cyan-500/30 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-400/20 text-cyan-400 border border-cyan-400/40">
                  <Activity className="h-4 w-4" />
                </span>
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider text-glow-cyan">
                  {isBn ? "[ হান্টার বায়োমেট্রিক মূল্যায়ন : CONTINUOUS EVALUATION ]" : "[ HUNTER COMBAT EVALUATION : PROGRESS ANALYSIS ]"}
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isBn
                  ? "আপনার সাম্প্রতিক সেশন, ভলিউম ও রিকভারির স্বয়ংক্রিয় মূল্যায়ন"
                  : "Continuous analysis of progressive overload, consistency, and volume trends"}
              </p>
            </div>

            {/* Overall Score Badge */}
            <div className="flex items-center gap-3 bg-black/80 border-2 border-cyan-400/60 rounded-xl px-4 py-2 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <div className="text-right">
                <span className="text-[9px] text-cyan-300 uppercase tracking-widest block font-black">
                  {isBn ? "যুদ্ধের প্রস্তুতি" : "COMBAT READINESS"}
                </span>
                <span className="text-xl font-black text-white font-mono text-glow-cyan">
                  {evaluation.overallScore}
                  <span className="text-xs text-zinc-500"> / 100</span>
                </span>
              </div>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-cyan-500/30 bg-black/70 p-3.5 shadow-inner">
              <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1.5 mb-1 uppercase tracking-wider">
                <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                {isBn ? "শক্তি সূচক (STRENGTH INDEX)" : "STRENGTH INDEX"}
              </span>
              <div className="text-2xl font-black text-white font-mono text-glow-cyan">{evaluation.strengthScore}%</div>
              <span className="text-[10px] text-cyan-400 font-bold uppercase">
                {isBn ? "প্রগ্রেসিভ ওভারলোড সক্রিয়" : "Progressive Overload Active"}
              </span>
            </div>

            <div className="rounded-xl border border-cyan-500/30 bg-black/70 p-3.5 shadow-inner">
              <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1.5 mb-1 uppercase tracking-wider">
                <Calendar className="h-3.5 w-3.5 text-purple-400" />
                {isBn ? "ধারাবাহিকতা (CONSISTENCY)" : "7D CONSISTENCY"}
              </span>
              <div className="text-2xl font-black text-purple-300 font-mono text-glow-purple">{evaluation.consistencyScore}%</div>
              <span className="text-[10px] text-zinc-400 font-bold">
                {evaluation.sessions7d} {isBn ? "টি সেশন সম্পন্ন" : "raids completed"}
              </span>
            </div>

            <div className="rounded-xl border border-cyan-500/30 bg-black/70 p-3.5 shadow-inner">
              <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1.5 mb-1 uppercase tracking-wider">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                {isBn ? "৭ দিনের মোট ভলিউম (TOTAL LOAD)" : "7D TOTAL LOAD"}
              </span>
              <div className="text-2xl font-black text-amber-400 font-mono text-glow-amber">
                {evaluation.volume7dKg.toLocaleString()} <span className="text-xs font-normal text-zinc-500">kg</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-bold">
                {isBn ? "সফলভাবে ভার বহন" : "Mechanical load sustained"}
              </span>
            </div>
          </div>

          {/* AI Coach Summary Verdict */}
          <div className="rounded-xl border border-cyan-400/40 bg-black/70 p-3.5 text-xs text-zinc-200 leading-relaxed flex items-start gap-2.5 shadow-inner">
            <Sparkles className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <strong className="text-cyan-300 block mb-0.5 font-black uppercase tracking-wider">
                {isBn ? "[ সিস্টেম নির্দেশিকা ও মূল্যায়ন : SYSTEM DIRECTIVE ]" : "[ SYSTEM DIRECTIVE ANALYSIS : AI EVALUATION ]"}
              </strong>
              {evaluation.aiSummary}
            </div>
          </div>
        </section>
      )}

      {/* 3. Adaptive Goals Section */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-cyan-400" />
            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider text-glow-cyan">
              {isBn ? "[ হান্টার কোয়েস্ট বোর্ড : QUEST BOARD ]" : "[ HUNTER QUEST BOARD : ACTIVE MILESTONES ]"}
            </h3>
          </div>

          <button
            onClick={() => {
              playSound("system-click");
              setShowAddModal(true);
            }}
            className="system-btn-chamfer flex items-center gap-1 border border-cyan-400/60 bg-cyan-400/20 px-3 py-1.5 text-xs font-black uppercase text-cyan-200 hover:bg-cyan-400/30 active:scale-95 transition-all cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.3)]"
          >
            <Plus className="h-3.5 w-3.5 stroke-[3]" />
            <span>{isBn ? "নতুন লক্ষ্য যোগ করুন" : "ADD NEW QUEST"}</span>
          </button>
        </div>

        {/* Active Goals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {activeGoals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.currentValue / Math.max(1, goal.targetValue)) * 100));

            return (
              <div
                key={goal.id}
                className="relative rounded-xl border border-cyan-500/30 bg-black/70 p-4 shadow-md space-y-3 transition-all hover:border-cyan-400/60"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block rounded bg-cyan-950 border border-cyan-500/40 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-cyan-300 mb-1.5">
                      {goal.category} QUEST
                    </span>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">{goal.title}</h4>
                    {goal.description && <p className="text-xs text-zinc-400 mt-0.5">{goal.description}</p>}
                  </div>
                  <span className="text-xs font-mono font-black text-cyan-300 text-glow-cyan shrink-0">{percent}%</span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1 font-mono font-bold">
                    <span>CURRENT: {goal.currentValue.toLocaleString()} {goal.unit}</span>
                    <span>TARGET: {goal.targetValue.toLocaleString()} {goal.unit}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-950 border border-cyan-500/30">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 transition-all duration-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
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
          <div className="mt-4 pt-3 border-t border-cyan-500/30 space-y-2">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              {isBn ? "[ সম্পন্ন হওয়া মাইলফলকসমূহ : CONQUERED MILESTONES ]" : "[ CONQUERED HUNTER MILESTONES ]"}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {completedGoals.map((cg) => (
                <div
                  key={cg.id}
                  className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-3 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="font-bold text-zinc-200 line-through opacity-85 uppercase">{cg.title}</span>
                  </div>
                  <span className="text-[9px] font-mono font-black text-emerald-300 shrink-0 bg-emerald-900/60 border border-emerald-400/40 px-2 py-0.5 rounded">
                    {isBn ? "সম্পন্ন (CONQUERED)" : "CONQUERED"}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-200 font-mono"
        >
          <div className="w-full max-w-md rounded-2xl border-2 border-cyan-400/80 bg-[#03081a]/95 p-6 shadow-[0_0_50px_rgba(6,182,212,0.4)] space-y-4 text-zinc-100 system-scanlines system-grid-bg">
            <div className="flex items-center justify-between border-b-2 border-cyan-500/40 pb-3">
              <div>
                <span className="text-[10px] text-cyan-400 uppercase font-black tracking-widest block">[ NEW MISSION ]</span>
                <h3 className="text-base font-black text-white uppercase text-glow-cyan">REGISTER SYSTEM QUEST</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="system-btn-chamfer h-8 w-8 flex items-center justify-center border border-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-300 font-bold uppercase mb-1">Quest Title / Objective</label>
                <input
                  type="text"
                  placeholder="e.g. Conquer 25 continuous push-ups"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-cyan-500/30 bg-black/80 p-2.5 text-white focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-300 font-bold uppercase mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-cyan-500/30 bg-black/80 p-2.5 text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="strength">Strength</option>
                    <option value="volume">Volume</option>
                    <option value="consistency">Consistency</option>
                    <option value="exercise">Exercise Skill</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold uppercase mb-1">Target Number</label>
                  <input
                    type="number"
                    min="1"
                    value={newTarget}
                    onChange={(e) => setNewTarget(Number(e.target.value))}
                    className="w-full rounded-xl border border-cyan-500/30 bg-black/80 p-2.5 text-white focus:border-cyan-400 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold uppercase mb-1">
                  {isBn ? "পরিমাপের একক" : "Measurement Unit"}
                </label>
                <select
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value as any)}
                  className="w-full rounded-xl border border-cyan-500/30 bg-black/80 p-2.5 text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="reps">{isBn ? "রেপস (Reps)" : "Reps"}</option>
                  <option value="kg">{isBn ? "কেজি ওজন (kg lifted)" : "kg lifted"}</option>
                  <option value="sessions">{isBn ? "সেশন সংখ্যা (Workout Sessions)" : "Workout Sessions"}</option>
                  <option value="days">{isBn ? "ধারাবাহিক দিন (Consecutive Days)" : "Consecutive Days"}</option>
                </select>
              </div>

              <button
                type="submit"
                className="system-btn-chamfer w-full py-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-black font-black uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                {isBn ? "কোয়েস্ট নিশ্চিত করুন (CONFIRM)" : "REGISTER QUEST & CONFIRM"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

