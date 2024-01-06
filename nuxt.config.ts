const isDev = process.env.NODE_ENV === 'development'
console.log('API', process.env.API)
console.log('API UTILS', process.env.API_UTILS)
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
      api_second: process.env.API_UTILS,
    },
  },
  watch: ['~/assets/css/tailwindcss.css'],
  modules: [
    '@nuxtjs/partytown',
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
    plugins: ['relativeTime', 'utc', 'timezone', 'duration', 'localeData', 'localizedFormat', 'customParseFormat', 'isToday'],
    defaultLocale: 'en',
    defaultTimezone: 'Asia/Jakarta',
  },
  // gtag: {
  //   id: 'G-C92JVM8CR4',
  //   config: {
  //     isDev,
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
      { code: 'en', iso: 'en-US', file: 'en.yaml', dir: 'ltr', name: 'EN' },
      { code: 'id', iso: 'id-ID', file: 'id.yaml', dir: 'ltr', name: 'ID' },
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
    timeline: {
      enabled: true,
    },
  },
  image: {
    cloudinary: {
      baseURL: 'https://res.cloudinary.com/doig4w6cm/image/fetch/',
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
