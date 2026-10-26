"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  LogOut,
  Cloud,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
  Radio,
} from "lucide-react";
import { Sheet } from "./Sheet";
import { type Language, TRANSLATIONS } from "@/lib/i18n";
import type { UserAccount } from "@/lib/types";
import { authClient } from "@/lib/auth-client";
import {
  isSupabaseConfigured,
  syncProfileToSupabase,
  syncPlayerStatsToSupabase,
} from "@/lib/supabase";
import { playSound, vibrate, unlockAudio } from "@/lib/audio";
import { loadPlayerStats } from "@/lib/systemStats";

interface Props {
  open: boolean;
  lang: Language;
  activeAccount: UserAccount | null;
  accounts: UserAccount[];
  geminiKey?: string;
  onSaveGeminiKey?: (key: string) => void;
  onSelectAccount: (acc: UserAccount | null) => void;
  onCreateAccount: (name: string, pin?: string) => void;
  onLanguageChange?: (lang: Language) => void;
  onSyncCloud?: () => void;
  onClose: () => void;
}

type AuthTab = "login" | "register" | "local";

export function HunterAuthModal({
  open,
  lang,
  activeAccount,
  accounts,
  onSelectAccount,
  onCreateAccount,
  onLanguageChange,
  onSyncCloud,
  onClose,
}: Props) {
  const t = TRANSLATIONS[lang] ?? TRANSLATIONS.bn;
  const isBn = lang === "bn";

  const [tab, setTab] = useState<AuthTab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hunterName, setHunterName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Local account creation state
  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState("");

  const isCloudLoggedIn = Boolean(activeAccount?.supabaseUser || activeAccount?.emailOrHandle);

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setHunterName("");
    setError(null);
    setNotice(null);
  };

  // 1. Better Auth: Email & Password Sign In
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!email.trim() || !password) {
      setError(
        isBn
          ? "অনুগ্রহ করে ইমেইল ও পাসওয়ার্ড প্রদান করুন।"
          : "Please provide your email and password."
      );
      return;
    }

    setLoading(true);
    unlockAudio();
    playSound("system-click");

    try {
      const res = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (res.error) {
        const msg = res.error.message || "";
        if (msg.includes("Invalid") || msg.includes("credentials")) {
          setError(
            isBn
              ? "ভুল ইমেইল বা পাসওয়ার্ড। দয়া করে সঠিক তথ্য দিন।"
              : "Invalid email or password. Please verify your credentials."
          );
        } else {
          setError(msg || (isBn ? "লগইন ব্যর্থ হয়েছে।" : "Login failed."));
        }
        playSound("system-alert");
        vibrate([50, 100]);
        return;
      }

      if (res.data?.user) {
        playSound("arise");
        vibrate([80, 120, 80]);
        const user = res.data.user;
        const userName = user.name || user.email?.split("@")[0] || "Hunter";

        const cloudAcc: UserAccount = {
          id: user.id,
          name: userName,
          emailOrHandle: user.email,
          createdAt: user.createdAt ? new Date(user.createdAt).getTime() : Date.now(),
          lastActive: Date.now(),
          profile: activeAccount?.profile,
          supabaseUser: true,
        };

        onSelectAccount(cloudAcc);
        setNotice(
          isBn
            ? `স্বাগতম হান্টার ${userName}! বেটার অথ ক্লাউডে সফলভাবে লগইন হয়েছে।`
            : `Welcome Hunter ${userName}! Successfully authenticated with Better Auth.`
        );

        setTimeout(() => {
          onClose();
          clearForm();
        }, 1200);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      playSound("system-alert");
    } finally {
      setLoading(false);
    }
  };

  // 2. Better Auth: Hunter Registration (Sign Up)
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!email.trim() || !password) {
      setError(isBn ? "ইমেইল ও পাসওয়ার্ড প্রয়োজন।" : "Email and password are required.");
      return;
    }

    if (password.length < 6) {
      setError(
        isBn
          ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।"
          : "Password must be at least 6 characters."
      );
      return;
    }

    setLoading(true);
    unlockAudio();
    playSound("system-click");

    try {
      const callSign = hunterName.trim() || "Shadow Hunter";
      const res = await authClient.signUp.email({
        email: email.trim(),
        password,
        name: callSign,
      });

      if (res.error) {
        setError(res.error.message || (isBn ? "নিবন্ধন ব্যর্থ হয়েছে।" : "Registration failed."));
        playSound("system-alert");
        vibrate([50, 100]);
        return;
      }

      if (res.data?.user) {
        playSound("arise");
        vibrate([80, 150, 80]);
        const user = res.data.user;

        const cloudAcc: UserAccount = {
          id: user.id,
          name: callSign,
          emailOrHandle: user.email,
          createdAt: Date.now(),
          lastActive: Date.now(),
          profile: activeAccount?.profile,
          supabaseUser: true,
        };

        onSelectAccount(cloudAcc);

        // Seed initial hunter stats to database for new hunter
        const localStats = loadPlayerStats();
        void syncPlayerStatsToSupabase(
          { ...localStats, name: callSign },
          user.id
        );
        if (activeAccount?.profile) {
          void syncProfileToSupabase(activeAccount.profile, user.id);
        }

        setNotice(
          isBn
            ? `অভিনন্দন ${callSign}! নতুন হান্টার হিসেবে আপনার লাইসেন্স সক্রিয় হয়েছে।`
            : `Congratulations ${callSign}! Your Hunter license is registered on Better Auth.`
        );

        setTimeout(() => {
          onClose();
          clearForm();
        }, 1500);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      playSound("system-alert");
    } finally {
      setLoading(false);
    }
  };

  // 3. Sign Out
  const handleSignOut = async () => {
    playSound("system-click");
    vibrate(25);
    setLoading(true);
    try {
      await authClient.signOut();
      onSelectAccount(null);
      setNotice(
        isBn
          ? "ক্লাউড সেশন শেষ হয়েছে। আপনি এখন লোকাল গেস্ট মোডে আছেন।"
          : "Signed out of Cloud session. Returned to offline guest mode."
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // 4. Force Cloud Telemetry Sync
  const handleForceSync = async () => {
    playSound("system-click");
    vibrate(20);
    setSyncing(true);
    setError(null);
    try {
      if (onSyncCloud) {
        onSyncCloud();
      }
      setNotice(
        isBn
          ? "সব ওয়ার্কআউট, গোল ও হান্টার স্ট্যাটাস সফলভাবে ক্লাউডে সিঙ্ক হয়েছে!"
          : "All combat telemetry, goals, and hunter attributes synced to Cloud!"
      );
      setTimeout(() => setNotice(null), 3500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSyncing(false);
    }
  };

  // 5. Local Profile Creation Handler
  const handleCreateLocal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    playSound("arise");
    onCreateAccount(newName.trim(), newPin.trim() || undefined);
    setNewName("");
    setNewPin("");
    setTab("local");
  };

  return (
    <Sheet
      open={open}
      title={
        isBn
          ? "[ HUNTER AUTHENTICATION : সিস্টেম লগইন ও প্রোফাইল ]"
          : "[ HUNTER AUTHENTICATION : SYSTEM LOGIN & PROFILE ]"
      }
      onClose={onClose}
      dismissable
    >
      <div className="space-y-4 font-mono text-cyan-100">
        {/* Language Selection Row */}
        {onLanguageChange && (
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-mono text-cyan-400/80 uppercase tracking-wider">
              {isBn ? "[ সিস্টেম ভাষা ]" : "[ SYSTEM LANGUAGE ]"}
            </span>
            <div
              className="inline-flex items-center rounded-lg border border-cyan-500/30 bg-[#061022] p-0.5 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
              role="group"
              aria-label="Language selection"
            >
              <button
                type="button"
                onClick={() => {
                  playSound("system-click");
                  onLanguageChange("bn");
                }}
                className={`px-2.5 py-0.5 text-xs font-bold rounded transition-all ${
                  isBn
                    ? "bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.6)] font-black"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
                aria-pressed={isBn}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => {
                  playSound("system-click");
                  onLanguageChange("en");
                }}
                className={`px-2.5 py-0.5 text-xs font-bold rounded transition-all ${
                  !isBn
                    ? "bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.6)] font-black"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
                aria-pressed={!isBn}
              >
                EN
              </button>
            </div>
          </div>
        )}

        {/* Active Account Status Bar */}
        <div className="system-btn-chamfer border-2 border-cyan-400/60 bg-gradient-to-r from-[#040c24] via-[#05112e] to-[#020510] p-4 shadow-[0_0_25px_rgba(6,182,212,0.25)] relative overflow-hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-xl overflow-hidden border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0 bg-[#020614]">
                <Image
                  src="/images/solo-leveling/system-crest-icon.jpg"
                  alt="System Crest"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-cyan-400 font-bold">
                  {isCloudLoggedIn ? (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                      {isBn ? "[ বেটার অথ · ক্লাউড কানেক্টেড ]" : "[ BETTER AUTH · CLOUD CONNECTED ]"}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      {isBn ? "[ লোকাল গেস্ট মোড ]" : "[ OFFLINE GUEST MODE ]"}
                    </span>
                  )}
                </div>
                <div className="text-base font-black text-white text-glow-cyan tracking-wide flex items-center gap-2">
                  <span>{activeAccount ? activeAccount.name : isBn ? "গেস্ট হান্টার" : "Guest Hunter"}</span>
                  {isCloudLoggedIn && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-950/80 border border-purple-400/50 text-purple-200">
                      BETTER AUTH PLAYER
                    </span>
                  )}
                </div>
                {activeAccount?.emailOrHandle && (
                  <div className="text-[11px] text-cyan-300/70 truncate max-w-[220px] sm:max-w-[320px]">
                    {activeAccount.emailOrHandle}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isCloudLoggedIn ? (
                <>
                  <button
                    type="button"
                    onClick={handleForceSync}
                    disabled={syncing}
                    title={isBn ? "ক্লাউডে ডাটা সিঙ্ক করুন" : "Force sync telemetry to cloud"}
                    className="flex items-center gap-1 px-2.5 py-1.5 system-btn-chamfer border border-cyan-400/50 bg-cyan-950/60 text-cyan-300 hover:text-white text-xs font-bold active:scale-95 transition-all"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin text-cyan-400" : ""}`} />
                    <span className="hidden sm:inline">{isBn ? "সিঙ্ক" : "Sync"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={loading}
                    className="flex items-center gap-1 px-2.5 py-1.5 system-btn-chamfer border border-rose-500/50 bg-rose-950/40 text-rose-300 hover:text-white text-xs font-bold active:scale-95 transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>{isBn ? "সাইন আউট" : "Sign Out"}</span>
                  </button>
                </>
              ) : (
                <span className="hidden sm:inline-block px-2 py-1 rounded text-[10px] font-mono text-cyan-400/80 border border-cyan-500/30 bg-cyan-950/30">
                  {isBn ? "লগইন করুন" : "Login Below"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Notices & Error Alerts */}
        {error && (
          <div className="alert alert-error shadow-lg p-3 text-xs flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="leading-tight">{error}</div>
          </div>
        )}

        {notice && (
          <div className="alert alert-success shadow-lg p-3 text-xs flex items-start gap-2.5">
            <Check className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="leading-tight">{notice}</div>
          </div>
        )}

        {/* Unified Navigation Tabs with DaisyUI */}
        <div className="tabs tabs-boxed bg-[#03081a] border border-cyan-500/40 p-1 grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => {
              playSound("system-click");
              setTab("login");
              setError(null);
            }}
            className={`tab text-xs transition-all ${
              tab === "login"
                ? "tab-active bg-cyan-500 text-black font-black shadow-md"
                : "text-zinc-400 hover:text-cyan-300"
            }`}
          >
            {isBn ? "লগইন" : "Login"}
          </button>

          <button
            type="button"
            onClick={() => {
              playSound("system-click");
              setTab("register");
              setError(null);
            }}
            className={`tab text-xs transition-all ${
              tab === "register"
                ? "tab-active bg-cyan-500 text-black font-black shadow-md"
                : "text-zinc-400 hover:text-cyan-300"
            }`}
          >
            {isBn ? "রেজিস্টার" : "Sign Up"}
          </button>

          <button
            type="button"
            onClick={() => {
              playSound("system-click");
              setTab("local");
              setError(null);
            }}
            className={`tab text-xs transition-all ${
              tab === "local"
                ? "tab-active bg-cyan-500 text-black font-black shadow-md"
                : "text-zinc-400 hover:text-cyan-300"
            }`}
          >
            {isBn ? "গেস্ট/লোকাল" : "Guest / PIN"}
          </button>
        </div>

        {/* TAB 1: Better Auth Email & Password Login */}
        {tab === "login" && (
          <form onSubmit={handleEmailLogin} className="space-y-3.5 system-btn-chamfer border border-cyan-500/40 bg-[#030920]/90 p-4">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
              <span className="text-xs font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-cyan-400" />
                {isBn ? "বেটার অথ হান্টার লগইন" : "BETTER AUTH HUNTER LOGIN"}
              </span>
              <span className="text-[10px] text-cyan-400/70 font-mono">
                {isBn ? "পাসওয়ার্ড দিয়ে প্রবেশ" : "Email & Password"}
              </span>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-cyan-300/80 uppercase">
                {isBn ? "হান্টার ইমেইল (EMAIL)" : "Hunter Email"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-cyan-500/70 z-10" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="hunter@arise.fit"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered input-primary w-full min-h-[44px] bg-[#020512] pl-10 pr-3 text-sm text-cyan-100 placeholder-cyan-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-cyan-300/80 uppercase">
                {isBn ? "গোপন পাসওয়ার্ড (PASSWORD)" : "Master Password"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-cyan-500/70 z-10" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-bordered input-primary w-full min-h-[44px] bg-[#020512] pl-10 pr-10 text-sm text-cyan-100 placeholder-cyan-800 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-cyan-500 hover:text-cyan-200 z-10"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full min-h-[46px] text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>{isBn ? "◆ সিস্টেমে লগইন করুন ◆" : "◆ ENGAGE SYSTEM LOGIN ◆"}</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: Better Auth Hunter Registration */}
        {tab === "register" && (
          <form onSubmit={handleEmailSignUp} className="space-y-3.5 system-btn-chamfer border border-cyan-500/40 bg-[#030920]/90 p-4">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
              <span className="text-xs font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                {isBn ? "নতুন হান্টার একাউন্ট নিবন্ধন" : "REGISTER AS A NEW HUNTER"}
              </span>
              <span className="text-[10px] text-purple-300 font-mono">
                {isBn ? "বেটার অথ ক্লাউড" : "Better Auth Cloud"}
              </span>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-cyan-300/80 uppercase">
                {isBn ? "হান্টার কল-সাইন / নাম" : "Hunter Call-Sign / Name"}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-cyan-500/70 z-10" />
                <input
                  type="text"
                  placeholder={isBn ? "যেমন: সুং জিন-উ / শ্যাডো হান্টার" : "e.g. Sung Jin-woo / Shadow Monarch"}
                  value={hunterName}
                  onChange={(e) => setHunterName(e.target.value)}
                  className="input input-bordered input-primary w-full min-h-[44px] bg-[#020512] pl-10 pr-3 text-sm text-cyan-100 placeholder-cyan-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-cyan-300/80 uppercase">
                {isBn ? "ইমেইল অ্যাড্রেস" : "Email Address"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-cyan-500/70 z-10" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="hunter@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered input-primary w-full min-h-[44px] bg-[#020512] pl-10 pr-3 text-sm text-cyan-100 placeholder-cyan-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-cyan-300/80 uppercase">
                {isBn ? "পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)" : "Master Password (Min 6 chars)"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-cyan-500/70 z-10" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-bordered input-primary w-full min-h-[44px] bg-[#020512] pl-10 pr-10 text-sm text-cyan-100 placeholder-cyan-800 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-cyan-500 hover:text-cyan-200 z-10"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-secondary w-full min-h-[46px] text-xs font-black uppercase tracking-wider text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-purple-200 animate-pulse" />
                  <span>{isBn ? "◆ হান্টার লাইসেন্স তৈরি করুন (ARISE) ◆" : "◆ REGISTER & AWAKEN PLAYER ◆"}</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 3: Guest & Hardware Profiles */}
        {tab === "local" && (
          <div className="space-y-4">
            {/* Quick Guest Entrance */}
            <div className="system-btn-chamfer border border-cyan-500/35 bg-[#030920]/90 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-cyan-400" />
                  {isBn ? "গেস্ট মোড (অফলাইন)" : "GUEST MODE (OFFLINE)"}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {isBn ? "কোনো অ্যাকাউন্ট ছাড়া" : "No Login Required"}
                </span>
              </div>
              <p className="text-[11px] text-cyan-300/70">
                {isBn
                  ? "লগইন ছাড়াই সব ফিচার ব্যবহার করুন। আপনার ব্রাউজারের মেমরিতে ডাটা সংরক্ষিত থাকবে।"
                  : "Train instantly without signing up. All telemetry remains securely encrypted in local device storage."}
              </p>
              <button
                type="button"
                onClick={() => {
                  playSound("system-click");
                  onSelectAccount(null);
                  onClose();
                }}
                className="w-full min-h-[42px] system-btn-chamfer border border-cyan-500/40 bg-[#020512] text-xs font-bold text-cyan-300 hover:border-cyan-400 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <span>{isBn ? "গেস্ট হিসেবে প্রবেশ করুন" : "CONTINUE AS OFFLINE GUEST"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Saved Local Device Accounts */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-cyan-400 uppercase">
                {isBn ? "এই ডিভাইসে সংরক্ষিত প্রোফাইল" : "HARDWARE SAVED ACCOUNTS"}
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {accounts.map((acc) => {
                  const isSelected = activeAccount?.id === acc.id;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => {
                        playSound("system-click");
                        onSelectAccount(acc);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between system-btn-chamfer border p-2.5 text-left transition-all ${
                        isSelected
                          ? "border-cyan-400 bg-cyan-500/20 text-white shadow-[0_0_12px_rgba(6,182,212,0.35)]"
                          : "border-cyan-500/20 bg-[#03081a]/80 text-cyan-300 hover:border-cyan-500/40"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-cyan-400 font-mono text-xs">◆</span>
                        <div>
                          <div className="font-bold text-xs text-white uppercase">{acc.name}</div>
                          <div className="text-[10px] text-cyan-500/80">
                            {acc.emailOrHandle || (isBn ? "লোকাল প্রোফাইল" : "Local Profile")}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Create New Local Profile Form */}
            <form onSubmit={handleCreateLocal} className="space-y-2.5 system-btn-chamfer border border-cyan-500/30 bg-[#020617] p-3">
              <div className="text-xs font-bold text-cyan-300 uppercase">
                {isBn ? "নতুন লোকাল প্রোফাইল যোগ করুন" : "Add Hardware Profile"}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder={isBn ? "নাম" : "Call-Sign"}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="min-h-[40px] system-btn-chamfer border border-cyan-500/30 bg-[#020512] px-3 text-xs text-cyan-100 placeholder-cyan-800 focus:outline-none focus:border-cyan-400"
                />
                <input
                  type="password"
                  maxLength={6}
                  placeholder={isBn ? "পিন (ঐচ্ছিক)" : "PIN (Optional)"}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="min-h-[40px] system-btn-chamfer border border-cyan-500/30 bg-[#020512] px-3 text-xs text-cyan-100 placeholder-cyan-800 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <button
                type="submit"
                className="w-full min-h-[38px] system-btn-chamfer bg-cyan-950/80 border border-cyan-500/40 text-xs font-bold text-cyan-300 hover:text-white"
              >
                {isBn ? "+ প্রোফাইল তৈরি করুন" : "+ Save Hardware Profile"}
              </button>
            </form>
            {/* Direct Sync Option */}
            <div className="pt-2 border-t border-cyan-500/20">
              <button
                type="button"
                onClick={handleForceSync}
                disabled={syncing}
                className="w-full min-h-[40px] system-btn-chamfer bg-gradient-to-r from-cyan-900/60 to-blue-900/60 border border-cyan-500/40 text-xs font-bold text-cyan-200 hover:text-white flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin text-cyan-400" : ""}`} />
                <span>{isBn ? "ক্লাউডে সব ডাটা সিঙ্ক করুন" : "Sync All Progress to Cloud"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Close CTA */}
        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[42px] system-btn-chamfer border border-cyan-500/30 bg-[#020512] text-xs font-bold text-cyan-300 hover:border-cyan-400 hover:text-white transition-all"
        >
          {t.closeBtn}
        </button>
      </div>
    </Sheet>
  );
}
