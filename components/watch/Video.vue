<script lang="ts" setup>
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import Hls, { Events } from 'hls.js/dist/hls.min.js'

const props = defineProps<{ sources: ShowroomAPI.StreamingURL[]; poster: string }>()
const emit = defineEmits<{ (e: 'fullsceen', isFullscreen: boolean): void }>()
useHead({
  link: [{ href: 'https://vjs.zencdn.net/8.0.4/video-js.css', rel: 'stylesheet' }],
  script: [{ src: 'https://vjs.zencdn.net/8.0.4/video.min.js' }],
})
const sources = ref(props.sources.filter(i => i.type === 'hls') ?? [])
const qualityId = useLocalStorage('quality-id', 2)
const currentSource = ref((sources.value ?? []).find(i => qualityId.value === i.id) ?? sources.value[0])
const videoPlayer = ref<HTMLElement>()
const video = ref<HTMLVideoElement>()
const hls = ref()
const lowLatencyMode = ref(true)
const tempVolume = useLocalStorage('data-volume', 0)
const isMuted = ref(false)
const mutedData = useLocalStorage('data-muted', false)
const isPlaying = ref(false)
const isLoading = ref(true)
const volume = ref(0)
const { isMobile } = useResponsive()

function setVolume(v: any, forced = false) {
  const n = Number.parseInt(v)
  if (video.value) {
    if (n === 0) {
      video.value.muted = true
      video.value.volume = 0
    }
    else {
      video.value.muted = false
      video.value.volume = n / 100
    }
    if (n > 0) tempVolume.value = n
    if (!forced) mutedData.value = video.value.muted
    isMuted.value = video.value.muted
    volume.value = video.value.volume * 100
  }
}
const showControl = ref(false)
const isFocusControl = ref(false)
const isHoverControl = ref(false)

const { start: autoRemoveHover, stop: stopAutoRemoveHover } = useTimeoutFn(() => {
  isFocusControl.value = false
  setShowControl(false)
}, 3000)

const { isOutside, x, y } = useMouseInElement(videoPlayer)
watch(x, () => {
  if (!isMobile && !isOutside.value !== showControl.value) {
    setShowControl(!isOutside.value)
  }
})

watch(y, () => {
  if (!isMobile && !isOutside.value !== showControl.value) {
    setShowControl(!isOutside.value)
  }
})

// watch(isOutside, (val) => {
//   if (!isMobile) setShowControl(!val)
// })

watch(isFocusControl, (v) => {
  if (!isMobile) setShowControl(v)
})

const volumeSlider = ref<HTMLInputElement | null>(null)
// const showVolume = ref(false)
// useEventListener(volumeSlider, 'focusin', () => {
//   showVolume.value = true
// })

// useEventListener(volumeSlider, 'focusout', () => {
//   showVolume.value = false
// })

useEventListener(volumeSlider, 'input', (event) => {
  setShowControl(true)
  setVolume((event.target as HTMLInputElement).value)
})

function setShowControl(show: boolean) {
  if (show) {
    autoRemoveHover()
  }
  else {
    stopAutoRemoveHover()
  }
  showControl.value = show
}

const fatalError = ref(0)
function createHLS(url: string) {
  fatalError.value = 0
  isLoading.value = true
  destroyVideo()
  hls.value = new Hls({
    enableWorker: true,
    lowLatencyMode: lowLatencyMode.value,
    backBufferLength: 90,
    fetchSetup(context: any, initParams: any) {
      // Always send cookies, even for cross-origin calls.
      initParams.credentials = 'include'
      return new Request(context.url, initParams)
    },
  })

  hls.value.on(Events.ERROR, (event: any, data: any) => {
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
          fatalError.value += 2
          if (fatalError.value > 3) {
            isPlaying.value = false
            hls.value.destroy()
          }
          else {
            reload()
          }
          break
      }
    }
  })

  hls.value.on(Hls.Events.ERROR, (_e: any, d: any) => {
    if (d.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
      isLoading.value = true
    }
  })
  hls.value.on(Hls.Events.FRAG_BUFFERED, () => {
    isLoading.value = false
  })

  hls.value.on(Hls.Events.MANIFEST_LOADING, () => {
    isLoading.value = true
  })

  hls.value.on(Hls.Events.LEVEL_LOADED, () => {
    isLoading.value = false
  })

  hls.value.attachMedia(video.value)
  loadSource(url)
  play()
}

