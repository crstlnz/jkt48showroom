<script lang="ts" setup>
import type { MediaVolumeChangeEvent } from 'vidstack'
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
</script>

<template>
  <div class="size-full">
    <media-player :volume="volume" class="size-full [&_video]:size-full" plays-inline :title="props.title" :src="src">
      <ClientOnly>
        <media-provider />
        <media-video-layout :thumbnails="props.thumbnails" />
      </ClientOnly>
    </media-player>
  </div>
</template>
