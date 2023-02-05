// TODO di hp pas tekan tombol unmute nda auto close pas tekan live card yang lain
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
    hls.value.loadSource(props.src)
    hls.value.attachMedia(video.value)
    hls.value.on(Events.BUFFER_CREATED, () => {
      videoLoaded.value = true
    })

    setTimeout(() => {
      if (video.value)
        video.value.muted = isMuted.value
    }, 600)
  }
}

function play() {
  if (process.server)
    return
  if (video.value) {
    video.value.muted = isMuted.value
    video.value.play()
  }
}

function stop() {
  if (process.server)
    return
  if (hls.value) {
    hls.value.destroy()
    videoLoaded.value = false
    if (video.value)
      video.value.muted = true
  }
}

function toggleMute() {
  if (video.value) {
    video.value.muted = !video.value.muted
    isMuted.value = video.value.muted
  }
}

onMounted(() => {
  if (video.value)
    video.value.muted = true
})

defineExpose({ play, stop, buffer })
</script>

<template>
  <div class="bg-black aspect-video relative">
    <button type="button" aria-label="Mute/Unmute Button" class="aspect-square w-5 md:w-6 rounded-full flex justify-center items-center cursor-pointer select-none z-[25] bg-slate-500/30 hover:bg-slate-500/40 text-white absolute right-0 bottom-0 m-2 md:m-3 xl:m-4" @click="toggleMute">
      <Icon v-if="isMuted" name="ph:speaker-simple-slash-fill" />
      <Icon v-else name="ph:speaker-simple-high-fill" />
    </button>
    <video ref="video" class="w-full h-full transition-opacity duration-300 opacity-0 bg-slate-200 dark:bg-dark-1/70 overflow-hidden object-cover" :class="{ 'opacity-100': videoLoaded }" />
  </div>
</template>
