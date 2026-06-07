import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7f7f7",
          100: "#e5e5e5",
          200: "#c2c2c2",
          300: "#9e9e9e",
          400: "#7a7a7a",
          500: "#525252",
          600: "#363636",
          700: "#1f1f1f",
          800: "#141414",
          900: "#0a0a0a",
          950: "#050505"
        },
        signal: {
          lime: "#d8ff36",
          coral: "#ff5c3b",
          violet: "#7c5cff",
          sky: "#7cd0ff"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "Inter", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"]
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" }
        },
        glow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" }
        }
      },
      animation: {
        marquee: "marquee 32s linear infinite",
        glow: "glow 2.4s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
