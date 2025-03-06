import swc from 'unplugin-swc'
import { vite as vidstack } from 'vidstack/plugins'

const isDev = process.env.NODE_ENV === 'development'

export default defineNuxtConfig({
  app: {
    head: {
      script: [
        {
          async: true,
          src: 'https://www.googletagmanager.com/gtag/js?id=G-C92JVM8CR4',
        },
        {
          children: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-C92JVM8CR4', { 'debug_mode' : ${isDev} });
            window.gtag = gtag
          `,
        },
      ],
    },
    rootId: 'app',
    layoutTransition: { name: 'layout', mode: 'out-in' },
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  runtimeConfig: {
    public: {
      isDev,
      cloudinary: process.env.CLOUDINARY_BASE_URL,
      api: process.env.API,
      showroom_api: process.env.SHOWROOM_API,
      proxy: process.env.PROXY,
    },
  },
  watch: ['~/assets/css/tailwindcss.css'],
  modules: [
    '@nuxt/image',
    'floating-vue/nuxt',
    'nuxt-security',
    'dayjs-nuxt',
    '@nuxtjs/device',
    '@nuxt/icon',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@nuxt/fonts',
    '@nuxt/eslint',
  ],
  icon: {
    mode: 'svg',
  },
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
            'script-src-attr': ['\'self\'', '\'nonce-{{nonce}}\''],
            'style-src': ['\'self\'', 'https:', '\'unsafe-inline\''],
            'script-src': [
              '\'self\'', // Fallback value, will be ignored by most modern browsers (level 3)
              'https:', // Fallback value, will be ignored by most modern browsers (level 3)
              '\'unsafe-inline\'', // Fallback value, will be ignored by almost any browser (level 2)
              '\'strict-dynamic\'', // Strict CSP via 'strict-dynamic', supported by most modern browsers (level 3)
              '\'nonce-{{nonce}}\'', // Enables CSP nonce support for scripts in SSR mode, supported by almost any browser (level 2)
            ],
            'upgrade-insecure-requests': true,
          }
        : false,
    },
    csrf: !isDev,
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
  future: {
    typescriptBundlerResolution: true,
  },
  experimental: {
    payloadExtraction: true,
    componentIslands: true,
    asyncContext: true,
    watcher: 'parcel',
  },
  // pwa: !isDev ? pwa : undefined,
  css: ['~/assets/css/style.scss', '~/assets/css/transition.scss', '~/assets/css/tailwindcss.css'],
  fonts: {
    provider: 'google',
  },
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
      { code: 'id', language: 'id-ID', file: 'id.yaml', dir: 'ltr', name: 'ID' },
      { code: 'en', language: 'en-US', file: 'en.yaml', dir: 'ltr', name: 'EN' },
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
    prerender: {
      routes: ['/about'],
    },
  },
  devtools: {
    enabled: false,
    timeline: {
      enabled: true,
    },
  },
  image: {
    provider: 'cloudinary',
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
  eslint: {
    config: {
      standalone: false,
    },
  },
  vue: {
    compilerOptions: {
      isCustomElement: tag => tag.startsWith('media-'),
    },
  },
  vite: {
    plugins: [
      vidstack({ include: /vidstack\// }),
      // Vite plugin
      swc.vite(),
      // Rollup plugin
      swc.rollup(),
    ],
  },
  compatibilityDate: '2024-08-31',
})
