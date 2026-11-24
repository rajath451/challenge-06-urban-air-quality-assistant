/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        aqi: {
          good: '#059669',
          goodBg: '#ecfdf5',
          moderate: '#0284c7',
          moderateBg: '#f0f9ff',
          sensitive: '#f59e0b',
          sensitiveBg: '#fffbeb',
          unhealthy: '#ea580c',
          unhealthyBg: '#fff7ed',
          veryUnhealthy: '#dc2626',
          veryUnhealthyBg: '#fef2f2',
          hazardous: '#991b1b',
          hazardousBg: '#450a0a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
