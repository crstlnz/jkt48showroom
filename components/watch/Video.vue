// TODO di hp pas tekan tombol unmute nda auto close pas tekan live card yang lain
<script lang="ts" setup>
import Hls, { Events } from 'hls.js/dist/hls.min.js'
import { useNotifications } from '~~/store/notifications'
useHead({
  link: [{ href: 'https://vjs.zencdn.net/8.0.4/video-js.css', rel: 'stylesheet' }],
  script: [{ src: 'https://vjs.zencdn.net/8.0.4/video.min.js' }]
})
const props = defineProps<{ sources: ShowroomAPI.StreamingURL[], poster: string }>()
const videoPlayer = ref<HTMLElement>()
const video = ref<HTMLVideoElement>()
const hls = ref()
const lowLatencyMode = ref(true)
const sources = ref(props.sources ?? [])
const tempVolume = useLocalStorage('data-volume', 0)
const isMuted = ref(false)
const mutedData = useLocalStorage('data-muted', false)
const isPlaying = ref(false)
const isLoading = ref(true)
const volume = ref(0)

function setVolume (v :any, forced = false) {
  const n = parseInt(v)
  if (video.value) {
    if (n === 0) {
      video.value.muted = true
      video.value.volume = 0
    } else {
      video.value.muted = false
      video.value.volume = n / 100
    }
    if (n > 0) tempVolume.value = n
    if (!forced) mutedData.value = video.value.muted
    isMuted.value = video.value.muted
    volume.value = video.value.volume * 100
  }
}
const { start: autoRemoveHover } = useTimeoutFn(() => {
  showControl.value = false
}, 2000)
const { isOutside, x, y } = useMouseInElement(videoPlayer)
watch(x, () => {
  if (!isOutside.value) {
    showControl.value = true
    autoRemoveHover()
  }
})

watch(y, () => {
  if (!isOutside.value) {
    showControl.value = true
    autoRemoveHover()
  }
})
watch(isOutside, (outside) => {
  if (outside) {
    showControl.value = false
  } else {
    autoRemoveHover()
    showControl.value = true
  }
})
const showControl = ref(false)

const volumeSlider = ref<HTMLInputElement | null>(null)

useEventListener(volumeSlider, 'input', (event) => {
  if (volumeSlider.value) {
    setVolume((event.target as HTMLInputElement).value)
  }
})

function createHLS () {
  isLoading.value = true
  destroyVideo()
  hls.value = new Hls({
    enableWorker: true,
    lowLatencyMode: lowLatencyMode.value,
    backBufferLength: 90
  })

  hls.value.on(Events.ERROR, function (event : any, data : any) {
    if (data.fatal) {
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
        // try to recover network error
          console.log('fatal network error encountered, try to recover')
          hls.value.startLoad()
          break
        case Hls.ErrorTypes.MEDIA_ERROR:
          console.log('fatal media error encountered, try to recover')
          hls.value.swapAudioCodec()
          hls.value.recoverMediaError()
          break
        default:
        // cannot recover
          hls.value.destroy()
          break
      }
    }
  })

  hls.value.on(Hls.Events.ERROR, (_e : any, d : any) => {
    if (d.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
      isLoading.value = true
    }
  })
  hls.value.on(Hls.Events.FRAG_BUFFERED, () => {
    isLoading.value = false
  })

  hls.value.on(Hls.Events.MANIFEST_LOADING, function () {
    isLoading.value = true
  })

  hls.value.on(Hls.Events.LEVEL_LOADED, function () {
    isLoading.value = false
  })

  hls.value.attachMedia(video.value)
  loadSource(sources.value[0].url)
  play()
}

function destroyVideo () {
  if (hls.value) hls.value.destroy()
}

function toggleMute () {
  if (video.value) {
    if (volume.value > 0) {
      mute()
    } else {
      unmute()
    }
  }
}

function mute () {
  setVolume(0)
}

function unmute () {
  setVolume(tempVolume.value || 100)
}