function destroyVideo() {
  if (hls.value) hls.value.destroy()
}

function toggleMute() {
  if (video.value) {
    if (volume.value > 0) {
      mute()
    }
    else {
      unmute()
    }
  }
}

function mute() {
  setVolume(0)
}

function unmute() {
  setVolume(tempVolume.value || 100)
}

const isProcessingPlay = ref(false)
async function togglePlay() {
  if (isProcessingPlay.value) return
  if (video.value) {
    isProcessingPlay.value = true
    try {
      if (video.value.paused) {
        await video.value.play()
      }
      else {
        await video.value.pause()
      }
      isProcessingPlay.value = false
    }
    catch (e) {
      isProcessingPlay.value = false
    }
  }
}

function loadSource(src: string) {
  hls.value?.loadSource(src)
}

function reload() {
  createHLS(currentSource.value.url)
}

const videoControl = ref<HTMLElement>()
useEventListener(videoControl, 'pointerenter', () => {
  isHoverControl.value = true
})
useEventListener(videoControl, 'pointerleave', () => {
  isHoverControl.value = false
})

// useEventListener(video, 'enterpictureinpicture', (event) => {
//   isHoverControl.value = false
// })
// useEventListener(video, 'leavepictureinpicture', (event) => {
//   console.log('LEAVE')
//   isHoverControl.value = false
// })

useEventListener(videoControl, 'focusin', () => {
  isFocusControl.value = true
})

useEventListener(video, 'click', () => {
  isFocusControl.value = true
})

useEventListener(videoControl, 'focusout', () => {
  isFocusControl.value = false
})
const { isSupported, orientation, lockOrientation, unlockOrientation } = useScreenOrientation()
const { isFullscreen, toggle } = useFullscreen(videoPlayer)
async function toggleFullscreen() {
  if (!isFullscreen.value) {
    const o = orientation.value
    await toggle()
    if (['portrait-primary', 'portrait-secondary', 'portrait'].includes(o ?? '')) {
      if (isSupported.value) await lockOrientation('landscape')
    }
  }
  else {
    unlockOrientation()
    await toggle()
  }
}

function togglePictureInPicture() {
  if (document.pictureInPictureElement) {
    document.exitPictureInPicture()
  }
  else if (document.pictureInPictureEnabled) {
    video.value?.requestPictureInPicture()
  }
}

function changeSource(source: ShowroomAPI.StreamingURL) {
  qualityId.value = source.id
  currentSource.value = source
  reload()
}

async function play() {
  if (process.server) return
  if (video.value) {
    try {
      if (mutedData.value) {
        mute()
      }
      else {
        unmute()
      }
      await video.value.play()
    }
    catch (e) {
      await nextTick(async () => {
        setVolume(0, true)
        await video.value?.play()
      })
    }
  }
}

const isSeekDragging = ref(false)

watch(isFullscreen, (fullscreen) => {
  emit('fullsceen', fullscreen)
})

function playEvent() {
  isPlaying.value = true
}

function pauseEvent() {
  isPlaying.value = false
}

const duration = ref(0)
const currentTime = ref(0)

function durationChange() {
  duration.value = video.value?.duration || 0
}

function timeUpdate() {
  if (isSeekDragging.value) return
  currentTime.value = video.value?.currentTime || 0
}

onMounted(() => {
  navigator.mediaSession.setActionHandler('nexttrack', () => {
    reload()
  })
  // currentSource.value = (sources.value ?? []).find(i => qualityId.value === i.id) ?? sources.value[0]
  if (video.value) {
    volume.value = tempVolume.value
    isPlaying.value = !video.value.paused
    video.value.addEventListener('play', playEvent)
    video.value.addEventListener('pause', pauseEvent)
    video.value.addEventListener('durationchange', durationChange)
    video.value.addEventListener('timeupdate', timeUpdate)
  }

  nextTick(() => {
    if (!mutedData.value) {
      unmute()
    }
    else {
      mute()
    }
    createHLS(currentSource.value.url)
  })
})

onBeforeUnmount(() => {
  destroyVideo()
  if (document?.pictureInPictureElement) {
    document.exitPictureInPicture()
  }
  if (video.value) {
    video.value.removeEventListener('play', playEvent)
    video.value.removeEventListener('pause', pauseEvent)
    video.value.removeEventListener('durationchange', durationChange)
    video.value.removeEventListener('timeupdate', timeUpdate)
  }
})

