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
    },
  },
  plugins: [],
} satisfies Config;
