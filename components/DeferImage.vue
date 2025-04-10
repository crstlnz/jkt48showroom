<script lang="ts" setup>
import { useImage } from '@vueuse/core'

const props = withDefaults(defineProps<{
  src: string
  alt: string
  transparent?: boolean
  draggable?: boolean
  errorImage?: string
}>(), {
  transparent: false,
  draggable: true,
})
const emit = defineEmits<{ (e: 'loaded', img: HTMLImageElement | null): void }>()
const lazyImage = ref<HTMLImageElement | null>(null)
const src = computed(() => props.src)
const { isLoading, error } = useImage({ src: props.src })
watch(isLoading, (loading) => {
  if (!loading) {
    nextTick(() => {
      emit('loaded', lazyImage.value)
    })
  }
})
</script>

<template>
  <div class="relative">
    <Transition
      name="fade-abs"
      mode="in-out"
    >
      <div v-if="isLoading" key="loading" class="absolute inset-0 animate-pulse bg-gray-300 dark:bg-dark-2/80" />
      <div v-else class="absolute inset-0">
        <img
          key="loaded"
          ref="lazyImage"
          class="h-full w-full object-cover object-center"
          :alt="!error ? alt : 'Image Error'"
          :src="!error ? src : errorImage ?? '/img/img-error.jpg'"
          :draggable="draggable"
        >
      </div>
    </Transition>
  </div>
</template>
