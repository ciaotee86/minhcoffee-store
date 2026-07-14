/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        coffee: {
          DEFAULT: '#4A2E24',
          50: '#F7F2EE',
          100: '#E8DDD3',
          200: '#D0BBA9',
          300: '#B3957D',
          400: '#8E6B54',
          500: '#6B4A38',
          600: '#4A2E24',
          700: '#3A241B',
          800: '#2D1B15',
          900: '#241B17',
        },
        roast: {
          DEFAULT: '#241B17',
          light: '#3A241B',
          dark: '#1A1310',
        },
        orange: {
          DEFAULT: '#C96F3B',
          light: '#D98A5C',
          dark: '#B05A2C',
          50: '#FBF0EA',
          100: '#F5DDD0',
          200: '#EBB89E',
          300: '#D98A5C',
          400: '#C96F3B',
          500: '#B05A2C',
          600: '#8E4823',
        },
        cream: {
          DEFAULT: '#F4EBDD',
          warm: '#F4EBDD',
          light: '#FAF5ED',
          dark: '#EBE0CE',
        },
        beige: {
          DEFAULT: '#E6D7C5',
          light: '#EFE5D6',
          dark: '#D4C3AC',
        },
        olive: {
          DEFAULT: '#7D8062',
          light: '#9AA082',
          dark: '#5F6347',
        },
        success: '#526B4E',
        error: '#A34736',
        muted: '#75665D',
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        hand: ['"Dancing Script"', 'cursive'],
      },
      fontSize: {
        'hero': ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'h2': ['clamp(2.25rem, 4vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        'h3': ['clamp(1.5rem, 2.5vw, 1.875rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
      },
      maxWidth: {
        'site': '1280px',
      },
      spacing: {
        'section': 'clamp(4rem, 10vw, 10rem)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in': 'fadeIn 0.5s ease forwards',
        'ring-in': 'ringIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'underline-draw': 'underlineDraw 0.7s cubic-bezier(0.65, 0, 0.35, 1) forwards',
        'float-soft': 'floatSoft 6s ease-in-out infinite',
        'stamp': 'stamp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px) rotate(-0.5deg)' },
          '100%': { opacity: '1', transform: 'translateY(0) rotate(0deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        ringIn: {
          '0%': { opacity: '0', transform: 'scale(0.8) rotate(-10deg)' },
          '100%': { opacity: 'var(--ring-opacity, 0.18)', transform: 'scale(1) rotate(-8deg)' },
        },
        underlineDraw: {
          '0%': { 'stroke-dashoffset': '100%' },
          '100%': { 'stroke-dashoffset': '0%' },
        },
        floatSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        stamp: {
          '0%': { opacity: '0', transform: 'scale(1.8) rotate(-15deg)' },
          '100%': { opacity: '0.85', transform: 'scale(1) rotate(-8deg)' },
        },
      },
      transitionTimingFunction: {
        'paper': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
