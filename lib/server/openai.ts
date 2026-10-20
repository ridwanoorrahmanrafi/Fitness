import OpenAI from "openai";
import type { ModelCaller } from "./generate";

/**
 * Returns available OpenAI models for structured generations and cross-checking.
 */
export function getOpenAIModelChain(): string[] {
  const primary = process.env.OPENAI_MODEL?.trim() || "gpt-4o";
  const fallback = process.env.OPENAI_FALLBACK_MODEL?.trim() || "gpt-4o-mini";
  return [...new Set([primary, fallback])];
}

/**
 * Factory creating a ModelCaller utilizing OpenAI's chat completions API.
 */
export function createOpenAICaller(apiKey: string | undefined): ModelCaller | undefined {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) return undefined;

  const client = new OpenAI({ apiKey: key });

  return async ({ model, system, prompt }) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25_000);
    try {
      const response = await client.chat.completions.create(
        {
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.4,
          max_tokens: 4096,
        },
        { signal: controller.signal }
      );

      const text = response.choices[0]?.message?.content;
      if (!text) throw new Error("Empty response from OpenAI.");
      return text;
    } finally {
      clearTimeout(timer);
    }
  };
}
