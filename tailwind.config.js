/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#D1FF00',
        background: '#14161A',
        card: '#1E2128',
        'modal-header': '#0077FF',
      },
    },
  },
  plugins: [],
};
