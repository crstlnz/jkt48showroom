<script lang="ts" setup>
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import Hls from 'hls.js'

const props = withDefaults(
  defineProps<{
    sources: ShowroomAPI.StreamingURL[]
    poster: string
    landscape?: boolean
    useShortcut?: boolean
    useDefaultControl?: boolean
    hideControl?: boolean
    maxBufferSize?: number
    maxMaxBufferLength?: number
    saveState?: boolean
    rotateFill?: 'width' | 'height'
    videoFill?: 'width' | 'height'
    compact?: boolean
  }>(),
  {
    landscape: true,
    useShortcut: true,
    useDefaultControl: false,
    hideControl: false,
    saveState: true,
    rotateFill: 'width',
    compact: false,
    videoFill: 'width',
  },
)
const emit = defineEmits<{ (e: 'fullsceen', isFullscreen: boolean): void, (e: 'isLandscape', isLandscape: boolean): void, (e: 'sourceError'): void }>()
const sources = ref(props.sources.filter(i => i.type === 'hls') ?? [])
watch(() => props.sources, () => {
  sources.value = props.sources.filter(i => i.type === 'hls') ?? []
})
const qualityId = useLocalStorage('quality-id', 2)
const currentSource = ref((sources.value ?? []).find(i => qualityId.value === i.id) ?? sources.value[0])
const videoPlayer = ref<HTMLElement>()
const video = ref<HTMLVideoElement>()
const hls = ref()
const tempVolume = props.saveState ? useLocalStorage('data-volume', 0) : ref(1)
const isMuted = ref(false)
const mutedData = props.saveState ? useLocalStorage('data-muted', false) : ref(false)
const isPlaying = ref(false)
const isLoading = ref(true)
const volume = ref(0)
const { isMobile } = useResponsive()

const { start: startAutoReload, stop: stopAutoReload } = useTimeoutFn(() => {
  reload()
}, 5000)

const pausedByUser = ref(false)

function setVolume(v: any, forced = false) {
  const n = Number.parseFloat(v)
  if (video.value) {
    if (n === 0) {
      video.value.muted = true
      video.value.volume = 0
    }
    else {
      video.value.muted = false
      video.value.volume = n
    }
    if (n > 0) tempVolume.value = n
    if (!forced) mutedData.value = video.value.muted
    isMuted.value = video.value.muted
    // volume.value = video.value.volume * 100
  }
}
const showControl = ref(false)
const isFocusControl = ref(false)
const isHoverControl = ref(false)

const { start: autoRemoveHover, stop: stopAutoRemoveHover } = useTimeoutFn(() => {
  isFocusControl.value = false
  setShowControl(false)
}, 2500)

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

watch(isFocusControl, (v) => {
  if (!isMobile) setShowControl(v)
})

const volumeSlider = ref<HTMLInputElement | null>(null)

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
const reloadTimeout = ref<NodeJS.Timeout | undefined>()
function clearReloadTimeout() {
  if (reloadTimeout.value) clearTimeout(reloadTimeout.value)
}
function createHLS(url: string) {
  fatalError.value = 0
  isLoading.value = true
  destroyVideo()
  hls.value = new Hls({
    enableWorker: true,
    liveSyncDurationCount: 1,
    maxBufferSize: props.maxBufferSize ? props.maxBufferSize : 254 * 1000 * 1000,
    // maxMaxBufferLength: props.maxMaxBufferLength ? props.maxMaxBufferLength : 1800,
    maxBufferLength: 5,
    // liveSyncDuration: 3,
    // liveMaxLatencyDuration: 5,
    // highBufferWatchdogPeriod: 1,
    lowLatencyMode: true,
    fetchSetup(context: any, initParams: any) {
      // Always send cookies, even for cross-origin calls.
      initParams.credentials = 'include'
      return new Request(context.url, initParams)
    },
  })

  hls.value.on(Hls.Events.ERROR, (event: any, data: any) => {
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
    emit('sourceError')
    if (d.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
      isLoading.value = true
    }

    clearReloadTimeout()
    reloadTimeout.value = setTimeout(() => {
      reload()
    }, 10000)
  })

  hls.value.on(Hls.Events.FRAG_BUFFERED, () => {
    clearReloadTimeout()
    isLoading.value = false
  })

  hls.value.on(Hls.Events.MANIFEST_LOADING, () => {
    isLoading.value = true
  })

  hls.value.on(Hls.Events.LEVEL_LOADED, () => {
    clearReloadTimeout()
    isLoading.value = false
  })

  hls.value.attachMedia(video.value)
  hls.value.loadSource(url)
  play()
}

function destroyVideo() {
  if (hls.value) hls.value.destroy()
}

function toggleMute() {
  if (video.value) {
    if (video.value.muted) {
      unmute()
    }
    else {
      mute()
    }
  }
}

