<script lang="ts" setup>
import { getProxiedStream } from '~/utils/proxyStream'

const props = withDefaults(
  defineProps<{
    src: string
    useProxy?: boolean
    disableMuteButton?: boolean
  }>(),
  {
    disableMuteButton: false,
  },
)

const video = ref<HTMLMediaElement>()

const hls = ref()
const videoLoaded = ref(false)
const isMuted = ref(true)

function buffer() {
  if (import.meta.server) return
  if (Hls.isSupported() && video.value) {
    hls.value = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
    })
    hls.value.attachMedia(video.value)
    hls.value.loadSource(props.useProxy ? getProxiedStream(props.src) : props.src)
    hls.value.on(Hls.Events.BUFFER_CREATED, () => {
      videoLoaded.value = true
    })

    setTimeout(() => {
      if (video.value) video.value.muted = isMuted.value
    }, 600)
  }
}

function play() {
  if (import.meta.server) return
  if (video.value) {
    video.value.muted = isMuted.value
    video.value.play()
  }
}

function stop() {
  if (import.meta.server) return
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

defineExpose({ isMuted, play, stop, buffer, toggleMute })
</script>

<template>
  <div class="relative bg-black">
    <MuteButton v-if="!disableMuteButton" :is-muted="isMuted" @click="toggleMute" />
    <video ref="video" class="h-full w-full overflow-hidden bg-slate-200 object-cover opacity-0 transition-opacity duration-300 dark:bg-dark-1/70" :class="{ 'opacity-100': videoLoaded }" />
  </div>
</template>
