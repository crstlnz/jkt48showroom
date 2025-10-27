<script lang="ts" setup>
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'

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
const emit = defineEmits<{
  (e: 'fullsceen', isFullscreen: boolean): void
  (e: 'isLandscape', isLandscape: boolean): void
  (e: 'sourceError'): void
}>()

const sources = ref(props.sources.filter(i => i.type === 'hls') ?? [])
watch(
  () => props.sources,
  () => {
    sources.value = props.sources.filter(i => i.type === 'hls') ?? []
  },
)
const qualityId = useLocalStorage('quality-id', 2)
const currentSource = ref(
  (sources.value ?? []).find(i => qualityId.value === i.id) ?? sources.value[0],
)
const videoPlayer = ref<HTMLElement>()
const video = ref<HTMLVideoElement>()
const hls = ref()
const tempVolume = props.saveState ? useLocalStorage('data-volume', 0) : ref(1)
const isMuted = ref(false)
const mutedData = props.saveState
  ? useLocalStorage('data-muted', false)
  : ref(false)
const isPlaying = ref(false)
const isLoading = ref(true)
const volume = ref(0)
const { isMobile } = useResponsive()

const { start: startAutoReload, stop: stopAutoReload } = useTimeoutFn(() => {
  reload()
}, 10000)

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

const { start: autoRemoveHover, stop: stopAutoRemoveHover } = useTimeoutFn(
  () => {
    isFocusControl.value = false
    isHoverControl.value = false
    setShowControl(false)
  },
  2500,
)

watch(isFocusControl, (focus) => {
  if (focus) autoRemoveHover()
})

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
    isFocusControl.value = false
    isHoverControl.value = false
    stopAutoRemoveHover()
  }
  showControl.value = show
}

const fatalError = ref(0)
const proxied = ref(false)
const createdVideo = ref(false)

useScriptTag(
  useAppConfig().hlsUrl,
  () => {
    createHLS(currentSource.value?.url ?? '')
  },
  {
    defer: true,
  },
)

const useWorker = ref(true)
const proxyServers = ref(getProxyServer())
const proxyIndex = ref(0)
onMounted(() => {
  if (!createdVideo.value && typeof Hls !== 'undefined') {
    createdVideo.value = true
    createHLS(currentSource.value?.url ?? '')
  }
})

const hlsNotWork = ref(false)
const id = useId()

function createHLS(_url: string) {
  if (!video.value) return
  const url = `${proxied.value ? `${proxyServers.value[proxyIndex.value] ?? ''}` : ''
  }${_url}`

  if (Hls.isSupported() && !hlsNotWork.value) {
    fatalError.value = 0
    isLoading.value = true
    destroyVideo()
    hls.value = new Hls({
      // enableWorker: useWorker.value,
      enableWorker: false,
      liveSyncDurationCount: 2,
      maxBufferSize: props.maxBufferSize
        ? props.maxBufferSize
        : 254 * 1000 * 1000,
      // maxMaxBufferLength: props.maxMaxBufferLength ? props.maxMaxBufferLength : 1800,
      maxBufferLength: 60,
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
      if (
        (data.response.code === 0 || data.response.code === 403)
        && data.type === Hls.ErrorTypes.NETWORK_ERROR
        && !_url.includes('showroom')
      ) {
        if (!proxied.value) {
          proxied.value = true
          return createHLS(_url)
        }
        else if (proxyIndex.value < proxyServers.value.length - 1) {
          proxyIndex.value += 1
          return createHLS(_url)
        }
      }

      if (data.details === 'manifestParsingError' && !hlsNotWork.value) {
        hlsNotWork.value = true
        return createHLS(_url)
      }
      emit('sourceError')
      startAutoReload()
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            // try to recover network error
            console.error('fatal network error encountered, try to recover')
            hls.value.startLoad()
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error('fatal media error encountered, try to recover')
            hls.value.recoverMediaError()
            break
          default:
            console.error('cannot recover error')
            if (useWorker.value) {
              useWorker.value = false
              return createHLS(url)
            }
            reload()
            break
        }
      }
      else {
        if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
          isLoading.value = true
        }
      }
    })

    hls.value.on(Hls.Events.FRAG_BUFFERED, () => {
      stopAutoReload()
      isLoading.value = false
    })

    hls.value.on(Hls.Events.MANIFEST_LOADING, () => {
      isLoading.value = true
    })

    hls.value.on(Hls.Events.LEVEL_LOADED, () => {
      stopAutoReload()
      isLoading.value = false
    })

    hls.value.attachMedia(video.value)
    hls.value.loadSource(url)
    play()
  }
  else {
    video.value.src = url
    video.value.load()
    play()
  }
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
        await play()
      }
      else {
        pausedByUser.value = true
        await video.value.pause()
      }
      isProcessingPlay.value = false
    }
    catch (e) {
      console.error(e)
      isProcessingPlay.value = false
    }
  }
}

