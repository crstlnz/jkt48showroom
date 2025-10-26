<script setup lang="ts">
import { useWindowVirtualizer } from '@tanstack/vue-virtual'
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  items: any[]
  gap?: number
  estimateSize: () => number
}>(), {
  gap: 0,
})

const parentRef = ref<HTMLElement | null>(null)
const scrollMargin = ref(0)

const virtualizerOptions = computed(() => {
  return {
    count: props.items.length,
    estimateSize: () => props.estimateSize() + props.gap,
    overscan: 5,
    scrollMargin: scrollMargin.value,
  }
})

const virtualizer = useWindowVirtualizer(virtualizerOptions)

const virtualRows = computed(() => virtualizer.value.getVirtualItems())
watch(virtualizerOptions, () => {
  virtualizer.value.measure()
})

function onResize() {
  scrollMargin.value = parentRef.value?.offsetTop ?? 0
  nextTick(() => {
    requestAnimationFrame(() => {
      virtualizer.value.measure()
    })
  })
}

const resizeObserver = new ResizeObserver(onResize)
onMounted(() => {
  resizeObserver.observe(document.documentElement)
  onResize()
})

onUnmounted(() => {
  resizeObserver.disconnect()
})
</script>

<template>
  <div
    ref="parentRef"
  >
    <slot name="top" />
    <div
      :key="scrollMargin"
      class="relative"
      :style="{ height: `${virtualizer.getTotalSize()}px` }"
    >
      <div
        v-for="virtualRow in virtualRows"
        :key="String(virtualRow.key)"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${virtualRow.size}px`,
          transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
        }"
      >
        <slot :item="items[virtualRow.index]" :index="virtualRow.index" />
      </div>
    </div>
    <slot name="bottom" />
  </div>
</template>
