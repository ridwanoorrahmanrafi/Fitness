"use client";

import { ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { playSound } from "@/lib/audio";
import { DAYS_OF_WEEK } from "@/lib/schedule";
import {
  ACTIVITY_LABELS,
  isProfileInRange,
  profileStats,
  macroTargets,
  cmToFtIn,
  ftInToCm,
  kgToLbs,
  lbsToKg,
  AGE_OPTIONS,
  HEIGHT_CM_OPTIONS,
  HEIGHT_FEET_OPTIONS,
  HEIGHT_INCHES_OPTIONS,
  WEIGHT_KG_OPTIONS,
  WEIGHT_LBS_OPTIONS,
  formatAgeOption,
  formatHeightCmOption,
  formatHeightFtOption,
  formatHeightInOption,
  formatWeightKgOption,
  formatWeightLbsOption,
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
import { StrengthCalculatorCard } from "./StrengthCalculatorCard";
import { CyberDropdown } from "./CyberDropdown";

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
  "input input-bordered w-full min-h-[44px] bg-zinc-900/90 border-zinc-700 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none transition-all";
const labelCls = "mb-1.5 block text-xs font-semibold tracking-wider text-zinc-400 uppercase";

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
          className={`btn btn-sm min-h-[44px] px-2 text-xs sm:text-sm font-medium tracking-wide transition-all ${value === o.value
            ? "bg-emerald-500 text-black font-semibold border-emerald-500 hover:bg-emerald-400 shadow-sm"
            : "btn-ghost border border-zinc-700/80 bg-zinc-900/80 text-zinc-400 hover:border-zinc-600 hover:text-white"
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
  const [name, setName] = useState(profile.name ?? "");
  const [currentUnit, setCurrentUnit] = useState<"metric" | "imperial">(unitSystem);
  const [currentLang, setCurrentLang] = useState<Language>(lang);
  const [entryMode, setEntryMode] = useState<"select" | "manual">("select");
  const [age, setAge] = useState(String(profile.age));
  const [height, setHeight] = useState(String(profile.heightCm));
  const [weight, setWeight] = useState(String(profile.weightKg));
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
      { ...draft, name: name.trim() || undefined, ...numbers, limitations: draft.limitations.trim() },
      "",
      "",
      currentUnit,
      currentLang,
    );
  };

  const sheetTitle = firstRun
    ? (currentLang === "bn" ? "অ্যাথলেট প্রোফাইল সেটআপ (My Details)" : "Athlete Profile Setup (My Details)")
    : (currentLang === "bn" ? "আমার শারীরিক বিবরণ ও প্রোফাইল" : "Athlete Profile & Biometrics (My Details)");

  return (
    <Sheet open={open} title={sheetTitle} onClose={onClose} dismissable={!firstRun}>
      <form onSubmit={submit} className="space-y-5">
        {firstRun && (
          <p className="text-sm text-zinc-400">
            {t.firstRunNote}
          </p>
        )}

        <section className="space-y-3">
          {/* Athlete Name / Alias Field */}
          <div>
            <label className={labelCls} htmlFor="athlete-name">
              {currentLang === "bn" ? "অ্যাথলেট নাম / ডাকনাম (ঐচ্ছিক)" : "Athlete Name / Nickname (Optional)"}
            </label>
            <input
              id="athlete-name"
              type="text"
              placeholder={currentLang === "bn" ? "যেমন: রাফি / Alex" : "e.g. Rafi / Alex"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              maxLength={60}
            />
            <span className="mt-1 block text-[11px] text-zinc-500">
              {currentLang === "bn"
                ? "আপনার ব্যক্তিগত ওয়ার্কআউট ও ড্যাশবোর্ডে প্রদর্শিত হবে।"
                : "Personalizes your training dashboard and workout sessions."}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-800/80">
            <h3 className="text-sm font-semibold text-white">{t.bodyBiometricsTitle}</h3>
            <div className="flex items-center gap-1.5">
              {/* Language Switcher */}
              <div
                className="flex gap-1 rounded-lg border border-zinc-700 bg-zinc-900/90 p-0.5 text-xs"
                role="group"
                aria-label="Language selection"
              >
                <button
                  type="button"
                  id="btn-profile-lang-bn"
                  onClick={() => {
                    playSound("click");
                    handleLanguageSwitch("bn");
                  }}
                  className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${currentLang === "bn"
                    ? "bg-emerald-500 text-black shadow-sm"
                    : "text-zinc-400 hover:text-white"
                    }`}
                  aria-pressed={currentLang === "bn"}
                >
                  বাংলা
                </button>
                <button
                  type="button"
                  id="btn-profile-lang-en"
                  onClick={() => {
                    playSound("click");
                    handleLanguageSwitch("en");
                  }}
                  className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${currentLang === "en"
                    ? "bg-emerald-500 text-black shadow-sm"
                    : "text-zinc-400 hover:text-white"
                    }`}
                  aria-pressed={currentLang === "en"}
                >
                  EN
                </button>
              </div>

              {/* Mode Switcher: Select (Dropdown) vs Manual (Type) */}
              <div
                className="flex gap-1 rounded-lg border border-zinc-700 bg-zinc-900/90 p-0.5 text-xs"
                role="group"
                aria-label="Input mode selection"
              >
                <button
                  type="button"
                  id="btn-profile-mode-select"
                  onClick={() => setEntryMode("select")}
                  className={`rounded px-2.5 py-1 font-semibold transition-all ${entryMode === "select"
                    ? "bg-emerald-500 text-black shadow-sm"
                    : "text-zinc-400 hover:text-white"
                    }`}
                  aria-pressed={entryMode === "select"}
                >
                  {t.modeSelectOption}
                </button>
                <button
                  type="button"
                  id="btn-profile-mode-manual"
                  onClick={() => setEntryMode("manual")}
                  className={`rounded px-2.5 py-1 font-semibold transition-all ${entryMode === "manual"
                    ? "bg-emerald-500 text-black shadow-sm"
                    : "text-zinc-400 hover:text-white"
                    }`}
                  aria-pressed={entryMode === "manual"}
                >
                  {t.modeManualOption}
                </button>
              </div>

              {/* Unit System Switcher */}
              <div className="flex gap-1 rounded-lg border border-zinc-700 bg-zinc-900/90 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setCurrentUnit("metric")}
                  className={`rounded px-2.5 py-1 font-semibold transition-all ${currentUnit === "metric" ? "bg-emerald-500 text-black shadow-sm" : "text-zinc-400 hover:text-white"
                    }`}
                >
                  {t.metricOption}
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentUnit("imperial")}
                  className={`rounded px-2.5 py-1 font-semibold transition-all ${currentUnit === "imperial" ? "bg-emerald-500 text-black shadow-sm" : "text-zinc-400 hover:text-white"
                    }`}
                >
                  {t.imperialOption}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <CyberDropdown
                id="gender"
                label={t.sexLabel}
                value={draft.gender}
                options={[
                  { value: "male", label: t.maleOption },
                  { value: "female", label: t.femaleOption },
                  { value: "other", label: t.otherSexOption },
                ]}
                onChange={(val) => set("gender", val as Gender)}
                searchable={false}
              />
            </div>
            <div>
              {entryMode === "select" ? (
                <CyberDropdown
                  id="age"
                  label={t.ageLabel}
                  value={Math.round(Number(age)) || 24}
                  options={
                    Number(age) > 0 && !AGE_OPTIONS.includes(Math.round(Number(age)))
                      ? [
                        { value: Math.round(Number(age)), label: `${age} (Custom)` },
                        ...AGE_OPTIONS.map((a) => ({ value: a, label: formatAgeOption(a, currentLang) })),
                      ]
                      : AGE_OPTIONS.map((a) => ({ value: a, label: formatAgeOption(a, currentLang) }))
                  }
                  onChange={(val) => setAge(String(val))}
                  searchable
                />
              ) : (
                <div>
                  <label className={labelCls} htmlFor="age">{t.ageLabel}</label>
                  <input id="age" className={inputCls} type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
              )}
            </div>

            {currentUnit === "metric" ? (
              <>
                <div>
                  {entryMode === "select" ? (
                    <CyberDropdown
                      id="height"
                      label={t.heightLabelMetric}
                      value={Math.round(Number(height)) || 175}
                      options={
                        Number(height) > 0 && !HEIGHT_CM_OPTIONS.includes(Math.round(Number(height)))
                          ? [
                            { value: Math.round(Number(height)), label: `${height} cm (Custom)` },
                            ...HEIGHT_CM_OPTIONS.map((c) => ({ value: c, label: formatHeightCmOption(c, currentLang) })),
                          ]
                          : HEIGHT_CM_OPTIONS.map((c) => ({ value: c, label: formatHeightCmOption(c, currentLang) }))
                      }
                      onChange={(val) => {
                        setHeight(String(val));
                        const ftIn = cmToFtIn(Number(val) || 175);
                        setFt(String(ftIn.feet));
                        setInch(String(ftIn.inches));
                      }}
                      searchable
                    />
                  ) : (
                    <div>
                      <label className={labelCls} htmlFor="height">{t.heightLabelMetric}</label>
                      <input id="height" className={inputCls} type="number" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} />
                    </div>
                  )}
                </div>
                <div>
                  {entryMode === "select" ? (
                    <CyberDropdown
                      id="weight"
                      label={t.weightLabelMetric}
                      value={Math.round(Number(weight)) || 70}
                      options={
                        Number(weight) > 0 && !WEIGHT_KG_OPTIONS.includes(Math.round(Number(weight)))
                          ? [
                            { value: Math.round(Number(weight)), label: `${weight} kg (Custom)` },
                            ...WEIGHT_KG_OPTIONS.map((k) => ({ value: k, label: formatWeightKgOption(k, currentLang) })),
                          ]
                          : WEIGHT_KG_OPTIONS.map((k) => ({ value: k, label: formatWeightKgOption(k, currentLang) }))
                      }
                      onChange={(val) => {
                        setWeight(String(val));
                        setLbs(String(kgToLbs(Number(val) || 70)));
                      }}
                      searchable
                    />
                  ) : (
                    <div>
                      <label className={labelCls} htmlFor="weight">{t.weightLabelMetric}</label>
                      <input id="weight" className={inputCls} type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className={labelCls}>{t.heightLabelImperial}</label>
                  {entryMode === "select" ? (
                    <div className="flex gap-1.5">
                      <CyberDropdown
                        aria-label="Height feet"
                        value={Number(ft) || 5}
                        options={HEIGHT_FEET_OPTIONS.map((f) => ({ value: f, label: formatHeightFtOption(f, currentLang) }))}
                        onChange={(newFt) => handleImperialHeight(String(newFt), inch)}
                        searchable={false}
                      />
                      <CyberDropdown
                        aria-label="Height inches"
                        value={Number(inch) || 0}
                        options={HEIGHT_INCHES_OPTIONS.map((i) => ({ value: i, label: formatHeightInOption(i, currentLang) }))}
                        onChange={(newIn) => handleImperialHeight(ft, String(newIn))}
                        searchable={false}
                      />
                    </div>
                  ) : (
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
                  )}
                </div>
                <div>
                  {entryMode === "select" ? (
                    <CyberDropdown
                      id="weightLbs"
                      label={t.weightLabelImperial}
                      value={Math.round(Number(lbs)) || 154}
                      options={
                        Number(lbs) > 0 && !WEIGHT_LBS_OPTIONS.includes(Math.round(Number(lbs)))
                          ? [
                            { value: Math.round(Number(lbs)), label: `${lbs} lbs (Custom)` },
                            ...WEIGHT_LBS_OPTIONS.map((l) => ({ value: l, label: formatWeightLbsOption(l, currentLang) })),
                          ]
                          : WEIGHT_LBS_OPTIONS.map((l) => ({ value: l, label: formatWeightLbsOption(l, currentLang) }))
                      }
                      onChange={(val) => handleImperialWeight(String(val))}
                      searchable
                    />
                  ) : (
                    <div>
                      <label className={labelCls} htmlFor="weightLbs">{t.weightLabelImperial}</label>
                      <input
                        id="weightLbs"
                        aria-label="Weight in pounds"
                        className={inputCls}
                        type="number"
                        value={lbs}
                        onChange={(e) => handleImperialWeight(e.target.value)}
                      />
                    </div>
                  )}
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
            <div className="rounded-3xl border border-white/10 glass-surface p-4 space-y-3">
              <BmiGauge bmi={stats.bmi} category={stats.bmiCategory} />

              <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-zinc-800">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5">
                  <div className="text-[10px] text-zinc-400 uppercase">{t.restingBmr}</div>
                  <div className="text-base font-bold text-white font-mono">{stats.bmr} <span className="text-[10px] text-zinc-500 font-normal">kcal</span></div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5">
                  <div className="text-[10px] text-zinc-400 uppercase">{t.dailyTdee}</div>
                  <div className="text-base font-bold text-emerald-400 font-mono">{stats.tdee} <span className="text-[10px] text-zinc-500 font-normal">kcal</span></div>
                </div>
              </div>

              {nutrition && (
                <div className="rounded-xl bg-zinc-900/80 p-3 border border-zinc-800 text-center">
                  <div className="flex items-center justify-between text-xs text-zinc-300 mb-1.5 font-medium">
                    <span>{t.targetCalories(draft.goal)}</span>
                    <strong className="text-white font-mono">{nutrition.targetCalories} kcal/day</strong>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                      <span className="text-emerald-400 font-semibold block text-[10px]">{t.proteinLabel}</span>
                      <strong className="text-white font-mono">{nutrition.proteinGrams}g</strong>
                    </div>
                    <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                      <span className="text-sky-400 font-semibold block text-[10px]">{t.carbsLabel}</span>
                      <strong className="text-white font-mono">{nutrition.carbGrams}g</strong>
                    </div>
                    <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                      <span className="text-amber-400 font-semibold block text-[10px]">{t.fatsLabel}</span>
                      <strong className="text-white font-mono">{nutrition.fatGrams}g</strong>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <StrengthCalculatorCard
                  lang={currentLang}
                  defaultGender={draft.gender}
                  defaultBodyweightKg={numbers.weightKg > 0 ? numbers.weightKg : 70}
                  compact={false}
                />
              </div>
            </div>
          )}

          {rangeError && <p className="text-xs text-amber-400">{rangeError}</p>}
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{currentLang === "bn" ? "প্রশিক্ষণের প্যারামিটার" : "TRAINING PARAMETERS"}</h3>
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
                  className="btn btn-xs uppercase border border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                >
                  {t.daysPpl}
                </button>
                <button
                  type="button"
                  onClick={() => set("workoutDays", [1, 2, 4, 5])}
                  className="btn btn-xs uppercase border border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                >
                  {t.daysFour}
                </button>
                <button
                  type="button"
                  onClick={() => set("workoutDays", [1, 2, 3, 4, 5])}
                  className="btn btn-xs uppercase border border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white"
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
                    className={`flex flex-col items-center justify-center rounded-xl p-2 min-h-[50px] border text-center transition-all cursor-pointer ${active
                      ? "border-emerald-500/80 bg-emerald-500/10 text-emerald-400 font-bold shadow-sm scale-102"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                      }`}
                  >
                    <span className="text-[10px] uppercase font-bold">{d.short}</span>
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
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{currentLang === "bn" ? "নিরাপত্তা ও পছন্দ" : "PREFERENCES & SAFETY"}</h3>
          <label className="flex min-h-[44px] items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 text-sm cursor-pointer hover:border-zinc-600 transition-colors">
            <input
              type="checkbox"
              className="checkbox checkbox-success h-5 w-5"
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
              className="textarea textarea-bordered w-full bg-zinc-900/90 border-zinc-700 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500"
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

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          className="btn w-full min-h-[48px] font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-black border-none shadow-md transition-all active:scale-[0.98]"
        >
          {firstRun
            ? (currentLang === "bn" ? "বিবরণ সংরক্ষণ ও ওয়ার্কআউট শুরু করুন" : "Save Details & Start Training")
            : (currentLang === "bn" ? "শারীরিক বিবরণ সংরক্ষণ করুন (Save Details)" : "Save Details & Apply")}
        </button>
      </form>
    </Sheet>
  );
}
