/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html','./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['SF Pro Text','SF Pro Display','Inter','system-ui','-apple-system','Segoe UI','Roboto','Ubuntu','Helvetica Neue','Arial','sans-serif'],
      },
      colors: { ink:'#0a0a0a', steel:'#1c1c1e', silver:'#f5f5f7', bluetint:'#0071e3' },
      boxShadow: {
        soft:'0 1px 2px rgba(0,0,0,.06), 0 10px 20px rgba(0,0,0,.06)',
        ring:'0 0 0 1px rgba(0,0,0,.06), 0 2px 8px rgba(0,0,0,.08)'
      },
      borderRadius: { xl2: '1.25rem' }
    }
  },
  plugins: []
}
