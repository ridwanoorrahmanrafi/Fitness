// Bangladeshi Fitness Diet Engine - Scientifically calibrated for local foods and preferences

import type { Goal } from "./types";

export interface MealItem {
  name: string;
  bengaliName: string;
  portion: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  notes?: string;
}

export interface Meal {
  id: string;
  title: string;
  bengaliTitle: string;
  time: string;
  items: MealItem[];
  tips?: string;
}

export interface BangladeshiDietPlan {
  goalId: Goal | "recomp";
  title: string;
  bengaliTitle: string;
  description: string;
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterLiters: number;
  meals: Meal[];
  guidelines: string[];
  summary?: string;
  source?: "gemini" | "openai" | "dual_ai" | "local";
  groceryList?: string[];
  consensus?: import("./types").AiConsensus;
}

/**
 * Common Bangladeshi Food Database with macros per serving
 */
export const BANGLADESHI_FOODS = {
  // Grains & Carbs
  whiteRice: { name: "Cooked White Rice", bengaliName: "সাদা ভাত (১ কাপ / মাঝারি বাটি)", calories: 205, proteinG: 4, carbsG: 45, fatG: 0.5 },
  redRice: { name: "Lal Chaal Rice", bengaliName: "লাল চালের ভাত (১ কাপ)", calories: 215, proteinG: 5, carbsG: 45, fatG: 1.5 },
  attaRuti: { name: "Whole Wheat Atta Ruti", bengaliName: "আটার লাল রুটি (মাঝারি ১টি)", calories: 110, proteinG: 3.5, carbsG: 22, fatG: 0.8 },
  oatsKhichuri: { name: "Oats Vegetable Khichuri", bengaliName: "ওটস সবজি খিচুড়ি (১ বাটি)", calories: 220, proteinG: 8, carbsG: 38, fatG: 4 },
  muri: { name: "Puffed Rice (Muri)", bengaliName: "মুড়ি (১ কাপ)", calories: 60, proteinG: 1.5, carbsG: 13, fatG: 0.2 },
  chira: { name: "Flattened Rice (Chira)", bengaliName: "চিড়া ভেজানো (আধ কাপ)", calories: 140, proteinG: 2.5, carbsG: 31, fatG: 0.3 },

  // Proteins
  boiledEggWhole: { name: "Whole Boiled Egg", bengaliName: "সিদ্ধ ডিম (কুসুমসহ ১টি)", calories: 75, proteinG: 6.5, carbsG: 0.5, fatG: 5 },
  eggWhite: { name: "Boiled Egg White", bengaliName: "ডিমের সাদা অংশ (১টি)", calories: 17, proteinG: 3.8, carbsG: 0.2, fatG: 0.1 },
  chickenBreast: { name: "Chicken Breast / Curry", bengaliName: "মুরগির বুকের মাংস / কম তেলে কারি (১০০ গ্রাম)", calories: 165, proteinG: 31, carbsG: 0, fatG: 3.6 },
  deshiChicken: { name: "Deshi Chicken Curry", bengaliName: "দেশি মুরগির ঝোল (২ পিস / ৭৫ গ্রাম)", calories: 150, proteinG: 20, carbsG: 2, fatG: 6 },
  ruiFish: { name: "Rui / Katla Fish", bengaliName: "রুই বা কাতলা মাছের তরকারি (মাঝারি ১ পিস)", calories: 130, proteinG: 19, carbsG: 1, fatG: 5 },
  tilapiaFish: { name: "Tilapia / Pangas Fish", bengaliName: "তেলাপিয়া বা পাঙ্গাশ মাছ (১ পিস)", calories: 140, proteinG: 21, carbsG: 0, fatG: 5.5 },
  leanBeef: { name: "Lean Beef Curry", bengaliName: "চর্বি ছাড়া গরুর মাংস (২ ছোট টুকরা)", calories: 170, proteinG: 24, carbsG: 1, fatG: 7 },
  tokDoi: { name: "Plain Tok Doi (Yogurt)", bengaliName: "টক দই (১ কাপ / ১৫০ গ্রাম)", calories: 95, proteinG: 9, carbsG: 7, fatG: 3 },
  chanaBoiled: { name: "Boiled Black Chana", bengaliName: "সিদ্ধ কালো ছোলা / চানা (আধ বাটি)", calories: 140, proteinG: 7.5, carbsG: 22, fatG: 2.5 },
  chhatuDrink: { name: "Gram Flour Drink (Chhatu)", bengaliName: "ছাতুর শরবত (২ টেবিল চামচ ছাতু + পানি)", calories: 130, proteinG: 9, carbsG: 18, fatG: 2 },
  patlaDal: { name: "Mosur Dal (Thin)", bengaliName: "পাতলা মসুর ডাল (১ বাটি)", calories: 90, proteinG: 5, carbsG: 14, fatG: 1.5 },
  ghonoDal: { name: "Thick Mosur/Moong Dal", bengaliName: "ঘন মসুর বা মুগ ডাল (১ বাটি)", calories: 160, proteinG: 11, carbsG: 24, fatG: 2.5 },
  soyaChunks: { name: "Soya Chunks Curry", bengaliName: "সয়াবিন বড়ি কারি (৫০ গ্রাম শুকনো মাপ)", calories: 170, proteinG: 26, carbsG: 16, fatG: 0.5 },
  cowMilk: { name: "Low-fat Cow Milk", bengaliName: "গরুর দুধ (১ গ্লাস / ২৫০ মিলি)", calories: 120, proteinG: 8, carbsG: 12, fatG: 4 },
  peanuts: { name: "Roasted Peanuts", bengaliName: "ভাজা চিনাবাদাম (মুঠোভর্তি / ২৫ গ্রাম)", calories: 145, proteinG: 6.5, carbsG: 4, fatG: 12 },

  // Vegetables & Fiber
  leafyShak: { name: "Steamed Shak (Palong/Lal)", bengaliName: "শাক ভাজি কম তেলে (১ বাটি)", calories: 50, proteinG: 2.5, carbsG: 6, fatG: 2 },
  mixedSabji: { name: "Mixed Vegetable Labra", bengaliName: "পেঁপে, লাউ, পটল সবজি (১ বাটি)", calories: 65, proteinG: 2, carbsG: 11, fatG: 1.5 },
  cucumberSalad: { name: "Cucumber Tomato Salad", bengaliName: "শসা, টমেটো ও লেবুর সালাদ (১ প্লেট)", calories: 30, proteinG: 1.5, carbsG: 6, fatG: 0.2 },

  // Fruits
  banana: { name: "Sagor / Sabri Kola", bengaliName: "কলা (মাঝারি ১টি)", calories: 90, proteinG: 1.2, carbsG: 23, fatG: 0.3 },
  guava: { name: "Deshi Peyara (Guava)", bengaliName: "দেশি পেয়ারা (মাঝারি ১টি)", calories: 50, proteinG: 2, carbsG: 11, fatG: 0.8 },
  appleMalta: { name: "Apple or Malta", bengaliName: "আপেল বা মাল্টা (১টি)", calories: 70, proteinG: 0.8, carbsG: 18, fatG: 0.3 },
};

