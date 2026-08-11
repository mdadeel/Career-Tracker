/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'SF Mono', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8', // color.surface.raised
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        surface: {
          DEFAULT: '#000000', // color.surface.base
          muted: '#f9fafb', // color.surface.muted
          raised: '#38bdf8', // color.surface.raised
        },
        ink: {
          DEFAULT: '#ffffff', // color.text.tertiary (on dark surface)
          secondary: '#111212', // color.text.secondary
          tertiary: '#ffffff', // color.text.tertiary
          inverse: 'oklch(0.373 0.034 259.733)', // color.text.inverse
        },
        // Dark mode surfaces (kept for compatibility)
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
      spacing: {
        '1': '2px',
        '2': '4px',
        '3': '6px',
        '4': '8px',
        '5': '12px',
        '6': '16px',
        '7': '20px',
        '8': '24px',
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
        'irfan-shadow': 'rgba(0, 0, 0, 0.15) 0px 12px 0px 0px',
      },
      fontSize: {
        'xs': '14px',
        'sm': '15px',
        'md': '16px',
        'lg': '18px',
        'xl': '30px',
        '2xl': '35px',
        '3xl': '44px',
        '4xl': '60px',
        'display': ['72px', { lineHeight: '72px', fontWeight: '500', letterSpacing: '-0.04em' }],
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
