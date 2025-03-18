<script lang="ts" setup>
import type { MediaLoadedMetadataEvent, MediaVolumeChangeEvent } from 'vidstack'
import type { MediaPlayerElement } from 'vidstack/elements'
import 'vidstack/bundle'

const props = defineProps<{ title: string, src: string, thumbnails?: string }>()
const player = ref<MediaPlayerElement>()
const volume = useLocalStorage('volume', 100)
const hlsLoaded = ref(false)
const { load: loadHls } = useScriptTag(
  useAppConfig().hlsUrl,
  () => {
    hlsLoaded.value = true
  },
  {
    manual: true,
  },
)

const mediaPlayer = ref<MediaPlayerElement>()
const proxied = ref(false)
const proxyServers = ref(getProxyServer())
const proxyIndex = ref(0)

onMounted(async () => {
  await loadHls()
  player.value = document.querySelector('media-player') as MediaPlayerElement
})

useEventListener(player, 'hls-error', (event: any) => {
  if (event.detail.type === 'networkError') {
    if (!proxied.value) {
      proxied.value = true
    }
    else if (proxyIndex.value < proxyServers.value.length - 1) {
      proxyIndex.value += 1
    }
  }
})

useEventListener(player, 'volume-change', (e: MediaVolumeChangeEvent) => {
  volume.value = e.detail.volume
})

useEventListener(player, 'can-play', () => {
  play()
})

const src = computed(() => {
  return `${
    proxied.value ? `${proxyServers.value[proxyIndex.value] ?? ''}` : ''
  }${props.src}`
})

async function play(retry: number = 0, tryRetry = true) {
  if (import.meta.server) return
  if (!player.value) return
  try {
    await player.value.play()
  }
  catch (e) {
    if (!tryRetry) return
    if (retry < 5) {
      setTimeout(() => {
        play(retry + 1)
      }, 100)
    }
    else {
      player.value.muted = true
      play(retry + 1, false)
    }
    console.error(e)
  }
}

onBeforeUnmount(() => {
  player.value?.destroy()
})

const videoLandscape = ref(false)

function onLoadedMetadata(ev: MediaLoadedMetadataEvent) {
  const videoEl = ev.target.$el?.querySelector('video')
  if (videoEl && videoEl.videoHeight < videoEl.videoWidth) {
    videoLandscape.value = true
  }
  else {
    videoLandscape.value = false
  }
}

onMounted(() => {
  if (!mediaPlayer.value) return
  mediaPlayer.value.addEventListener('loaded-metadata', onLoadedMetadata)
})

onUnmounted(() => {
  mediaPlayer.value?.removeEventListener('loaded-metadata', onLoadedMetadata)
})
</script>

<template>
  <div class="size-full">
    <!-- eslint-disable-next-line vue/attribute-hyphenation -->
    <media-player ref="mediaPlayer" playsInline :volume="volume" class="size-full [&_video]:size-full" :title="props.title" :src="src" :class="{ landscape: videoLandscape, potrait: !videoLandscape }">
      <ClientOnly>
        <media-provider />
        <media-video-layout :thumbnails="props.thumbnails" />
      </ClientOnly>
    </media-player>
  </div>
</template>