/**
 * Generate Bangladeshi diet chart tailored to weight, BMI, and fitness goal
 */
export function generateBangladeshiDiet(
  weightKg: number,
  tdeeKcal: number,
  goal: Goal | "recomp" = "recomp",
  bmiValue = 23
): BangladeshiDietPlan {
  const isLoss = goal === "endurance" || goal === "recomp" && bmiValue >= 25;
  const isBulk = goal === "muscle" && bmiValue < 25;

  let targetCalories: number;
  let proteinGrams: number;
  let title: string;
  let bengaliTitle: string;
  let description: string;
  let meals: Meal[] = [];

  if (isLoss) {
    // Weight Loss / Fat Loss Plan
    targetCalories = Math.max(1300, Math.round(tdeeKcal - 450));
    proteinGrams = Math.round(weightKg * 1.8);
    title = "Bangladeshi Fat Loss & Lean Sculpt";
    bengaliTitle = "ওজন কমানো ও ফ্যাট লস ডায়েট চার্ট";
    description = "ভাত ও তেলের পরিমাপ নিয়ন্ত্রণ রেখে উচ্চ প্রোটিন ও আঁশযুক্ত দেশীয় খাবারের সমন্বয়।";

    meals = [
      {
        id: "m_breakfast",
        title: "Breakfast (সকালের নাস্তা)",
        bengaliTitle: "সকাল ৮:০০ - ৮:৩০",
        time: "8:00 AM",
        items: [
          { ...BANGLADESHI_FOODS.attaRuti, portion: "২টি মাঝারি লাল আটার রুটি", calories: 220, proteinG: 7, carbsG: 44, fatG: 1.6 },
          { ...BANGLADESHI_FOODS.boiledEggWhole, portion: "১টি পুরো ডিম সিদ্ধ", calories: 75, proteinG: 6.5, carbsG: 0.5, fatG: 5 },
          { ...BANGLADESHI_FOODS.eggWhite, portion: "১টি ডিমের সাদা অংশ", calories: 17, proteinG: 3.8, carbsG: 0.2, fatG: 0.1 },
          { ...BANGLADESHI_FOODS.mixedSabji, portion: "১ বাটি তেল ছাড়া সবজি (লাউ/পেঁপে/পটল)", calories: 65, proteinG: 2, carbsG: 11, fatG: 1.5 },
        ],
        tips: "চিনি ছাড়া গ্রিন টি বা লাল চা খেতে পারেন। রুটি ভালো করে চিবিয়ে খান।",
      },
      {
        id: "m_midmorning",
        title: "Mid-Morning Snack (মধ্য সকাল)",
        bengaliTitle: "বেলা ১১:০০ - ১১:৩০",
        time: "11:00 AM",
        items: [
          { ...BANGLADESHI_FOODS.guava, portion: "১টি মাঝারি দেশি পেয়ারা বা আপেল", calories: 50, proteinG: 2, carbsG: 11, fatG: 0.8 },
          { ...BANGLADESHI_FOODS.peanuts, portion: "১ মুঠো ভাজা চীনা বাদাম (১০-১২টি)", calories: 80, proteinG: 3.5, carbsG: 2, fatG: 6 },
        ],
        tips: "পেয়ারা ক্ষুধা নিয়ন্ত্রণে ও মেটাবলিজম বাড়াতে দারুণ সাহায্য করে।",
      },
      {
        id: "m_lunch",
        title: "Lunch (দুপুরের খাবার)",
        bengaliTitle: "দুপুর ১:৩০ - ২:০০",
        time: "1:30 PM",
        items: [
          { ...BANGLADESHI_FOODS.whiteRice, portion: "১ কাপ ভাত (১০০-১১০ গ্রাম)", calories: 160, proteinG: 3.5, carbsG: 35, fatG: 0.4 },
          { ...BANGLADESHI_FOODS.chickenBreast, portion: "১ বাটি মুরগির মাংস (বুকের মাংস, কম ঝোল)", calories: 165, proteinG: 31, carbsG: 0, fatG: 3.6 },
          { ...BANGLADESHI_FOODS.ghonoDal, portion: "১ বাটি ঘন মসুর ডাল", calories: 140, proteinG: 10, carbsG: 21, fatG: 2 },
          { ...BANGLADESHI_FOODS.leafyShak, portion: "১ বাটি শাক (পালং/লাল শাক)", calories: 50, proteinG: 2.5, carbsG: 6, fatG: 2 },
          { ...BANGLADESHI_FOODS.cucumberSalad, portion: "বড় ১ প্লেট শসা ও টমেটোর সালাদ", calories: 30, proteinG: 1.5, carbsG: 6, fatG: 0.2 },
        ],
        tips: "খাবারের শুরুতে সালাদ ও শাক খেয়ে নিন, এতে ভাত কম খেলেও পেট অনেকক্ষণ ভরা থাকবে।",
      },
      {
        id: "m_snack",
        title: "Evening Snack / Pre-Workout (বিকেলের নাস্তা)",
        bengaliTitle: "বিকাল ৫:৩০ - ৬:০০",
        time: "5:30 PM",
        items: [
          { ...BANGLADESHI_FOODS.chanaBoiled, portion: "আধ বাটি সিদ্ধ ছোলা শসা-লেবু মাখানো", calories: 140, proteinG: 7.5, carbsG: 22, fatG: 2.5 },
          { name: "Black Coffee / Green Tea", bengaliName: "রং চা বা ব্ল্যাক কফি (চিনি ছাড়া)", portion: "১ কাপ", calories: 5, proteinG: 0.2, carbsG: 1, fatG: 0 },
        ],
        tips: "ওয়ার্কআউটের ৩০-৪০ মিনিট আগে খেলে দারুণ এনার্জি পাওয়া যায়।",
      },
      {
        id: "m_dinner",
        title: "Dinner (রাতের খাবার)",
        bengaliTitle: "রাত ৮:৩০ - ৯:০০",
        time: "8:30 PM",
        items: [
          { ...BANGLADESHI_FOODS.attaRuti, portion: "১টি আটার লাল রুটি (অথবা আধ কাপ ভাত)", calories: 110, proteinG: 3.5, carbsG: 22, fatG: 0.8 },
          { ...BANGLADESHI_FOODS.ruiFish, portion: "১ বড় পিস রুই বা কাতলা মাছের ঝোল", calories: 130, proteinG: 19, carbsG: 1, fatG: 5 },
          { ...BANGLADESHI_FOODS.patlaDal, portion: "১ বাটি পাতলা ডাল", calories: 90, proteinG: 5, carbsG: 14, fatG: 1.5 },
          { ...BANGLADESHI_FOODS.cucumberSalad, portion: "শসার সালাদ", calories: 20, proteinG: 1, carbsG: 4, fatG: 0.1 },
        ],
        tips: "ঘুমোতে যাওয়ার কমপক্ষে ১.৫ থেকে ২ ঘণ্টা আগে রাতের খাবার শেষ করুন।",
      },
    ];
  } else if (isBulk) {
    // Muscle Building & Hypertrophy Plan
    targetCalories = Math.round(tdeeKcal + 320);
    proteinGrams = Math.round(weightKg * 2.0);
    title = "Bangladeshi Muscle Building & Hypertrophy";
    bengaliTitle = "মাসল তৈরি ও বডি বিল্ডিং ডায়েট চার্ট";
    description = "দেশীয় উচ্চ প্রোটিন, ছাতু, ডিম, মুরগি ও মাছের সমন্বয়ে পরিষ্কার পেশি বৃদ্ধির খাবার।";

    meals = [
      {
        id: "m_breakfast",
        title: "Breakfast (সকালের নাস্তা)",
        bengaliTitle: "সকাল ৮:০০ - ৮:৩০",
        time: "8:00 AM",
        items: [
          { ...BANGLADESHI_FOODS.attaRuti, portion: "৩টি আটার লাল রুটি", calories: 330, proteinG: 10.5, carbsG: 66, fatG: 2.4 },
          { ...BANGLADESHI_FOODS.boiledEggWhole, portion: "২টি সিদ্ধ ডিম (কুসুমসহ)", calories: 150, proteinG: 13, carbsG: 1, fatG: 10 },
          { ...BANGLADESHI_FOODS.eggWhite, portion: "২টি ডিমের সাদা অংশ", calories: 34, proteinG: 7.6, carbsG: 0.4, fatG: 0.2 },
          { ...BANGLADESHI_FOODS.ghonoDal, portion: "১ বাটি ঘন ডাল বা সবজি", calories: 140, proteinG: 9, carbsG: 20, fatG: 2 },
        ],
        tips: "সকালে পর্যাপ্ত প্রোটিন মাসল রিকভারি দ্রুত শুরু করে।",
      },
      {
        id: "m_midmorning",
        title: "Mid-Morning Power Snack (মধ্য সকাল)",
        bengaliTitle: "বেলা ১১:০০",
        time: "11:00 AM",
        items: [
          { ...BANGLADESHI_FOODS.chhatuDrink, portion: "৩ টেবিল চামচ ছাতু + ১ গ্লাস পানিতে গুলে খাওয়া", calories: 180, proteinG: 13, carbsG: 26, fatG: 3 },
          { ...BANGLADESHI_FOODS.banana, portion: "১টি পাকা সাগর কলা", calories: 90, proteinG: 1.2, carbsG: 23, fatG: 0.3 },
        ],
        tips: "ছাতু হলো বাংলার প্রাকৃতিক হুই প্রোটিন—অল্প খরচে চমৎকার প্রোটিন উৎস।",
      },
      {
        id: "m_lunch",
        title: "Lunch (দুপুরের খাবার)",
        bengaliTitle: "দুপুর ১:৩০ - ২:০০",
        time: "1:30 PM",
        items: [
          { ...BANGLADESHI_FOODS.whiteRice, portion: "দেড় কাপ ভাত (১৫০ গ্রাম)", calories: 240, proteinG: 5, carbsG: 52, fatG: 0.6 },
          { ...BANGLADESHI_FOODS.chickenBreast, portion: "১৫০ গ্রাম মুরগির মাংস (বুকের মাংস)", calories: 230, proteinG: 42, carbsG: 0, fatG: 5 },
          { ...BANGLADESHI_FOODS.ghonoDal, portion: "১ বড় বাটি ঘন মসুর বা মুগ ডাল", calories: 160, proteinG: 11, carbsG: 24, fatG: 2.5 },
          { ...BANGLADESHI_FOODS.leafyShak, portion: "শাক ভাজি", calories: 50, proteinG: 2.5, carbsG: 6, fatG: 2 },
          { ...BANGLADESHI_FOODS.cucumberSalad, portion: "লেবু ও শসার সালাদ", calories: 30, proteinG: 1.5, carbsG: 6, fatG: 0.2 },
        ],
        tips: "মুরগির বদলে সপ্তাহে ১-২ দিন গরুর চর্বিহীন মাংস বা ডিম যোগ করতে পারেন।",
      },
      {
        id: "m_snack",
        title: "Pre/Post Workout (বিকেলের নাস্তা)",
        bengaliTitle: "বিকাল ৫:৩০",
        time: "5:30 PM",
        items: [
          { ...BANGLADESHI_FOODS.cowMilk, portion: "১ গ্লাস গরুর দুধ", calories: 120, proteinG: 8, carbsG: 12, fatG: 4 },
          { ...BANGLADESHI_FOODS.peanuts, portion: "১ মুঠো চিনাবাদাম (২৫ গ্রাম)", calories: 145, proteinG: 6.5, carbsG: 4, fatG: 12 },
          { ...BANGLADESHI_FOODS.eggWhite, portion: "২টি ডিমের সাদা অংশ", calories: 34, proteinG: 7.6, carbsG: 0.4, fatG: 0.2 },
        ],
        tips: "ব্যায়ামের পর এই নাস্তা পেশি ক্ষয় রোধ করে প্রোটিন সংশ্লেষণ বাড়ায়।",
      },
      {
        id: "m_dinner",
        title: "Dinner (রাতের খাবার)",
        bengaliTitle: "রাত ৯:০০",
        time: "9:00 PM",
        items: [
          { ...BANGLADESHI_FOODS.attaRuti, portion: "২টি আটার লাল রুটি বা ১ কাপ ভাত", calories: 220, proteinG: 7, carbsG: 44, fatG: 1.6 },
          { ...BANGLADESHI_FOODS.ruiFish, portion: "২ পিস রুই / কাতলা / তেলাপিয়া মাছ", calories: 230, proteinG: 34, carbsG: 1, fatG: 9 },
          { ...BANGLADESHI_FOODS.patlaDal, portion: "১ বাটি ডাল", calories: 90, proteinG: 5, carbsG: 14, fatG: 1.5 },
          { ...BANGLADESHI_FOODS.tokDoi, portion: "৪-৫ চামচ টক দই", calories: 60, proteinG: 5, carbsG: 4, fatG: 2 },
        ],
        tips: "টক দই হজমশক্তি উন্নত করে এবং রাতে প্রোবায়োটিক সরবরাহ করে।",
      },
    ];
  } else {
    // Body Recomposition / "Look Good & Fit" Plan
    targetCalories = Math.round(tdeeKcal);
    proteinGrams = Math.round(weightKg * 1.7);
    title = "Bangladeshi Body Recomp & Aesthetic Fit";
    bengaliTitle = "ফিট, স্লিম ও এস্থেটিক বডি শেপ ডায়েট চার্ট";
    description = "পেটের মেদ কমিয়ে সুন্দর বডি শেইপ ও মাসল টোনিংয়ের জন্য আদর্শ সুষম বাঙালি খাবার।";

    meals = [
      {
        id: "m_breakfast",
        title: "Breakfast (সকালের নাস্তা)",
        bengaliTitle: "সকাল ৮:০০ - ৮:৩০",
        time: "8:00 AM",
        items: [
          { ...BANGLADESHI_FOODS.attaRuti, portion: "২টি আটার লাল রুটি", calories: 220, proteinG: 7, carbsG: 44, fatG: 1.6 },
          { ...BANGLADESHI_FOODS.boiledEggWhole, portion: "১টি সিদ্ধ ডিম (কুসুমসহ)", calories: 75, proteinG: 6.5, carbsG: 0.5, fatG: 5 },
          { ...BANGLADESHI_FOODS.eggWhite, portion: "১টি ডিমের সাদা অংশ", calories: 17, proteinG: 3.8, carbsG: 0.2, fatG: 0.1 },
          { ...BANGLADESHI_FOODS.mixedSabji, portion: "১ বাটি সবজি ভাজি (কম তেলে)", calories: 65, proteinG: 2, carbsG: 11, fatG: 1.5 },
        ],
        tips: "সকালে কুসুম গরম পানিতে লেবুর রস মিশিয়ে পান করা মেটাবলিজমের জন্য ভালো।",
      },
      {
        id: "m_midmorning",
        title: "Mid-Morning (মধ্য সকাল)",
        bengaliTitle: "বেলা ১১:০০",
        time: "11:00 AM",
        items: [
          { ...BANGLADESHI_FOODS.banana, portion: "১টি কলা বা পেয়ারা", calories: 80, proteinG: 1.5, carbsG: 20, fatG: 0.5 },
          { ...BANGLADESHI_FOODS.peanuts, portion: "১০-১২টি ভাজা বাদাম", calories: 75, proteinG: 3.2, carbsG: 2, fatG: 6 },
        ],
        tips: "চা-কফিতে চিনি ও কনডেন্সড মিল্ক একদম পরিহার করুন।",
      },
      {
        id: "m_lunch",
        title: "Lunch (দুপুরের খাবার)",
        bengaliTitle: "দুপুর ১:৩০ - ২:০০",
        time: "1:30 PM",
        items: [
          { ...BANGLADESHI_FOODS.whiteRice, portion: "১ বাটি ভাত (১ কাপ সমপরিমাণ)", calories: 180, proteinG: 4, carbsG: 40, fatG: 0.5 },
          { ...BANGLADESHI_FOODS.chickenBreast, portion: "১ বাটি মুরগির মাংস বা মাছের বড় পিস", calories: 180, proteinG: 30, carbsG: 0, fatG: 5 },
          { ...BANGLADESHI_FOODS.ghonoDal, portion: "১ বাটি ঘন ডাল", calories: 140, proteinG: 10, carbsG: 21, fatG: 2 },
          { ...BANGLADESHI_FOODS.leafyShak, portion: "যেকোনো সবুজ শাক", calories: 50, proteinG: 2.5, carbsG: 6, fatG: 2 },
          { ...BANGLADESHI_FOODS.cucumberSalad, portion: "শসা, গাজর ও টমেটোর সালাদ", calories: 30, proteinG: 1.5, carbsG: 6, fatG: 0.2 },
        ],
        tips: "ভাত বেশি না খেয়ে ডাল ও শাকসবজির অনুপাত বাড়িয়ে খাওয়ার অভ্যাস করুন।",
      },
      {
        id: "m_snack",
        title: "Evening Snack (বিকেলের নাস্তা)",
        bengaliTitle: "বিকাল ৫:৩০",
        time: "5:30 PM",
        items: [
          { ...BANGLADESHI_FOODS.chanaBoiled, portion: "১ কাপ সিদ্ধ ছোলা বা চানাচুরের বদলে মুড়ি-ছোলা", calories: 150, proteinG: 8, carbsG: 24, fatG: 2.5 },
          { ...BANGLADESHI_FOODS.tokDoi, portion: "৩-৪ চামচ টক দই", calories: 50, proteinG: 4.5, carbsG: 3.5, fatG: 1.5 },
        ],
        tips: "বাইরের তেলেভাজা সিঙ্গারা-সমুচা পরিহার করে ঘরের হালকা নাস্তা নিন।",
      },
      {
        id: "m_dinner",
        title: "Dinner (রাতের খাবার)",
        bengaliTitle: "রাত ৮:৩০ - ৯:০০",
        time: "8:30 PM",
        items: [
          { ...BANGLADESHI_FOODS.attaRuti, portion: "২টি আটার লাল রুটি", calories: 220, proteinG: 7, carbsG: 44, fatG: 1.6 },
          { ...BANGLADESHI_FOODS.ruiFish, portion: "১ পিস তাজা রুই বা কাতলা মাছের তরকারি", calories: 140, proteinG: 20, carbsG: 1, fatG: 5.5 },
          { ...BANGLADESHI_FOODS.mixedSabji, portion: "১ বাটি পেঁপে বা লাউ সবজি", calories: 60, proteinG: 2, carbsG: 10, fatG: 1 },
        ],
        tips: "রাতে অতিরিক্ত তেল-মসলাযুক্ত তরকারি এড়িয়ে হালকা ঝোল তরকারি খান।",
      },
    ];
  }

  // Calculate actual totals
  const totalCalories = meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.calories, 0), 0);
  const actualProtein = meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.proteinG, 0), 0);
  const actualCarbs = meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.carbsG, 0), 0);
  const actualFat = meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.fatG, 0), 0);

  const waterLiters = +(Math.max(2.5, Math.min(4.5, weightKg * 0.038))).toFixed(1);

  const guidelines = [
    "রান্নায় সোয়াবিন তেলের ব্যবহার কমিয়ে দিন (প্রতিজনের জন্য দিনে সর্বোচ্চ ২-৩ চা চামচ)।",
    "দুধ-চা এবং মিষ্টি পানীয় পরিহার করুন। চিনি ছাড়া লাল চা বা গ্রিন টি পান করুন।",
    "প্রোটিন বাড়াতে নিয়মিত ডিমের সাদা অংশ, ঘন ডাল এবং সাশ্রয়ী দেশি ছাতু ব্যবহার করুন।",
    "দৈনিক কমপক্ষে ৩ থেকে ৩.৫ লিটার বিশুদ্ধ পানি পান নিশ্চিত করুন।",
    "খাবার খাওয়ার সাথে সাথে পানি না খেয়ে ২০-৩০ মিনিট পর পানি পান করুন।",
    "বাইরের ফ্রায়েড ফুড, বিরিয়ানি ও প্রক্রিয়াজাত প্যাকেটজাত স্ন্যাকস সপ্তাহে ১ দিনের বেশি নয়।",
  ];

  return {
    goalId: goal,
    title,
    bengaliTitle,
    description,
    targetCalories: totalCalories,
    proteinGrams: Math.round(actualProtein),
    carbsGrams: Math.round(actualCarbs),
    fatGrams: Math.round(actualFat),
    waterLiters,
    meals,
    guidelines,
  };
}
