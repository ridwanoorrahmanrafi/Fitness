import { GoogleGenAI } from "@google/genai";
import type { ModelCaller } from "./generate";

/** Defaults use Google's "latest" aliases so a retired dated model name cannot break the app. Override in .env. */
export function getModelChain(): string[] {
  const primary = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const fallback = process.env.GEMINI_FALLBACK_MODEL?.trim() || "gemini-2.0-flash";
  const models = [primary, fallback, "gemini-1.5-flash"];
  return [...new Set(models)];
}

export function createGeminiCaller(apiKey: string | undefined): ModelCaller | undefined {
  if (!apiKey) return undefined;
  const ai = new GoogleGenAI({ apiKey });
  return async ({ model, system, prompt, schema }) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25_000);
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: system,
          responseMimeType: "application/json",
          responseJsonSchema: schema,
          temperature: 0.5,
          maxOutputTokens: 4096,
          abortSignal: controller.signal,
        },
      });
      const text = response.text;
      if (!text) throw new Error("Empty response from the model.");
      return text;
    } finally {
      clearTimeout(timer);
    }
  };
}
