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

interface Props {
  open: boolean;
  firstRun: boolean;
  profile: Profile;
  accessCode: string;
  geminiKey?: string;
  unitSystem?: "metric" | "imperial";
  onSave: (p: Profile, accessCode: string, geminiKey?: string, unitSystem?: "metric" | "imperial") => void;
  onClose: () => void;
}

const inputCls =
  "w-full min-h-[44px] rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none";
const labelCls = "mb-1 block text-xs font-medium text-zinc-400";

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
          className={`min-h-[44px] rounded-xl border px-2 text-sm transition-colors ${
            value === o.value
              ? "border-emerald-500/70 bg-emerald-500/15 font-semibold text-emerald-300"
              : "border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-zinc-500"
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
  onSave,
  onClose,
}: Props) {
  const [draft, setDraft] = useState<Profile>(profile);
  const [currentUnit, setCurrentUnit] = useState<"metric" | "imperial">(unitSystem);
  const [age, setAge] = useState(String(profile.age));
  const [height, setHeight] = useState(String(profile.heightCm));
  const [weight, setWeight] = useState(String(profile.weightKg));
  const [code, setCode] = useState(accessCode);
  const [apiKey, setApiKey] = useState(geminiKey);
  const [error, setError] = useState<string | null>(null);

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
    );
  };

  return (
    <Sheet open={open} title={firstRun ? "Set up your coach" : "Your profile"} onClose={onClose} dismissable={!firstRun}>
      <form onSubmit={submit} className="space-y-5">
        {firstRun && (
          <p className="text-sm text-zinc-400">
            Everything is saved on this device only. The calculators run locally, and body measurements are never sent to
            the AI.
          </p>
        )}

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Body & Biometrics</h3>
            <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setCurrentUnit("metric")}
                className={`rounded-md px-2.5 py-1 transition-colors ${
                  currentUnit === "metric" ? "bg-emerald-500 font-semibold text-zinc-950" : "text-zinc-400 hover:text-white"
                }`}
              >
                Metric (kg/cm)
              </button>
              <button
                type="button"
                onClick={() => setCurrentUnit("imperial")}
                className={`rounded-md px-2.5 py-1 transition-colors ${
                  currentUnit === "imperial" ? "bg-emerald-500 font-semibold text-zinc-950" : "text-zinc-400 hover:text-white"
                }`}
              >
                Imperial (lbs/ft)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor="gender">Sex (Mifflin-St Jeor formula)</label>
              <select id="gender" className={inputCls} value={draft.gender} onChange={(e) => set("gender", e.target.value as Gender)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="age">Age</label>
              <input id="age" className={inputCls} type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>

            {currentUnit === "metric" ? (
              <>
                <div>
                  <label className={labelCls} htmlFor="height">Height (cm)</label>
                  <input id="height" className={inputCls} type="number" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="weight">Weight (kg)</label>
                  <input id="weight" className={inputCls} type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className={labelCls}>Height (ft & in)</label>
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
                  <label className={labelCls}>Weight (lbs)</label>
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
            <label className={labelCls} htmlFor="activity">Daily activity factor</label>
            <select id="activity" className={inputCls} value={draft.activity} onChange={(e) => set("activity", e.target.value as Activity)}>
              {Object.entries(ACTIVITY_LABELS).map(([k, v]) => (
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
                  <div className="text-[10px] text-zinc-400">Basal BMR</div>
                  <div className="text-base font-bold text-white">{stats.bmr} <span className="text-[10px] text-zinc-500 font-normal">kcal</span></div>
                </div>
                <div className="rounded-xl bg-zinc-900/60 p-2">
                  <div className="text-[10px] text-zinc-400">Daily TDEE</div>
                  <div className="text-base font-bold text-emerald-400">{stats.tdee} <span className="text-[10px] text-zinc-500 font-normal">kcal</span></div>
                </div>
              </div>

              {nutrition && (
                <div className="rounded-xl bg-zinc-900/80 p-2.5 border border-zinc-800 text-center">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5 font-medium">
                    <span>Target Calories ({draft.goal}):</span>
                    <strong className="text-white font-mono">{nutrition.targetCalories} kcal/day</strong>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                      <span className="text-emerald-400 font-semibold block">Protein</span>
                      <strong className="text-white font-mono">{nutrition.proteinGrams}g</strong>
                    </div>
                    <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                      <span className="text-teal-400 font-semibold block">Carbs</span>
                      <strong className="text-white font-mono">{nutrition.carbGrams}g</strong>
                    </div>
                    <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                      <span className="text-amber-400 font-semibold block">Fats</span>
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
          <h3 className="text-sm font-semibold text-white">Training Parameters</h3>
          <div>
            <span className={labelCls}>Experience</span>
            <Segmented<Level>
              value={draft.level}
              onChange={(v) => set("level", v)}
              options={[
                { value: "beginner", label: "Beginner" },
                { value: "intermediate", label: "Intermediate" },
                { value: "advanced", label: "Advanced" },
              ]}
            />
          </div>
          <div>
            <span className={labelCls}>Goal</span>
            <Segmented<Goal>
              value={draft.goal}
              onChange={(v) => set("goal", v)}
              options={[
                { value: "muscle", label: "Build muscle (+300 kcal)" },
                { value: "strength", label: "Strength (maintain)" },
                { value: "endurance", label: "Endurance (-350 kcal)" },
              ]}
            />
          </div>
          <div>
            <span className={labelCls}>Session length</span>
            <Segmented<Profile["minutes"]>
              value={draft.minutes}
              onChange={(v) => set("minutes", v)}
              options={[
                { value: 20, label: "20 min" },
                { value: 30, label: "30 min" },
                { value: 45, label: "45 min" },
                { value: 60, label: "60 min" },
              ]}
            />
          </div>
          <div>
            <span className={labelCls}>Target Focus</span>
            <div className="flex flex-wrap gap-2">
              {FOCUSES.map((f) => (
                <Chip key={f.id} selected={draft.focus === f.id} onClick={() => set("focus", f.id)}>
                  {f.label}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className={labelCls}>Weekly Workout Days (সাপ্তাহিক ব্যায়ামের দিন)</span>
              <div className="flex gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => set("workoutDays", [1, 3, 5])}
                  className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-400 hover:text-white"
                >
                  3d (PPL)
                </button>
                <button
                  type="button"
                  onClick={() => set("workoutDays", [1, 2, 4, 5])}
                  className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-400 hover:text-white"
                >
                  4d
                </button>
                <button
                  type="button"
                  onClick={() => set("workoutDays", [1, 2, 3, 4, 5])}
                  className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-400 hover:text-white"
                >
                  5d
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
                    <span className="text-[10px] opacity-75">{d.bengaliName.slice(0, 3)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className={labelCls}>Bangladeshi Diet Target (বাঙালি ডায়েট লক্ষ্য)</span>
            <Segmented<Goal | "recomp">
              value={draft.dietGoal ?? (draft.goal === "muscle" ? "muscle" : "recomp")}
              onChange={(v) => set("dietGoal", v)}
              options={[
                { value: "endurance", label: "Fat Loss (ওজন কমানো)" },
                { value: "muscle", label: "Muscle Gain (মাসল বৃদ্ধি)" },
                { value: "recomp", label: "Aesthetic Fit (বডি শেইপ)" },
              ]}
            />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Available Equipment</h3>
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
          <p className="text-[11px] text-zinc-500">Bodyweight movements are always included. Movements outside this list will never be programmed.</p>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Preferences & Safety</h3>
          <label className="flex min-h-[44px] items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 text-sm">
            <input
              type="checkbox"
              className="h-5 w-5 accent-emerald-500"
              checked={draft.lowImpact}
              onChange={(e) => set("lowImpact", e.target.checked)}
            />
            <span>
              Joint-friendly only
              <span className="block text-[11px] text-zinc-500">No jumping, plyometrics, or ballistic knee loading.</span>
            </span>
          </label>
          <div>
            <label className={labelCls} htmlFor="limits">Injuries or limitations (optional)</label>
            <textarea
              id="limits"
              rows={2}
              maxLength={300}
              className={`${inputCls} py-2`}
              placeholder="e.g. sore left knee, avoid overhead pressing, wrist discomfort"
              value={draft.limitations}
              onChange={(e) => set("limitations", e.target.value)}
            />
            <p className="mt-1 flex items-start gap-1.5 text-[11px] text-zinc-500">
              <ShieldAlert className="mt-0.5 h-3 w-3 shrink-0" />
              Treated as safety data by the coach to exclude conflicting movements.
            </p>
          </div>
        </section>

        {/* AI Key & Access Code Section */}
        <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-3.5">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">AI Key & Server Access</h3>
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
            <p className="mt-1 text-[11px] text-zinc-500">
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

        {error && <p className="text-sm text-amber-400">{error}</p>}

        <button
          type="submit"
          className="min-h-[48px] w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 font-bold text-zinc-950 transition-opacity hover:opacity-95"
        >
          {firstRun ? "Save and continue" : "Save profile"}
        </button>
      </form>
    </Sheet>
  );
}
