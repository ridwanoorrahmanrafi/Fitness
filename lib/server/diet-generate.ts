import { LlmDietSchema } from "../schemas";
import { generateBangladeshiDiet, type BangladeshiDietPlan } from "../diet";
import type { GenerateDietRequest } from "../types";
import type { ModelCaller } from "./generate";

export interface GenerateDietOptions {
  callModel?: ModelCaller;
  models?: string[];
}

export interface GenerateDietPlanOutput {
  diet: BangladeshiDietPlan;
  source: "gemini" | "openai" | "dual_ai" | "local";
  warning?: string;
}

export async function generateDietPlan(
  req: GenerateDietRequest,
  opts?: GenerateDietOptions,
): Promise<GenerateDietPlanOutput> {
  const isBn = req.language === "bn";

  // If no Gemini caller is configured, fallback to our deterministic local Bangladeshi engine
  if (!opts?.callModel || !opts.models || opts.models.length === 0) {
    const local = generateBangladeshiDiet(req.weightKg, req.tdee, req.goal, req.bmi);
    return {
      diet: {
        ...local,
        summary: isBn
          ? `দৈনিক ${local.targetCalories} ক্যালোরি ও ${local.proteinGrams} গ্রাম প্রোটিন সম্পন্ন বিজ্ঞানসম্মত দেশীয় খাবারের চার্ট।`
          : `Calibrated daily meal plan with ${local.targetCalories} kcal and ${local.proteinGrams}g protein using local foods.`,
        source: "local" as const,
        groceryList: [
          "লাল চাল বা লাল আটা",
          "দেশি মুরগি বা ব্রয়লার বুকের মাংস",
          "ডিম (১-২ ডজন)",
          "রুই, কাতলা বা পাঙ্গাশ মাছ",
          "মুগ ডাল বা মসুর ডাল",
          "কালো ছোলা ও চিড়া",
          "মৌসুমি শাকসবজি (পালং, ডাঁটা, লাউ, পেঁপে)",
          "টক দই",
        ],
      },
      source: "local" as const,
      warning: "Generated with local deterministic Bangladeshi diet engine (no AI key needed).",
    };
  }

  const system = `You are an elite clinical sports nutritionist and expert in authentic Bangladeshi cuisine and nutrition science.
Your job is to generate a personalized, culturally authentic 5-meal daily diet plan for a Bangladeshi person based on their exact biometrics, health goal, and budget/routine preferences.

CRITICAL NUTRITION RULES:
1. Target Calories: ${req.targetCalories} kcal (Maintenance TDEE is ${req.tdee} kcal).
2. Protein Target: ${Math.round(req.weightKg * (req.goal === "muscle" ? 1.8 : req.goal === "endurance" ? 1.5 : 1.6))}g.
3. Carbs & Fats: Balanced for energy and hormone support.
4. Food Items: Use real, affordable Bangladeshi foods (ভাত, রুটি, ডাল, ডিম, মাছ, মুরগি, ছোলা, মুড়ি, টকদই, শাকসবজি).
5. Household Measurements: Always specify exact local portions (e.g., "১ কাপ / মাঝারি বাটি", "২টি মাঝারি পিস", "১০০ গ্রাম").
6. Output Language: Write titles and meal names in natural bilingual format with clear Bengali (বাংলা).

Preferences & Notes:
- Goal: ${req.goal}
- Gender: ${req.gender}, Age: ${req.age}, Weight: ${req.weightKg}kg, Height: ${req.heightCm}cm, BMI: ${req.bmi}
- Selected Preferences: ${(req.preferences || []).join(", ") || "None"}
- Restrictions/Allergies: ${req.allergiesOrRestrictions || "None"}
- Budget Level: ${req.budgetLevel || "standard"}

Meals required (5 meals):
1. সকালের নাস্তা (Breakfast, 8:00 AM)
2. মিড-মর্নিং স্ন্যাক (Mid-Morning, 11:30 AM)
3. দুপুরের খাবার (Lunch, 2:00 PM)
4. বিকেলের নাস্তা (Evening Snack, 5:30 PM)
5. রাতের খাবার (Dinner, 8:30 PM)`;

  const prompt = `Generate the structured 5-meal Bangladeshi diet plan matching exactly ${req.targetCalories} kcal total. Provide meal-by-meal macro breakdowns, grocery shopping list, and 5 key Bangladeshi lifestyle/hydration guidelines.`;

  for (const model of opts.models) {
    try {
      const raw = await opts.callModel({
        model,
        system,
        prompt,
        schema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            bengaliTitle: { type: "STRING" },
            summary: { type: "STRING" },
            targetCalories: { type: "NUMBER" },
            proteinGrams: { type: "NUMBER" },
            carbsGrams: { type: "NUMBER" },
            fatGrams: { type: "NUMBER" },
            meals: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  id: { type: "STRING" },
                  title: { type: "STRING" },
                  bengaliTitle: { type: "STRING" },
                  time: { type: "STRING" },
                  items: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        name: { type: "STRING" },
                        bengaliName: { type: "STRING" },
                        portion: { type: "STRING" },
                        calories: { type: "NUMBER" },
                        proteinG: { type: "NUMBER" },
                        carbsG: { type: "NUMBER" },
                        fatG: { type: "NUMBER" },
                        notes: { type: "STRING" },
                      },
                      required: ["name", "bengaliName", "portion", "calories", "proteinG", "carbsG", "fatG"],
                    },
                  },
                  tips: { type: "STRING" },
                },
                required: ["id", "title", "bengaliTitle", "time", "items"],
              },
            },
            groceryList: { type: "ARRAY", items: { type: "STRING" } },
            guidelines: { type: "ARRAY", items: { type: "STRING" } },
          },
          required: ["title", "bengaliTitle", "summary", "targetCalories", "proteinGrams", "carbsGrams", "fatGrams", "meals", "guidelines"],
        },
      });

      const parsed = LlmDietSchema.safeParse(JSON.parse(raw));
      if (parsed.success) {
        return {
          diet: {
            ...parsed.data,
            goalId: req.goal,
            description: parsed.data.summary,
            waterLiters: Math.max(2.5, Math.round((req.weightKg * 0.038) * 10) / 10),
            source: "gemini" as const,
          },
          source: "gemini" as const,
        };
      }
    } catch (err) {
      console.warn(`Model ${model} failed for diet generation, trying next:`, err);
    }
  }

  // Graceful fallback to deterministic local plan if all AI calls fail
  const fallback = generateBangladeshiDiet(req.weightKg, req.tdee, req.goal, req.bmi);
  return {
    diet: {
      ...fallback,
      summary: isBn
        ? `দৈনিক ${fallback.targetCalories} ক্যালোরি সম্পন্ন দেশীয় সুষম খাবারের চার্ট।`
        : `Daily Bangladeshi balanced diet calibrated to ${fallback.targetCalories} kcal.`,
      source: "local" as const,
      groceryList: [
        "লাল চাল বা লাল আটা",
        "দেশি মুরগি বা ব্রয়লার বুকের মাংস",
        "ডিম",
        "রুই বা কাতলা মাছ",
        "মুগ ডাল বা মসুর ডাল",
        "ছোলা ও শসা-টমেটো",
        "টক দই",
      ],
    },
    source: "local" as const,
    warning: "AI generation quota or connection issue; generated with verified local nutrition engine.",
  };
}
