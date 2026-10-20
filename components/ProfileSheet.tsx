"use client";

import { ShieldAlert, Key, Scale, Zap, Info, Calendar, Utensils } from "lucide-react";
import { useMemo, useState } from "react";
import { DAYS_OF_WEEK } from "@/lib/schedule";
import {
  ACTIVITY_LABELS,
  isProfileInRange,
  profileStats,
  macroTargets,
  cmToFtIn,
  ftInToCm,
  kgToLbs,
  lbsToKg
} from "@/lib/calc";
import {
  type Activity,
  EQUIPMENT,
  EQUIPMENT_PRESETS,
  type Equipment,
  FOCUSES,
  type Gender,
  type Goal,
  type Level,
  type Profile,
} from "@/lib/types";
import { Chip, Sheet } from "./Sheet";
import { BmiGauge } from "./BmiGauge";

import {
  type Language,
  TRANSLATIONS,
  ACTIVITY_LABELS_I18N,
  FOCUS_LABELS_I18N,
  GOAL_LABELS_I18N,
  LEVEL_LABELS_I18N,
} from "@/lib/i18n";

interface Props {
  open: boolean;
  firstRun: boolean;
  profile: Profile;
  accessCode: string;
  geminiKey?: string;
  unitSystem?: "metric" | "imperial";
  lang?: Language;
  onLanguageChange?: (lang: Language) => void;
  onSave: (
    p: Profile,
    accessCode: string,
    geminiKey?: string,
    unitSystem?: "metric" | "imperial",
    lang?: Language
  ) => void;
  onClose: () => void;
}

const inputCls =
  "w-full min-h-[44px] rounded-lg border border-cyan-500/35 bg-[#03081a]/90 px-3 text-sm font-mono text-cyan-100 placeholder:text-cyan-800 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.35)] focus:outline-none transition-all";
const labelCls = "mb-1 block text-xs font-mono font-semibold tracking-wider text-cyan-400/80 uppercase";

