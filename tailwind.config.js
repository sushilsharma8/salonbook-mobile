/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter_400Regular', 'system-ui', 'sans-serif'],
        display: ['Outfit_600SemiBold', 'system-ui', 'sans-serif'],
      },
      colors: {
        page: '#fafaf9',
      },
    },
  },
  plugins: [],
};
