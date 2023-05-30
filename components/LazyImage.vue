<script lang="ts" setup>
import { useImage } from '@vueuse/core'

const props = withDefaults(defineProps<{
  src: string
  alt: string
  transparent?: boolean
}>(), {
  transparent: false,
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
      <div v-if="isLoading" key="loading" class="dark:bg-dark-2/80 absolute inset-0 animate-pulse bg-gray-300" />
      <div v-else class="absolute inset-0">
        <img
          key="loaded"
          ref="lazyImage"
          class="h-full w-full object-cover object-center"
          :alt="!error ? alt : 'Image Error'"
          :src="!error ? src : '/img/img-error.jpg'"
          loading="lazy"
        >
      </div>
    </Transition>
  </div>
</template>