function Segmented<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid auto-cols-fr grid-flow-col gap-1.5">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-[44px] system-btn-chamfer border px-2 text-sm font-mono tracking-wide transition-all ${
            value === o.value
              ? "border-cyan-400 bg-cyan-500/25 font-bold text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)]"
              : "border-cyan-500/20 bg-[#03081a]/80 text-zinc-400 hover:border-cyan-500/40 hover:text-cyan-200"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ProfileSheet({
  open,
  firstRun,
  profile,
  accessCode,
  geminiKey = "",
  unitSystem = "metric",
  lang = "bn",
  onLanguageChange,
  onSave,
  onClose,
}: Props) {
  const [draft, setDraft] = useState<Profile>(profile);
  const [currentUnit, setCurrentUnit] = useState<"metric" | "imperial">(unitSystem);
  const [currentLang, setCurrentLang] = useState<Language>(lang);
  const [age, setAge] = useState(String(profile.age));
  const [height, setHeight] = useState(String(profile.heightCm));
  const [weight, setWeight] = useState(String(profile.weightKg));
  const [code, setCode] = useState(accessCode);
  const [apiKey, setApiKey] = useState(geminiKey);
  const [error, setError] = useState<string | null>(null);

  const t = TRANSLATIONS[currentLang] ?? TRANSLATIONS.bn;

  const handleLanguageSwitch = (newLang: Language) => {
    setCurrentLang(newLang);
    onLanguageChange?.(newLang);
  };

  // Imperial inputs state
  const initialFtIn = cmToFtIn(profile.heightCm);
  const [ft, setFt] = useState(String(initialFtIn.feet));
  const [inch, setInch] = useState(String(initialFtIn.inches));
  const [lbs, setLbs] = useState(String(kgToLbs(profile.weightKg)));

  const handleImperialHeight = (newFt: string, newIn: string) => {
    setFt(newFt);
    setInch(newIn);
    const cm = ftInToCm(Number(newFt) || 0, Number(newIn) || 0);
    setHeight(String(cm));
  };

  const handleImperialWeight = (newLbs: string) => {
    setLbs(newLbs);
    const kg = lbsToKg(Number(newLbs) || 0);
    setWeight(String(kg));
  };

  const numbers = { age: Number(age), heightCm: Number(height), weightKg: Number(weight) };
  const rangeError = isProfileInRange(numbers);
  const stats = useMemo(
    () => (rangeError ? null : profileStats({ ...draft, ...numbers })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draft.gender, draft.activity, numbers.age, numbers.heightCm, numbers.weightKg, rangeError],
  );

  const nutrition = useMemo(
    () => (stats ? macroTargets(stats.tdee, numbers.weightKg, draft.goal) : null),
    [stats, numbers.weightKg, draft.goal],
  );

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const toggleEquipment = (id: Equipment) =>
    set("equipment", draft.equipment.includes(id) ? draft.equipment.filter((e) => e !== id) : [...draft.equipment, id]);

  const sameSet = (a: Equipment[], b: Equipment[]) => a.length === b.length && a.every((x) => b.includes(x));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rangeError) {
      setError(rangeError);
      return;
    }
    onSave(
      { ...draft, ...numbers, limitations: draft.limitations.trim() },
      code.trim(),
      apiKey.trim(),
      currentUnit,
      currentLang,
    );
  };

  return (
    <Sheet open={open} title={firstRun ? t.firstRunTitle : t.profileSheetTitle} onClose={onClose} dismissable={!firstRun}>
      <form onSubmit={submit} className="space-y-5">
        {firstRun && (
          <p className="text-sm text-zinc-400">
            {t.firstRunNote}
          </p>
        )}

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-white">{t.bodyBiometricsTitle}</h3>
            <div className="flex items-center gap-1.5">
              {/* Language Switcher */}
              <div className="flex gap-1 rounded-lg border border-cyan-500/30 bg-[#03081a] p-0.5 text-xs font-mono">
                <button
                  type="button"
                  id="btn-profile-lang-en"
                  onClick={() => handleLanguageSwitch("en")}
                  className={`rounded px-2 py-1 font-bold transition-all ${
                    currentLang === "en" ? "bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.6)]" : "text-cyan-400/60 hover:text-cyan-200"
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  id="btn-profile-lang-bn"
                  onClick={() => handleLanguageSwitch("bn")}
                  className={`rounded px-2 py-1 font-bold transition-all ${
                    currentLang === "bn" ? "bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.6)]" : "text-cyan-400/60 hover:text-cyan-200"
                  }`}
                >
                  বাংলা
                </button>
              </div>

              {/* Unit System Switcher */}
              <div className="flex gap-1 rounded-lg border border-cyan-500/30 bg-[#03081a] p-0.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setCurrentUnit("metric")}
                  className={`rounded px-2.5 py-1 font-bold transition-all ${
                    currentUnit === "metric" ? "bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.6)]" : "text-cyan-400/60 hover:text-cyan-200"
                  }`}
                >
                  {t.metricOption}
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentUnit("imperial")}
                  className={`rounded px-2.5 py-1 font-bold transition-all ${
                    currentUnit === "imperial" ? "bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.6)]" : "text-cyan-400/60 hover:text-cyan-200"
                  }`}
                >
                  {t.imperialOption}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor="gender">{t.sexLabel}</label>
              <select id="gender" className={inputCls} value={draft.gender} onChange={(e) => set("gender", e.target.value as Gender)}>
                <option value="male">{t.maleOption}</option>
                <option value="female">{t.femaleOption}</option>
                <option value="other">{t.otherSexOption}</option>
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="age">{t.ageLabel}</label>
              <input id="age" className={inputCls} type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>

            {currentUnit === "metric" ? (
              <>
                <div>
                  <label className={labelCls} htmlFor="height">{t.heightLabelMetric}</label>
                  <input id="height" className={inputCls} type="number" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="weight">{t.weightLabelMetric}</label>
                  <input id="weight" className={inputCls} type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className={labelCls}>{t.heightLabelImperial}</label>
                  <div className="flex gap-1.5">
                    <input
                      placeholder="ft"
                      aria-label="Height in feet"
                      className={`${inputCls} text-center`}
                      type="number"
                      value={ft}
                      onChange={(e) => handleImperialHeight(e.target.value, inch)}
                    />
                    <input
                      placeholder="in"
                      aria-label="Height in inches"
                      className={`${inputCls} text-center`}
                      type="number"
                      value={inch}
                      onChange={(e) => handleImperialHeight(ft, e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>{t.weightLabelImperial}</label>
                  <input
                    aria-label="Weight in pounds"
                    className={inputCls}
                    type="number"
                    value={lbs}
                    onChange={(e) => handleImperialWeight(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <label className={labelCls} htmlFor="activity">{t.activityLabel}</label>
            <select id="activity" className={inputCls} value={draft.activity} onChange={(e) => set("activity", e.target.value as Activity)}>
              {Object.entries(ACTIVITY_LABELS_I18N[currentLang] ?? ACTIVITY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Interactive Visual BMI Gauge */}
          {stats && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3.5 space-y-3">
              <BmiGauge bmi={stats.bmi} category={stats.bmiCategory} />

              <div className="grid grid-cols-2 gap-2 text-center pt-1 border-t border-zinc-800/60">
                <div className="rounded-xl bg-zinc-900/60 p-2">
                  <div className="text-[10px] text-zinc-400">{t.restingBmr}</div>
                  <div className="text-base font-bold text-white">{stats.bmr} <span className="text-[10px] text-zinc-500 font-normal">kcal</span></div>
                </div>
                <div className="rounded-xl bg-zinc-900/60 p-2">
                  <div className="text-[10px] text-zinc-400">{t.dailyTdee}</div>
                  <div className="text-base font-bold text-emerald-400">{stats.tdee} <span className="text-[10px] text-zinc-500 font-normal">kcal</span></div>
                </div>
              </div>

              {nutrition && (
                <div className="rounded-xl bg-zinc-900/80 p-2.5 border border-zinc-800 text-center">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5 font-medium">
                    <span>{t.targetCalories(draft.goal)}</span>
                    <strong className="text-white font-mono">{nutrition.targetCalories} kcal/day</strong>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                      <span className="text-emerald-400 font-semibold block">{t.proteinLabel}</span>
                      <strong className="text-white font-mono">{nutrition.proteinGrams}g</strong>
                    </div>
                    <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                      <span className="text-teal-400 font-semibold block">{t.carbsLabel}</span>
                      <strong className="text-white font-mono">{nutrition.carbGrams}g</strong>
                    </div>
                    <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                      <span className="text-amber-400 font-semibold block">{t.fatsLabel}</span>
                      <strong className="text-white font-mono">{nutrition.fatGrams}g</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {rangeError && <p className="text-xs text-amber-400">{rangeError}</p>}
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-white">{currentLang === "bn" ? "প্রশিক্ষণের প্যারামিটার" : "Training Parameters"}</h3>
          <div>
            <span className={labelCls}>{t.levelLabel}</span>
            <Segmented<Level>
              value={draft.level}
              onChange={(v) => set("level", v)}
              options={[
                { value: "beginner", label: LEVEL_LABELS_I18N[currentLang].beginner },
                { value: "intermediate", label: LEVEL_LABELS_I18N[currentLang].intermediate },
                { value: "advanced", label: LEVEL_LABELS_I18N[currentLang].advanced },
              ]}
            />
          </div>
          <div>
            <span className={labelCls}>{t.goalLabel}</span>
            <Segmented<Goal>
              value={draft.goal}
              onChange={(v) => set("goal", v)}
              options={[
                { value: "muscle", label: GOAL_LABELS_I18N[currentLang].muscle },
                { value: "strength", label: GOAL_LABELS_I18N[currentLang].strength },
                { value: "endurance", label: GOAL_LABELS_I18N[currentLang].endurance },
              ]}
            />
          </div>
          <div>
            <span className={labelCls}>{t.sessionLengthLabel}</span>
            <Segmented<Profile["minutes"]>
              value={draft.minutes}
              onChange={(v) => set("minutes", v)}
              options={[
                { value: 20, label: `20 ${currentLang === "bn" ? "মি." : "min"}` },
                { value: 30, label: `30 ${currentLang === "bn" ? "মি." : "min"}` },
                { value: 45, label: `45 ${currentLang === "bn" ? "মি." : "min"}` },
                { value: 60, label: `60 ${currentLang === "bn" ? "মি." : "min"}` },
              ]}
            />
          </div>
          <div>
            <span className={labelCls}>{t.targetFocusLabel}</span>
            <div className="flex flex-wrap gap-2">
              {FOCUSES.map((f) => (
                <Chip key={f.id} selected={draft.focus === f.id} onClick={() => set("focus", f.id)}>
                  {FOCUS_LABELS_I18N[currentLang]?.[f.id] ?? f.label}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className={labelCls}>{t.weeklyDaysProfileLabel}</span>
              <div className="flex gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => set("workoutDays", [1, 3, 5])}
                  className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-400 hover:text-white"
                >
                  {t.daysPpl}
                </button>
                <button
                  type="button"
                  onClick={() => set("workoutDays", [1, 2, 4, 5])}
                  className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-400 hover:text-white"
                >
                  {t.daysFour}
                </button>
                <button
                  type="button"
                  onClick={() => set("workoutDays", [1, 2, 3, 4, 5])}
                  className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-400 hover:text-white"
                >
                  {t.daysFive}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {DAYS_OF_WEEK.map((d) => {
                const days = draft.workoutDays && draft.workoutDays.length > 0 ? draft.workoutDays : [1, 3, 5];
                const active = days.includes(d.dayIndex);
                return (
                  <button
                    key={d.dayIndex}
                    type="button"
                    onClick={() => {
                      const cur = new Set(days);
                      if (cur.has(d.dayIndex)) {
                        if (cur.size > 1) cur.delete(d.dayIndex);
                      } else {
                        cur.add(d.dayIndex);
                      }
                      set("workoutDays", Array.from(cur).sort((a, b) => a - b));
                    }}
                    className={`flex flex-col items-center justify-center rounded-xl p-2 min-h-[50px] border text-center transition-colors ${
                      active
                        ? "border-emerald-500 bg-emerald-500/15 font-bold text-emerald-300"
                        : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-semibold">{d.short}</span>
                    <span className="text-[10px] opacity-75">{currentLang === "bn" ? d.bengaliName.slice(0, 3) : d.short}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className={labelCls}>{t.dietGoalLabel}</span>
            <Segmented<Goal | "recomp">
              value={draft.dietGoal ?? (draft.goal === "muscle" ? "muscle" : "recomp")}
              onChange={(v) => set("dietGoal", v)}
              options={[
                { value: "endurance", label: t.tabFatLoss },
                { value: "muscle", label: t.tabMuscle },
                { value: "recomp", label: t.tabRecomp },
              ]}
            />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-white">{t.equipmentTitle}</h3>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_PRESETS.map((p) => (
              <Chip key={p.id} selected={sameSet(draft.equipment, p.equipment)} onClick={() => set("equipment", [...p.equipment])}>
                {p.label}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT.map((eq) => (
              <Chip key={eq.id} selected={draft.equipment.includes(eq.id)} onClick={() => toggleEquipment(eq.id)}>
                {eq.label}
              </Chip>
            ))}
          </div>
          <p className="text-[11px] text-zinc-500">
            {currentLang === "bn"
              ? "বডিওয়েট ব্যায়াম সবসময় অন্তর্ভুক্ত থাকে। এই তালিকার বাইরের সরঞ্জাম প্রোগ্রাম করা হবে না।"
              : "Bodyweight movements are always included. Movements outside this list will never be programmed."}
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-white">{currentLang === "bn" ? "নিরাপত্তা ও পছন্দ" : "Preferences & Safety"}</h3>
          <label className="flex min-h-[44px] items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 text-sm">
            <input
              type="checkbox"
              className="h-5 w-5 accent-emerald-500"
              checked={draft.lowImpact}
              onChange={(e) => set("lowImpact", e.target.checked)}
            />
            <span>
              {currentLang === "bn" ? "জয়েন্ট ফ্রেন্ডলি (হালকা ব্যায়াম)" : "Joint-friendly only"}
              <span className="block text-[11px] text-zinc-500">
                {currentLang === "bn"
                  ? "কোনো ভারী লাফানো বা হাঁটুতে অতিরিক্ত চাপ সৃষ্টিকারী ব্যায়াম বাদ দেওয়া হবে।"
                  : "No jumping, plyometrics, or ballistic knee loading."}
              </span>
            </span>
          </label>
          <div>
            <label className={labelCls} htmlFor="limits">{t.limitationsLabel}</label>
            <textarea
              id="limits"
              rows={2}
              maxLength={300}
              className={`${inputCls} py-2`}
              placeholder={t.limitationsPlaceholder}
              value={draft.limitations}
              onChange={(e) => set("limitations", e.target.value)}
            />
            <p className="mt-1 flex items-start gap-1.5 text-[11px] text-zinc-500">
              <ShieldAlert className="mt-0.5 h-3 w-3 shrink-0" />
              {currentLang === "bn"
                ? "কোচ আপনার আঘাত ও সমস্যার কথা মনে রেখে বিপরীতধর্মী ব্যায়াম বাদ দেবে।"
                : "Treated as safety data by the coach to exclude conflicting movements."}
            </p>
          </div>
        </section>

        {/* AI Key & Access Code Section */}
        <section className="space-y-3 system-btn-chamfer border border-cyan-500/30 bg-[#03081a]/80 p-4 shadow-[0_0_20px_rgba(6,182,212,0.06)]">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold tracking-widest text-cyan-300 uppercase">{t.serverAccessTitle}</h3>
          </div>

          <div>
            <label className={labelCls} htmlFor="apikey">Google AI Studio Gemini Key (Optional)</label>
            <input
              id="apikey"
              className={inputCls}
              type="password"
              autoComplete="off"
              placeholder="AI Studio key (saved in this browser only)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="mt-1 font-mono text-[10px] text-cyan-600">
              Leave blank to use server environment key or offline builder.
            </p>
          </div>

          <div>
            <label className={labelCls} htmlFor="code">Server Access Code (Optional)</label>
            <input
              id="code"
              className={inputCls}
              type="password"
              autoComplete="off"
              placeholder="Only if your server sets ACCESS_CODE"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
        </section>

        {error && <p className="font-mono text-xs text-red-400 [text-shadow:0_0_8px_rgba(248,113,113,0.5)]">{error}</p>}

        <button
          type="submit"
          className="min-h-[48px] w-full system-btn-chamfer bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 font-mono font-black tracking-widest uppercase text-white shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all hover:brightness-110 active:scale-[0.98]"
        >
          {firstRun ? (currentLang === "bn" ? "◆ সিস্টেম সক্রিয় করুন (AWAKEN) ◆" : "◆ CONFIRM & AWAKEN SYSTEM ◆") : t.saveProfileBtn}
        </button>
      </form>
    </Sheet>
  );
}