const { addNotif } = useNotifications()
function togglePlay () {
  addNotif({
    message: 'Test',
    type: 'info'
  })
  if (!showControl.value) return
  if (video.value) {
    if (video.value.paused) {
      video.value.play()
    } else {
      video.value.pause()
    }
  }
}

function loadSource (src : string) {
  hls.value?.loadSource(src)
}

function reload () {
  createHLS()
}

const isFocus = ref(false)
const videoControl = ref<HTMLElement>()
useEventListener(videoControl, 'focusin', () => {
  isFocus.value = true
})

useEventListener(videoControl, 'focusout', () => {
  isFocus.value = false
})
const { isSupported, orientation, lockOrientation, unlockOrientation } = useScreenOrientation()
const { isFullscreen, toggle } = useFullscreen(videoPlayer)
async function toggleFullscreen () {
  if (!isFullscreen.value) {
    const o = orientation.value
    await toggle()
    if (['portrait-primary', 'portrait-secondary', 'portrait'].includes(o ?? '')) {
      if (isSupported.value) { await lockOrientation('landscape') }
    }
  } else {
    unlockOrientation()
    await toggle()
  }
}

function togglePictureInPicture () {
  if (document.pictureInPictureElement) {
    document.exitPictureInPicture()
  } else if (document.pictureInPictureEnabled) {
    video.value?.requestPictureInPicture()
  }
}

async function play () {
  if (process.server) { return }
  if (video.value) {
    try {
      if (mutedData.value) {
        mute()
      } else {
        unmute()
      }
      await video.value.play()
    } catch (e) {
      await nextTick(async () => {
        setVolume(0, true)
        await video.value?.play()
      })
    }
  }
}

onMounted(() => {
  if (video.value) {
    volume.value = tempVolume.value
    isPlaying.value = !video.value.paused
    video.value.addEventListener('play', function () {
      isPlaying.value = true
    })

    video.value.addEventListener('pause', function () {
      isPlaying.value = false
    })
  }

  nextTick(() => {
    if (!mutedData.value) {
      unmute()
    } else {
      mute()
    }
    createHLS()
  })
})

onBeforeUnmount(() => {
  destroyVideo()
})
// defineExpose({ stop })
</script>