function videoClick() {
  if (!isMobile) {
    togglePlay()
  }
  else if (showControl.value) {
    togglePlay()
  }
  else {
    if (!isPlaying.value) togglePlay()
    setShowControl(true)
  }
}

function stop() {
  destroyVideo()
  if (document?.pictureInPictureElement) {
    document.exitPictureInPicture()
  }
}
const seekSlider = ref<HTMLInputElement | null>()
const videoProgess = computed(() => {
  if (duration.value === 0) return 0
  return currentTime.value / duration.value * 100
})

function seek() {
  if (seekSlider.value) {
    currentTime.value = Number(seekSlider.value.value) / (Number(seekSlider.value.max) || 0) * duration.value
  }
}

function changeVideoTime() {
  if (seekSlider.value && video.value) {
    video.value.currentTime = Number(seekSlider.value.value) / (Number(seekSlider.value.max) || 0) * duration.value
  }
  isSeekDragging.value = false
}

onKeyStroke('ArrowLeft', () => {
  const val = currentTime.value - 5
  if (video.value) video.value.currentTime = val < 0 ? 0 : val
}, { eventName: 'keyup' })

onKeyStroke('ArrowRight', () => {
  const val = currentTime.value + 5
  if (video.value) video.value.currentTime = val > duration.value ? val : duration.value
}, { eventName: 'keyup' })

watch(videoProgess, (val) => {
  if (seekSlider.value) seekSlider.value.value = String(val * (Number(seekSlider.value.max) || 0) / 100)
}, { immediate: true })
const dayjs = useDayjs()
const currentTimeFloor = computed(() => Math.floor(currentTime.value))
defineExpose({ stop })
</script>

