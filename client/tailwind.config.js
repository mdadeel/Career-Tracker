/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Geist', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'SF Mono', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f7fa',
          100: '#d9edf4',
          200: '#b3dbea',
          300: '#7dc1d9',
          400: '#4da6c7',
          500: '#3b6b8a',
          600: '#335972',
          700: '#2d4a5e',
          800: '#283e4f',
          900: '#253543',
          950: '#18222c',
        },
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9',
        },
        ink: {
          DEFAULT: '#0f172a',
          secondary: '#475569',
          tertiary: '#64748b',
          disabled: '#cbd5e1',
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
        sm: '0.375rem',
        DEFAULT: '0.5rem',
        md: '0.625rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        'elevated': '0 8px 24px -4px rgb(0 0 0 / 0.08), 0 2px 6px 0 rgb(0 0 0 / 0.04)',
        'dialog': '0 20px 48px -8px rgb(0 0 0 / 0.12), 0 4px 12px 0 rgb(0 0 0 / 0.08)',
      },
      fontSize: {
        'display': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '700', letterSpacing: '-0.025em' }],
        'heading': ['1.125rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        'body': ['0.875rem', { lineHeight: '1.5rem' }],
        'caption': ['0.75rem', { lineHeight: '1rem' }],
        'label': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.06em', fontWeight: '600' }],
        'stat': ['2.5rem', { lineHeight: '1', fontWeight: '700', letterSpacing: '-0.03em' }],
        'stat-lg': ['3.25rem', { lineHeight: '1', fontWeight: '700', letterSpacing: '-0.03em' }],
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
