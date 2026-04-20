/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./pages/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#080808",
        card: "#111111",
        elevated: "#1a1a1a",
        border: "#222222",
        "border-light": "#2d2d2d",
        primary: "#f0ebe0",
        secondary: "#888880",
        muted: "#444440",
        accent: "#e8c547",
        "accent-dim": "#b89a30",
        green: "#47c47a",
        red: "#e85447",
        blue: "#6ea8fe",
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        "card-lg": "20px",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        spin: "spin 0.8s linear infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
