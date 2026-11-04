/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"Inter"',
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        app: {
          bg: "rgb(var(--color-bg-rgb) / <alpha-value>)",
          surface: "rgb(var(--color-surface-rgb) / <alpha-value>)",
          "surface-secondary": "rgb(var(--color-surface-secondary-rgb) / <alpha-value>)",
          border: "rgb(var(--color-border-rgb) / <alpha-value>)",
          text: "rgb(var(--color-text-rgb) / <alpha-value>)",
          "text-secondary": "rgb(var(--color-text-secondary-rgb) / <alpha-value>)",
          "text-muted": "rgb(var(--color-text-muted-rgb) / <alpha-value>)",
          accent: "rgb(var(--color-accent-rgb) / <alpha-value>)",
          danger: "rgb(var(--color-danger-rgb) / <alpha-value>)",
          success: "rgb(var(--color-success-rgb) / <alpha-value>)",
        },
      },
      letterSpacing: {
        tightest: "-0.015em",
      },
    },
  },
  plugins: [],
};
