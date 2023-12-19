<script lang="ts" setup>
import Hls, { Events } from 'hls.js/dist/hls.min.js'

const props = defineProps<{ src: string }>()
const video = ref<HTMLMediaElement>()

const hls = ref()
const videoLoaded = ref(false)
const isMuted = ref(true)
function buffer() {
  if (process.server) return
  if (Hls.isSupported() && video.value) {
    hls.value = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
    })
    hls.value.attachMedia(video.value)
    hls.value.loadSource(props.src)
    hls.value.on(Events.BUFFER_CREATED, () => {
      videoLoaded.value = true
    })

    setTimeout(() => {
      if (video.value) video.value.muted = isMuted.value
    }, 600)
  }
}

function play() {
  if (process.server) return
  if (video.value) {
    video.value.muted = isMuted.value
    video.value.play()
  }
}

function stop() {
  if (process.server) return
  if (hls.value) {
    hls.value.destroy()
    videoLoaded.value = false
    if (video.value) video.value.muted = true
  }
}

function toggleMute() {
  if (video.value) {
    video.value.muted = !video.value.muted
    isMuted.value = video.value.muted
  }
}

onMounted(() => {
  if (video.value) video.value.muted = true
})

defineExpose({ play, stop, buffer })
</script>

<template>
  <div class="relative bg-black">
    <button type="button" aria-label="Mute/Unmute Button" class="absolute bottom-0 right-0 z-[25] m-2 flex aspect-square w-5 cursor-pointer select-none items-center justify-center rounded-full bg-slate-500/30 text-white hover:bg-slate-500/40 md:m-3 md:w-6 xl:m-4" @click="toggleMute">
      <Icon v-if="isMuted" name="ph:speaker-simple-slash-fill" />
      <Icon v-else name="ph:speaker-simple-high-fill" />
    </button>
    <video ref="video" class="h-full w-full overflow-hidden bg-slate-200 object-cover opacity-0 transition-opacity duration-300 dark:bg-dark-1/70" :class="{ 'opacity-100': videoLoaded }" />
  </div>
</template>
