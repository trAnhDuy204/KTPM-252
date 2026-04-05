/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          300: "#e8c98a",
          400: "#d4a853",
          500: "#c9a96e",
          600: "#b8922e",
          700: "#9a7520",
        },
        zinc: {
          850: "#1c1c1e",
          950: "#0e0e0f",
        },
        surface: "var(--c-surface)",
        card: "var(--c-card)",
        raised: {
          DEFAULT: "rgb(var(--c-raised-rgb) / <alpha-value>)",
          2: "var(--c-raised-2)",
        },
        edge: {
          DEFAULT: "var(--c-edge)",
          md: "var(--c-edge-md)",
          str: "var(--c-edge-str)",
        },
        accent: {
          DEFAULT: "rgb(var(--c-accent-rgb) / <alpha-value>)",
          strong: "rgb(var(--c-accent-strong-rgb) / <alpha-value>)",
          soft: "rgb(var(--c-accent-soft-rgb) / <alpha-value>)",
          contrast: "var(--c-accent-contrast)",
        },
        success: {
          DEFAULT: "rgb(var(--c-success-rgb) / <alpha-value>)",
          soft: "rgb(var(--c-success-soft-rgb) / <alpha-value>)",
        },
        info: {
          DEFAULT: "rgb(var(--c-info-rgb) / <alpha-value>)",
          soft: "rgb(var(--c-info-soft-rgb) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--c-warning-rgb) / <alpha-value>)",
          soft: "rgb(var(--c-warning-soft-rgb) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--c-danger-rgb) / <alpha-value>)",
          soft: "rgb(var(--c-danger-soft-rgb) / <alpha-value>)",
        },
        hi: "var(--c-hi)",
        dim: "var(--c-dim)",
        muted: "var(--c-muted)",
        ghost: "var(--c-ghost)",
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      keyframes: {
        fadein: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        fadein: "fadein 0.4s ease forwards",
        "fadein-slow": "fadein 0.6s ease forwards",
      },
    },
  },
  plugins: [],
};
