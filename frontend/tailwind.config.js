/** @type {import('tailwindcss').Config} */
export default {
  content: [
  "./index.html",
  "./src/**/*.{js,jsx,ts,tsx}",
  ],
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