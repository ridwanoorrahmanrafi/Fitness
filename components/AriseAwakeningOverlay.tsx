"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { Zap, Sparkles, X, Shield, ArrowUp } from "lucide-react";
import { playSound, vibrate } from "@/lib/audio";
import type { Language } from "@/lib/i18n";

interface AriseAwakeningOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
  title?: string;
  subtitle?: string;
  level?: number;
}

export default function AriseAwakeningOverlay({
  isOpen,
  onClose,
  lang = "bn",
  title,
  subtitle,
  level = 1,
}: AriseAwakeningOverlayProps) {
  const isBn = lang === "bn";

  const defaultTitle = isBn ? "ARISE : জাগ্রত হও" : "ARISE : AWAKEN";
  const defaultSubtitle = isBn
    ? "শ্যাডো মনার্কের আগমন ঘটেছে · নতুন ক্ষমতা সক্রিয়"
    : "THE SHADOW MONARCH AWAKENS · NEW POWER UNLOCKED";

  useEffect(() => {
    if (isOpen) {
      playSound("arise");
      vibrate([100, 50, 150, 50, 200]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
      {/* Background Anime Banner with Shadow Gradient */}
      <div className="absolute inset-0 overflow-hidden opacity-35 pointer-events-none">
        <Image
          src="/images/solo-leveling/system-monarch-banner.jpg"
          alt="System Monarch Background"
          fill
          className="object-cover scale-105 filter blur-[2px]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-purple-950/40" />
      </div>

      {/* Main Holographic Container */}
      <div className="relative w-full max-w-lg max-h-[94vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-[#030611]/90 border-2 border-cyan-400 shadow-[0_0_60px_rgba(6,182,212,0.45)] p-5 sm:p-8 text-center text-white">
        {/* Animated Shadow Rune Aura */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-gradient-to-b from-cyan-500/20 via-purple-600/30 to-transparent blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute top-4 right-4 text-cyan-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Crest Emblem */}
        <div className="relative mx-auto h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.6)] mb-4 animate-float">
          <Image
            src="/images/solo-leveling/system-crest-icon.jpg"
            alt="Arise System Crest"
            fill
            className="object-cover"
          />
        </div>

        {/* Dual Language Title */}
        <div className="text-cyan-400 font-mono text-sm tracking-widest font-black uppercase mb-1">
          {isBn ? "[ SYSTEM AWAKENING : সিস্টেম জাগরণ ]" : "[ SYSTEM AWAKENING : ASCENSION ]"}
        </div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-purple-300 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]">
          {title || defaultTitle}
        </h2>
        <p className="text-xs sm:text-sm font-mono text-purple-300/90 mt-1">
          {subtitle || defaultSubtitle}
        </p>

        {/* Level & Status Pill */}
        <div className="my-5 p-4 rounded-2xl bg-black/70 border border-cyan-500/30 space-y-2 font-mono text-xs text-left">
          <div className="flex items-center justify-between text-cyan-300">
            <span className="flex items-center gap-1.5 font-bold">
              <Zap className="h-4 w-4 text-cyan-400" /> {isBn ? "প্লেয়ার লেভেল" : "PLAYER LEVEL"}
            </span>
            <span className="text-lg font-black text-white">Lv. {level}</span>
          </div>

          <div className="h-px w-full bg-cyan-500/20" />

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/20">
              <span className="text-zinc-400 block">{isBn ? "ক্লান্তি (FATIGUE)" : "FATIGUE"}</span>
              <span className="text-emerald-400 font-bold">{isBn ? "০% (সম্পূর্ণ মুক্ত)" : "0% (PURGED)"}</span>
            </div>
            <div className="p-2 rounded-lg bg-purple-950/40 border border-purple-500/20">
              <span className="text-zinc-400 block">{isBn ? "শক্তি পুনরুদ্ধার" : "STAT RECOVERY"}</span>
              <span className="text-purple-300 font-bold">HP & MP 100%</span>
            </div>
          </div>

          <div className="text-center pt-2 text-cyan-200/90 text-xs">
            {isBn ? (
              <>✨ <span className="font-bold">+৩ টি স্ট্যাট পয়েন্ট</span> আপনার স্ট্যাটাস উইন্ডোতে যোগ করা হয়েছে!</>
            ) : (
              <>✨ <span className="font-bold">+3 Unallocated Stat Points</span> awarded to your status window!</>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => {
            playSound("system-click");
            onClose();
          }}
          className="btn btn-primary w-full py-3.5 px-6 font-black text-sm uppercase tracking-widest text-black shadow-[0_0_25px_rgba(6,182,212,0.8)]"
        >
          {isBn ? "সিস্টেম সিঙ্ক্রোনাইজেশন নিশ্চিত করুন" : "CONFIRM SYSTEM SYNCHRONIZATION"}
        </button>
      </div>
    </div>
  );
}
