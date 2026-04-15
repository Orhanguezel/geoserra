import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

const config = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        /* Shadcn/Radix token'ları */
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        /* Tailwind renk paletleri (emerald/cyan/amber erişimi için) */
        emerald: colors.emerald,
        cyan:    colors.cyan,
        amber:   colors.amber,
        teal:    colors.teal,
        indigo:  colors.indigo,
      },
      fontFamily: {
        sans:  ['var(--font-outfit)',     'Outfit',          'system-ui', 'sans-serif'],
        mono:  ['var(--font-jetbrains)',  'JetBrains Mono',  'Menlo',     'monospace'],
      },
      borderRadius: {
        lg:  'var(--radius)',
        md:  'calc(var(--radius) - 2px)',
        sm:  'calc(var(--radius) - 4px)',
        xl:  'calc(var(--radius) + 8px)',
        '2xl': '20px',
        '3xl': '28px',
      },
      backgroundImage: {
        'gradient-geo':  'linear-gradient(135deg, #10b981, #0ea5e9)',
        'gradient-hero': 'radial-gradient(ellipse 600px 600px at -10% -10%, rgba(16,185,129,0.15), transparent)',
        'gradient-emerald': 'linear-gradient(135deg, #10b981, #0d9668)',
        'gradient-cyan':    'linear-gradient(135deg, #0ea5e9, #0284c7)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'score-fill': {
          from: { strokeDashoffset: '251' },
          to:   { strokeDashoffset: 'var(--target-offset)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(1)',   opacity: '0.4' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
      },
      animation: {
        'accordion-down':   'accordion-down 0.2s ease-out',
        'accordion-up':     'accordion-up 0.2s ease-out',
        'fade-up':          'fade-up 0.5s ease-out forwards',
        'fade-in':          'fade-in 0.4s ease-out forwards',
        'score-fill':       'score-fill 1.2s ease-out forwards',
        float:              'float 6s ease-in-out infinite',
        'float-delayed':    'float 6s ease-in-out -2s infinite',
        'float-delayed-2':  'float 6s ease-in-out -4s infinite',
        'pulse-ring':       'pulse-ring 2s ease-out infinite',
        'pulse-slow':       'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer:            'shimmer 1.8s linear infinite',
      },
      boxShadow: {
        emerald:    '0 0 30px rgba(16,185,129,0.3)',
        'emerald-lg': '0 8px 32px rgba(16,185,129,0.35)',
        cyan:       '0 0 30px rgba(14,165,233,0.3)',
        card:       '0 16px 48px rgba(0,0,0,0.25)',
        'card-lg':  '0 20px 60px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
} satisfies Config;

export default config;
