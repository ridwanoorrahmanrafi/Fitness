import type { Config } from "tailwindcss";

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
        hunter: {
          dark: "#020510",
          card: "#060d1f",
          blue: "#00d2ff",
          purple: "#7928ca",
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
          primary: "#06b6d4",
          secondary: "#3b82f6",
          accent: "#8b5cf6",
          neutral: "#090d1a",
          "base-100": "#020510",
          "base-200": "#080e22",
          "base-300": "#0f1738",
          info: "#38bdf8",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },
      "night",
      "synthwave",
      "cyberpunk",
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    logs: false,
  },
};
export default config;
