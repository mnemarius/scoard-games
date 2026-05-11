/** @type {import('tailwindcss').Config} */

const withAlpha = (cssVar) => `rgb(var(${cssVar}) / <alpha-value>)`;

const scale = (name) =>
  Object.fromEntries(
    [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((step) => [
      step,
      withAlpha(`--color-${name}-${step}`),
    ]),
  );

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: scale("primary"),
        accent: scale("accent"),
        success: scale("success"),
        warning: scale("warning"),
        danger: scale("danger"),
        neutral: scale("neutral"),
        surface: {
          DEFAULT: withAlpha("--color-surface"),
          raised: withAlpha("--color-surface-raised"),
          sunken: withAlpha("--color-surface-sunken"),
        },
        content: {
          DEFAULT: withAlpha("--color-content"),
          muted: withAlpha("--color-content-muted"),
          subtle: withAlpha("--color-content-subtle"),
          inverse: withAlpha("--color-content-inverse"),
        },
      },
    },
  },
  plugins: [],
};
