/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // Brand Blue
        secondary: '#0f172a', // Dark Sidebar
        aesthetic: {
          50: '#eff6ff', // Light card bg
          950: '#172554', // Deep sidebar bg
        }
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}