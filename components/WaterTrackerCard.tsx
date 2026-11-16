"use client";

import { useState, useEffect } from "react";
import { Droplet, Plus, Minus, RotateCcw, Sparkles } from "lucide-react";
import { playSound } from "@/lib/audio";
import type { Language } from "@/lib/i18n";

interface Props {
  lang?: Language;
}

export function WaterTrackerCard({ lang = "bn" }: Props) {
  const isBn = lang === "bn";
  const todayKey = `arise.v1.water_${new Date().toISOString().split("T")[0]}`;
  const targetMl = 3000; // 3 Liters recommended for resistance athletes

  const [waterMl, setWaterMl] = useState<number>(() => {
    if (typeof localStorage === "undefined") return 0;
    try {
      const stored = localStorage.getItem(todayKey);
      return stored ? Number(stored) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(todayKey, String(waterMl));
    } catch {
      // ignore
    }
  }, [waterMl, todayKey]);

  const addWater = (delta: number) => {
    playSound("click");
    setWaterMl((prev) => Math.max(0, Math.min(6000, prev + delta)));
  };

  const progressPercent = Math.min(100, Math.round((waterMl / targetMl) * 100));
  const glassesCount = Math.round((waterMl / 250) * 10) / 10;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#111726] p-5 shadow-lg font-sans">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
            <Droplet className="h-4 w-4 fill-current" />
          </span>
          <div>
            <h3 className="text-base font-bold text-white">
              {isBn ? "দৈনিক হাইড্রেশন ও পানি ট্র্যাকার" : "Daily Hydration Tracker"}
            </h3>
            <p className="text-xs text-zinc-400">
              {isBn
                ? "মাসল রিকভারি এবং শক্তি বৃদ্ধির জন্য পর্যাপ্ত পানি পান করুন"
                : "Target 3.0L for athletic performance & muscle recovery"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            playSound("click");
            setWaterMl(0);
          }}
          className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          title={isBn ? "রিসেট করুন" : "Reset today's water"}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Main Hydration Progress Gauge */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        {/* Metric numbers */}
        <div className="sm:col-span-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
              {(waterMl / 1000).toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-zinc-400">
              / {(targetMl / 1000).toFixed(1)} L ({glassesCount} {isBn ? "গ্লাস" : "glasses"})
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-zinc-800 h-2.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-teal-400 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-sky-400">{progressPercent}% {isBn ? "সম্পন্ন" : "achieved"}</span>
            <span>{Math.max(0, targetMl - waterMl)} ml {isBn ? "বাকি" : "remaining"}</span>
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div className="flex sm:flex-col gap-2">
          <button
            type="button"
            onClick={() => addWater(250)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold text-xs shadow-md shadow-sky-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>+250 ml ({isBn ? "১ গ্লাস" : "1 Glass"})</span>
          </button>

          <div className="flex gap-1.5 flex-1">
            <button
              type="button"
              onClick={() => addWater(500)}
              className="flex-1 py-2 px-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 hover:text-white font-bold text-xs active:scale-95 transition-all"
            >
              +500 ml
            </button>
            <button
              type="button"
              onClick={() => addWater(-250)}
              disabled={waterMl <= 0}
              className="py-2 px-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 text-xs active:scale-95 transition-all"
              title="Minus 250ml"
            >
              <Minus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

