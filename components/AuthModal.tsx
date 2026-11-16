"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  LogOut,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Sheet } from "./Sheet";
import { type Language, TRANSLATIONS } from "@/lib/i18n";
import type { UserAccount } from "@/lib/types";
import { authClient } from "@/lib/auth-client";
import {
  syncProfileToMongo,
  syncAthleteStatsToMongo,
} from "@/lib/mongodb-sync";
import { playSound, vibrate, unlockAudio } from "@/lib/audio";
import { loadAthleteStats } from "@/lib/athleteStats";
import { KEYS } from "@/lib/storage";
import { migrateGuestDataToCloud } from "@/lib/guest-migration";

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

export function AuthModal({
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
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Local account creation state
  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState("");

  const isCloudLoggedIn = Boolean(activeAccount?.cloudUser || activeAccount?.emailOrHandle);

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
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
    playSound("click");

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
          setError(res.error.message || (isBn ? "লগইন ব্যর্থ হয়েছে।" : "Login failed."));
        }
        playSound("warning");
        vibrate([50, 100]);
        return;
      }

      if (res.data?.user) {
        playSound("click");
        vibrate(30);
        const user = res.data.user;
        const displayName = user.name || email.split("@")[0] || "User";

        const cloudAcc: UserAccount = {
          id: user.id,
          name: displayName,
          emailOrHandle: user.email,
          createdAt: Date.now(),
          lastActive: Date.now(),
          profile: activeAccount?.profile,
          cloudUser: true,
        };

        onSelectAccount(cloudAcc);
        setNotice(
          isBn
            ? `স্বাগতম ${displayName}! সফলভাবে ক্লাউডে লগইন হয়েছে।`
            : `Welcome back, ${displayName}! Signed in to cloud account.`
        );

        setTimeout(() => {
          onClose();
          clearForm();
        }, 1200);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      playSound("warning");
    } finally {
      setLoading(false);
    }
  };

  // 2. Better Auth: Email & Password Sign Up
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!email.trim() || !password) {
      setError(
        isBn
          ? "অনুগ্রহ করে ইমেইল ও পাসওয়ার্ড প্রদান করুন।"
          : "Please enter your email and password."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        isBn
          ? "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।"
          : "Password must be at least 6 characters long."
      );
      return;
    }

    setLoading(true);
    unlockAudio();
    playSound("click");

    try {
      const displayName = fullName.trim() || email.split("@")[0] || "Athlete";
      const res = await authClient.signUp.email({
        email: email.trim(),
        password,
        name: displayName,
      });

      if (res.error) {
        setError(res.error.message || (isBn ? "নিবন্ধন ব্যর্থ হয়েছে।" : "Registration failed."));
        playSound("warning");
        vibrate([50, 100]);
        return;
      }

      if (res.data?.user) {
        playSound("click");
        vibrate([40, 80]);
        const user = res.data.user;

        const cloudAcc: UserAccount = {
          id: user.id,
          name: displayName,
          emailOrHandle: user.email,
          createdAt: Date.now(),
          lastActive: Date.now(),
          profile: activeAccount?.profile,
          cloudUser: true,
        };

        onSelectAccount(cloudAcc);

        const localStats = loadAthleteStats();
        void syncAthleteStatsToMongo(
          localStats,
          user.id
        );
        if (activeAccount?.profile) {
          void syncProfileToMongo(activeAccount.profile, user.id);
        }

        try {
          const rawHist = typeof localStorage !== "undefined" ? localStorage.getItem(KEYS.history) : null;
          const localHist = rawHist ? JSON.parse(rawHist) : [];
          if (localHist.length > 0) {
            void migrateGuestDataToCloud(user.id, {
              profile: activeAccount?.profile,
              history: localHist,
              athleteStats: localStats,
            });
          }
        } catch {
          // ignore
        }

        setNotice(
          isBn
            ? `অভিনন্দন ${displayName}! আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।`
            : `Welcome ${displayName}! Your account has been created.`
        );

        setTimeout(() => {
          onClose();
          clearForm();
        }, 1200);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      playSound("warning");
    } finally {
      setLoading(false);
    }
  };

  // 3. Sign Out
  const handleSignOut = async () => {
    playSound("click");
    vibrate(25);
    setLoading(true);
    try {
      await authClient.signOut();
      onSelectAccount(null);
      setNotice(
        isBn
          ? "সফলভাবে সাইন আউট হয়েছেন। আপনি এখন লোকাল গেস্ট মোডে আছেন।"
          : "Signed out. Switched to offline guest mode."
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // 4. Force Cloud Sync
  const handleForceSync = async () => {
    playSound("click");
    vibrate(20);
    setSyncing(true);
    setError(null);
    try {
      if (onSyncCloud) {
        onSyncCloud();
      }
      setNotice(
        isBn
          ? "সব ওয়ার্কআউট ও ডাটা সফলভাবে ক্লাউডে সিঙ্ক হয়েছে!"
          : "All workout logs and goals synced to the cloud!"
      );
      setTimeout(() => setNotice(null), 3000);
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
    playSound("click");
    onCreateAccount(newName.trim(), newPin.trim() || undefined);
    setNewName("");
    setNewPin("");
    setTab("local");
  };

  return (
    <Sheet
      open={open}
      title={isBn ? "অ্যাকাউন্ট ও ক্লাউড সিঙ্ক" : "Account & Cloud Sync"}
      onClose={onClose}
      dismissable
    >
      <div className="space-y-4 text-zinc-100">
        {/* Language Selection Row */}
        {onLanguageChange && (
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs text-zinc-400">
              {isBn ? "ভাষা নির্বাচন" : "Language"}
            </span>
            <div
              className="inline-flex items-center rounded-lg border border-zinc-800 bg-zinc-900 p-0.5"
              role="group"
              aria-label="Language selection"
            >
              <button
                type="button"
                onClick={() => {
                  playSound("click");
                  onLanguageChange("bn");
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  isBn
                    ? "bg-emerald-500 text-black font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
                aria-pressed={isBn}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => {
                  playSound("click");
                  onLanguageChange("en");
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  !isBn
                    ? "bg-emerald-500 text-black font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
                aria-pressed={!isBn}
              >
                EN
              </button>
            </div>
          </div>
        )}

        {/* Active Account Status Bar */}
        <div className="rounded-xl glass-surface border border-white/10 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-base">
                {(activeAccount?.name || "G").charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-medium">
                  {isCloudLoggedIn ? (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {isBn ? "ক্লাউড কানেক্টেড" : "Cloud Connected"}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      {isBn ? "লোকাল গেস্ট মোড" : "Offline Guest Mode"}
                    </span>
                  )}
                </div>
                <div className="text-base font-bold text-white tracking-tight">
                  {activeAccount ? activeAccount.name : isBn ? "গেস্ট ইউজার" : "Guest User"}
                </div>
                {activeAccount?.emailOrHandle && (
                  <div className="text-xs text-zinc-400 truncate max-w-[220px] sm:max-w-[300px]">
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
                    title={isBn ? "ডাটা সিঙ্ক করুন" : "Sync data to cloud"}
                    className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:text-white transition-all"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin text-emerald-400" : ""}`} />
                    <span className="hidden sm:inline">{isBn ? "সিঙ্ক" : "Sync"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={loading}
                    className="flex items-center gap-1 rounded-lg border border-red-900/60 bg-red-950/20 px-2.5 py-1.5 text-xs font-medium text-red-300 hover:bg-red-950/40 transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>{isBn ? "সাইন আউট" : "Sign Out"}</span>
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Notices & Error Alerts */}
        {error && (
          <div className="rounded-xl border border-red-900/60 bg-red-950/30 p-3 text-xs text-red-200 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <div className="leading-tight">{error}</div>
          </div>
        )}

        {notice && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-xs text-emerald-200 flex items-start gap-2.5">
            <Check className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            <div className="leading-tight">{notice}</div>
          </div>
        )}

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-zinc-900 p-1 border border-zinc-800">
          <button
            type="button"
            onClick={() => {
              playSound("click");
              setTab("login");
              setError(null);
            }}
            className={`rounded-lg py-2 text-xs font-semibold transition-all ${
              tab === "login"
                ? "bg-zinc-800 text-white shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {isBn ? "লগইন" : "Sign In"}
          </button>

          <button
            type="button"
            onClick={() => {
              playSound("click");
              setTab("register");
              setError(null);
            }}
            className={`rounded-lg py-2 text-xs font-semibold transition-all ${
              tab === "register"
                ? "bg-zinc-800 text-white shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {isBn ? "সাইন আপ" : "Sign Up"}
          </button>

          <button
            type="button"
            onClick={() => {
              playSound("click");
              setTab("local");
              setError(null);
            }}
            className={`rounded-lg py-2 text-xs font-semibold transition-all ${
              tab === "local"
                ? "bg-zinc-800 text-white shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {isBn ? "গেস্ট / প্রোফাইল" : "Guest / Local"}
          </button>
        </div>

        {/* TAB 1: Email & Password Login */}
        {tab === "login" && (
          <form onSubmit={handleEmailLogin} className="space-y-3.5 rounded-xl glass-surface border border-white/10 p-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-300">
                {isBn ? "ইমেইল অ্যাড্রেস" : "Email Address"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800/80 pl-9 pr-3 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-300">
                {isBn ? "পাসওয়ার্ড" : "Password"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800/80 pl-9 pr-10 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-xs font-bold text-black shadow hover:brightness-105 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>{isBn ? "লগইন করুন" : "Sign In"}</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: Email Registration */}
        {tab === "register" && (
          <form onSubmit={handleEmailSignUp} className="space-y-3.5 rounded-xl glass-surface border border-white/10 p-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-300">
                {isBn ? "আপনার পুরো নাম" : "Full Name"}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder={isBn ? "যেমন: রাফি আহমেদ" : "e.g. Alex Johnson"}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800/80 pl-9 pr-3 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-300">
                {isBn ? "ইমেইল অ্যাড্রেস" : "Email Address"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800/80 pl-9 pr-3 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-300">
                {isBn ? "পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)" : "Password (min 6 characters)"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800/80 pl-9 pr-10 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-xs font-bold text-black shadow hover:brightness-105 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <span>{isBn ? "অ্যাকাউন্ট তৈরি করুন" : "Create Account"}</span>
              )}
            </button>
          </form>
        )}

        {/* TAB 3: Guest & Local Profiles */}
        {tab === "local" && (
          <div className="space-y-4">
            <div className="rounded-xl glass-surface border border-white/10 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-emerald-400" />
                  {isBn ? "গেস্ট মোড (অফলাইন)" : "Guest Mode (Offline)"}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {isBn ? "লগইন ছাড়াই" : "No Login Required"}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {isBn
                  ? "লগইন ছাড়াই সব ফিচার ব্যবহার করুন। আপনার ব্রাউজারের মেমরিতে ডাটা নিরাপদে সংরক্ষিত থাকবে।"
                  : "Use all features without an account. Your data is stored privately in your browser."}
              </p>
              <button
                type="button"
                onClick={() => {
                  playSound("click");
                  onSelectAccount(null);
                  onClose();
                }}
                className="w-full h-10 rounded-lg border border-zinc-700 bg-zinc-800 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>{isBn ? "গেস্ট হিসেবে চালিয়ে যান" : "Continue as Guest"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Saved Local Device Accounts */}
            {accounts.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-zinc-300">
                  {isBn ? "সংরক্ষিত প্রোফাইলসমূহ" : "Saved Local Profiles"}
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {accounts.map((acc) => {
                    const isSelected = activeAccount?.id === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          playSound("click");
                          onSelectAccount(acc);
                          onClose();
                        }}
                        className={`w-full flex items-center justify-between rounded-lg border p-2.5 text-left transition-all ${
                          isSelected
                            ? "border-emerald-500/50 bg-emerald-950/20 text-white"
                            : "border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-white">{acc.name}</span>
                          <span className="text-[10px] text-zinc-500">
                            {acc.emailOrHandle || (isBn ? "লোকাল" : "Local")}
                          </span>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Create New Local Profile Form */}
            <form onSubmit={handleCreateLocal} className="space-y-2.5 rounded-xl glass-surface border border-white/10 p-3">
              <div className="text-xs font-semibold text-zinc-300">
                {isBn ? "নতুন লোকাল প্রোফাইল যোগ করুন" : "Add Local Profile"}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder={isBn ? "নাম" : "Profile Name"}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-9 rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="password"
                  maxLength={6}
                  placeholder={isBn ? "পিন (ঐচ্ছিক)" : "PIN (Optional)"}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="h-9 rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="w-full h-8 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white"
              >
                {isBn ? "+ প্রোফাইল তৈরি করুন" : "+ Save Profile"}
              </button>
            </form>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full h-10 rounded-xl border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-400 hover:text-white transition-all"
        >
          {t.closeBtn}
        </button>
      </div>
    </Sheet>
  );
}
