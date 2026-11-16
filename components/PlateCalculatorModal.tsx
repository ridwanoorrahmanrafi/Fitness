"use client";

import { useState, useMemo } from "react";
import { X, Dumbbell, RotateCcw, Check } from "lucide-react";
import { playSound } from "@/lib/audio";
import type { Language } from "@/lib/i18n";
import { Sheet } from "./Sheet";

interface Props {
  open: boolean;
  initialWeightKg?: number;
  lang?: Language;
  onApplyWeight?: (weightKg: number) => void;
  onClose: () => void;
}

interface Plate {
  weight: number;
  color: string;
  textColor: string;
  height: string;
}

const AVAILABLE_PLATES: Plate[] = [
  { weight: 25, color: "bg-red-600 border-red-500", textColor: "text-white", height: "h-24" },
  { weight: 20, color: "bg-blue-600 border-blue-500", textColor: "text-white", height: "h-22" },
  { weight: 15, color: "bg-amber-500 border-amber-400", textColor: "text-slate-950", height: "h-20" },
  { weight: 10, color: "bg-emerald-600 border-emerald-500", textColor: "text-white", height: "h-18" },
  { weight: 5, color: "bg-zinc-200 border-white", textColor: "text-slate-950", height: "h-14" },
  { weight: 2.5, color: "bg-zinc-700 border-zinc-600", textColor: "text-white", height: "h-11" },
  { weight: 1.25, color: "bg-zinc-500 border-zinc-400", textColor: "text-white", height: "h-9" },
];

