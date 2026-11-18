import type { Config } from "tailwindcss";

/**
 * TheWearCo visual system v3 — warm cream + red accents.
 * Background inspired by parchment/dot-grid; primary signal is red.
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
          50: "#f7f1e9",
          100: "#efe7db",
          200: "#e2d6c6",
          300: "#cfc0ab",
          400: "#a9947c",
          500: "#7a6a58",
          600: "#5a4e42",
          700: "#3d352d",
          800: "#241f1a",
          900: "#14110e",
        },
        ink: {
          50: "#f7f1e9",
          100: "#ebe3d8",
          200: "#d2c6b6",
          300: "#b0a090",
          400: "#857564",
          500: "#5c4f43",
          600: "#3f352c",
          700: "#2a231d",
          800: "#1a1511",
          900: "#100e0b",
          950: "#0a0806",
        },
        signal: {
          // Primary brand punch — red
          coral: "#e11d2e",
          // Legacy names remapped into the new system
          lime: "#e11d2e",
          limeInk: "#9f1239",
          violet: "#e11d2e",
          violetInk: "#be123c",
          sky: "#0ea5e9",
          peach: "#f59e0b",
          mint: "#059669",
        },
      },
      fontFamily: {
        sans: ["'Source Sans 3'", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'Source Sans 3'", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'Source Code Pro'", "ui-monospace", "monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      backgroundImage: {
        "gradient-aurora":
          "linear-gradient(135deg, #e11d2e 0%, #f59e0b 45%, #14110e 100%)",
        "gradient-aurora-soft":
          "linear-gradient(135deg, rgba(225,29,46,0.95) 0%, rgba(245,158,11,0.85) 55%, rgba(20,17,14,0.9) 100%)",
        "gradient-radial":
          "radial-gradient(circle at 50% 0%, rgba(225,29,46,0.14), transparent 60%)",
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
        "reveal-blur": {
          "0%": { opacity: "0", filter: "blur(6px)", transform: "translateY(12px)" },
          "100%": { opacity: "1", filter: "blur(0)", transform: "translateY(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "badge-pop": {
          "0%": { transform: "scale(0.6)" },
          "60%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" },
        },
        "diamond-pulse": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        "progress-fill": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
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
        "reveal-blur": "reveal-blur 0.65s ease-out both",
        "slide-in-left": "slide-in-left 0.45s ease-out both",
        "slide-in-right": "slide-in-right 0.45s ease-out both",
        "badge-pop": "badge-pop 0.35s ease-out both",
        "diamond-pulse": "diamond-pulse 2.8s ease-in-out infinite",
        "progress-fill": "progress-fill 6s linear both",
      },
    },
  },
  plugins: [],
};

export default config;
