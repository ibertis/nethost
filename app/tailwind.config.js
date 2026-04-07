/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        brand: { cyan: '#0ea5e9', blue: '#2563eb', dark: '#050914' },
      },
      keyframes: {
        'fade-up': {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: 0, transform: 'scale(0.92)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
        'draw-circle': {
          from: { strokeDashoffset: '283' },
          to: { strokeDashoffset: '0' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
          '100%': { transform: 'translateY(-120px) rotate(720deg)', opacity: 0 },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.4 },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease forwards',
        'scale-in': 'scale-in 0.35s ease forwards',
        'draw-circle': 'draw-circle 0.7s ease forwards',
        confetti: 'confetti 1.2s ease forwards',
        spin: 'spin 0.8s linear infinite',
        pulse: 'pulse 1.4s ease infinite',
      },
    },
  },
  plugins: [],
};