export function PlateCalculatorModal({
  open,
  initialWeightKg = 60,
  lang = "bn",
  onApplyWeight,
  onClose,
}: Props) {
  const isBn = lang === "bn";
  const [targetWeight, setTargetWeight] = useState<number>(initialWeightKg);
  const [barWeight, setBarWeight] = useState<20 | 15>(20);

  // Compute plates needed per side
  const calculation = useMemo(() => {
    const weightPerSide = Math.max(0, (targetWeight - barWeight) / 2);
    let remaining = weightPerSide;
    const platesPerSide: Plate[] = [];

    for (const p of AVAILABLE_PLATES) {
      while (remaining >= p.weight - 0.001) {
        platesPerSide.push(p);
        remaining -= p.weight;
      }
    }

    const actualTotal = barWeight + platesPerSide.reduce((sum, p) => sum + p.weight, 0) * 2;
    return {
      platesPerSide,
      weightPerSide: Math.round(weightPerSide * 100) / 100,
      actualTotal: Math.round(actualTotal * 100) / 100,
      remainder: Math.round(remaining * 100) / 100,
    };
  }, [targetWeight, barWeight]);

  if (!open) return null;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isBn ? "বারবেল প্লেট ক্যালকুলেটর" : "Barbell Plate Calculator"}
    >
      <div className="space-y-6 text-zinc-100 font-sans">
        {/* Target Weight & Barbell Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
            <label className="text-xs font-semibold text-zinc-400 block mb-2 uppercase tracking-wider">
              {isBn ? "টার্গেট ওজন (কেজি)" : "Target Total Weight (kg)"}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="2.5"
                min={barWeight}
                max={500}
                value={targetWeight || ""}
                onChange={(e) => setTargetWeight(Math.max(0, Number(e.target.value)))}
                className="w-full text-2xl font-bold bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-sm font-semibold text-zinc-400">kg</span>
            </div>
            {/* Quick adjust buttons */}
            <div className="flex items-center gap-1.5 mt-3">
              {[-5, -2.5, +2.5, +5].map((delta) => (
                <button
                  key={delta}
                  type="button"
                  onClick={() => {
                    playSound("click");
                    setTargetWeight((w) => Math.max(barWeight, w + delta));
                  }}
                  className="flex-1 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-semibold hover:bg-zinc-700 transition-colors"
                >
                  {delta > 0 ? `+${delta}` : delta}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
            <label className="text-xs font-semibold text-zinc-400 block mb-2 uppercase tracking-wider">
              {isBn ? "বারবেল ওজন" : "Barbell Weight"}
            </label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  playSound("click");
                  setBarWeight(20);
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  barWeight === 20
                    ? "bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md"
                    : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white"
                }`}
              >
                20 kg (Standard)
              </button>
              <button
                type="button"
                onClick={() => {
                  playSound("click");
                  setBarWeight(15);
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  barWeight === 15
                    ? "bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md"
                    : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white"
                }`}
              >
                15 kg (Olympic)
              </button>
            </div>
            <p className="mt-3 text-[11px] text-zinc-400 leading-relaxed">
              {isBn
                ? `প্রতি পাশে প্লেট লাগবে: ${calculation.weightPerSide} কেজি`
                : `Weight per sleeve: ${calculation.weightPerSide} kg`}
            </p>
          </div>
        </div>

        {/* Visual Barbell Display */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 overflow-x-auto">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4 flex items-center justify-between">
            <span>{isBn ? "প্রতি পাশের প্লেট লোডিং (স্লিভ)" : "Plates per Side (One Sleeve)"}</span>
            <span className="text-emerald-400 font-mono">
              {calculation.platesPerSide.length} {isBn ? "টি প্লেট" : "plates"}
            </span>
          </div>

          {/* Graphical sleeve */}
          <div className="relative min-w-[320px] h-32 flex items-center justify-start bg-zinc-900/60 rounded-xl px-4 border border-zinc-800/80">
            {/* Barbell collar / shaft */}
            <div className="h-10 w-16 bg-gradient-to-r from-zinc-600 to-zinc-400 rounded-l border border-zinc-500 shrink-0 shadow flex items-center justify-center">
              <span className="text-[10px] font-bold text-zinc-950 font-mono">{barWeight}kg Bar</span>
            </div>
            {/* Barbell collar ring */}
            <div className="h-16 w-3 bg-zinc-400 border border-zinc-300 rounded-sm shrink-0 shadow-md" />

            {/* Loaded Plates */}
            <div className="flex items-center gap-1 pl-1">
              {calculation.platesPerSide.length === 0 ? (
                <div className="ml-4 text-xs font-medium text-zinc-500 italic">
                  {isBn ? "কোনো প্লেট প্রয়োজন নেই (শুধু বারবেল)" : "Empty bar (no plates needed)"}
                </div>
              ) : (
                calculation.platesPerSide.map((p, idx) => (
                  <div
                    key={idx}
                    className={`${p.height} w-7 sm:w-8 ${p.color} ${p.textColor} rounded-md border flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform shrink-0`}
                    title={`${p.weight}kg plate`}
                  >
                    <span className="text-[11px] font-extrabold font-mono -rotate-90 select-none">
                      {p.weight}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Sleeve end cap */}
            <div className="h-6 w-12 bg-zinc-500 rounded-r border border-zinc-400 ml-auto opacity-40 shrink-0" />
          </div>

          {/* Plates Count Breakdown */}
          {calculation.platesPerSide.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium">
                {isBn ? "প্রয়োজনীয় প্লেট (প্রতি পাশে):" : "Summary per side:"}
              </span>
              {Array.from(new Set(calculation.platesPerSide.map((p) => p.weight))).map((w) => {
                const count = calculation.platesPerSide.filter((p) => p.weight === w).length;
                const plateObj = AVAILABLE_PLATES.find((p) => p.weight === w)!;
                return (
                  <span
                    key={w}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold ${plateObj.color} ${plateObj.textColor}`}
                  >
                    {count} × {w}kg
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Button */}
        {onApplyWeight && (
          <button
            type="button"
            onClick={() => {
              playSound("set");
              onApplyWeight(targetWeight);
              onClose();
            }}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="h-4 w-4 stroke-[2.5]" />
            <span>
              {isBn ? `${targetWeight} কেজি সেটে যুক্ত করুন` : `Apply ${targetWeight} kg to Current Set`}
            </span>
          </button>
        )}
      </div>
    </Sheet>
  );
}

