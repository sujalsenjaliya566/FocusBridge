import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#0E0F12",
        surface: "#16181D",
        borderSubtle: "#262933",
        textPrimary: "#EDEDF0",
        textMuted: "#9BA1B0",
        accentEmerald: "#10B981",
        accentAmber: "#F59E0B",
        accentRose: "#F43F5E",
      },
      fontFamily: {
        sans: ["var(--font-lexend)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
