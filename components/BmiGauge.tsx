"use client";

import { bmiScalePercent } from "@/lib/calc";

interface Props {
  bmi: number;
  category: string;
  compact?: boolean;
}

export function BmiGauge({ bmi, category, compact = false }: Props) {
  const percent = bmiScalePercent(bmi);

  const categoryBadgeClass =
    bmi < 18.5
      ? "badge-info badge-outline"
      : bmi < 25
      ? "badge-success"
      : bmi < 30
      ? "badge-warning"
      : "badge-error";

  return (
    <div className={`w-full ${compact ? "space-y-1.5" : "space-y-2.5"}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-zinc-300">
          BMI <strong className="font-mono text-white text-sm ml-1">{bmi || "-"}</strong>
        </span>
        <span className={`badge badge-sm font-bold ${categoryBadgeClass}`}>
          {category || "Unknown"}
        </span>
      </div>

      {/* Segmented Gradient Bar */}
      <div className="space-y-1">
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-zinc-800 flex">
          {/* Underweight: 15 to 18.5 = 17.5% */}
          <div className="h-full w-[17.5%] bg-cyan-500/80" title="Underweight (< 18.5)" />
          {/* Normal: 18.5 to 25 = 32.5% */}
          <div className="h-full w-[32.5%] bg-emerald-500/80" title="Normal (18.5 - 24.9)" />
          {/* Overweight: 25 to 30 = 25% */}
          <div className="h-full w-[25%] bg-amber-500/80" title="Overweight (25.0 - 29.9)" />
          {/* Obese: 30 to 35+ = 25% */}
          <div className="h-full w-[25%] bg-rose-500/80" title="Obese (≥ 30.0)" />
        </div>

        {/* Dynamic Needle Indicator */}
        <div className="relative h-3 w-full">
          <div
            className="absolute -top-1 -ml-1.5 flex flex-col items-center transition-[left] duration-500 ease-out"
            style={{ left: `${percent}%` }}
          >
            <div className="h-3 w-3 rounded-full border-2 border-white bg-emerald-400 shadow-md ring-2 ring-zinc-950 animate-pulse" />
          </div>
        </div>

        {/* Scale Numbers */}
        {!compact && (
          <div className="flex justify-between px-0.5 text-[10px] font-mono text-zinc-500">
            <span>15</span>
            <span>18.5</span>
            <span>25</span>
            <span>30</span>
            <span>35+</span>
          </div>
        )}
      </div>
    </div>
  );
}
