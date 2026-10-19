"use client";

import { useState, useMemo } from "react";
import {
  X,
  Utensils,
  Flame,
  Droplets,
  Scale,
  Sparkles,
  CheckCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  Apple,
  Info,
} from "lucide-react";
import { generateBangladeshiDiet, type BangladeshiDietPlan } from "@/lib/diet";
import type { Goal } from "@/lib/types";

interface Props {
  open: boolean;
  weightKg: number;
  heightCm: number;
  bmi: number;
  bmiCategory: string;
  tdee: number;
  initialGoal?: Goal | "recomp";
  onClose: () => void;
}

type TabGoal = "loss" | "muscle" | "recomp";

export function DietSheet({
  open,
  weightKg,
  heightCm,
  bmi,
  bmiCategory,
  tdee,
  initialGoal = "recomp",
  onClose,
}: Props) {
  // Map initial goal to tab
  const getInitialTab = (): TabGoal => {
    if (initialGoal === "endurance" || (initialGoal === "recomp" && bmi >= 25)) return "loss";
    if (initialGoal === "muscle" && bmi < 25) return "muscle";
    return "recomp";
  };

  const [activeTab, setActiveTab] = useState<TabGoal>(getInitialTab);
  const [copied, setCopied] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  // Derive diet plan dynamically
  const plan: BangladeshiDietPlan = useMemo(() => {
    const goalParam = activeTab === "loss" ? "endurance" : activeTab === "muscle" ? "muscle" : "recomp";
    return generateBangladeshiDiet(weightKg, tdee, goalParam, bmi);
  }, [activeTab, weightKg, tdee, bmi]);

  if (!open) return null;

  const copyPlanToClipboard = () => {
    const text = `🥗 ARISE Bangladesh Diet Chart - ${plan.bengaliTitle} (${plan.title})
⚖️ Profile: Weight ${weightKg}kg | BMI ${bmi} (${bmiCategory}) | Daily Need: ${plan.targetCalories} kcal
💧 Water: ${plan.waterLiters}L/day | Protein: ${plan.proteinGrams}g | Carbs: ${plan.carbsGrams}g | Fats: ${plan.fatGrams}g

${plan.meals
  .map(
    (m) =>
      `▶️ ${m.title} [${m.time}]:\n` +
      m.items.map((i) => ` • ${i.bengaliName} (${i.portion}) - ${i.calories} kcal [P: ${i.proteinG}g]`).join("\n") +
      (m.tips ? `\n 💡 Tip: ${m.tips}` : "")
  )
  .join("\n\n")}

📋 Guidelines:
${plan.guidelines.map((g, idx) => `${idx + 1}. ${g}`).join("\n")}
`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="diet-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center p-0 sm:p-4"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-t-3xl sm:rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl text-zinc-100 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/90 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-zinc-950 font-bold shadow-md shadow-emerald-500/20">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="diet-modal-title" className="text-base font-bold text-white sm:text-lg">
                  দেশীয় ডায়েট চার্ট
                </h2>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">
                  Bangladeshi Diet
                </span>
              </div>
              <p className="text-xs text-zinc-400">আপনার ওজন ও বিএমআই অনুযায়ী সঠিক খাবারের হিসাব</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close diet chart"
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Goal Selection Tabs */}
        <div className="border-b border-zinc-800/80 bg-zinc-900/40 p-3">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveTab("loss")}
              className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-all ${
                activeTab === "loss"
                  ? "border-emerald-500 bg-emerald-500/15 text-emerald-300 font-semibold shadow-sm"
                  : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <span className="text-xs sm:text-sm">📉 ওজন কমানো</span>
              <span className="text-[10px] opacity-75">Fat Loss</span>
            </button>
            <button
              onClick={() => setActiveTab("muscle")}
              className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-all ${
                activeTab === "muscle"
                  ? "border-emerald-500 bg-emerald-500/15 text-emerald-300 font-semibold shadow-sm"
                  : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <span className="text-xs sm:text-sm">💪 মাসল বৃদ্ধি</span>
              <span className="text-[10px] opacity-75">Muscle Gain</span>
            </button>
            <button
              onClick={() => setActiveTab("recomp")}
              className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-all ${
                activeTab === "recomp"
                  ? "border-emerald-500 bg-emerald-500/15 text-emerald-300 font-semibold shadow-sm"
                  : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <span className="text-xs sm:text-sm">🌟 এস্থেটিক বডি</span>
              <span className="text-[10px] opacity-75">Look Good / Fit</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Plan Summary Banner */}
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-emerald-950/20 p-4 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-base font-bold text-white sm:text-lg">{plan.bengaliTitle}</span>
              <span className="flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-xs text-zinc-300">
                <Scale className="h-3.5 w-3.5 text-emerald-400" />
                <span>{weightKg} kg</span>
                <span className="text-zinc-500">|</span>
                <span className="text-emerald-300">BMI {bmi}</span>
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed mb-4">{plan.description}</p>

            {/* Macro Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-2.5">
                <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400">
                  <Flame className="h-3 w-3 text-amber-400" /> দৈনিক ক্যালোরি
                </div>
                <div className="mt-1 text-lg font-bold font-mono text-white">
                  {plan.targetCalories} <span className="text-[11px] font-normal text-zinc-500">kcal</span>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-2.5">
                <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400">
                  <Sparkles className="h-3 w-3 text-emerald-400" /> মোট প্রোটিন
                </div>
                <div className="mt-1 text-lg font-bold font-mono text-emerald-400">
                  {plan.proteinGrams} <span className="text-[11px] font-normal text-zinc-500">গ্রাম</span>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-2.5">
                <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400">
                  <Apple className="h-3 w-3 text-teal-400" /> কার্বোহাইড্রেট
                </div>
                <div className="mt-1 text-lg font-bold font-mono text-teal-400">
                  {plan.carbsGrams} <span className="text-[11px] font-normal text-zinc-500">গ্রাম</span>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-2.5">
                <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400">
                  <Droplets className="h-3 w-3 text-cyan-400" /> পানি পান
                </div>
                <div className="mt-1 text-lg font-bold font-mono text-cyan-300">
                  {plan.waterLiters} <span className="text-[11px] font-normal text-zinc-500">লিটার</span>
                </div>
              </div>
            </div>
          </div>

          {/* Meals Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Utensils className="h-3.5 w-3.5 text-emerald-400" /> সারাদিনের ৫টি খাবারের চার্ট (Daily Meals)
            </h3>

            {plan.meals.map((meal, mIdx) => {
              const isExpanded = expandedMeal === meal.id || expandedMeal === null;
              const mealCal = meal.items.reduce((s, i) => s + i.calories, 0);
              const mealProtein = meal.items.reduce((s, i) => s + i.proteinG, 0);

              return (
                <div
                  key={meal.id}
                  className="rounded-2xl border border-zinc-800/90 bg-zinc-900/70 overflow-hidden transition-all shadow-sm"
                >
                  <div
                    onClick={() => setExpandedMeal(isExpanded && expandedMeal !== null ? "" : meal.id)}
                    className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-zinc-850 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
                        {mIdx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white">{meal.title}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                          <span>{meal.bengaliTitle}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-medium font-mono">{mealCal} kcal</span>
                          <span>•</span>
                          <span className="text-zinc-300 font-medium font-mono">{mealProtein}g প্রোটিন</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-zinc-500">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-zinc-800/80 bg-zinc-950/60 p-3.5 space-y-2.5">
                      <div className="space-y-1.5">
                        {meal.items.map((item, iIdx) => (
                          <div
                            key={iIdx}
                            className="flex items-center justify-between rounded-xl border border-zinc-800/60 bg-zinc-900/60 px-3 py-2 text-xs"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="font-semibold text-zinc-100 block">{item.bengaliName}</span>
                              <span className="text-[11px] text-zinc-400">{item.portion}</span>
                            </div>
                            <div className="shrink-0 text-right">
                              <span className="font-bold font-mono text-emerald-400 block">{item.calories} kcal</span>
                              <span className="text-[10px] text-zinc-500 font-mono">P: {item.proteinG}g | C: {item.carbsG}g</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {meal.tips && (
                        <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-2.5 text-[11px] text-emerald-200">
                          <Info className="h-3.5 w-3.5 shrink-0 text-emerald-400 mt-0.5" />
                          <span>
                            <strong>টিপস: </strong>
                            {meal.tips}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bangladeshi Nutrition Guidelines */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> বাঙালি খাদ্যাভ্যাসে জরুরি নিয়মাবলী
            </h4>
            <ul className="space-y-2 text-xs text-zinc-300">
              {plan.guidelines.map((g, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400 mt-0.5">
                    ✓
                  </span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-zinc-800/80 bg-zinc-900/90 px-5 py-3.5 flex items-center justify-between gap-3">
          <button
            onClick={copyPlanToClipboard}
            className="flex min-h-[44px] items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors"
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-300">কপি হয়েছে!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>চার্ট কপি করুন (Copy Plan)</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-6 text-xs font-bold text-zinc-950 shadow-md shadow-emerald-500/20 hover:opacity-95 transition-opacity"
          >
            ঠিক আছে (Close)
          </button>
        </div>
      </div>
    </div>
  );
}
