// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  ssr: true,
  routeRules: {
    '/api/**': { cors: true }
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  runtimeConfig: {
    public: {
      IS_DEV: process.env.NODE_ENV === 'development',
      baseURL: process.env.BASE_URL
    }
  },
  modules: [
    // '@nuxt/devtools',
    '@nuxtjs/device',
    'nuxt-icon',
    '@nuxtjs/google-fonts',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/html-validator',
    [
      '@pinia/nuxt',
      {
        autoImports: ['storeToRefs', 'defineStore', 'acceptHMRUpdate', 'skipHydrate']
      }
    ]
  ],
  css: ['~/assets/css/style.scss'],
  colorMode: {
    preference: 'dark',
    fallback: 'light',
    classSuffix: ''
  },
  googleFonts: {
    families: {
      Rubik: true,
      Roboto: true
    }
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },
  build: {
    transpile: ['@headlessui/vue']
  },
  vite: {
    server: {
      proxy: {
        '/api/user/profile': {
          target: 'https://www.showroom-live.com/api/user/profile',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api\/user\/profile/, '')
        },
        '/api/room/status': {
          target: 'https://www.showroom-live.com/api/room/status',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api\/room\/status/, '')
        }
      }
    }
  },
  i18n: {
    baseUrl: process.env.BASE_URL,
    strategy: 'no_prefix',
    locales: [
      { code: 'en', iso: 'en-US', file: 'en.yaml', dir: 'ltr', name: 'EN' },
      { code: 'id', iso: 'id-ID', file: 'id.yaml', dir: 'ltr', name: 'ID' }
    ],
    langDir: 'locales',
    lazy: true,
    defaultLocale: 'en',
    vueI18n: {
      legacy: false,
      datetimeFormats: {
        en: {
          short: {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          },
          long: {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
            hour: 'numeric',
            minute: 'numeric'
          }
        },
        id: {
          short: {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          },
          long: {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
            hour: 'numeric',
            minute: 'numeric'
          }
        }
      },
      numberFormats: {
        'en-US': {
          currency: {
            style: 'currency',
            currency: 'USD'
          }
        },
        'ja-JP': {
          currency: {
            style: 'currency',
            currency: 'JPY',
            currencyDisplay: 'symbol'
          }
        },
        'id-ID': {
          currency: {
            style: 'currency',
            currency: 'IDR',
            currencyDisplay: 'symbol'
          }
        }
      }
    }
  },
  htmlValidator: {
    usePrettier: true,
    logLevel: 'verbose',
    failOnError: false,
    options: {
      extends: ['html-validate:document', 'html-validate:recommended', 'html-validate:standard'],
      rules: {
        'svg-focusable': 'off',
        'no-unknown-elements': 'error',
        // Conflicts or not needed as we use prettier formatting
        'void-style': 'off',
        'no-trailing-whitespace': 'off',
        // Conflict with Nuxt defaults
        'require-sri': 'off',
        'attribute-boolean-style': 'off',
        'doctype-style': 'off',
        // Unreasonable rule
        'no-inline-style': 'off'
      }
    }
  },
  typescript: {
    shim: false
  },
  nitro: {
    compressPublicAssets: true,
    prerender: {
      routes: ['/sitemap.xml']
    }
  }
})
