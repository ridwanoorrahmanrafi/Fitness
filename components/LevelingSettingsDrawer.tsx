"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Search,
  ChevronRight,
  Sparkles,
  Volume2,
  VolumeX,
  Vibrate,
  Globe,
  Bell,
  Share2,
  Gift,
  Radio,
  FileText,
  SlidersHorizontal,
  Shield,
  HelpCircle,
  Database,
  Cloud,
  LogOut,
  Utensils,
  Dumbbell,
  Crown,
  Palette,
  LayoutGrid,
} from "lucide-react";
import { playSound, vibrate, unlockAudio } from "@/lib/audio";
import type { Language } from "@/lib/i18n";
import type { UserAccount, Profile } from "@/lib/types";
import type { PlayerStats } from "@/lib/systemStats";
import { isSupabaseConfigured } from "@/lib/supabase";

interface Props {
  open: boolean;
  onClose: () => void;
  lang: Language;
  onLanguageChange: (l: Language) => void;
  soundOn: boolean;
  onToggleSound: () => void;
  hapticsOn: boolean;
  onToggleHaptics: () => void;
  playerStats: PlayerStats;
  activeAccount: UserAccount | null;
  profile: Profile;
  onOpenAuth: () => void;
  onOpenDiet: () => void;
  onOpenArsenal: () => void;
  onOpenAchievements: () => void;
  onOpenGuildHub: () => void;
  onExportData: () => void;
  onResetData: () => void;
}

