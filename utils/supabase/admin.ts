import { createClient } from "@supabase/supabase-js";

/**
 * Creates an admin Supabase client with secret/service role capabilities.
 * ONLY use in server-side contexts (API routes, Server Actions, Background tasks).
 * Never expose this client to the browser.
 */
export function createAdminClient() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://vdaenqmujfpduvjmuxzm.supabase.co";

  const secretKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "";

  if (!secretKey) {
    throw new Error("Missing SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY on server.");
  }

  return createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
