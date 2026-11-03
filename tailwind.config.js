/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Charcoal surfaces, from page background (900) up to borders (600).
        ink: { 900: "#0D1117", 800: "#161B22", 700: "#21262D", 600: "#30363D" },
        // The single bright accent used for actions and highlights.
        accent: "#C8F135",
      },
    },
  },
  plugins: [],
};
