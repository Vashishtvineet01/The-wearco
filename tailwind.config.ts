import type { Config } from "tailwindcss";

/**
 * TheWearCo visual system v2 — cool stone + electric lime + teal.
 * Deliberately not purple-pastel / cream-serif / broadsheet.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: "#f3f4f6",
          100: "#e8eaee",
          200: "#d5d8e0",
          300: "#b8bdc9",
          400: "#8b91a1",
          500: "#5c6374",
          600: "#3f4554",
          700: "#2a2e3a",
          800: "#171a22",
          900: "#0a0b0f",
        },
        ink: {
          50: "#f4f5f7",
          100: "#e4e6eb",
          200: "#c5c9d2",
          300: "#9aa1b0",
          400: "#6e7689",
          500: "#4b5263",
          600: "#343a48",
          700: "#222632",
          800: "#141820",
          900: "#0c0e14",
          950: "#06070a",
        },
        signal: {
          lime: "#c6ff4a",
          limeInk: "#3a5208",
          coral: "#ff4d3d",
          // Legacy class names kept; mapped to teal so the site sheds purple.
          violet: "#14b8a6",
          violetInk: "#0f766e",
          sky: "#38bdf8",
          peach: "#fb923c",
          mint: "#2dd4bf",
        },
      },
      fontFamily: {
        sans: [
          "Manrope",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "Syne",
          "Manrope",
          "sans-serif",
        ],
        mono: [
          "'IBM Plex Mono'",
          "ui-monospace",
          "monospace",
        ],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      backgroundImage: {
        "gradient-aurora":
          "linear-gradient(135deg, #c6ff4a 0%, #14b8a6 48%, #0a0b0f 100%)",
        "gradient-aurora-soft":
          "linear-gradient(135deg, rgba(198,255,74,0.95) 0%, rgba(20,184,166,0.9) 55%, rgba(10,11,15,0.9) 100%)",
        "gradient-radial":
          "radial-gradient(circle at 50% 0%, rgba(198,255,74,0.22), transparent 60%)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "float-soft": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(1deg)" },
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "33%": { transform: "translate3d(40px,-30px,0) scale(1.08)" },
          "66%": { transform: "translate3d(-30px,20px,0) scale(0.95)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        marquee: "marquee 32s linear infinite",
        glow: "glow 2.4s ease-in-out infinite",
        float: "float 4.5s ease-in-out infinite",
        "float-soft": "float-soft 5.5s ease-in-out infinite",
        drift: "drift 22s ease-in-out infinite",
        "drift-slow": "drift 36s ease-in-out infinite",
        "gradient-shift": "gradient-shift 6s ease infinite",
        "fade-in-up": "fade-in-up 0.7s ease-out both",
        "fade-in": "fade-in 0.6s ease-out both",
        "spin-slow": "spin-slow 18s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
