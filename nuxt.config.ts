// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  ssr: true,
  runtimeConfig: {
    public: {
      baseURL: process.env.BASE_URL,
    },
  },
  modules: [
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
    "@nuxtjs/robots",
    "@nuxtjs/sitemap",
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
  nitro: {
    plugins: ["~/library/server.ts"],
  },
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
  htmlValidator: {
    usePrettier: false,
    failOnError: false,
    options: {
      extends: ["html-validate:document", "html-validate:recommended", "html-validate:standard"],
      rules: {
        "svg-focusable": "off",
        "no-unknown-elements": "error",
        // Conflicts or not needed as we use prettier formatting
        "void-style": "off",
        "no-trailing-whitespace": "off",
        // Conflict with Nuxt defaults
        "require-sri": "off",
        "attribute-boolean-style": "off",
        "doctype-style": "off",
        // Unreasonable rule
        "no-inline-style": "off",
      },
    },
  },
  robots: [
    {
      UserAgent: "*",
      Disallow: "/recent  ",
      CrawlDelay: 60,
      Sitemap: (req) => `https://${req.headers.host}/sitemap.xml`,
    },
  ],
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
});
