import { DynamicScroller, DynamicScrollerItem, RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('RecycleScroller', RecycleScroller)
  nuxtApp.vueApp.component('DynamicScroller', DynamicScroller)
  nuxtApp.vueApp.component('DynamicScrollerItem', DynamicScrollerItem)
})
