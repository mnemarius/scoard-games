/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#efeae0",
          100: "#e2e1df",
          200: "#d0c1a9",
          400: "#a08561",
          500: "#7a4a2b",
          600: "#5c341e",
          700: "#2f180b",
        },
      },
    },
  },
  plugins: [],
};
