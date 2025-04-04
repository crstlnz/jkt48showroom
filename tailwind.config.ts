/** @type {import('tailwindcss').Config} */

module.exports = {
  // content: ['components/**/*.{vue,js}', 'layouts/**/*.vue', 'pages/**/*.vue', 'assets/css/*.{scss,css}'],
  darkMode: 'class',
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      zIndex: {
        belowNav: '100',
        nav: '150',
        aboveNav: '200',
        notification: '300',
      },
      boxShadow: {
        all: '0 0 0 1600px rgba(0,0,0,0.65)',
        rounded: 'rgb(101 119 134 / 20%) 0px 0px 15px, rgb(101 119 134 / 15%) 0px 0px 3px 1px',
      },
      colors: {
        'dark-2': '#1e2124',
        'dark-1': '#282b30',
        'dark-3': '#36393e',
        'dark-4': '#424549',
        'second-1': '#7289da',
        'second-2': '#4698eb',
      },
    },
  },
}
