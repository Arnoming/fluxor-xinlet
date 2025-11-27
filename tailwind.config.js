/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#d97757',
        secondary: '#6b6b6b',
        accent: '#da7756',
        background: '#fcf7f1',
        surface: '#ffffff',
        muted: '#9e9e9e',
      },
      fontFamily: {
        heading: ['Merriweather', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}