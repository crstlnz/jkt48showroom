// https://v3.nuxtjs.org/api/configuration/nuxt.config
const isDev = process.env.NODE_ENV === 'development'
const allowedOrigins = ['https://jkt48-showroom.vercel.app']
export default defineNuxtConfig({
  routeRules: {
    '/api/showroom/**': { cache: !isDev ? { maxAge: 3600, staleMaxAge: 360 } : false },
    '/api/showroom/polling': { cache: false },
    '/api/showroom/members': { cache: !isDev ? { maxAge: 21600, staleMaxAge: 1800 } : false },
    '/api/showroom/recent': { cache: !isDev ? { maxAge: 1, staleMaxAge: 0 } : false },
    '/api/showroom/recent/**': { cache: !isDev ? { maxAge: 600, staleMaxAge: 10 } : false },
    '/api/member/birthday': { cache: !isDev ? { maxAge: 86400, staleMaxAge: 3600 } : false },
    '/api/showroom/records': { cache: !isDev ? { maxAge: 1800, staleMaxAge: 0 } : false },
    '/api/jpn_rates': { cache: !isDev ? { maxAge: 86400, staleMaxAge: 0 } : false },
    '/img/**': { cache: !isDev ? { maxAge: 86400, staleMaxAge: 3600 } : false },
    '/svg/**': { cache: !isDev ? { maxAge: 86400, staleMaxAge: 3600 } : false },
    '/api/auth/callback/credentials': {
      security: {
        rateLimiter: {
          tokensPerInterval: 5,
          interval: 'minute',
          fireImmediately: false,
        },
      },
    },
    // '/api/user/logins': {
    //   proxy: 'https://www.showroom-live.com/user/login',
    //   security: {
    //     rateLimiter: {
    //       tokensPerInterval: 5,
    //       interval: 'minute',
    //       fireImmediately: false,
    //     },
    //   },

  },
  // auth: {
  //   globalAppMiddleware: true,
  // },
  app: {
    rootId: 'app',
    layoutTransition: { name: 'layout', mode: 'out-in' },
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  runtimeConfig: {
    admin_ids: process.env.DISCORD_ADMINS,
    public: {
      baseURL: process.env.BASE_URL,
      isDev,
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'JKT48 Showroom',
      short_name: 'JKT48 Showroom',
      description: 'Fanmade JKT48 Showroom Log',
      orientation: 'portrait',
      start_url: '/',
      icons: [
        {
          src: 'img/192x192-logo.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'img/512x512-logo.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'img/512x512-masklogo.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      navigateFallback: undefined,
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600,
    },
    devOptions: {
      enabled: isDev,
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  },
  watch: ['~/assets/css/tailwindcss.css'],
  modules: [
    '@sidebase/nuxt-session',
    'nuxt-security',
    '@vite-pwa/nuxt',
    'dayjs-nuxt',
    'nuxt-gtag',
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
  security: {
    headers: false,
    csrf: false,
    corsHandler: {
      origin: allowedOrigins,
      methods: '*',
      credentials: true,
    },
    rateLimiter: {
      tokensPerInterval: 50,
      interval: 'minute',
      fireImmediately: false,
      throwError: true,
    },
    requestSizeLimiter: {
      maxRequestSizeInBytes: 3000000,
      maxUploadFileRequestInBytes: 12000000,
    },
  },
  dayjs: {
    locales: ['en', 'id'],
    plugins: ['relativeTime', 'utc', 'timezone', 'duration', 'localeData'],
    defaultLocale: 'en',
    defaultTimezone: 'Asia/Jakarta',
  },
  gtag: {
    id: 'G-C92JVM8CR4',
  },
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
  build: {
    transpile: ['@vuepic/vue-datepicker'],
  },
  nitro: {
    compressPublicAssets: true,
  },
  devtools: {
    enabled: true,
  },
})
