import { betterAuth } from "better-auth";
import { dash } from "@better-auth/infra";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { mongoClient, mongoDb } from "./server/mongodb";

// Better Auth server instance backed by MongoDB Atlas
export const auth = betterAuth({
  database: mongodbAdapter(mongoDb, {
    client: mongoClient,
  }),
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    (typeof process.env.VERCEL_URL === "string"
      ? `https://${process.env.VERCEL_URL}`
      : "https://fitness-eight-virid.vercel.app"),
  trustedOrigins: [
    "https://fitness-eight-virid.vercel.app",
    "http://localhost:3000",
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`] : []),
  ],
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "arise_solo_leveling_better_auth_secret_hunter_system_key_2026_x99",
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
    minPasswordLength: 6,
  },
  user: {
    additionalFields: {
      hunterRank: {
        type: "string",
        required: false,
        defaultValue: "E-RANK",
        input: true,
      },
      hunterTitle: {
        type: "string",
        required: false,
        defaultValue: "The Awakened",
        input: true,
      },
    },
  },
  plugins: [
    dash({
      apiKey: process.env.BETTER_AUTH_API_KEY || "ba_yj4gvi7bpg0ml6oy31hgvpauuchtlpsw",
    }),
  ],
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
