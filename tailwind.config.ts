import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./tools/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        backgroundDark: "#020617",
        electricBlue: "#38bdf8",
        neonPurple: "#a855f7",
        successGreen: "#10b981",
        warningAmber: "#f59e0b",
        errorRose: "#f43f5e"
      },
      boxShadow: {
        glow: "0 0 40px rgba(56, 189, 248, 0.18)",
        purpleGlow: "0 0 40px rgba(168, 85, 247, 0.16)"
      },
      backgroundImage: {
        "toolmind-gradient":
          "radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), transparent 32%), radial-gradient(circle at top right, rgba(168, 85, 247, 0.18), transparent 32%), linear-gradient(135deg, #020617 0%, #0f172a 45%, #111827 100%)"
      }
    }
  },
  plugins: []
};

export default config;
