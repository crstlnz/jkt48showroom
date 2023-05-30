// https://v3.nuxtjs.org/api/configuration/nuxt.config
const isDev = process.env.NODE_ENV === 'development'
export default defineNuxtConfig({
  routeRules: {
    '/api/showroom/members': { cors: true, cache: !isDev ? { maxAge: 21600, staleMaxAge: 1800 } : false },
    '/api/showroom/recent/**': { cors: true, cache: !isDev ? { maxAge: 3600, staleMaxAge: 360 } : false },
  },
  // auth: {
  //   globalAppMiddleware: true,
  // },
  app: {
    rootId: 'app',
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },
  runtimeConfig: {
    admin_ids: process.env.DISCORD_ADMINS,
    public: {
      baseURL: process.env.BASE_URL,
    },
  },
  watch: ['~/assets/css/tailwindcss.css'],
  modules: [
    '@nuxt/devtools',
    '@sidebase/nuxt-auth',
    '@nuxtjs/device',
    'nuxt-icon',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    // '@nuxtjs/html-validator',
    [
      '@pinia/nuxt',
      {
        autoImports: ['storeToRefs', 'defineStore', 'acceptHMRUpdate', 'skipHydrate'],
      },
    ],
  ],
  css: ['~/assets/css/fonts.scss', '~/assets/css/style.scss', '~/assets/css/transition.scss'],
  colorMode: {
    preference: 'dark',
    fallback: 'light',
    classSuffix: '',
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  i18n: {
    // baseUrl: process.env.BASE_URL,
    strategy: 'no_prefix',
    locales: [
      { code: 'en', iso: 'en-US', file: 'en.yaml', dir: 'ltr', name: 'EN' },
      { code: 'id', iso: 'id-ID', file: 'id.yaml', dir: 'ltr', name: 'ID' },
    ],
    langDir: 'locales',
    lazy: true,
    defaultLocale: 'en',
  },
  // htmlValidator: {
  //   usePrettier: true,
  //   logLevel: 'verbose',
  //   failOnError: false,
  //   options: {
  //     extends: ['html-validate:document', 'html-validate:recommended', 'html-validate:standard'],
  //     rules: {
  //       'svg-focusable': 'off',
  //       'no-unknown-elements': 'error',
  //       // Conflicts or not needed as we use prettier formatting
  //       'void-style': 'off',
  //       'no-trailing-whitespace': 'off',
  //       // Conflict with Nuxt defaults
  //       'require-sri': 'off',
  //       'attribute-boolean-style': 'off',
  //       'doctype-style': 'off',
  //       // Unreasonable rule
  //       'no-inline-style': 'off',
  //     },
  //   },
  // },
  typescript: {
    shim: false,
    strict: true,
    tsConfig: {
      compilerOptions: {
        moduleResolution: 'bundler',
      },
    },
  },
  nitro: {
    compressPublicAssets: true,
  },
  devtools: {
    enabled: true,
  },
})
