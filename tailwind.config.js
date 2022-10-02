/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [`components/**/*.{vue,js}`, `layouts/**/*.vue`, `pages/**/*.vue`],
  // content: [
  //   "./components/**/*.{js,vue,ts}",
  //   "./layouts/**/*.vue",
  //   "./nuxt/layouts/**/*.vue",
  //   "./nuxt/pages/**/*.vue",
  //   "./nuxt/components/**/*.{js,vue,ts}",
  //   "./pages/**/*.vue",
  //   "./plugins/**/*.{js,ts}",
  //   // './nuxt.config.{js,ts}',
  // ],
  darkMode: "class",
  theme: {
    extend: {
      boxShadow: {
        all: "0 0 0 1600px rgba(0,0,0,0.65)",
        rounded: "rgb(101 119 134 / 20%) 0px 0px 15px, rgb(101 119 134 / 15%) 0px 0px 3px 1px",
      },
      colors: {
        "dark-1": "#1e2124",
        "dark-2": "#282b30",
        "dark-3": "#36393e",
        "dark-4": "#424549",
        "second-1": "#7289da",
        "second-2": "#4698eb",
      },
    },
  },
  plugins: [require("@headlessui/tailwindcss"), require("@tailwindcss/line-clamp")],
};
