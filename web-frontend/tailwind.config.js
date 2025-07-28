const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#EAF1F8",  // Main primary color (light mode)
          light: "#ECF3F9",    // Lighter variant
          tint1: "#EFF4FA",    // Additional tint
          tint2: "#F1F6FA",
        },
        surface: {
          DEFAULT: "#FFFFFF",  // Light surface color
          dark: "#2E2E2E",     // Dark mode main background
          darkAlt: "#424242",  // Alternate dark mode background for cards and headers
          darkAccent: "#575757", // For secondary elements in dark mode
        },
        text: {
          DEFAULT: "#374151",  // Light mode text
          dark: "#E4E4E7",     // Dark mode text
          muted: "#9CA3AF",    // Secondary text
        },
      },
    },
  },
  plugins: [],
};
