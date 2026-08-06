/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Source Serif 4', 'Georgia', 'serif'],
        display: ['Source Serif 4', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'SF Mono', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        brand: {
          50: '#e6f0ff',
          100: '#c2daff',
          200: '#8ab8ff',
          300: '#4d94ff',
          400: '#1a78ff',
          500: '#0064FF',
          600: '#0052d6',
          700: '#0042ad',
          800: '#003585',
          900: '#002a6b',
          950: '#001a45',
        },
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#F2EFE8',
          tertiary: '#ece8de',
        },
        ink: {
          DEFAULT: '#000000',
          secondary: '#5F5F5F',
          tertiary: '#8a8a8a',
          disabled: '#c6c6c6',
        },
        // Dark mode surfaces (used via dark:)
        dark: {
          DEFAULT: '#0a0f1a',
          surface: '#111827',
          elevated: '#1e293b',
          border: '#1e293b',
          hover: '#1e293b',
          'surface-subtle': 'rgba(255,255,255,0.03)',
          'surface-elevated': 'rgba(255,255,255,0.06)',
          'surface-overlay': 'rgba(255,255,255,0.08)',
        },
      },
      borderRadius: {
        sm: '0px',
        DEFAULT: '0px',
        md: '0px',
        lg: '2px',
        xl: '2px',
        '2xl': '4px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        'elevated': '0 8px 24px -4px rgb(0 0 0 / 0.08), 0 2px 6px 0 rgb(0 0 0 / 0.04)',
        'dialog': '0 20px 48px -8px rgb(0 0 0 / 0.12), 0 4px 12px 0 rgb(0 0 0 / 0.08)',
      },
      fontSize: {
        'display': ['2.5rem', { lineHeight: '3rem', fontWeight: '800', letterSpacing: '-0.04em' }],
        'heading': ['1.125rem', { lineHeight: '1.5rem', fontWeight: '700' }],
        'body': ['0.875rem', { lineHeight: '1.5rem' }],
        'caption': ['0.75rem', { lineHeight: '1rem' }],
        'label': ['0.72rem', { lineHeight: '1rem', letterSpacing: '0.1em', fontWeight: '600', fontFamily: 'JetBrains Mono, monospace' }],
        'stat': ['2.5rem', { lineHeight: '1', fontWeight: '900', letterSpacing: '-0.04em' }],
        'stat-lg': ['3.25rem', { lineHeight: '1', fontWeight: '900', letterSpacing: '-0.04em' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-in-up': 'fadeInUp 0.35s ease-out',
        'slide-in-right': 'slideInRight 0.25s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'float-up': 'floatUp 0.6s ease-out both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
