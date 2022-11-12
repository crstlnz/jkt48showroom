import { DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller";
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("DynamicScroller", DynamicScroller);
  nuxtApp.vueApp.component("DynamicScrollerItem", DynamicScrollerItem);
});
