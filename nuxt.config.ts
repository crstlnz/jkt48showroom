// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  ssr: true,
  app: {
    pageTransition: { name: "page", mode: "out-in" },
  },
  runtimeConfig: {
    public: {
      baseURL: process.env.BASE_URL,
    },
  },
  modules: [
    "@nuxtjs/i18n",
    "nuxt-icon",
    "@nuxtjs/google-fonts",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "@vueuse/nuxt",
    ["@pinia/nuxt"],
  ],
  css: ["~/assets/css/style.scss"],
  colorMode: {
    preference: "dark",
    fallback: "light",
    classSuffix: "",
  },
  googleFonts: {
    families: {
      Rubik: true,
      Roboto: true,
    },
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  build: {
    transpile: ["@headlessui/vue"],
  },
  vite: {
    server: {
      proxy: {
        "/api/user/profile": {
          target: "https://www.showroom-live.com/api/user/profile",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/user\/profile/, ""),
        },
      },
    },
  },
  i18n: {
    baseUrl: process.env.BASE_URL,
    strategy: "no_prefix",
    // locales: [
    //   { code: "en", iso: "en-US", file: "en.js", dir: "ltr", name: "EN" },
    //   { code: "id", iso: "id-ID", file: "id.js", dir: "ltr", name: "ID" },
    //   // { code: "en", iso: "en-US", file: "en.ts", dir: "ltr", name: "English" },
    //   // { code: "id", iso: "id-ID", file: "id.ts", dir: "ltr", name: "Bahasa Indonesia" },
    // ],
    // locales: ["en", "id"],
    // langDir: "locales/",
    // lazy: true,
    defaultLocale: "en",
    vueI18n: {
      numberFormats: {
        "en-US": {
          currency: {
            style: "currency",
            currency: "USD",
          },
        },
        "ja-JP": {
          currency: {
            style: "currency",
            currency: "JPY",
            currencyDisplay: "symbol",
          },
        },
        "id-ID": {
          currency: {
            style: "currency",
            currency: "IDR",
            currencyDisplay: "symbol",
          },
        },
      },
    },
  },
});
