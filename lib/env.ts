import { z } from "zod";

/**
 * Server Environment Variables Schema
 * Validates all backend secrets and configuration at startup.
 * NEVER prints secret values to logs or console.
 */
export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  
  // Better Auth Core
  BETTER_AUTH_SECRET: z
    .string()
    .min(16, "BETTER_AUTH_SECRET must be at least 16 characters long for cryptographic security"),
  BETTER_AUTH_URL: z
    .string()
    .url("BETTER_AUTH_URL must be a valid URL (e.g. http://localhost:3000)")
    .default("http://localhost:3000"),
  BETTER_AUTH_API_KEY: z.string().optional(),

  // MongoDB Atlas Database
  MONGODB_URI: z.string().optional(),
  MONGODB_DB_NAME: z.string().default("fitness"),
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),

  // AI Intelligence Services (Optional: graceful offline builder fallback is enforced when absent)
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  // Access Control & Distributed Rate Limiting
  ACCESS_CODE: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

/**
 * Client Environment Variables Schema
 * Safely exposed to browser with NEXT_PUBLIC_ prefix.
 */
export const clientEnvSchema = z.object({
  NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

let cachedServerEnv: ServerEnv | null = null;
let cachedClientEnv: ClientEnv | null = null;

/**
 * Validates and returns server environment variables.
 * Fails fast with clear descriptive error messages if any required variable is missing.
 */
export function getServerEnv(): ServerEnv {
  if (cachedServerEnv) return cachedServerEnv;

  const raw = {
    NODE_ENV: process.env.NODE_ENV,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
    BETTER_AUTH_API_KEY: process.env.BETTER_AUTH_API_KEY,
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || "fitness",
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ACCESS_CODE: process.env.ACCESS_CODE,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  };

  const parsed = serverEnvSchema.safeParse(raw);
  if (!parsed.success) {
    const errorIssues = parsed.error.issues
      .map((i) => `  - [${i.path.join(".")}] ${i.message}`)
      .join("\n");
    throw new Error(
      `\n❌ [ENV VALIDATION ERROR] Server environment configuration is invalid:\n${errorIssues}\nCheck your .env.local file or deployment environment variables.\n`
    );
  }

  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}

/**
 * Validates and returns client environment variables.
 */
export function getClientEnv(): ClientEnv {
  if (cachedClientEnv) return cachedClientEnv;

  const raw = {
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  };

  const parsed = clientEnvSchema.safeParse(raw);
  if (!parsed.success) {
    const errorIssues = parsed.error.issues
      .map((i) => `  - [${i.path.join(".")}] ${i.message}`)
      .join("\n");
    throw new Error(
      `\n❌ [ENV VALIDATION ERROR] Client environment configuration is invalid:\n${errorIssues}\n`
    );
  }

  cachedClientEnv = parsed.data;
  return cachedClientEnv;
}