function reload() {
  stopAutoReload()
  try {
    createHLS(currentSource.value?.url ?? '')
  }
  catch (e) {
    console.error(e)
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
  if (isMobile) return
  isFocusControl.value = true
})

// useEventListener(video, 'click', () => {
//   isFocusControl.value = true
// })

useEventListener(videoControl, 'focusout', () => {
  isFocusControl.value = false
})
const { isSupported, orientation, lockOrientation, unlockOrientation }
  = useScreenOrientation()
const videoWidth = ref(0)
const videoHeight = ref(0)
const isLandscape = computed(() => {
  return videoHeight.value <= videoWidth.value
})

watch(
  isLandscape,
  (l) => {
    emit('isLandscape', l)
  },
  {
    immediate: true,
  },
)

const isBuiltInFullscreen = ref(false)

const { isFullscreen: isPlayerFullscreen, toggle } = useFullscreen(videoPlayer)
const isFullscreen = computed(() => {
  return isBuiltInFullscreen.value || isPlayerFullscreen.value
})
async function toggleFullscreen() {
  if (!isFullscreen.value) {
    const o = orientation.value
    await toggle()
    try {
      if (isLandscape.value) {
        if (
          ['portrait-primary', 'portrait-secondary', 'portrait'].includes(
            o ?? '',
          )
        ) {
          if (isSupported.value) await lockOrientation('landscape')
        }
      }
      else {
        if (
          ['landscape-primary', 'landscape-secondary', 'landscape'].includes(
            o ?? '',
          )
        ) {
          if (isSupported.value) await lockOrientation('portrait')
        }
      }
    }
    catch (e) {
      console.error(e)
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

watch(
  isPlaying,
  (play) => {
    if (!play && !pausedByUser.value) {
      startAutoReload()
    }
    else {
      stopAutoReload()
      errorPlayCount.value = 0
    }
  },
  {
    immediate: true,
  },
)

async function play() {
  if (import.meta.server) return
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
      console.error(e)
      if (errorPlayCount.value > 5) return
      errorPlayCount.value += 1
      await nextTick(async () => {
        if (errorPlayCount.value > 4) {
          if (video.value) {
            video.value.muted = true
            video.value.volume = 0
          }
          volume.value = 0
          isMuted.value = true
          return play()
        }
        return play()
      })
    }
  }
}

const isSeekDragging = ref(false)

const isFullscreenLandscape = ref(false)
watch(isFullscreen, (fullscreen) => {
  emit('fullsceen', fullscreen)
  isFullscreenLandscape.value = window.innerHeight <= window.innerWidth
  calculateVideoSize()
})

const duration = ref(0)
const currentTime = ref(0)

onBeforeUnmount(() => {
  destroyVideo()
  if (document?.pictureInPictureElement) {
    document.exitPictureInPicture()
  }
})

function videoClick() {
  if (!isMobile) {
    togglePlay()
  }
  else {
    if (!showControl.value) {
      setShowControl(true)
    }
    else {
      setShowControl(false)
    }
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
  return (currentTime.value / duration.value) * 100
})

function seek() {
  if (seekSlider.value) {
    currentTime.value
      = (Number(seekSlider.value.value) / (Number(seekSlider.value.max) || 0))
        * duration.value
  }
}

function changeVideoTime() {
  if (seekSlider.value && video.value) {
    video.value.currentTime
      = (Number(seekSlider.value.value) / (Number(seekSlider.value.max) || 0))
        * duration.value
  }
  isSeekDragging.value = false
}

if (props.useShortcut) {
  onKeyStroke(
    'ArrowLeft',
    () => {
      const val = currentTime.value - 2
      if (video.value) video.value.currentTime = val < 0 ? 0 : val
    },
    { eventName: 'keyup' },
  )

  onKeyStroke(
    'ArrowRight',
    () => {
      const val = currentTime.value + 2
      const maxTime = duration.value - 3
      if (video.value) video.value.currentTime = val > maxTime ? maxTime : val
    },
    { eventName: 'keyup' },
  )
}

watch(
  videoProgess,
  (val) => {
    if (seekSlider.value) {
      seekSlider.value.value = String(
        (val * (Number(seekSlider.value.max) || 0)) / 100,
      )
    }
  },
  { immediate: true },
)
const currentTimeFloor = computed(() => Math.floor(currentTime.value))

function checkMute() {
  return video.value?.getAttribute('prop')
}

const volumeIcon = computed(() => {
  if (!isMuted.value && volume.value >= 0.5) {
    return 'ic:round-volume-up'
  }
  else if (!isMuted.value && volume.value > 0) {
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
const enableRotate = useLocalStorage<boolean>('rotate_feature_v1', () => false)

watch(enableRotate, (v) => {
  if (!v) {
    video.value?.style.removeProperty('scale')
    rotation.value = 0
  }
})

function rotate() {
  if (!enableRotate.value) return
  rotation.value += 90
}

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
    // const isPortrait = originalSize.value.height > originalSize.value.width
    let aspectRatio: number
    if (props.rotateFill === 'width') {
      aspectRatio = landscape
    }
    else {
      aspectRatio = potrait
    }
    if (isFullscreen.value) {
      aspectRatio = isFullscreenLandscape.value
        ? !isLandscape.value
            ? landscape
            : potrait
        : !isLandscape.value
            ? potrait
            : landscape
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

useEventListener(video, 'loadedmetadata', function () {
  videoWidth.value = (this as any).videoWidth
  videoHeight.value = (this as any).videoHeight
})

useEventListener(video, 'loadeddata', function () {
  videoWidth.value = (this as any).videoWidth
  videoHeight.value = (this as any).videoHeight
})

useEventListener(video, 'play', () => {
  isLoading.value = false
  isPlaying.value = true
})
useEventListener(video, 'pause', () => {
  isLoading.value = false
  isPlaying.value = false
})
useEventListener(video, 'playing', () => {
  isLoading.value = false
  isPlaying.value = true
})
useEventListener(video, 'stalled', () => {
  isLoading.value = true
})
useEventListener(video, 'waiting', () => {
  isLoading.value = true
})
useEventListener(video, 'durationchange', () => {
  duration.value = video.value?.duration || 0
})
useEventListener(video, 'timeupdate', () => {
  if (isSeekDragging.value) return
  currentTime.value = video.value?.currentTime || 0
})
useEventListener(video, 'loadstart', () => {
  isLoading.value = true
})

useEventListener(video, 'volumechange', (event) => {
  isMuted.value = (event.target as HTMLVideoElement)?.muted
  volume.value = (event.target as HTMLVideoElement)?.volume || 0
})

function checkBuiltInFullscreen() {
  isBuiltInFullscreen.value = document.fullscreenElement !== null
}

useEventListener(video, 'webkitfullscreenchange', () => {
  checkBuiltInFullscreen()
})
useEventListener(video, 'mozfullscreenchange', () => {
  checkBuiltInFullscreen()
})
useEventListener(video, 'fullscreenchange', () => {
  checkBuiltInFullscreen()
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
    console.error(e)
  }
  /////

  if (video.value) {
    volume.value = Number(tempVolume.value) || 1
    setVolume(volume.value)
    isPlaying.value = !video.value.paused
  }

  nextTick(() => {
    if (!mutedData.value) {
      unmute()
    }
    else {
      mute()
    }
  })
})

function getAspectRatio(width: number, height: number, rotate = false) {
  if (rotate) {
    [width, height] = [height, width] // Swap width and height
  }
  return width / height
}

const aspectRatio = computed(() => {
  if (!videoWidth.value || !videoHeight.value) return getAspectRatio(16, 9, isMiring.value)
  return getAspectRatio(videoWidth.value, videoHeight.value, isMiring.value)
})

const { isMD } = useResponsive()
defineExpose({
  stop,
  rotate,
  syncLive,
  calculateVideoSize,
  isPlaying,
  isMuted,
  reload,
  togglePlay,
  isLandscape,
  changeSource,
  checkMute,
  volume,
  pause,
  play,
  mute,
  unmute,
  setVolume,
})
</script>

<template>
  <div
    ref="videoPlayer" class="overflow-hidden relative group flex items-center transform-all duration-300" :style="{
      aspectRatio: enableRotate && rotateFill === 'width' ? aspectRatio : undefined,

    }" :class="{
      'w-full h-full': !enableRotate && rotateFill !== 'width',
      'cursor-none!': !showControl && isPlaying,
    }"
  >
    <div
      :class="{
        'w-full h-full': !enableRotate,
        'absolute top-1/2 -translate-y-1/2 z-0': enableRotate && !isFullscreen,
        'absolute top-1/2 -translate-y-1/2 z-0 -translate-x-1/2 left-1/2':
          enableRotate && isFullscreen,
        'aspect-video': isLandscape && enableRotate,
        'aspsect-[9/12]': !isLandscape && enableRotate,
        'w-full':
          (videoFill === 'width' && !isFullscreen && enableRotate)
          || isFullscreen,
        'h-full': videoFill === 'height' && !isFullscreen && enableRotate,
      // 'w-full': isFullscreen && enableRotate && isFullscreenLandscape && !isLandscape,
      // 'w-full': isFullscreen && enableRotate && isFullscreenLandscape,
      }" @click="videoClick"
    >
      <video
        :id="id" ref="video" playsinline :controls="!(!useDefaultControl || enableRotate || hideControl)" :class="{
          'object-cover': !isFullscreen,
        }" class="inset-0 w-full h-full transition-all duration-500 origin-center"
        :style="{ transform: enableRotate ? `rotate(${rotation}deg)` : 'none' }" :poster="poster"
      >
        <p class="vjs-no-js">
          To view this video please enable JavaScript, and consider upgrading to
          a web browser that
          <a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
        </p>
      </video>
    </div>

    <div v-if="!useDefaultControl || enableRotate">
      <div
        v-if="!isPlaying && !isLoading"
        class="z-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1"
        :class="{ 'pointer-events-none': !isMobile }" @click="
          () => {
            if (isMobile) togglePlay()
          }
        "
      >
        <Icon name="ic:round-play-arrow" class="text-white/60" size="3rem" />
      </div>
      <div
        v-if="isMobile && isPlaying && showControl && !isLoading"
        class="z-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1"
        :class="{ 'pointer-events-none': !isMobile }" @click="togglePlay"
      >
        <Icon name="ic:round-pause" class="text-white/60" size="3rem" />
      </div>

      <div
        v-if="isLoading" id="loading-spinner"
        class="absolute inset-0 z-0 flex items-center justify-center bg-black/30 text-black"
      >
        <Icon name="svg-spinners:270-ring-with-bg" class="text-white" size="3rem" />
      </div>

      <div
        id="control" ref="videoControl" :class="{
          'opacity-100': showControl || isFocusControl || isHoverControl,
        }" class="absolute inset-x-0 bottom-0 z-10 text-slate-200 opacity-0 duration-200 ease-in-out"
        @click="setShowControl(true)"
      >
        <div :class="{ 'pointer-events-none': isMobile && !showControl }">
          <div class="group flex items-center justify-center">
            <div class="relative flex h-full w-full duration-200 group-hover/volume:w-20">
              <div
                :class="{ 'h-[3px]': compact, 'h-1': !compact }"
                class="absolute bottom-0 z-0 w-full overflow-hidden bg-neutral-700/75"
              >
                <div class="h-full bg-red-600" :style="{ width: `${videoProgess}%` }" />
              </div>
              <div
                :class="{
                  'opacity-0': !isMobile,
                  'h-3 w-3': !compact,
                  'h-2 w-2': compact,
                }"
                class="absolute bottom-[2px] -translate-x-1/2 translate-y-1/2 rounded-full bg-red-600 transition-opacity duration-300 group-hover:opacity-100"
                :style="{ left: `${videoProgess}%` }"
              />
              <input
                ref="seekSlider" :class="{ 'opacity-0': !isMobile, compact }" aria-label="Playback" type="range"
                min="0" max="10000" step="1"
                class="volume-slider hidden-slider z-20 h-4 w-full cursor-pointer transition-opacity duration-300 hover:opacity-100"
                @change="changeVideoTime" @input="seek" @pointerdown="isSeekDragging = true"
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
                <div
                  class="absolute inset-0 top-1/2 h-1 z-0 w-16 -translate-y-1/2 overflow-hidden rounded-xs bg-gray-300/25 md:w-20"
                >
                  <div class="h-full bg-slate-200" :style="{ width: `${volume * 100}%` }" />
                </div>
                <input
                  ref="volumeSlider" v-model="volume" aria-label="Volume" type="range" min="0" max="1" step="0.01"
                  class="volume-slider z-20 h-1 w-16 cursor-pointer md:w-20"
                >
              </div>
            </div>
            <div class="flex-1" />
            <div v-if="!compact && isMD" class="flex items-center text-xs md:text-sm">
              {{ $dayjs.duration(currentTimeFloor, 'second').format('mm:ss') }}
              / {{ $dayjs.duration(duration, 'second').format('mm:ss') }}
            </div>
            <button class="h-7 w-7 md:h-8 md:w-8 p-0.5 md:p-1" aria-label="Reload" type="button" @click="reload">
              <Icon name="ic:round-refresh" class="h-full w-full p-[1px]" />
            </button>
            <button
              v-if="enableRotate" class="h-7 w-7 md:h-8 md:w-8 p-0.5 md:p-1" aria-label="Reload" type="button"
              @click="rotate"
            >
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
                      <PopoverButton
                        v-for="source in sources" :key="source.id"
                        class="flex items-center truncate text-left text-sm hover:bg-black/50"
                        @click="() => changeSource(source)"
                      >
                        <div class="h-10 w-10">
                          <Icon
                            v-if="currentSource?.id === source.id" name="ic:round-check"
                            class="h-full w-full p-2.5"
                          />
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
            <button
              v-if="pipEnabled" class="group h-7 w-7 md:h-8 md:w-8 p-0.5 md:p-1" aria-label="Fullscreen"
              type="button" @click="togglePictureInPicture"
            >
              <Icon name="ic:round-picture-in-picture" class="h-full w-full p-0.5 duration-300" />
            </button>
            <button
              class="group h-7 w-7 md:h-8 md:w-8 p-0.5 md:p-1" aria-label="Fullscreen" type="button"
              @click="toggleFullscreen"
            >
              <Icon
                v-if="!isFullscreen" name="ic:round-fullscreen"
                class="h-full w-full duration-300 hover:scale-125"
              />
              <Icon v-else name="ic:round-fullscreen-exit" class="h-full w-full duration-300 hover:scale-125" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@reference "~/assets/css/theme.css";