<template>
  <div ref="videoPlayer" class="group relative">
    <div v-if="!isPlaying && !isLoading" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1">
      <Icon name="material-symbols:pause" class="text-white/60" size="3rem" />
    </div>
    <video
      ref="video"
      class="h-full w-full"
      :poster="poster"
      @click="videoClick"
    >
      <!-- <source v-for="src in sources" :key="src.id" :src="src.url"> -->
      <p class="vjs-no-js">
        To view this video please enable JavaScript, and consider upgrading to a
        web browser that
        <a
          href="https://videojs.com/html5-video-support/"
          target="_blank"
        >supports HTML5 video</a>
      </p>
    </video>

    <div v-if="isLoading" id="loading-spinner" class="absolute inset-0 z-0 flex items-center justify-center bg-black/30 text-black">
      <Icon name="svg-spinners:270-ring-with-bg" class="h-[10%] w-[10%] text-white" />
    </div>

    <div id="control" ref="videoControl" :class="{ 'opacity-100': showControl || isFocusControl || isHoverControl }" class="absolute inset-x-0 bottom-0 z-10 text-slate-200 opacity-0 duration-200 ease-in-out" @click="setShowControl(true)">
      <!-- <ClientOnly>

      </ClientOnly> -->
      <div>
        <div class="group flex items-center justify-center">
          <div class="relative flex h-full w-full duration-200 group-hover/volume:w-20">
            <div class="absolute bottom-0 z-0 h-1 w-full overflow-hidden bg-neutral-700/75">
              <div class="h-full bg-red-600" :style="{ width: `${videoProgess}%` }" />
            </div>
            <div :class="{ 'opacity-0': !isMobile }" class="absolute bottom-[2px] h-3 w-3 -translate-x-1/2 translate-y-1/2 rounded-full bg-red-600 transition-opacity duration-300 group-hover:opacity-100" :style="{ left: `${videoProgess}%` }" />
            <input
              ref="seekSlider"
              :class="{ 'opacity-0': !isMobile }"
              aria-label="Playback"
              type="range"
              min="0"
              max="10000"
              step="1"
              class="volume-slider hidden-slider z-20 h-4 w-full cursor-pointer transition-opacity duration-300 hover:opacity-100"
              @change="changeVideoTime"
              @input="seek"
              @pointerdown="isSeekDragging = true"
              @pointerup="isSeekDragging = false"
            >
          </div>
        </div>
        <div class="flex w-full bg-black/70 px-1 duration-200 dark:bg-black/75 md:px-2">
          <button class="h-8 w-8 p-1" aria-label="Play" type="button" @click="togglePlay">
            <Icon v-if="isPlaying" name="ic:baseline-pause" class="h-full w-full" />
            <Icon v-else name="ph:play-fill" class="h-full w-full p-[2.5px]" />
          </button>
          <div class="group/volume flex items-center gap-1">
            <button class="h-8 w-8 p-1" aria-label="Mute" type="button" @click="toggleMute">
              <Icon v-if="!isMuted" :name=" volume >= 50 ? 'ic:round-volume-up' : 'ic:round-volume-down' " class="h-full w-full p-[1px]" />
              <Icon v-else name="ic:round-volume-off" class="h-full w-full p-[1px]" />
            </button>
            <div class="relative flex h-full w-16 items-center duration-200 group-hover/volume:w-20 md:w-20">
              <div class="absolute inset-0 top-1/2 z-0 h-1 w-16 -translate-y-1/2 overflow-hidden rounded-sm bg-gray-300/25 md:w-20">
                <div class="h-full bg-slate-200" :style="{ width: `${volume}%` }" />
              </div>
              <input
                ref="volumeSlider"
                v-model="volume"
                aria-label="Volume"
                type="range"
                min="0"
                max="100"
                step="5"
                class="volume-slider z-20 h-1 w-16 cursor-pointer md:w-20"
              >
            </div>
          </div>
          <div class="flex-1" />
          <div class="flex items-center text-xs md:text-sm">
            {{ dayjs.duration(currentTimeFloor, 'second').format("mm:ss") }} / {{ dayjs.duration(duration, 'second').format("mm:ss") }}
          </div>
          <button class="h-8 w-8 p-1" aria-label="Reload" type="button" @click="reload">
            <Icon name="ic:round-refresh" class="h-full w-full p-[1px]" />
          </button>
          <Popover>
            <PopoverButton aria-label="Setting" class="h-8 w-8 p-1">
              <Icon name="ic:baseline-settings" class="h-full w-full p-[2px] duration-300" />
            </PopoverButton>
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="translate-y-2 translate-x-1 opacity-0"
              enter-to-class="translate-y-0 translate-x-0 opacity-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="translate-y-0 translate-x-x opacity-100"
              leave-to-class="translate-y-2 translate-x-1 opacity-0"
            >
              <PopoverPanel class="absolute bottom-11 right-4 rounded-md bg-black/70 dark:bg-black/80">
                <div>
                  <div class="border-b border-white/20 px-3 py-1.5 md:px-4 md:py-2.5">
                    {{ $t('quality') }}
                  </div>
                  <div class="flex w-[220px] flex-col py-1 text-base md:w-[250px]">
                    <PopoverButton v-for="source in sources" :key="source.id" class="flex items-center truncate text-left text-sm hover:bg-black/50" @click="() => changeSource(source)">
                      <div class="h-10 w-10">
                        <Icon v-if="currentSource.id === source.id" name="ic:round-check" class="h-full w-full p-2.5" />
                      </div>
                      <div>
                        {{ source.label }}
                      </div>
                    </PopoverButton>
                  </div>
                </div>
              </PopoverPanel>
            </Transition>
          </Popover>
          <button class="group h-8 w-8 p-1 " aria-label="Fullscreen" type="button" @click="togglePictureInPicture">
            <Icon name="ic:round-picture-in-picture" class="h-full w-full p-0.5 duration-300" />
          </button>
          <button class="group h-8 w-8 p-1 " aria-label="Fullscreen" type="button" @click="toggleFullscreen">
            <Icon v-if="!isFullscreen" name="ic:round-fullscreen" class="h-full w-full duration-300 hover:scale-125" />
            <Icon v-else name="ic:round-fullscreen-exit" class="h-full w-full duration-300 hover:scale-125" />
          </button>
        </div>
      </div>
    </div>
  </div>
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

  &.hidden-slider{
    &::-webkit-slider-thumb {
   visibility: hidden;
  }

  &::-moz-range-thumb {
    visibility: hidden;
  }
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

  &:focus-visible {
    &::-webkit-slider-thumb {
      @apply ring-2 ring-blue-500;
      -webkit-appearance: none;
      appearance: none;
      cursor: pointer;
    }
    &::-moz-range-thumb {
      @apply ring-2 ring-blue-500;
      cursor: pointer;
    }
  }
}
</style>
