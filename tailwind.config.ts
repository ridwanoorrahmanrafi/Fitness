import type { Config } from "tailwindcss";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#10b981",
          600: "#059669",
          900: "#064e3b",
          dark: "#090d16",
          card: "#111726",
          surface: "#182032",
          accent: "#0ea5e9",
        },
        // Retain hunter color tokens as aliases so any auxiliary classes don't break
        hunter: {
          dark: "#090d16",
          card: "#111726",
          blue: "#0ea5e9",
          purple: "#8b5cf6",
          gold: "#f59e0b",
        },
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          primary: "#10b981",
          secondary: "#0ea5e9",
          accent: "#8b5cf6",
          neutral: "#18181b",
          "base-100": "#090d16",
          "base-200": "#111726",
          "base-300": "#182032",
          info: "#38bdf8",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    logs: false,
  },
};
export default config;