.volume-slider {
  -webkit-appearance: none;
  /* Override default CSS styles */
  appearance: none;
  background: transparent;
  /* Grey background */
  outline: none;
  /* Remove outline */
  border: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  /* Override default look */
  appearance: none;
  width: 10px;
  /* Set a specific slider handle width */
  height: 10px;
  /* Slider handle height */
  background: #000;
  border: none;
  border-radius: 100%;
}

.volume-slider::-moz-range-thumb {
  width: 10px;
  /* Set a specific slider handle width */
  height: 10px;
  /* Slider handle height */
  background: #000;
  border: none;
  border-radius: 100%;
  /* Green background */
  cursor: pointer;
  /* Cursor on hover */
  appearance: none;
}

.volume-slider.compact::-webkit-slider-thumb {
  width: 7px;
  /* Set a specific slider handle width */
  height: 7px;
  /* Slider handle height */
}

.volume-slider.compact::-moz-range-thumb {
  width: 7px;
  /* Set a specific slider handle width */
  height: 7px;
  /* Slider handle height */
}

.volume-slider.hidden-slider::-webkit-slider-thumb {
  visibility: hidden;
}

.volume-slider.hidden-slider::-moz-range-thumb {
  visibility: hidden;
}

.volume-slider::-webkit-progress-value {
  background: transparent;
  border: none;
}

.volume-slider::-moz-range-progress {
  background: transparent;
  border: none;
  appearance: none;
}

.volume-slider::-moz-range-track {
  appearance: none;
}

.volume-slider:focus-visible::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  @apply ring-2 ring-blue-500;
}

.volume-slider:focus-visible::-moz-range-thumb {
  cursor: pointer;
  @apply ring-2 ring-blue-500;
}
</style>
