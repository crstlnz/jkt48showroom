import type { MaybeRefOrGetter } from 'vue'
// composables/useNavScroll.ts
import { useEventListener } from '@vueuse/core'
import { toValue } from 'vue'

export function useNavScroll(navBar: MaybeRefOrGetter<HTMLElement | undefined>) {
  const navShow = ref(true)
  const lastScroll = ref(0)
  const lastDirectionScroll = ref(0)
  const ticking = ref(false)

  const { isMobile } = useDevice()

  if (import.meta.client) {
    useEventListener(document, 'scroll', () => {
      if (ticking.value) return

      ticking.value = true
      requestAnimationFrame(() => {
        const navHeight = toValue(navBar)?.clientHeight ?? 0

        if (isMobile) {
          if (window.scrollY < navHeight) {
            navShow.value = true
          }
          else {
            const val = window.scrollY - lastScroll.value
            lastScroll.value = window.scrollY

            if (val !== 0) {
              if ((val > 0) !== (lastDirectionScroll.value > 0)) {
                lastDirectionScroll.value = val
              }
              else {
                lastDirectionScroll.value += val
              }

              if (Math.abs(lastDirectionScroll.value) > 30) {
                navShow.value = lastDirectionScroll.value < 0
              }
            }
          }
        }

        ticking.value = false
      })
    }, { passive: true })
  }

  return { navShow }
}
