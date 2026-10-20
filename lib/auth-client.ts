import { createAuthClient } from "better-auth/react";
import { sentinelClient } from "@better-auth/infra/client";

/**
 * Better Auth Client for Browser & React Components
 */
export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [
    sentinelClient(),
  ],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
