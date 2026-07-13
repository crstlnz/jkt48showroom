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
  <Teleport to="body">
    <Transition name="imageviewer">
      <div v-if="isOpen && image" class="fixed inset-0 z-aboveNav imageviewer-root">
        <div class="absolute inset-0 bg-black/75 imageviewer-background" />
        <ImageViewerZoom class="imageviewer-zoom" :image="image" @exit="close" />
      </div>
    </Transition>
  </Teleport>
</template>