<template>
  <div ref="videoPlayer" class="group relative">
    <video
      ref="video"
      class="h-full w-full"
      :poster="poster"
      @click="togglePlay"
    >
      <source v-for="src in sources" :key="src.id" :src="src.url">
      <p class="vjs-no-js">
        To view this video please enable JavaScript, and consider upgrading to a
        web browser that
        <a
          href="https://videojs.com/html5-video-support/"
          target="_blank"
        >supports HTML5 video</a>
      </p>
    </video>

    <div v-if="isLoading" id="loading-spinner" class="absolute inset-0 z-10 flex items-center justify-center bg-black/30 text-black">
      <Icon name="svg-spinners:270-ring-with-bg" class="h-[10%] w-[10%] text-white" />
    </div>

    <div id="control" ref="videoControl" :class="{'opacity-100' : isFocus || showControl, }" class=" absolute bottom-0 z-50 flex w-full justify-end bg-black/50 px-2 text-slate-200 opacity-0 duration-200 ease-in-out dark:bg-black/75">
      <ClientOnly>
        <button class="h-8 w-8 p-1" aria-label="Reload" type="button" @click="togglePlay">
          <Icon v-if="isPlaying" name="ic:baseline-pause" class="h-full w-full" />
          <Icon v-else name="ph:play-fill" class="h-full w-full p-[2.5px]" />
        </button>
        <div class="group/volume flex items-center gap-1">
          <button class="h-8 w-8 p-1" aria-label="Reload" type="button" @click="toggleMute">
            <Icon v-if="!isMuted" :name=" volume >= 50 ? 'ic:round-volume-up' : 'ic:round-volume-down' " class="h-full w-full p-[1px]" />
            <Icon v-else name="ic:round-volume-off" class="h-full w-full p-[1px]" />
          </button>
          <div class="relative flex h-full w-0 items-center overflow-hidden transition-[width] duration-200 group-hover/volume:w-20">
            <div class="absolute inset-0 top-1/2 z-0 h-1 w-20 -translate-y-1/2 overflow-hidden rounded-sm bg-black/25">
              <div class="h-full bg-slate-200" :style="{width : `${volume}%`}" />
            </div>
            <input
              ref="volumeSlider"
              v-model="volume"
              aria-label="Volume"
              type="range"
              min="0"
              max="100"
              class="volume-slider z-20 h-1 w-20 cursor-pointer"
            >
          </div>
        </div>
        <div class="flex-1" />
        <button class="h-8 w-8 p-1" aria-label="Reload" type="button" @click="reload">
          <Icon name="ic:round-refresh" class="h-full w-full p-[1px]" />
        </button>
        <button class="group h-8 w-8 p-1 " aria-label="Fullscreen" type="button">
          <Icon name="ic:baseline-settings" class="h-full w-full p-0.5 duration-300" />
        </button>
        <button class="group h-8 w-8 p-1 " aria-label="Fullscreen" type="button" @click="togglePictureInPicture">
          <Icon name="ic:round-picture-in-picture" class="h-full w-full p-0.5 duration-300" />
        </button>
        <button class="group h-8 w-8 p-1 " aria-label="Fullscreen" type="button" @click="toggleFullscreen">
          <Icon v-if="!isFullscreen" name="ic:round-fullscreen" class="h-full w-full duration-300 hover:scale-125" />
          <Icon v-else name="ic:round-fullscreen-exit" class="h-full w-full duration-300 hover:scale-125" />
        </button>
      </ClientOnly>
    </div>
  </div>
  <!-- <div class="relative aspect-video bg-black">
    <button type="button" aria-label="Mute/Unmute Button" class="absolute right-0 bottom-0 z-[25] m-2 flex aspect-square w-5 cursor-pointer select-none items-center justify-center rounded-full bg-slate-500/30 text-white hover:bg-slate-500/40 md:m-3 md:w-6 xl:m-4" @click="toggleMute">
      <Icon v-if="isMuted" name="ph:speaker-simple-slash-fill" />
      <Icon v-else name="ph:speaker-simple-high-fill" />
    </button>
    <video ref="video" class="h-full w-full overflow-hidden bg-slate-200 object-cover opacity-0 transition-opacity duration-300 dark:bg-dark-1/70" :class="{ 'opacity-100': videoLoaded }" />
  </div> -->
</template>

<style lang="scss">
.volume-slider {
  -webkit-appearance: none; /* Override default CSS styles */
  appearance: none;
  background: transparent; /* Grey background */
  outline: none; /* Remove outline */
  border: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none; /* Override default look */
    appearance: none;
    width: 10px; /* Set a specific slider handle width */
    height: 10px; /* Slider handle height */
    background: rgb(226 232 240 / var(--tw-bg-opacity));;
    border: none;
    border-radius: 100%; /*
    cursor: pointer; /* Cursor on hover */
  }

  &::-moz-range-thumb {
    width: 10px; /* Set a specific slider handle width */
    height: 10px; /* Slider handle height */
    background: rgb(226 232 240 / var(--tw-bg-opacity));;
    border: none;
    border-radius: 100%; /* Green background */
    cursor: pointer; /* Cursor on hover */
    appearance: none;
  }

  &::-webkit-progress-value {
    background: transparent;
    border: none;
  }

  &::-moz-range-progress {
    background: transparent;
    border: none;
    appearance: none;
  }
  &::-moz-range-track {
    appearance: none;
  }

  &:focus-within {
    &::-webkit-slider-thumb,
    &::-moz-range-thumb {
      border: 2px solid rgb(45, 129, 255);
      background: red;
      width: 26px; /* Set a specific slider handle width */
      height: 26px;
      opacity: 1;
    }
  }
}
</style>
