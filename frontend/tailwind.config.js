/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        bg: "#09090B",
        surface: "#141414",
        surfaceHover: "#1E1E24",
        border: "#27272A",
        borderStrong: "#3F3F46",
        volt: "#D4FF00",
        voltDim: "#BCE600",
        danger: "#FF3B30",
        success: "#22C55E",
        txt: "#F4F4F5",
        sub: "#A1A1AA",
        muted: "#71717A",
      },
      fontFamily: {
        heading: ["Oswald", "sans-serif"],
        sans: ["Manrope", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        "scale-in": "scale-in 0.2s ease-out both",
      },
    },
  },
  plugins: [],
};
