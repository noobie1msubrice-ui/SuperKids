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
      },
      fontFamily: { sans: ['Nunito', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
