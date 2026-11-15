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
          700: "#211f2c",
          800: "#161423",
          900: "#0f0d1a",
          950: "#0b0a14"
        },
        signal: {
          lime: "#d8ff36",
          coral: "#ff5c3b",
          violet: "#7c5cff",
          sky: "#7cd0ff",
          peach: "#ff9a6b",
          mint: "#5ee3b4"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "Inter", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"]
      },
      backgroundImage: {
        "gradient-aurora":
          "linear-gradient(135deg, #7c5cff 0%, #ff5c3b 50%, #d8ff36 100%)",
        "gradient-aurora-soft":
          "linear-gradient(135deg, rgba(124,92,255,0.9) 0%, rgba(255,92,59,0.85) 55%, rgba(216,255,54,0.85) 100%)",
        "gradient-radial":
          "radial-gradient(circle at 50% 0%, rgba(124,92,255,0.25), transparent 60%)"
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" }
        },
        glow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" }
        },
        drift: {
          "0%, 100%": {
            transform: "translate3d(0,0,0) scale(1)"
          },
          "33%": {
            transform: "translate3d(40px,-30px,0) scale(1.08)"
          },
          "66%": {
            transform: "translate3d(-30px,20px,0) scale(0.95)"
          }
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" }
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        }
      },
      animation: {
        marquee: "marquee 32s linear infinite",
        glow: "glow 2.4s ease-in-out infinite",
        float: "float 4.5s ease-in-out infinite",
        drift: "drift 22s ease-in-out infinite",
        "drift-slow": "drift 36s ease-in-out infinite",
        "gradient-shift": "gradient-shift 6s ease infinite",
        "fade-in-up": "fade-in-up 0.7s ease-out both",
        "fade-in": "fade-in 0.6s ease-out both",
        "spin-slow": "spin-slow 18s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
