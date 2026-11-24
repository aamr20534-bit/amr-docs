/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef4fa',
          100: '#d5e3f3',
          200: '#adc9e7',
          300: '#7da8d8',
          400: '#4b82c4',
          500: '#2663ac',
          600: '#1d4ed8',
          700: '#163b6d',
          800: '#0f2942',
          900: '#0a1c2e',
          950: '#06121e',
        },
        royal: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'IBM Plex Sans Arabic', 'Segoe UI', 'Tahoma', 'sans-serif'],
        sans: ['Inter', 'Cairo', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 10px rgba(15, 41, 66, 0.06)',
        card: '0 4px 20px rgba(15, 41, 66, 0.08)',
        ribbon: '0 1px 4px rgba(15, 41, 66, 0.08)',
      },
    },
  },
  plugins: [],
};
