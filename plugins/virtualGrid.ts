import Grid from 'vue-virtual-scroll-grid'
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('Grid', Grid)
})
