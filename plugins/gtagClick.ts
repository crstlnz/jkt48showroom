import type { Directive } from 'vue'
import { createClickEvent } from '~/utils/gtag'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('gtagClick', <Directive<HTMLElement, { label: string, category: string }>> {
    mounted(el, { value }) {
      el.onclick = () => {
        createClickEvent(value.label, value.category)
      }
    },
  })

  nuxtApp.vueApp.directive('socialClick', <Directive<HTMLElement, string>> {
    mounted(el, { value }) {
      el.onclick = () => {
        createClickEvent(value, 'social')
      }
    },
  })
})
