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
        xl: '12px',
        '2xl': '16px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(31, 32, 48, 0.08)',
      },
      maxWidth: {
        content: '960px',
      },
    },
  },
  plugins: [],
} satisfies Config;
