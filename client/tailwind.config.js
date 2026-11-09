/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B68E9', // Clean Royal/Periwinkle Blue from screenshot
          hover: '#2D56D8',
          dark: '#1E3A8A',
          light: '#EEF2FF',
        },
        navy: {
          DEFAULT: '#102B46',
          dark: '#0A1C2E',
        },
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#3B68E9',
          600: '#3B68E9',
          700: '#2D56D8',
          800: '#1E3A8A',
        },
        brandBlue: '#3B68E9',
        accentTeal: '#10B981',
        slatebg: '#F5F7FC',
        cardBg: '#FFFFFF',
        textDark: '#1E293B',
        textMuted: '#64748B',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '24px',
        '2xl': '18px',
        'xl': '14px',
      },
      boxShadow: {
        'soft': '0 10px 30px -5px rgba(59, 104, 233, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'modal': '0 25px 50px -12px rgba(16, 43, 70, 0.25)',
        'card': '0 2px 10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 12px 30px -4px rgba(59, 104, 233, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 25px rgba(59, 104, 233, 0.35)',
      }
    },
  },
  plugins: [],
}
