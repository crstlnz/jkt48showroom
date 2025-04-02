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

const videoDimens = ref<{ width: number, height: number }>({ width: 0, height: 0 })
const containerDimens = ref<{ width: number, height: number }>({ width: 0, height: 0 })
const { width: vWidth, height: vHeight } = useElementSize(mediaPlayer)

watch([vWidth, vHeight], () => {
  containerDimens.value = {
    width: vWidth.value,
    height: vHeight.value,
  }
})

function onLoadedMetadata(ev: MediaLoadedMetadataEvent) {
  const videoEl = ev.target.$el?.querySelector('video')
  if (videoEl) {
    videoDimens.value = {
      height: videoEl.videoHeight ?? 0,
      width: videoEl.videoWidth ?? 0,
    }
  }
  if (videoEl && videoEl.videoHeight < videoEl.videoWidth) {
    videoLandscape.value = true
  }
  else {
    videoLandscape.value = false
  }
}

const id = useId()
const observer = ref<MutationObserver>()
const { rotate, rotation, videoScale, isRotateFeatureEnabled, reset } = useVideoRotate(videoDimens, containerDimens)
onMounted(() => {
  if (!mediaPlayer.value) return
  mediaPlayer.value.addEventListener('loaded-metadata', onLoadedMetadata)
  createRotateButton()

  observer.value = new MutationObserver((mutationsList) => {
    mutationsList.forEach(() => {
      if (isRotateFeatureEnabled.value) {
        createRotateButton()
      }
      else {
        deleteRotateButton()
      }
    })
  })

  observer.value.observe(mediaPlayer.value, { attributes: false, childList: true, subtree: true })
})

onUnmounted(() => {
  observer.value?.disconnect()
  mediaPlayer.value?.removeEventListener('loaded-metadata', onLoadedMetadata)
})

function createRotateButton() {
  const btn = document.querySelector(`#${id} media-rotate-button`)
  if (btn) return
  const fsBtns = Array.from(document.querySelectorAll('media-tooltip'))
  const fsBtn = fsBtns.find(i => i.querySelector('media-fullscreen-button'))
  if (!fsBtn) return
  const button = document.createElement('media-rotate-button')
  button.setAttribute('role', 'button')
  button.classList.add('vds-button')
  button.innerHTML = '<svg class="vds-icon" style="padding:4.5px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#ffffff" d="M4 2h3a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m16 13a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-9v-7zM14 4a8 8 0 0 1 8 8l-.06 1h-2.02l.08-1a6 6 0 0 0-6-6v3l-4-4l4-4z"/></svg>'

  button.addEventListener('click', () => {
    rotate()
  })

  fsBtn.before(button)
}

function deleteRotateButton() {
  const btn = document.querySelector(`#${id} media-rotate-button`)
  if (btn) btn.remove()
}

const videoLayouts = ref()
watch(() => isRotateFeatureEnabled.value && videoLayouts.value, () => {
  if (isRotateFeatureEnabled.value) {
    createRotateButton()
  }
  else {
    reset()
    deleteRotateButton()
  }
})

watch(rotation, () => {
  const video = mediaPlayer.value?.querySelector('video')
  if (video) {
    video.style.transform = `rotate(${rotation.value}deg) scale(${videoScale.value})`
  }
})
</script>

<template>
  <div class="size-full">
    <!-- eslint-disable-next-line vue/attribute-hyphenation -->
    <media-player :id="id" ref="mediaPlayer" playsInline :volume="volume" class="size-full [&_video]:size-full! [&_video]:transition-[transform,object-fit] [&_video]:duration-[400ms] ease-out" :title="props.title" :src="src" :class="{ landscape: videoLandscape, potrait: !videoLandscape }">
      <ClientOnly>
        <media-provider />
        <media-video-layout ref="videoLayouts" :thumbnails="props.thumbnails" />
      </ClientOnly>
    </media-player>
  </div>
</template>
