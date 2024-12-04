/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pumpkin: '#FF6700',
        antiFlashWhite: '#EBEBEB',
        silver: '#C0C0C0',
        biceBlue: '#3A6EA5',
        polynesianBlue: '#004E98'
      }
    },
  },
  plugins: [],
}