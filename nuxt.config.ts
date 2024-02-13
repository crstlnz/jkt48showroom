const isDev = process.env.NODE_ENV === 'development'
console.log('API', process.env.API)
export default defineNuxtConfig({
  app: {
    rootId: 'app',
    layoutTransition: { name: 'layout', mode: 'out-in' },
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  runtimeConfig: {
    public: {
      isDev,
      api: process.env.API,
      showroom_api: process.env.SHOWROOM_API,
    },
  },
  watch: ['~/assets/css/tailwindcss.css'],
  modules: [
    // '@nuxtjs/partytown',
    // '@vite-pwa/nuxt',
    // 'nuxt-lazy-load',
    '@nuxtjs/fontaine',
    'floating-vue/nuxt',
    'nuxt-security',
    'dayjs-nuxt',
    '@nuxtjs/device',
    'nuxt-icon',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@nuxt/image',
  ],
  // lazyLoad: {
  //   directiveOnly: true,
  // },
  security: {
    nonce: !isDev,
    headers: {
      permissionsPolicy: { fullscreen: '*' },
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: !isDev
        ? {
            'base-uri': ['\'none\''],
            'font-src': ['*', 'https:', 'data:'],
            'form-action': ['\'self\''],
            'frame-ancestors': ['\'self\''],
            'img-src': ['*', 'data:'],
            'object-src': ['\'none\''],
            'script-src-attr': ['\'none\''],
            'style-src': ['\'self\'', 'https:', '\'unsafe-inline\''],
            'script-src': ['\'self\'', 'https:', '\'unsafe-inline\'', '\'strict-dynamic\'', '\'nonce-{{nonce}}\''],
            'upgrade-insecure-requests': false,
          }
        : false,
    },
    csrf: false,
    xssValidator: false,
    requestSizeLimiter: {
      maxRequestSizeInBytes: 15000000,
      maxUploadFileRequestInBytes: 30000000,
    },
  },
  dayjs: {
    locales: ['en', 'id'],
    plugins: ['relativeTime', 'utc', 'timezone', 'duration', 'localeData', 'localizedFormat', 'customParseFormat', 'isToday', 'isTomorrow'],
    defaultLocale: 'en',
    defaultTimezone: 'Asia/Jakarta',
  },
  // pwa: {
  //   strategies: 'injectManifest',
  //   srcDir: './assets/worker',
  //   filename: 'sw.ts',
  //   registerType: 'prompt',
  //   manifest: {
  //     name: 'JKT48 Showroom',
  //     short_name: 'NgidolKuy',
  //     theme_color: '#1e2124',
  //     description: 'Fanmade JKT48 Live Portal',
  //     orientation: 'portrait',
  //     start_url: '/',
  //     icons: [
  //       {
  //         src: 'img/192x192-logo.png',
  //         sizes: '192x192',
  //         type: 'image/png',
  //       },
  //       {
  //         src: 'img/512x512-logo.png',
  //         sizes: '512x512',
  //         type: 'image/png',
  //       },
  //       {
  //         src: 'img/512x512-masklogo.png',
  //         sizes: '512x512',
  //         type: 'image/png',
  //         purpose: 'maskable',
  //       },
  //     ],
  //   },
  //   workbox: {
  //     navigateFallback: undefined,
  //     globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
  //   },
  //   client: {
  //     installPrompt: true,
  //     periodicSyncForUpdates: 3600,
  //   },
  //   devOptions: {
  //     enabled: isDev,
  //     suppressWarnings: true,
  //     navigateFallbackAllowlist: [/^\/$/],
  //     type: 'module',
  //   },
  // },
  css: ['~/assets/css/style.scss', '~/assets/css/transition.scss'],
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
    strategy: 'no_prefix',
    locales: [
      { code: 'id', iso: 'id-ID', file: 'id.yaml', dir: 'ltr', name: 'ID' },
      { code: 'en', iso: 'en-US', file: 'en.yaml', dir: 'ltr', name: 'EN' },
    ],
    langDir: 'locales',
    lazy: true,
    defaultLocale: 'id',
  },
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
    compressPublicAssets: {
      brotli: true,
    },
  },
  experimental: {
    componentIslands: true,
  },
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },
  image: {
    cloudinary: {
      baseURL: process.env.CLOUDINARY_BASE_URL,
    },
    quality: 80,
    placeholder: 10,
    format: ['webp'],
    screens: {
      'xs': 320,
      'sm': 640,
      'md': 768,
      'lg': 1024,
      'xl': 1280,
      'xxl': 1536,
      '2xl': 1536,
    },
  },
})
