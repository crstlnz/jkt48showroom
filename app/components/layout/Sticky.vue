<script lang="ts" setup>
import type { breakpointsTailwind } from '@vueuse/core'

type key = keyof typeof breakpointsTailwind
const props = defineProps<{
  stopSticky?: key
}>()
const stickyElement = ref<HTMLElement>()
const stickyContainer = ref<HTMLElement>()
const marginElement = ref<HTMLElement>()
const lastScroll = ref<number>(0)
const { height } = useWindowSize()
const { greaterOrEqual } = useResponsive()
const scrollState = ref<'up' | 'down' | 'overflow' | null>()
const stopSticky = greaterOrEqual(props.stopSticky ?? 'xl')
useEventListener('resize', () => {
  scrollState.value = null
  if (stopSticky.value) {
    if (stickyElement.value && stickyContainer.value && marginElement.value) {
      marginElement.value.style.marginTop = ''
    }
  }
  else {
    calculateSticky()
  }
})

const padding = 40
function calculateSticky() {
  if (!stopSticky.value) return
  if (stickyElement.value && stickyContainer.value && marginElement.value) {
    const rect = stickyElement.value.getBoundingClientRect()
    const containerRect = stickyContainer.value.getBoundingClientRect()
    const pos = lastScroll.value
    lastScroll.value = window.scrollY
    if (height.value > stickyElement.value.clientHeight) {
      if (scrollState.value === 'overflow') return
      scrollState.value = 'overflow'
      marginElement.value.style.marginTop = ''
      stickyElement.value.style.top = `${stickyContainer.value.offsetTop}px`
    }
    else
      if (window.scrollY > pos) {
        marginElement.value.style.marginTop = `${rect.top - containerRect.top}px`
        if (scrollState.value === 'down') return
        scrollState.value = 'down'
        stickyElement.value.style.top = `-${stickyElement.value.clientHeight - height.value + padding}px`
        stickyElement.value.style.bottom = ''
      }
      else {
        if (scrollState.value === 'up') return
        marginElement.value.style.marginTop = `${rect.top - containerRect.top}px`
        scrollState.value = 'up'
        stickyElement.value.style.top = ''
        stickyElement.value.style.bottom = `-${stickyElement.value.clientHeight - height.value + stickyContainer.value.offsetTop}px`
      }
  }
}

useEventListener('scroll', () => {
  calculateSticky()
})
</script>

<template>
  <div ref="stickyContainer" class="relative flex shrink-0 flex-col">
    <div ref="marginElement" />
    <div ref="stickyElement" class="sticky">
      <slot />
    </div>
  </div>
</template>
