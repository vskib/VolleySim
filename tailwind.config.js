
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Main interface: Navy
        ink: {
          950: "#080E1A",
          900: "#0D1628",
          800: "#142238",
          700: "#1E304B",
          600: "#30445F",
        },

        // Primary actions: Volleyball Orange
        accent: {
          DEFAULT: "#FF8A24",
          light: "#FFAD55",
          dark: "#E66B12",
        },

        // Secondary actions: Court Blue
        court: {
          DEFAULT: "#2563EB",
          light: "#60A5FA",
          dark: "#1D4ED8",
        },

        // Text colors
        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
          muted: "#64748B",
        },

        // Volleyball-inspired highlights
        ball: {
          yellow: "#FDE047",
          white: "#FFFFFF",
        },

        // Feedback and status
        success: "#22C55E",
        warning: "#FACC15",
        danger: "#EF4444",

        // Borders and dividers
        border: "#263750",
      },
    },
  },
  plugins: [],
};