function mute() {
  if (video.value) {
    video.value.muted = true
    isMuted.value = true
  }
  else {
    setVolume(0)
  }
}

function unmute() {
  if (video.value) {
    video.value.muted = false
    isMuted.value = false
  }
  else {
    setVolume(tempVolume.value || 1)
  }
}

const isProcessingPlay = ref(false)
async function togglePlay() {
  if (isProcessingPlay.value) return
  if (video.value) {
    isProcessingPlay.value = true
    try {
      if (video.value.paused) {
        pausedByUser.value = false
        play()
      }
      else {
        pausedByUser.value = true
        await video.value.pause()
      }
      isProcessingPlay.value = false
    }
    catch (e) {
      isProcessingPlay.value = false
    }
  }
}

function reload() {
  clearReloadTimeout()
  try {
    createHLS(currentSource.value.url)
  }
  catch (e) {
    destroyVideo()
  }
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
const videoWidth = ref(0)
const videoHeight = ref(0)
const isLandscape = computed(() => {
  return videoHeight.value <= videoWidth.value
})

watch(isLandscape, (l) => {
  emit('isLandscape', l)
}, {
  immediate: true,
})

useEventListener(video, 'loadedmetadata', function () {
  videoWidth.value = (this as any).videoWidth
  videoHeight.value = (this as any).videoHeight
})

const { isFullscreen, toggle } = useFullscreen(videoPlayer)
async function toggleFullscreen() {
  if (!isFullscreen.value) {
    const o = orientation.value
    await toggle()
    try {
      if (isLandscape.value) {
        if (['portrait-primary', 'portrait-secondary', 'portrait'].includes(o ?? '')) {
          if (isSupported.value) await lockOrientation('landscape')
        }
      }
      else {
        if (['landscape-primary', 'landscape-secondary', 'landscape'].includes(o ?? '')) {
          if (isSupported.value) await lockOrientation('portrait')
        }
      }
    }
    catch (e) {
      console.log(e)
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

const errorPlayCount = ref(0)

watch(isPlaying, (play) => {
  if (!play && !pausedByUser.value) {
    startAutoReload()
  }
  else {
    stopAutoReload()
    errorPlayCount.value = 0
  }
}, {
  immediate: true,
})

async function play() {
  if (process.server) return
  pausedByUser.value = false
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
      errorPlayCount.value += 1
      if (errorPlayCount.value > 3) return
      await nextTick(async () => {
        if ((e as Error)?.message?.includes('play() failed because the user didn\'t interact with the document first.')) {
          if (video.value) {
            video.value.muted = true
            isMuted.value = true
          }
        }
        video.value?.play()
      })
    }
  }
}

const isSeekDragging = ref(false)

watch(isFullscreen, (fullscreen) => {
  emit('fullsceen', fullscreen)
  calculateVideoSize()
})

const duration = ref(0)
const currentTime = ref(0)

onBeforeUnmount(() => {
  console.log('Destroy video!')
  destroyVideo()
  if (document?.pictureInPictureElement) {
    document.exitPictureInPicture()
  }
})

function videoClick() {
  if (!isMobile) {
    togglePlay()
  }
  else if (!showControl.value) {
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

if (props.useShortcut) {
  onKeyStroke('ArrowLeft', () => {
    const val = currentTime.value - 2
    if (video.value) video.value.currentTime = val < 0 ? 0 : val
  }, { eventName: 'keyup' })

  onKeyStroke('ArrowRight', () => {
    const val = currentTime.value + 2
    const maxTime = duration.value - 3
    if (video.value) video.value.currentTime = val > maxTime ? maxTime : val
  }, { eventName: 'keyup' })
}

watch(videoProgess, (val) => {
  if (seekSlider.value) seekSlider.value.value = String(val * (Number(seekSlider.value.max) || 0) / 100)
}, { immediate: true })
const currentTimeFloor = computed(() => Math.floor(currentTime.value))

function checkMute() {
  return video.value?.getAttribute('prop')
}

useEventListener(video, 'volumechange', (event) => {
  isMuted.value = (event.target as HTMLVideoElement)?.muted
  volume.value = (event.target as HTMLVideoElement)?.volume || 0
})

const volumeIcon = computed(() => {
  if (!isMuted.value && (volume.value >= 0.5)) {
    return 'ic:round-volume-up'
  }
  else if (!isMuted.value && (volume.value > 0)) {
    return 'ic:round-volume-down'
  }
  return 'ic:round-volume-off'
})

const playIcon = computed(() => {
  if (isPlaying.value) {
    return 'ic:round-pause'
  }
  return 'ic:round-play-arrow'
})

function pause() {
  video.value?.pause()
  pausedByUser.value = true
}

function syncLive() {
  if (video.value) {
    video.value.currentTime = duration.value - 3
  }
}

const rotation = ref(0)
function rotate() {
  rotation.value += 90
}

const oldWidth = ref(0)
const oldHeight = ref(0)

const { width, height } = useElementSize(videoPlayer)
const originalSize = ref<{ width: number, height: number } | null>(null)
const isMiring = computed(() => {
  return (rotation.value / 90) % 2 !== 0
})

function calculateVideoSize() {
  if (!originalSize.value) {
    const rect = video.value?.getBoundingClientRect()
    originalSize.value = {
      width: rect?.width || 0,
      height: rect?.height || 0,
    }
  }
  const deg = rotation.value
  if (!video.value || !videoPlayer.value) return
  video.value.style.removeProperty('scale')
  if ((deg / 90) % 2 !== 0) {
    if (!originalSize.value) return
    const potrait = originalSize.value.height / originalSize.value.width
    const landscape = originalSize.value.width / originalSize.value.height
    const isPortrait = originalSize.value.height > originalSize.value.width
    let aspectRatio: number
    if (props.rotateFill === 'width') {
      aspectRatio = landscape
    }
    else {
      aspectRatio = potrait
    }
    console.log('is potrait', isPortrait, originalSize.value.width, originalSize.value.height)
    if (isFullscreen.value) {
      aspectRatio = potrait
    }
    // aspectRatio = isFullscreen.value ? (isPortrait ? potrait : landscape) : (!isPortrait ? landscape : potrait)
    video.value.style.scale = `${aspectRatio}`
  }
}

watch(rotation, () => {
  const isMiring = (rotation.value / 90) % 2 !== 0
  const isLs = isLandscape.value ? !isMiring : isMiring
  emit('isLandscape', isLs)
  requestAnimationFrame(() => calculateVideoSize())
})

useEventListener(video, 'play', () => {
  isPlaying.value = true
})
useEventListener(video, 'pause', () => {
  isPlaying.value = false
})
useEventListener(video, 'durationchange', () => {
  duration.value = video.value?.duration || 0
})
useEventListener(video, 'timeupdate', () => {
  if (isSeekDragging.value) return
  currentTime.value = video.value?.currentTime || 0
})

const pipEnabled = ref(false)

onMounted(() => {
  useEventListener(window, 'resize', () => {
    requestAnimationFrame(() => calculateVideoSize())
  })

  pipEnabled.value = document.pictureInPictureEnabled

  // set custom button on picture on picture
  try {
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      reload()
    })
  }
  catch (e) {
    console.log(e)
  }
  /////

  if (video.value) {
    volume.value = Number(tempVolume.value) || 1
    isPlaying.value = !video.value.paused
  }

  nextTick(() => {
    if (!mutedData.value) {
      unmute()
    }
    else {
      mute()
    }
    reload()
  })
})

const aspectRatio = computed(() => {
  const landscapeRatio = isMiring.value ? 'aspect-[9/12]' : 'aspect-video'
  const portraitRatio = !isMiring.value ? 'aspect-[9/12]' : 'aspect-video'
  return isLandscape.value ? landscapeRatio : portraitRatio
})

const { isMD } = useResponsive()

defineExpose({ stop, rotate, syncLive, calculateVideoSize, isPlaying, isMuted, reload, togglePlay, isLandscape, changeSource, checkMute, volume, pause, play, mute, unmute, setVolume })
</script>

<template>
  <div ref="videoPlayer" class="overflow-hidden relative group flex items-center transform-all duration-300" :class="rotateFill === 'width' ? aspectRatio : 'h-full w-full'">
    <div
      v-if="!isPlaying && !isLoading && !useDefaultControl" class="z-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1" @click="() => {
        if (isMobile) togglePlay()
      }"
    >
      <Icon name="ic:round-play-arrow" class="text-white/60" size="3rem" />
    </div>
    <div v-if="isMobile && !useDefaultControl && isPlaying && showControl" class="z-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1" @click="togglePlay">
      <Icon name="ic:round-pause" class="text-white/60" size="3rem" />
    </div>
    <div
      class="absolute top-1/2 -translate-y-1/2 z-0"
      :class="{ 'aspect-video': isLandscape, 'aspsect-[9/12]': !isLandscape, 'w-full': (videoFill === 'width') && !isFullscreen, 'h-full': videoFill === 'height' || isFullscreen }"
      @click="videoClick"
    >
      <video
        ref="video"
        :controls="useDefaultControl && !hideControl"
        class="inset-0 w-full h-full transition-all duration-500 object-cover origin-center"
        :style="{ transform: `rotate(${rotation}deg)` }"
        :poster="poster"
      >
        <p class="vjs-no-js">
          To view this video please enable JavaScript, and consider upgrading to a
          web browser that
          <a
            href="https://videojs.com/html5-video-support/"
            target="_blank"
          >supports HTML5 video</a>
        </p>
      </video>
    </div>

    <div v-if="isLoading && !useDefaultControl" id="loading-spinner" class="absolute inset-0 z-0 flex items-center justify-center bg-black/30 text-black">
      <Icon name="svg-spinners:270-ring-with-bg" class="h-[15%] w-[15%] text-white" />
    </div>

    <div v-if="!useDefaultControl" id="control" ref="videoControl" :class="{ 'opacity-100': showControl || isFocusControl || isHoverControl }" class="absolute inset-x-0 bottom-0 z-10 text-slate-200 opacity-0 duration-200 ease-in-out" @click="setShowControl(true)">
      <div :class="{ 'pointer-events-none': isMobile && !showControl }">
        <div class="group flex items-center justify-center">
          <div class="relative flex h-full w-full duration-200 group-hover/volume:w-20">
            <div :class="{ 'h-[3px]': compact, 'h-1': !compact }" class="absolute bottom-0 z-0 w-full overflow-hidden bg-neutral-700/75">
              <div class="h-full bg-red-600" :style="{ width: `${videoProgess}%` }" />
            </div>
            <div :class="{ 'opacity-0': !isMobile, 'h-3 w-3': !compact, 'h-2 w-2': compact }" class="absolute bottom-[2px] -translate-x-1/2 translate-y-1/2 rounded-full bg-red-600 transition-opacity duration-300 group-hover:opacity-100" :style="{ left: `${videoProgess}%` }" />
            <input
              ref="seekSlider"
              :class="{ 'opacity-0': !isMobile, compact }"
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
        <div class="flex w-full bg-black/70 px-1 duration-200 dark:bg-black/75 md:px-2 items-center">
          <button class="h-7 w-7 md:h-8 md:w-8 p-0.5 md:p-1" aria-label="Play" type="button" @click="togglePlay">
            <Icon :name="playIcon" class="h-full w-full" />
          </button>
          <div v-if="!compact" class="group/volume flex items-center gap-1">
            <button class="h-7 w-7 md:h-8 md:w-8 p-0.5 md:p-1" aria-label="Mute" type="button" @click="toggleMute">
              <Icon :name="volumeIcon" class="h-full w-full" />
            </button>
            <div class="relative flex h-full w-16 items-center duration-200 group-hover/volume:w-20 md:w-20">
              <div class="absolute inset-0 top-1/2 h-1 z-0 w-16 -translate-y-1/2 overflow-hidden rounded-sm bg-gray-300/25 md:w-20">
                <div class="h-full bg-slate-200" :style="{ width: `${volume * 100}%` }" />
              </div>
              <input
                ref="volumeSlider"
                v-model="volume"
                aria-label="Volume"
                type="range"
                min="0"
                max="1"
                step="0.01"
                class="volume-slider z-20 h-1 w-16 cursor-pointer md:w-20"
              >
            </div>
          </div>
          <div class="flex-1" />
          <div v-if="!compact && isMD" class="flex items-center text-xs md:text-sm">
            {{ $dayjs.duration(currentTimeFloor, 'second').format("mm:ss") }} / {{ $dayjs.duration(duration, 'second').format("mm:ss") }}
          </div>
          <button class="h-7 w-7 md:h-8 md:w-8 p-0.5 md:p-1" aria-label="Reload" type="button" @click="reload">
            <Icon name="ic:round-refresh" class="h-full w-full p-[1px]" />
          </button>
          <button class="h-7 w-7 md:h-8 md:w-8 p-0.5 md:p-1" aria-label="Reload" type="button" @click="rotate">
            <Icon name="ic:outline-rotate-right" class="h-full w-full p-[1px]" />
          </button>
          <Popover v-if="!compact">
            <PopoverButton aria-label="Setting" class="h-7 w-7 md:h-8 md:w-8 p-0.5 md:p-1">
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
          <button v-if="pipEnabled" class="group h-7 w-7 md:h-8 md:w-8 p-0.5 md:p-1 " aria-label="Fullscreen" type="button" @click="togglePictureInPicture">
            <Icon name="ic:round-picture-in-picture" class="h-full w-full p-0.5 duration-300" />
          </button>
          <button class="group h-7 w-7 md:h-8 md:w-8 p-0.5 md:p-1 " aria-label="Fullscreen" type="button" @click="toggleFullscreen">
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

  &.compact {
    &::-webkit-slider-thumb {
      width: 7px; /* Set a specific slider handle width */
      height: 7px; /* Slider handle height */
    }

    &::-moz-range-thumb {
      width: 7px; /* Set a specific slider handle width */
      height: 7px; /* Slider handle height */
    }
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
