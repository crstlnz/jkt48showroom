import tailwindcss from '@tailwindcss/vite'
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
          innerHTML: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-C92JVM8CR4', { 'debug_mode' : ${isDev} });
            window.gtag = gtag
          `,
        },
      ],
      link: [
        {
          rel: 'preconnect',
          href: 'https://api.crstlnz.my.id',
          crossorigin: 'anonymous',
        },
      ],
    },
    rootId: 'app',
    layoutTransition: { name: 'layout', mode: 'out-in' },
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  runtimeConfig: {
    private: {
      jwt_secret: process.env.JWT_SECRET,
    },
    public: {
      isDev,
      cloudinary: process.env.CLOUDINARY_BASE_URL,
      api: process.env.API,
      showroom_api: process.env.SHOWROOM_API,
      proxy: process.env.PROXY,
      webviewAppPackages: process.env.WEBVIEW_APP_PACKAGES?.trim().split(',') ?? [],
    },
  },
  watch: ['~/assets/css/theme.css', '~/assets/css/style.css'],
  modules: [
    '@nuxt/image',
    'floating-vue/nuxt',
    'nuxt-security',
    'dayjs-nuxt',
    '@nuxtjs/device',
    '@nuxt/icon',
    // '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@nuxt/fonts',
    '@nuxt/scripts',
    '@vite-pwa/nuxt',
  ],
  icon: {
    mode: 'svg',
    serverBundle: 'remote',
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
            'img-src': ['*', 'data:', 'blob:'],
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
  pwa: {
    registerType: 'autoUpdate',
    client: {
      installPrompt: true,
    },
    includeAssets: [
      'favicon.ico',
      'img/192x192-logo.png',
      'img/512x512-logo.png',
      'img/512x512-masklogo.png',
    ],
    manifest: {
      id: '/',
      name: 'JKT48 Live',
      short_name: 'JKT48 Live',
      description: 'A Fanmade Website for JKT48 Live.',
      lang: 'id-ID',
      categories: ['entertainment', 'music'],
      theme_color: '#1e2124',
      background_color: '#1e2124',
      display: 'standalone',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/img/192x192-logo.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/img/512x512-logo.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/img/512x512-masklogo.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
      shortcuts: [
        {
          name: 'Home',
          short_name: 'Home',
          url: '/',
          icons: [
            {
              src: '/img/192x192-logo.png',
              sizes: '192x192',
              type: 'image/png',
            },
          ],
        },
        {
          name: 'Live Now',
          short_name: 'Live',
          url: '/?tab=live',
          icons: [
            {
              src: '/img/192x192-logo.png',
              sizes: '192x192',
              type: 'image/png',
            },
          ],
        },
        {
          name: 'Recent',
          short_name: 'Recent',
          url: '/recent',
          icons: [
            {
              src: '/img/192x192-logo.png',
              sizes: '192x192',
              type: 'image/png',
            },
          ],
        },
      ],
    },
    workbox: {
      cleanupOutdatedCaches: true,
      // Keep app shell fallback so `useOnline()` watcher can control redirect to /offline.
      navigateFallback: '/',
      navigateFallbackDenylist: [/^\/api\//],
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'html-pages-cache',
            networkTimeoutSeconds: 7,
            cacheableResponse: {
              statuses: [0, 200],
            },
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 7,
            },
          },
        },
        {
          urlPattern: /\/api\/_nuxt_icon\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'nuxt-icons-cache',
            cacheableResponse: {
              statuses: [0, 200],
            },
            expiration: {
              maxEntries: 128,
              maxAgeSeconds: 60 * 60 * 24 * 30,
            },
          },
        },
        {
          urlPattern: /^https:\/\/api\.crstlnz\.my\.id\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 10,
            cacheableResponse: {
              statuses: [0, 200],
            },
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24,
            },
          },
        },
        {
          urlPattern: /\/api\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'local-api-cache',
            networkTimeoutSeconds: 10,
            cacheableResponse: {
              statuses: [0, 200],
            },
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24,
            },
          },
        },
        {
          urlPattern: /^https:\/\/img\.crstlnz\.my\.id\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            cacheableResponse: {
              statuses: [0, 200],
            },
            expiration: {
              maxEntries: 300,
              maxAgeSeconds: 60 * 60 * 24 * 30,
            },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            cacheableResponse: {
              statuses: [0, 200],
            },
            expiration: {
              maxEntries: 30,
              maxAgeSeconds: 60 * 60 * 24 * 365,
            },
          },
        },
      ],
    },
  },
  css: ['~/assets/css/style.css', '~/assets/css/transition.css'],
  fonts: {
    provider: 'google',
  },
  colorMode: {
    preference: 'dark',
    fallback: 'light',
    classSuffix: '',
  },
  i18n: {
    baseUrl: process.env.BASE_URL,
    strategy: 'no_prefix',
    locales: [
      { code: 'id', language: 'id-ID', file: 'id.yaml', dir: 'ltr', name: 'ID' },
      { code: 'en', language: 'en-US', file: 'en.yaml', dir: 'ltr', name: 'EN' },
      { code: 'ja', language: 'ja-JP', file: 'jp.yaml', dir: 'ltr', name: 'JP' },
    ],
    langDir: 'locales',
    lazy: true,
    defaultLocale: 'id',
    vueI18n: '../i18n.config.ts',
    bundle: {
      optimizeTranslationDirective: false,
    },
  },
  build: {
    transpile: ['@vuepic/vue-datepicker'],
  },
  nitro: {
    replace: {
      'import process from \'node:process\';': '',
    },
    compressPublicAssets: {
      brotli: true,
    },
    prerender: {
      routes: ['/offline'],
    },
    rollupConfig: {
      external: ['@vueuse/core', '@vueuse/shared'],
    },
  },
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },
  image: {
    domains: ['img.crstlnz.my.id'],
    providers: {
      crstlnz: {
        name: 'crstlnz', // optional value to overrider provider name
        provider: '~/providers/crstlnz-img.ts', // Path to custom provider
        options: {
          // ... provider options
          baseURL: 'https://img.crstlnz.my.id',
        },
      },
    },
    quality: 80,
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
  vue: {
    compilerOptions: {
      isCustomElement: tag => tag.startsWith('media-'),
    },
  },
  vite: {
    plugins: [
      // @ts-expect-error vite 7
      vidstack({ include: /vidstack\// }),
      // @ts-expect-error vite 7
      tailwindcss(),
    ],
    optimizeDeps: {
      include: [
        '@use-gesture/vanilla',
        'popmotion',
        '@headlessui/vue',
        '@vueuse/integrations/useFuse',
        'horoscope',
        'fuse.js',
        'blaze-slider',
        '@vueuse/core',
      ],
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
  },
  compatibilityDate: '2025-10-26',
})
