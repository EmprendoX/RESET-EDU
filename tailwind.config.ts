import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe7ff',
          200: '#bfd2ff',
          300: '#94b3ff',
          400: '#6489ff',
          500: '#3a5fff',
          600: '#1f3df5',
          700: '#1a30d8',
          800: '#1c2bae',
          900: '#1d2a8a',
          950: '#141a52',
        },
        ai: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        note: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        reset: {
          'bg-0': '#000000',
          'bg-1': '#0A0A0A',
          'bg-2': '#111111',
          'bg-3': '#1A1A1A',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-strong': 'rgba(255, 255, 255, 0.14)',
          'text-muted': '#A0A0A0',
          'text-dim': '#6B6B6B',
          red: '#FF1E1E',
          'red-2': '#FF4D4D',
          'red-dim': 'rgba(255, 30, 30, 0.18)',
          blue: '#1E4DFF',
          'blue-2': '#4A6FFF',
          success: '#3DDC97',
          danger: '#B91C1C',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        display: [
          'Plus Jakarta Sans',
          'DM Sans',
          'system-ui',
          'sans-serif',
        ],
        body: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      maxWidth: {
        prose: '70ch',
      },
      animation: {
        'pulse-soft': 'pulse 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
