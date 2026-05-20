import type { Config } from 'tailwindcss';

// Design tokens — see Plan/06-UI-UX-Specification.md §2.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#5B5BD6',
        secondary: '#FF8A3D',
        star: '#FFC93C',
        success: '#3CC97A',
        danger: '#E5484D',
        bgLight: '#F6F7FB',
        surface: '#FFFFFF',
        textPrimary: '#1F2030',
        textMuted: '#6B6C7E',
      },
      fontFamily: {
        sans: ['Baloo 2', 'Nunito', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['34px', { lineHeight: '1.15', fontWeight: '700' }],
        title: ['24px', { lineHeight: '1.2', fontWeight: '700' }],
        section: ['18px', { lineHeight: '1.3', fontWeight: '600' }],
        body: ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['13px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(31, 32, 48, 0.08)',
        cardHover: '0 8px 24px rgba(91, 91, 214, 0.16)',
        pop: '0 4px 0 rgba(31, 32, 48, 0.14)',
      },
      maxWidth: {
        content: '960px',
      },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(0.94)', opacity: '0' },
          '60%': { transform: 'scale(1.015)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'fade-in-up': {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-7deg)' },
          '75%': { transform: 'rotate(7deg)' },
        },
        'star-pop': {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'scale(1.4) rotate(20deg)', opacity: '0' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-20vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(540deg)', opacity: '0' },
        },
        'pulse-grow': {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.25)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'pop-in': 'pop-in 260ms ease-out both',
        'fade-in-up': 'fade-in-up 320ms ease-out both',
        wiggle: 'wiggle 500ms ease-in-out',
        'star-pop': 'star-pop 900ms ease-out forwards',
        confetti: 'confetti-fall 1600ms linear forwards',
        'pulse-grow': 'pulse-grow 450ms ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
