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
          DEFAULT: '#102B46', // Deep Navy
          light: '#1B3D60',
          dark: '#0A1C2E',
        },
        secondary: {
          DEFAULT: '#315FCB', // Professional Blue
          light: '#4B77DE',
          dark: '#2448A2',
        },
        accent: {
          DEFAULT: '#159B86', // Healthcare Teal
          light: '#1EB8A0',
          dark: '#0E7363',
          50: '#F0FDF9',
        },
        slatebg: '#F6F8FB',
        textPrimary: '#182536',
        textSecondary: '#748094',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'card': '14px',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(16, 43, 70, 0.04), 0 1px 2px -1px rgba(16, 43, 70, 0.04)',
        'card': '0 4px 12px -2px rgba(16, 43, 70, 0.05), 0 2px 6px -2px rgba(16, 43, 70, 0.03)',
        'card-hover': '0 8px 24px -4px rgba(16, 43, 70, 0.08), 0 4px 10px -2px rgba(16, 43, 70, 0.04)',
      }
    },
  },
  plugins: [],
}
