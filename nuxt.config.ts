// https://v3.nuxtjs.org/api/configuration/nuxt.config
import id from "./locales/id";
import en from "./locales/en";
export default defineNuxtConfig({
  ssr: true,
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
    [
      "@pinia/nuxt",
      {
        autoImports: ["defineStore", "storeToRefs"],
      },
    ],
    // "@nuxtjs/html-validator",
    // "@nuxtjs/robots",
    // "@nuxtjs/sitemap",
  ],
  css: ["~/assets/css/style.scss"],
  // components: {
  //   global: true,
  //   dirs: ["~/components"],
  // },
  colorMode: {
    preference: "dark",
    fallback: "light",
    classSuffix: "",
  },
  serverMiddleware: [{ path: "/api", handler: "~/library/utils/dbCheck.ts" }],
  // nitro: {
  //   plugins: ["~/library/server.ts", "~/library/nitro.ts"],
  // },
  // env: {
  //   privateRuntimeConfig: {
  //     mongodbUri: process.env.MONGODB_URI,
  //   },
  // },
  googleFonts: {
    families: {
      Rubik: true,
      Roboto: true,
    },
  },
  // htmlValidator: {
  //   usePrettier: false,
  //   failOnError: false,
  //   options: {
  //     extends: ["html-validate:document", "html-validate:recommended", "html-validate:standard"],
  //     rules: {
  //       "svg-focusable": "off",
  //       "no-unknown-elements": "error",
  //       // Conflicts or not needed as we use prettier formatting
  //       "void-style": "off",
  //       "no-trailing-whitespace": "off",
  //       // Conflict with Nuxt defaults
  //       "require-sri": "off",
  //       "attribute-boolean-style": "off",
  //       "doctype-style": "off",
  //       // Unreasonable rule
  //       "no-inline-style": "off",
  //     },
  //   },
  // },
  // robots: [
  //   {
  //     UserAgent: "*",
  //     Disallow: "/recent  ",
  //     CrawlDelay: 60,
  //     Sitemap: (req) => `https://${req.headers.host}/sitemap.xml`,
  //   },
  // ],
  build: {
    transpile: ["@headlessui/vue"],
    postcss: {
      postcssOptions: {
        plugins: {
          tailwindcss: {},
          autoprefixer: {},
        },
      },
    },
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
    locales: [
      { code: "en", iso: "en-US", file: "en.yml", dir: "ltr", name: "English" },
      { code: "id", iso: "id-ID", file: "id.yml", dir: "ltr", name: "Bahasa Indonesia" },
    ],
    // locales: ["en", "id"],
    // langDir: "./locales/",
    defaultLocale: "en",
    vueI18n: {
      legacy: false,
      locale: "en",
      fallbackLocale: "en",
      availableLocales: ["en", "id"],
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
      // messages: {
      //   id,
      //   en,
      // },
    },
  },
});
