/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,jsx}',
  ],
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        sdms: {
          sidebar: '#0f172a',
          header:  '#0f172a',
          accent:  '#6366f1',
          surface: '#1e293b',
          muted:   '#334155',
        },
        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card':   '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-md':'0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        'card-lg':'0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
        'card-xl':'0 20px 25px -5px rgb(0 0 0 / 0.06), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
        'inner-sm': 'inset 0 1px 2px 0 rgb(0 0 0 / 0.04)',
        'glow-primary': '0 0 20px -5px rgb(99 102 241 / 0.25)',
        'glow-emerald': '0 0 20px -5px rgb(16 185 129 / 0.25)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.35s ease-out',
        'slide-up':   'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-in-left': 'slideInLeft 0.25s ease-out',
        'scale-in':   'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':  'spin 2s linear infinite',
        'float':      'float 6s ease-in-out infinite',
        'float-delay':'float 6s ease-in-out 2s infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn:      { from: { opacity: 0 },                                           to: { opacity: 1 } },
        fadeInUp:    { from: { opacity: 0, transform: 'translateY(12px)' },             to: { opacity: 1, transform: 'translateY(0)' } },
        slideUp:     { from: { opacity: 0, transform: 'translateY(8px)' },             to: { opacity: 1, transform: 'translateY(0)' } },
        slideInLeft: { from: { opacity: 0, transform: 'translateX(-8px)' },            to: { opacity: 1, transform: 'translateX(0)' } },
        scaleIn:     { from: { opacity: 0, transform: 'scale(0.95)' },                 to: { opacity: 1, transform: 'scale(1)' } },
        pulseSoft:   { '0%,100%': { opacity: 1 },                                      '50%': { opacity: 0.6 } },
        float:       { '0%, 100%': { transform: 'translateY(0px)' },                   '50%': { transform: 'translateY(-10px)' } },
        glow:        { from: { boxShadow: '0 0 15px -3px rgb(99 102 241 / 0.15)' },   to: { boxShadow: '0 0 25px -3px rgb(99 102 241 / 0.3)' } },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce-soft': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
