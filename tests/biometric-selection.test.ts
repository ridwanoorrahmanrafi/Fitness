import { describe, expect, it } from "vitest";
import {
  LIMITS,
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
  toBengaliDigits,
} from "../lib/calc";
import { TRANSLATIONS } from "../lib/i18n";

describe("Biometric Selection Options & Formatters", () => {
  it("generates comprehensive options covering all standard human physiological limits", () => {
    // Age options
    expect(AGE_OPTIONS[0]).toBe(LIMITS.age.min);
    expect(AGE_OPTIONS[AGE_OPTIONS.length - 1]).toBe(LIMITS.age.max);
    expect(AGE_OPTIONS).toContain(24);

    // Height options
    expect(HEIGHT_CM_OPTIONS[0]).toBe(120);
    expect(HEIGHT_CM_OPTIONS[HEIGHT_CM_OPTIONS.length - 1]).toBe(220);
    expect(HEIGHT_CM_OPTIONS).toContain(175);
    expect(HEIGHT_FEET_OPTIONS).toEqual([4, 5, 6, 7]);
    expect(HEIGHT_INCHES_OPTIONS.length).toBe(12);

    // Weight options
    expect(WEIGHT_KG_OPTIONS[0]).toBe(35);
    expect(WEIGHT_KG_OPTIONS[WEIGHT_KG_OPTIONS.length - 1]).toBe(200);
    expect(WEIGHT_KG_OPTIONS).toContain(70);

    // Imperial Weight options
    expect(WEIGHT_LBS_OPTIONS[0]).toBe(75);
    expect(WEIGHT_LBS_OPTIONS[WEIGHT_LBS_OPTIONS.length - 1]).toBe(440);
    expect(WEIGHT_LBS_OPTIONS).toContain(154);
  });

  it("converts digits accurately to Bengali numerals", () => {
    expect(toBengaliDigits(24)).toBe("২৪");
    expect(toBengaliDigits(175)).toBe("১৭৫");
    expect(toBengaliDigits("70.5")).toBe("৭০.৫");
  });

  it("formats age option strings correctly in English and Bangla", () => {
    expect(formatAgeOption(25, "en")).toBe("25 years");
    expect(formatAgeOption(25, "bn")).toBe("২৫ বছর");
  });

  it("formats height option strings correctly with dual-unit awareness", () => {
    // 175 cm is 5'9"
    expect(formatHeightCmOption(175, "en")).toBe("175 cm (5'9\")");
    expect(formatHeightCmOption(175, "bn")).toBe("১৭৫ সেমি (৫'৯\")");

    // Imperial feet & inches
    expect(formatHeightFtOption(5, "en")).toBe("5 ft");
    expect(formatHeightFtOption(5, "bn")).toBe("৫ ফুট");
    expect(formatHeightInOption(9, "en")).toBe("9 in");
    expect(formatHeightInOption(9, "bn")).toBe("৯ ইঞ্চি");
  });

  it("formats weight option strings correctly with dual-unit awareness", () => {
    // 70 kg is ~154.3 lbs
    expect(formatWeightKgOption(70, "en")).toContain("70 kg");
    expect(formatWeightKgOption(70, "en")).toContain("154.3 lbs");
    expect(formatWeightKgOption(70, "bn")).toContain("৭০ কেজি");
    expect(formatWeightKgOption(70, "bn")).toContain("১৫৪.৩ পাউন্ড");

    // 154 lbs is ~69.9 kg
    expect(formatWeightLbsOption(154, "en")).toContain("154 lbs");
    expect(formatWeightLbsOption(154, "en")).toContain("69.9 kg");
    expect(formatWeightLbsOption(154, "bn")).toContain("১৫৪ পাউন্ড");
    expect(formatWeightLbsOption(154, "bn")).toContain("৬৯.৯ কেজি");
  });

  it("provides modeSelectOption and modeManualOption in translations for en and bn", () => {
    expect(TRANSLATIONS.en.modeSelectOption).toBe("Select");
    expect(TRANSLATIONS.en.modeManualOption).toBe("Type");
    expect(TRANSLATIONS.bn.modeSelectOption).toBe("নির্বাচন");
    expect(TRANSLATIONS.bn.modeManualOption).toBe("টাইপ");
  });
});
