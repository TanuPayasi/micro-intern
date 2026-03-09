/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        blush:    '#FADADD',
        lavender: '#EAE4F7',
        mint:     '#D4F5E2',
        sky:      '#D4EEFF',
        peach:    '#FFE8D6',
        cream:    '#FDF8F2',
        rose:     '#C9849A',
        plum:     '#8B6FAD',
        slate: {
          dark:  '#2D3142',
          mid:   '#4F5470',
          light: '#9396AB',
        },
      },
      boxShadow: {
        soft: '0 2px 12px rgba(45,49,66,0.06)',
        card: '0 4px 28px rgba(45,49,66,0.09)',
        glow: '0 0 0 3px rgba(201,132,154,0.15)',
      },
    },
  },
  plugins: [],
};
