/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        navy: { 900: "#0B1B33", 800: "#12294A", 700: "#1B3A66" },
        volley: { orange: "#FF8A1F", yellow: "#FFD23F" },
      },
    },
  },
  plugins: [],
};
