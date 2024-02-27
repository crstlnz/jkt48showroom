import type { PwaModuleOptions } from '@vite-pwa/nuxt'

const isDev = process.env.NODE_ENV === 'development'
export const pwa: PwaModuleOptions = {
  injectRegister: 'script',
  registerType: 'autoUpdate',
  strategies: 'generateSW',
  manifest: {
    name: 'JKT48 Showroom',
    short_name: 'NgidolKuy',
    theme_color: '#1e2124',
    description: 'Fanmade JKT48 Live Portal',
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
    offlineGoogleAnalytics: true,
    navigateFallback: '/offline',
    navigateFallbackAllowlist: [/^\/$/],
    navigationPreload: true,
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
    globPatterns: [
      '**/*.{json,ico,svg,ttf,woff,css,scss,js,html,txt,jpg,png,woff2,mjs,otf,ani}',
    ],
    runtimeCaching: [
      {
        urlPattern: '/offline',
        handler: 'CacheFirst',
        options: {
          cacheName: 'offline-page',
          expiration: {
            maxEntries: 1,
            maxAgeSeconds: 60 * 60 * 24 * 7, // <== 7 days
          },
        },
      },
      {
        urlPattern: '/',
        handler: 'NetworkFirst',
      },
      {
        urlPattern: '/member',
        handler: 'NetworkFirst',
        options: {
          cacheName: 'member-page',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 1, // <== 1 days
          },
        },
      },
      {
        urlPattern: /\.(js|css|woff|woff2|svg|png|jpg|gif|ico)$/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'assets-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /^https:\/\/api\.crstlnz\.my\.id\/api\/member\?group=[^&\s]+$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'member-data',
          cacheableResponse: {
            statuses: [0, 200],
          },
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 1, // <== 1 days
          },
        },
      },
      {
        urlPattern: /^https:\/\/api\.crstlnz\.my\.id\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'gstatic-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 31, // <== 31 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
  },
  //   client: {
  //     installPrompt: true,
  //     periodicSyncForUpdates: 3600,
  //   },
  devOptions: {
    enabled: isDev,
    suppressWarnings: true,
    navigateFallback: '/offline',
    navigateFallbackAllowlist: [/^\/$/],
    type: 'module',
  },
}
