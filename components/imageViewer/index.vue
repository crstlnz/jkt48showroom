<script lang="ts" setup>
import { ImageViewerZoom } from '#components'

const el = ref<HTMLElement>()
const imageProvider = useImage()

const isLocked = useScrollLock(el)
const image = ref<ImageViewerOptions>()

onMounted(() => {
  el.value = document.body
})

const isOpen = ref(false)

function open(_img: ImageViewerOptions) {
  image.value = {
    src: imageProvider(_img.src, { format: 'webp' }),
    alt: _img.alt,
  }

  isOpen.value = true
  isLocked.value = true
}

function close() {
  isOpen.value = false
  isLocked.value = false
}

defineExpose({
  open,
  close,
})
</script>

<template>
  <Transition name="fade">
    <ImageViewerZoom v-if="isOpen && image" :image="image" @exit="close" />
  </Transition>
</template>
