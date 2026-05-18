/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
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
        textMuted: '#6B7280',
        textPrimary: '#1A1A2E',
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        title: ['1.5rem', { lineHeight: '2rem' }],
        section: ['1.125rem', { lineHeight: '1.75rem' }],
        body: ['1rem', { lineHeight: '1.5rem' }],
        caption: ['0.75rem', { lineHeight: '1rem' }],
      },
      maxWidth: {
        content: '720px',
      },
      boxShadow: {
        card: '0 1px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