export function LevelingSettingsDrawer({
  open,
  onClose,
  lang,
  onLanguageChange,
  soundOn,
  onToggleSound,
  hapticsOn,
  onToggleHaptics,
  playerStats,
  activeAccount,
  profile,
  onOpenAuth,
  onOpenDiet,
  onOpenArsenal,
  onOpenAchievements,
  onOpenGuildHub,
  onExportData,
  onResetData,
}: Props) {
  const isBn = lang === "bn";
  const [search, setSearch] = useState("");
  const isCloudSynced = isSupabaseConfigured();
  const [backendStatus, setBackendStatus] = useState<{
    geminiConfigured: boolean;
    openaiConfigured: boolean;
    activeModelChain?: string[];
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/system-status")
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) {
          setBackendStatus({
            geminiConfigured: data.geminiConfigured,
            openaiConfigured: data.openaiConfigured,
            activeModelChain: data.activeModelChain,
          });
        }
      })
      .catch(() => {});
  }, [open]);

  if (!open) return null;

  const hunterInitial = (playerStats.name || "Sung Jin-woo").charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-5 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg min-h-[580px] max-h-[92vh] flex flex-col rounded-3xl bg-[#060c18] border border-cyan-500/40 p-5 shadow-[0_0_40px_rgba(0,140,255,0.25)] text-zinc-100 overflow-hidden my-auto">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-3">
          <button
            type="button"
            onClick={() => {
              playSound("system-click");
              onClose();
            }}
            className="btn btn-sm btn-circle btn-ghost text-zinc-400 hover:text-white"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <h2 className="text-lg font-bold text-white tracking-wide">
            {isBn ? "সেটিংস" : "Settings"}
          </h2>

          <div className="w-11" />
        </div>

        {/* Search settings input */}
        <div className="relative my-2">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-cyan-400 z-10 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isBn ? "সেটিংস খুঁজুন..." : "Search settings"}
            className="input input-bordered input-primary input-sm w-full bg-[#091326] pl-10 text-xs font-medium text-white placeholder-zinc-500"
          />
        </div>

        {/* Scrollable Settings Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mt-1">
          {/* Hunter Pass Card */}
          <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-b from-[#0a1c3d]/90 to-[#071329]/95 p-4 shadow-[0_0_20px_rgba(0,140,255,0.2)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-cyan-400" />
                <span className="text-base font-black tracking-widest text-cyan-300 uppercase">
                  HUNTER PASS
                </span>
              </div>
              <span className="badge badge-primary badge-outline text-[10px] font-bold">
                {isBn ? "৭ দিন ফ্রি ট্রায়াল" : "7-day free trial"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 my-3 text-center">
              <div className="rounded-xl border border-red-500/20 bg-black/40 p-2">
                <span className="block text-red-400 text-xs">🚫</span>
                <span className="text-[10px] font-bold text-zinc-300">
                  {isBn ? "বিজ্ঞাপনহীন" : "Zero ads"}
                </span>
              </div>
              <div className="rounded-xl border border-cyan-500/20 bg-black/40 p-2">
                <span className="block text-cyan-400 text-xs">⚡</span>
                <span className="text-[10px] font-bold text-zinc-300">
                  {isBn ? "কাস্টম কোয়েস্ট" : "Custom Quests"}
                </span>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-black/40 p-2">
                <span className="block text-amber-400 text-xs">📈</span>
                <span className="text-[10px] font-bold text-zinc-300">
                  {isBn ? "অ্যাডভান্সড ডাটা" : "Advanced stats"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playSound("system-click");
                onOpenAchievements();
              }}
              className="btn btn-sm btn-primary w-full shadow-md gap-1.5"
            >
              <span>{isBn ? "সকল সুবিধা দেখুন →" : "See everything included →"}</span>
            </button>
          </div>

          {/* Profile Card */}
          <div>
            <h3 className="text-xs font-bold text-cyan-400 tracking-wider uppercase mb-2">
              {isBn ? "প্রোফাইল" : "Profile"}
            </h3>
            <div className="rounded-2xl border border-cyan-500/20 bg-[#091326] p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-700 text-white font-black text-lg shadow-[0_0_12px_rgba(0,140,255,0.4)]">
                    {hunterInitial}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {playerStats.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="badge badge-primary badge-outline text-[9px] font-black">
                        RANK {playerStats.rank}
                      </span>
                      <span className="text-zinc-500 text-xs">·</span>
                      <span className="text-xs text-zinc-300 font-bold">
                        Lv. {playerStats.level}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-zinc-400 bg-black/60 border border-zinc-700 px-2 py-0.5 rounded-lg">
                  #LL5DMR
                </span>
              </div>

              {/* Edit Profile & Supabase Cloud Sync */}
              <button
                type="button"
                onClick={() => {
                  playSound("system-click");
                  onOpenAuth();
                }}
                className="w-full flex items-center justify-between text-xs py-1.5 text-zinc-300 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-cyan-400" />
                  <span>{isBn ? "ক্লাউড সিঙ্ক ও অ্যাকাউন্ট" : "Cloud Sync & Accounts"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-[10px] font-bold ${isCloudSynced ? "text-emerald-400" : "text-zinc-500"}`}>
                    {isCloudSynced ? "Supabase Connected" : "Local Storage"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-zinc-500" />
                </div>
              </button>
            </div>
          </div>

          {/* AI Serverless Backend Status Card */}
          <div className="rounded-2xl border border-cyan-500/30 bg-[#07132a] p-3.5 space-y-2 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {isBn ? "জেমিনাই এআই ব্যাকএন্ড" : "Gemini AI Backend Engine"}
                </span>
              </div>
              <span className={`badge badge-sm font-mono font-bold ${
                backendStatus?.geminiConfigured
                  ? "badge-success badge-outline shadow-[0_0_8px_rgba(52,211,153,0.3)]"
                  : "badge-warning badge-outline animate-pulse"
              }`}>
                {backendStatus?.geminiConfigured ? "ONLINE (SERVER)" : "NEEDS VERCEL KEY"}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {backendStatus?.geminiConfigured
                ? (isBn ? "সার্ভার সাইড এনভায়রনমেন্ট সুরক্ষিতভাবে ব্যাকএন্ড থেকে কাজ করছে। ফ্রন্টএন্ডে কোনো এআই কি প্রয়োজন নেই।" : "Server-side GEMINI_API_KEY running securely from the backend. Zero frontend key input required.")
                : (isBn ? "Vercel ড্যাশবোর্ডে GEMINI_API_KEY এনভায়রনমেন্ট ভ্যারিয়েবল যুক্ত করুন যাতে ব্যাকএন্ড থেকে স্বয়ংক্রিয়ভাবে এআই প্ল্যান তৈরি হয়।" : "Add GEMINI_API_KEY in your Vercel Project Dashboard (Settings → Environment Variables) for automatic serverless AI generation.")}
            </p>
            {backendStatus?.activeModelChain && (
              <div className="text-[10px] font-mono text-cyan-400/80 flex items-center justify-between pt-1 border-t border-cyan-500/20">
                <span>Model: {backendStatus.activeModelChain[0]}</span>
                <span className="text-zinc-500">100% Serverless Node.js</span>
              </div>
            )}
          </div>

          {/* Appearance Section */}
          <div>
            <h3 className="text-xs font-bold text-cyan-400 tracking-wider uppercase mb-2">
              {isBn ? "রূপ ও কার্যকারিতা" : "Appearance & Audio"}
            </h3>
            <div className="rounded-2xl border border-cyan-500/20 bg-[#091326] p-4 divide-y divide-zinc-800/80">
              {/* Sound Effects Toggle */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2.5">
                  {soundOn ? (
                    <Volume2 className="h-4 w-4 text-cyan-400" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-zinc-500" />
                  )}
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isBn ? "সাউন্ড ইফেক্টস" : "Sound Effects"}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {isBn ? "সিস্টেম বীপ ও অ্যারাইজ অডিও" : "Audio cues & system voice alerts"}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  aria-label={isBn ? "সাউন্ড ইফেক্টস" : "Sound Effects"}
                  checked={soundOn}
                  onChange={() => {
                    unlockAudio();
                    onToggleSound();
                  }}
                  className="toggle toggle-primary toggle-sm"
                />
              </div>

              {/* Haptic Feedback Toggle */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2.5">
                  <Vibrate className="h-4 w-4 text-purple-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isBn ? "হ্যাপটিক ফিডব্যাক" : "Haptic Feedback"}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {isBn ? "বাটনে স্পর্শে সূক্ষ্ম কম্পন" : "Subtle tactile vibrations"}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  aria-label={isBn ? "হ্যাপটিক ফিডব্যাক" : "Haptic Feedback"}
                  checked={hapticsOn}
                  onChange={() => {
                    vibrate(30);
                    onToggleHaptics();
                  }}
                  className="toggle toggle-primary toggle-sm"
                />
              </div>

              {/* Language Switcher */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2.5">
                  <Globe className="h-4 w-4 text-teal-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isBn ? "ভাষা ও অঞ্চল" : "Language & Region"}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {lang === "bn" ? "বাংলা (Bangladesh)" : "English (Global)"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playSound("system-click");
                    onLanguageChange(lang === "bn" ? "en" : "bn");
                  }}
                  className="btn btn-xs btn-outline btn-primary"
                >
                  {lang === "bn" ? "Switch to English" : "বাংলায় দেখুন"}
                </button>
              </div>
            </div>
          </div>

          {/* Training & Features */}
          <div>
            <h3 className="text-xs font-bold text-cyan-400 tracking-wider uppercase mb-2">
              {isBn ? "প্রশিক্ষণ ও ফিচার" : "Training & Features"}
            </h3>
            <div className="rounded-2xl border border-cyan-500/20 bg-[#091326] p-3 space-y-1">
              <button
                type="button"
                onClick={() => {
                  playSound("system-click");
                  onOpenDiet();
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Utensils className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold text-zinc-200">
                    {isBn ? "বাঙালি ডায়েট ও পুষ্টি রেশন" : "Bangladeshi Nutrition & Rations"}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-500" />
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound("system-click");
                  onOpenArsenal();
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Dumbbell className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-bold text-zinc-200">
                    {isBn ? "হান্টার আর্সেনাল ও অ্যানিমেশন" : "Hunter Arsenal & Kinematics"}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-500" />
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound("system-click");
                  onOpenGuildHub();
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-bold text-zinc-200">
                    {isBn ? "গিল্ড হাব ও সম্প্রদায়" : "Guild Hub & Community"}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-500" />
              </button>
            </div>
          </div>

          {/* Data & Backup */}
          <div>
            <h3 className="text-xs font-bold text-cyan-400 tracking-wider uppercase mb-2">
              {isBn ? "ডাটা ও ব্যাকআপ" : "Data & Storage"}
            </h3>
            <div className="rounded-2xl border border-cyan-500/20 bg-[#091326] p-3 space-y-2">
              <button
                type="button"
                onClick={() => {
                  playSound("system-click");
                  onExportData();
                }}
                className="btn btn-sm btn-outline btn-info w-full justify-between"
              >
                <span>{isBn ? "ব্যাকআপ ফাইল ডাউনলোড (JSON)" : "Export Hunter Backup (JSON)"}</span>
                <Share2 className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm(isBn ? "আপনি কি নিশ্চিত সব ডাটা রিসেট করতে চান?" : "Are you sure you want to reset all data?")) {
                    onResetData();
                  }
                }}
                className="btn btn-sm btn-outline btn-error w-full justify-between"
              >
                <span>{isBn ? "ডাটা রিসেট করুন" : "Reset Local Data"}</span>
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
