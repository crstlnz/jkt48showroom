const url = process.env.IS_DEV ? "http://192.168.1.2:48" : process.env.API_URL;

export default {
  // Target: https://go.nuxtjs.dev/config-target
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: "jkt48showroom",
    htmlAttrs: {
      lang: "en"
    },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: "Website khusus informasi Showroom JKT48"
      }
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    "@nuxtjs/axios",
    "nuxt-lazy-load",
    ["cookie-universal-nuxt", { alias: "cookiz" }]
  ],
  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
  credentials: false,
  axios: {
    baseURL: url,
    credentials: false
  },
  loading: {
    color: "#ff4d4d",
    height: "4px"
  },
  srcDir: "nuxt/",
  pageTransition: "custom"
};
