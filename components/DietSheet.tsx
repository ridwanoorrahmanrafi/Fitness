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
  Bot,
  Zap,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { generateBangladeshiDiet, type BangladeshiDietPlan } from "@/lib/diet";
import { TRANSLATIONS, type Language } from "@/lib/i18n";
import type { Goal, GenerateDietResponse } from "@/lib/types";

interface Props {
  open: boolean;
  weightKg: number;
  heightCm: number;
  bmi: number;
  bmiCategory: string;
  tdee: number;
  initialGoal?: Goal | "recomp";
  lang?: Language;
  geminiKey?: string;
  accessCode?: string;
  onClose: () => void;
}

type TabGoal = "loss" | "muscle" | "recomp";
type DietViewMode = "preset" | "ai";

export function DietSheet({
  open,
  weightKg,
  heightCm,
  bmi,
  bmiCategory,
  tdee,
  initialGoal = "recomp",
  lang = "bn",
  accessCode = "",
  onClose,
}: Props) {
  // Map initial goal to tab
  const getInitialTab = (): TabGoal => {
    if (initialGoal === "endurance" || (initialGoal === "recomp" && bmi >= 25)) return "loss";
    if (initialGoal === "muscle" && bmi < 25) return "muscle";
    return "recomp";
  };

  const [viewMode, setViewMode] = useState<DietViewMode>("preset");
  const [activeTab, setActiveTab] = useState<TabGoal>(getInitialTab);
  const [copied, setCopied] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const t = TRANSLATIONS[lang] ?? TRANSLATIONS.bn;
  const isBn = lang === "bn";

  // AI Diet state
  const [aiPreferences, setAiPreferences] = useState<string[]>(["high_protein"]);
  const [aiRestrictions, setAiRestrictions] = useState("");
  const [aiBudget, setAiBudget] = useState<"student" | "standard" | "premium">("standard");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDiet, setAiDiet] = useState<BangladeshiDietPlan | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [aiSource, setAiSource] = useState<"gemini" | "openai" | "dual_ai" | "local" | null>(null);

  // Derive standard diet plan dynamically
  const standardPlan: BangladeshiDietPlan = useMemo(() => {
    const goalParam = activeTab === "loss" ? "endurance" : activeTab === "muscle" ? "muscle" : "recomp";
    return generateBangladeshiDiet(weightKg, tdee, goalParam, bmi);
  }, [activeTab, weightKg, tdee, bmi]);

  // Active displayed diet (either Gemini AI output or standard verified plan)
  const activeDiet: BangladeshiDietPlan = viewMode === "ai" && aiDiet ? aiDiet : standardPlan;

  const toggleAiPref = (pref: string) => {
    setAiPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const generateAiDiet = async () => {
    setAiLoading(true);
    setAiNotice(null);

    const goalParam = activeTab === "loss" ? "endurance" : activeTab === "muscle" ? "muscle" : "recomp";

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(accessCode ? { "x-access-code": accessCode } : {}),
      };

      const res = await fetch("/api/generate-diet", {
        method: "POST",
        headers,
        body: JSON.stringify({
          weightKg,
          heightCm,
          age: 26,
          gender: "male",
          activity: "moderate",
          goal: goalParam,
          bmi,
          tdee,
          targetCalories: standardPlan.targetCalories,
          preferences: aiPreferences,
          allergiesOrRestrictions: aiRestrictions.trim() || undefined,
          budgetLevel: aiBudget,
          language: lang,
        }),
      });

      const data: GenerateDietResponse = await res.json();
      if (data.ok && data.diet) {
        setAiDiet(data.diet);
        setAiSource(data.source ?? "gemini");
        if (data.warning) setAiNotice(data.warning);
      } else {
        setAiNotice(data.error || (isBn ? "এআই প্ল্যান তৈরিতে সমস্যা হয়েছে। লোকাল প্ল্যান দেখানো হচ্ছে।" : "AI plan failed, using standard plan."));
      }
    } catch {
      setAiNotice(isBn ? "কানেকশন সমস্যা হয়েছে। লোকাল ডায়েট ইঞ্জিন ব্যবহার করা হচ্ছে।" : "Connection error; using local plan.");
    } finally {
      setAiLoading(false);
    }
  };

  if (!open) return null;

  const copyPlanToClipboard = () => {
    const text = `🥗 ARISE Bangladesh Diet Chart - ${activeDiet.bengaliTitle} (${activeDiet.title})
⚖️ Profile: Weight ${weightKg}kg | BMI ${bmi} (${bmiCategory}) | Daily Need: ${activeDiet.targetCalories} kcal
💧 Water: ${activeDiet.waterLiters}L/day | Protein: ${activeDiet.proteinGrams}g | Carbs: ${activeDiet.carbsGrams}g | Fats: ${activeDiet.fatGrams}g

${activeDiet.meals
  .map(
    (m) =>
      `▶️ ${m.title} [${m.time}]:\n` +
      m.items.map((i) => ` • ${lang === "bn" ? i.bengaliName : i.name} (${i.portion}) - ${i.calories} kcal [P: ${i.proteinG}g]`).join("\n") +
      (m.tips ? `\n 💡 Tip: ${m.tips}` : "")
  )
  .join("\n\n")}

📋 Guidelines:
${activeDiet.guidelines.map((g, idx) => `${idx + 1}. ${g}`).join("\n")}
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
      <div className="system-window relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-t-2xl sm:rounded-2xl border-1.5 border-cyan-500/60 bg-[#03081a]/95 text-cyan-100 shadow-[0_0_40px_rgba(6,182,212,0.35)] overflow-hidden font-sans">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 bg-[#03081a] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center system-btn-chamfer bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] tracking-widest text-cyan-400 font-bold">◆ SYSTEM NOURISHMENT ◆</span>
              </div>
              <h2 id="diet-modal-title" className="text-base font-black text-white sm:text-lg font-mono tracking-wide text-glow-cyan uppercase">
                {t.dietSheetTitle}
              </h2>
              <p className="font-mono text-[11px] text-cyan-400/80">{t.dietSheetSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close diet chart"
            className="flex h-9 w-9 items-center justify-center system-btn-chamfer border border-cyan-500/30 bg-[#03081a] text-cyan-400 hover:text-white hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Engine Switcher (Preset vs Gemini AI) */}
        <div className="border-b border-cyan-500/20 bg-[#03081a]/80 px-4 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode("preset")}
              className={`flex items-center gap-1.5 system-btn-chamfer px-3 py-1.5 text-xs font-mono font-bold tracking-wide transition-all ${
                viewMode === "preset"
                  ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                  : "border border-cyan-500/20 bg-[#03081a]/80 text-cyan-400/60 hover:text-cyan-200"
              }`}
            >
              <Utensils className="h-3.5 w-3.5 text-cyan-400" />
              <span>{isBn ? "প্রমাণিত হান্টার রেশন" : "Standard Hunter Rations"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode("ai");
                if (!aiDiet && !aiLoading) {
                  generateAiDiet();
                }
              }}
              className={`flex items-center gap-1.5 system-btn-chamfer px-3 py-1.5 text-xs font-mono font-bold tracking-wide transition-all ${
                viewMode === "ai"
                  ? "bg-gradient-to-r from-cyan-500/25 to-purple-500/25 text-cyan-300 border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  : "border border-cyan-500/20 bg-[#03081a]/80 text-cyan-400/60 hover:text-cyan-200"
              }`}
            >
              <Bot className="h-3.5 w-3.5 text-cyan-400" />
              <span>{isBn ? "এআই হান্টার রেশন" : "AI Tactical Rations"}</span>
              <span className="system-btn-chamfer bg-cyan-500/30 px-1.5 py-0.2 text-[9px] font-mono text-cyan-300 border border-cyan-400/40">
                PRO
              </span>
            </button>
          </div>

          {viewMode === "ai" && aiSource && (
            <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] text-cyan-300">
              <Zap className="h-3 w-3 text-cyan-400" />
              {aiSource === "dual_ai"
                ? "Dual-AI (Gemini + ChatGPT)"
                : aiSource === "gemini"
                  ? "Google Gemini 3.5 Flash"
                  : aiSource === "openai"
                    ? "ChatGPT (GPT-4o)"
                    : "Local Engine"}
            </span>
          )}
        </div>

        {/* Goal Selection Tabs */}
        <div className="border-b border-cyan-500/20 bg-[#03081a]/60 p-3">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveTab("loss")}
              className={`flex flex-col items-center justify-center system-btn-chamfer border p-2 text-center transition-all ${
                activeTab === "loss"
                  ? "border-cyan-400 bg-cyan-500/20 text-cyan-200 font-bold shadow-[0_0_12px_rgba(6,182,212,0.35)]"
                  : "border-cyan-500/20 bg-[#03081a]/80 text-cyan-400/60 hover:border-cyan-500/40 hover:text-cyan-200"
              }`}
            >
              <span className="text-xs sm:text-sm font-mono">{t.tabFatLoss}</span>
              <span className="font-mono text-[10px] opacity-75">{isBn ? "ওজন হ্রাস ও দ্রুত ক্ষিপ্রতা" : "Agile Shred & Fat Loss"}</span>
            </button>
            <button
              onClick={() => setActiveTab("muscle")}
              className={`flex flex-col items-center justify-center system-btn-chamfer border p-2 text-center transition-all ${
                activeTab === "muscle"
                  ? "border-cyan-400 bg-cyan-500/20 text-cyan-200 font-bold shadow-[0_0_12px_rgba(6,182,212,0.35)]"
                  : "border-cyan-500/20 bg-[#03081a]/80 text-cyan-400/60 hover:border-cyan-500/40 hover:text-cyan-200"
              }`}
            >
              <span className="text-xs sm:text-sm font-mono">{t.tabMuscle}</span>
              <span className="font-mono text-[10px] opacity-75">{isBn ? "পেশি ও শক্তির বিশাল বৃদ্ধি" : "Titan Hypertrophy & Mass"}</span>
            </button>
            <button
              onClick={() => setActiveTab("recomp")}
              className={`flex flex-col items-center justify-center system-btn-chamfer border p-2 text-center transition-all ${
                activeTab === "recomp"
                  ? "border-cyan-400 bg-cyan-500/20 text-cyan-200 font-bold shadow-[0_0_12px_rgba(6,182,212,0.35)]"
                  : "border-cyan-500/20 bg-[#03081a]/80 text-cyan-400/60 hover:border-cyan-500/40 hover:text-cyan-200"
              }`}
            >
              <span className="text-xs sm:text-sm font-mono">{t.tabRecomp}</span>
              <span className="font-mono text-[10px] opacity-75">{isBn ? "শ্যাডো মনার্ক এস্থেটিক বডি" : "Shadow Monarch Aesthetic"}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* AI Generator Controls (when viewMode is AI) */}
          {viewMode === "ai" && (
            <div className="rounded-2xl border border-emerald-500/30 bg-zinc-900/80 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {isBn ? "জেমিনাই এআই অপশন ও পছন্দসমূহ" : "Gemini AI Preferences & Routine"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={generateAiDiet}
                  disabled={aiLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50 transition-colors"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>{isBn ? "তৈরি হচ্ছে..." : "Generating..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{isBn ? "পুনরায় তৈরি করুন" : "Regenerate"}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Preferences Chips */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-zinc-400 block font-medium">
                  {isBn ? "আপনার ধরন ও পছন্দ নির্বাচন করুন:" : "Select your lifestyle preferences:"}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "high_protein", labelBn: "💪 হাই প্রোটিন", labelEn: "High Protein" },
                    { id: "mess_friendly", labelBn: "🏢 মেস / ব্যাচেলর ফ্রেন্ডলি", labelEn: "Student / Mess" },
                    { id: "low_oil", labelBn: "🌿 কম তেল ও মশলা", labelEn: "Low Oil" },
                    { id: "diabetes_low_gi", labelBn: "🩸 ডায়াবেটিস / লো-জিআই", labelEn: "Diabetes / Low GI" },
                    { id: "office_tiffin", labelBn: "💼 অফিস টিফিন উপযোগী", labelEn: "Office Tiffin" },
                    { id: "vegetarian", labelBn: "🥗 নিরামিষ / ভেজ", labelEn: "Vegetarian" },
                  ].map((p) => {
                    const selected = aiPreferences.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleAiPref(p.id)}
                        className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                          selected
                            ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 font-semibold"
                            : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                        }`}
                      >
                        {isBn ? p.labelBn : p.labelEn}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Budget & Allergy Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">
                    {isBn ? "বাজেট লেভেল:" : "Budget Level:"}
                  </label>
                  <select
                    value={aiBudget}
                    onChange={(e) => setAiBudget(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="student">{isBn ? "সাশ্রয়ী / স্টুডেন্ট বাজেট (ডিম, ডাল, ছোলা)" : "Student / Budget-friendly"}</option>
                    <option value="standard">{isBn ? "স্ট্যান্ডার্ড বাঙালি (মাছ, মুরগি, ডিম)" : "Standard Household"}</option>
                    <option value="premium">{isBn ? "প্রিমিয়াম (রুই, স্যামন, চিকেন ব্রেস্ট, বাদাম)" : "Premium Nutrition"}</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">
                    {isBn ? "কোনো খাবারে এলার্জি বা নিষেধ?" : "Restrictions / Allergies:"}
                  </label>
                  <input
                    type="text"
                    value={aiRestrictions}
                    onChange={(e) => setAiRestrictions(e.target.value)}
                    placeholder={isBn ? "যেমন: চিংড়ি নিষেধ, গরুর মাংস খাই না" : "e.g. no shrimp, no beef"}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none placeholder:text-zinc-600"
                  />
                </div>
              </div>

              {aiNotice && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-950/20 p-2 text-xs text-amber-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>{aiNotice}</span>
                </div>
              )}
            </div>
          )}

          {/* Plan Summary Banner */}
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-emerald-950/20 p-4 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-base font-bold text-white sm:text-lg">
                {isBn ? activeDiet.bengaliTitle : activeDiet.title}
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-xs text-zinc-300">
                <Scale className="h-3.5 w-3.5 text-emerald-400" />
                <span>{weightKg} kg</span>
                <span className="text-zinc-500">|</span>
                <span className="text-emerald-300">BMI {bmi}</span>
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed mb-4">{activeDiet.description}</p>

            {activeDiet.consensus && (
              <div className="mb-4 overflow-hidden rounded-xl border border-teal-500/30 bg-teal-950/20 p-3.5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-2 border-b border-teal-500/20 pb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
                    <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                    {activeDiet.consensus.verifiedBy}
                  </span>
                  {activeDiet.consensus.safetyScore && (
                    <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-teal-200">
                      {activeDiet.consensus.safetyScore}% Clinical Match
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-zinc-300 leading-relaxed">
                  {activeDiet.consensus.summary}
                </p>
                {activeDiet.consensus.notes && activeDiet.consensus.notes.length > 0 && (
                  <ul className="mt-2 space-y-1 text-[11px] text-zinc-400">
                    {activeDiet.consensus.notes.map((note, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle className="h-3 w-3 text-teal-400 mt-0.5 shrink-0" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-2.5">
                <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400">
                  <Flame className="h-3 w-3 text-amber-400" /> {lang === "bn" ? "দৈনিক ক্যালোরি" : "Daily Calories"}
                </div>
                <div className="mt-1 text-lg font-bold font-mono text-white">
                  {activeDiet.targetCalories} <span className="text-[11px] font-normal text-zinc-500">kcal</span>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-2.5">
                <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400">
                  <Sparkles className="h-3 w-3 text-emerald-400" /> {t.proteinLabel}
                </div>
                <div className="mt-1 text-lg font-bold font-mono text-emerald-400">
                  {activeDiet.proteinGrams} <span className="text-[11px] font-normal text-zinc-500">{lang === "bn" ? "গ্রাম" : "g"}</span>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-2.5">
                <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400">
                  <Apple className="h-3 w-3 text-teal-400" /> {t.carbsLabel}
                </div>
                <div className="mt-1 text-lg font-bold font-mono text-teal-400">
                  {activeDiet.carbsGrams} <span className="text-[11px] font-normal text-zinc-500">{lang === "bn" ? "গ্রাম" : "g"}</span>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-2.5">
                <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400">
                  <Droplets className="h-3 w-3 text-cyan-400" /> {t.waterLabel}
                </div>
                <div className="mt-1 text-lg font-bold font-mono text-cyan-300">
                  {activeDiet.waterLiters} <span className="text-[11px] font-normal text-zinc-500">{lang === "bn" ? "লিটার" : "L"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Meals Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Utensils className="h-3.5 w-3.5 text-emerald-400" /> {t.dailyMealsTitle}
            </h3>

            {activeDiet.meals.map((meal, mIdx) => {
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
                          <span className="text-zinc-300 font-medium font-mono">
                            {mealProtein}g {isBn ? "প্রোটিন" : "protein"}
                          </span>
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
                              <span className="font-semibold text-zinc-100 block">
                                {isBn ? item.bengaliName : item.name}
                              </span>
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
                            <strong>{isBn ? "টিপস: " : "Tip: "}</strong>
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
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />{" "}
              {isBn ? "বাঙালি খাদ্যাভ্যাসে জরুরি নিয়মাবলী" : "Bangladeshi Nutrition Guidelines"}
            </h4>
            <ul className="space-y-2 text-xs text-zinc-300">
              {activeDiet.guidelines.map((g, idx) => (
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
        <div className="border-t border-cyan-500/30 bg-[#03081a] px-5 py-3.5 flex items-center justify-between gap-3">
          <button
            onClick={copyPlanToClipboard}
            className="flex min-h-[44px] items-center gap-2 system-btn-chamfer border border-cyan-500/30 bg-[#03081a] px-4 text-xs font-mono font-bold text-cyan-300 hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(6,182,212,0.35)] transition-all"
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 text-cyan-400" />
                <span className="text-cyan-200">{t.copiedBtn}</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>{t.copyPlanBtn}</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="flex min-h-[44px] items-center justify-center system-btn-chamfer bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 px-6 text-xs font-mono font-black uppercase text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-[0.98] transition-all"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
