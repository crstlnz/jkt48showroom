<script lang="ts" setup>
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

const MAX_RETRY = 2
const RETRY_DELAY = 1000
const container = ref<HTMLElement | null>()
const lazyImage = ref<HTMLImageElement | null>(null)
const isLoading = ref(false)
const hasError = ref(false)
const retry = ref(0)
const imageSrc = ref('')
let loadId = 0
let retryTimer: ReturnType<typeof setTimeout> | undefined
const targetIsVisible = useElementVisibility(container, { once: true })

const showLoader = computed(() => !targetIsVisible.value || isLoading.value)

function finish() {
  isLoading.value = false
  nextTick(() => emit('loaded', lazyImage.value))
}

function resetLoad() {
  clearTimeout(retryTimer)
  loadId++
  retry.value = 0
  imageSrc.value = ''
  hasError.value = false
  isLoading.value = false
}

function loadImage(delay = 0) {
  if (!targetIsVisible.value) return

  clearTimeout(retryTimer)
  if (delay) {
    retryTimer = setTimeout(() => loadImage(), delay)
    return
  }

  const currentLoadId = ++loadId
  const img = new Image()

  isLoading.value = true
  hasError.value = false

  img.onload = () => {
    if (currentLoadId !== loadId) return

    imageSrc.value = props.src
    finish()
  }

  img.onerror = () => {
    if (currentLoadId !== loadId) return

    if (retry.value < MAX_RETRY) {
      retry.value++
      loadImage(RETRY_DELAY)
      return
    }

    hasError.value = true
    imageSrc.value = props.errorImage ?? '/img/img-error.jpg'
    finish()
  }

  img.src = props.src
}

watch(targetIsVisible, (visible) => {
  if (visible) loadImage()
})

watch(() => props.src, () => {
  resetLoad()
  loadImage()
})

onBeforeUnmount(resetLoad)
</script>

<template>
  <div ref="container" class="relative">
    <Transition
      name="fade-abs"
      mode="in-out"
    >
      <div v-if="showLoader" key="loading" class="absolute inset-0 animate-pulse bg-gray-300 dark:bg-dark-2/80" />
      <div v-else class="absolute inset-0">
        <img
          key="loaded"
          ref="lazyImage"
          class="h-full w-full object-cover object-center"
          :alt="!hasError ? alt : 'Image Error'"
          :src="imageSrc"
          :draggable="draggable"
        >
      </div>
    </Transition>
  </div>
</template>
