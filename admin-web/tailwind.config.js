/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      colors: {
        luxury: {
          black: '#0a0a0a',
          white: '#fafafa',
          gray: '#737373',
        },
      },
    },
  },
  plugins: [],
};
