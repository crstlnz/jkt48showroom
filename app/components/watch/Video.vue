<script lang="ts" setup>
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'

const props = withDefaults(
  defineProps<{
    sources: ShowroomAPI.StreamingURL[]
    poster: string
    title?: string
    landscape?: boolean
    useShortcut?: boolean
    useDefaultControl?: boolean
    hideControl?: boolean
    hideCursorWhenPlaying?: boolean
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
    hideCursorWhenPlaying: true,
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

const sources = ref(props.sources.filter(i => i.type === 'hls' || isYouTubeUrl(i.url ?? '')) ?? [])
watch(
  () => props.sources,
  () => {
    sources.value = props.sources.filter(i => i.type === 'hls' || isYouTubeUrl(i.url ?? '')) ?? []
  },
)

const qualityId = useLocalStorage('quality-id', 2)
const currentSource = ref(
  (sources.value ?? []).find(i => qualityId.value === i.id) ?? sources.value[0],
)

// Whether the active source is a YouTube URL
const isYouTube = computed(() => isYouTubeUrl(currentSource.value?.url ?? ''))
const youtubeVideoId = computed(() => extractYouTubeId(currentSource.value?.url ?? ''))

// ─── HLS / Native video refs ──────────────────────────────────────────────────

const videoPlayer = ref<HTMLElement>()
const video = ref<HTMLVideoElement>()
const hls = ref()
const tempVolume = props.saveState ? useLocalStorage('data-volume', 0) : ref(1)
const isMuted = ref(false)
const mutedData = props.saveState
  ? useLocalStorage('data-muted', false)
  : ref(false)
const isPlaying = ref(true)
const isLoading = ref(true)
const volume = ref(0)
const { isMobile } = useResponsive()

const { start: startAutoReload, stop: stopAutoReload } = useTimeoutFn(() => {
  reload()
}, 10000)

const pausedByUser = ref(false)
const ytPlayer = ref<any>(null)

function setVolume(v: any, forced = false) {
  const n = Number.parseFloat(v)
  // YouTube player
  if (isYouTube.value && ytPlayer.value) {
    if (n === 0) {
      ytPlayer.value.mute()
    }
    else {
      ytPlayer.value.unMute()
      ytPlayer.value.setVolume(n * 100)
    }
    if (n > 0) tempVolume.value = n
    if (!forced) mutedData.value = n === 0
    isMuted.value = n === 0
    volume.value = n
    return
  }
  // Native video
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
  }
}

const showControl = ref(false)
const isFocusControl = ref(false)
const isHoverControl = ref(false)
const videoWidth = ref(0)
const videoHeight = ref(0)

const { start: autoRemoveHover, stop: stopAutoRemoveHover } = useTimeoutFn(
  () => {
    isFocusControl.value = false
    isHoverControl.value = false
    setShowControl(false)
  },
  3500,
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

// ─── YouTube IFrame API ───────────────────────────────────────────────────────

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

const ytContainerId = useId()
const ytApiReady = ref(false)
const ytPlayerReady = ref(false)

function loadYouTubeApi(): Promise<void> {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve()
      return
    }
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve()
    }
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }
  })
}

async function createYouTubePlayer(videoId: string) {
  if (import.meta.server) return
  isLoading.value = true
  ytPlayerReady.value = false

  await loadYouTubeApi()
  ytApiReady.value = true

  // Wait for the DOM container to be rendered
  await nextTick()

  // Destroy previous instance
  if (ytPlayer.value) {
    try {
      ytPlayer.value.destroy()
    }
    catch {}
    ytPlayer.value = null
  }

  ytPlayer.value = new window.YT.Player(ytContainerId, {
    videoId,
    playerVars: {
      autoplay: 1,
      controls: 0, // hide native controls (we use our own)
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
      enablejsapi: 1,
      origin: window.location.origin,
    },
    events: {
      onReady(event: any) {
        ytPlayerReady.value = true
        isLoading.value = false
        isPlaying.value = true
        // Restore volume / mute state
        if (mutedData.value) {
          event.target.mute()
          isMuted.value = true
          volume.value = 0
        }
        else {
          const v = Number(tempVolume.value) || 1
          event.target.unMute()
          event.target.setVolume(v * 100)
          volume.value = v
          isMuted.value = false
        }
      },
      onStateChange(event: any) {
        // YT.PlayerState: UNSTARTED=-1, ENDED=0, PLAYING=1, PAUSED=2, BUFFERING=3, CUED=5
        const state = event.data
        if (state === 1) {
          isPlaying.value = true
          isLoading.value = false
          stopAutoReload()
        }
        else if (state === 2) {
          isPlaying.value = false
          isLoading.value = false
          if (!pausedByUser.value) startAutoReload()
        }
        else if (state === 3) {
          isLoading.value = true
        }
        else if (state === 0) {
          // ended
          isPlaying.value = false
        }
      },
      onError() {
        emit('sourceError')
        startAutoReload()
      },
    },
  })
}

// ─── HLS setup ───────────────────────────────────────────────────────────────

const fatalError = ref(0)
const proxied = ref(false)
const createdVideo = ref(false)

useScriptTag(
  useAppConfig().hlsUrl,
  () => {
    if (!isYouTube.value) {
      createHLS(currentSource.value?.url ?? '')
    }
  },
  { defer: true },
)

const useWorker = ref(true)
const proxyServers = ref(getProxyServer())
const proxyIndex = ref(0)

onMounted(() => {
  if (isYouTube.value) {
    if (youtubeVideoId.value) {
      createYouTubePlayer(youtubeVideoId.value)
    }
  }
  else if (!createdVideo.value && typeof Hls !== 'undefined') {
    createdVideo.value = true
    createHLS(currentSource.value?.url ?? '')
  }
})

const hlsNotWork = ref(false)
const id = useId()

function createHLS(_url: string) {
  if (!video.value) return
  const url = `${proxied.value ? `${proxyServers.value[proxyIndex.value] ?? ''}` : ''}${_url}`

  if (Hls.isSupported() && !hlsNotWork.value) {
    fatalError.value = 0
    isLoading.value = true
    destroyVideo()
    hls.value = new Hls({
      enableWorker: false,
      liveSyncDurationCount: 2,
      maxBufferSize: props.maxBufferSize ? props.maxBufferSize : 254 * 1000 * 1000,
      maxBufferLength: 60,
      lowLatencyMode: true,
      fetchSetup(context: any, initParams: any) {
        initParams.credentials = 'include'
        return new Request(context.url, initParams)
      },
    })

    const syncVideoMetrics = () => {
      requestAnimationFrame(() => {
        if (!video.value) return
        if (video.value.videoWidth && video.value.videoHeight) {
          videoWidth.value = video.value.videoWidth
          videoHeight.value = video.value.videoHeight
        }
        calculateVideoSize()
      })
    }

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
            hls.value.startLoad()
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.value.recoverMediaError()
            break
          default:
            if (useWorker.value) {
              useWorker.value = false
              return createHLS(url)
            }
            reload()
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
      syncVideoMetrics()
    })
    hls.value.on(Hls.Events.MANIFEST_LOADING, () => {
      isLoading.value = true
    })
    hls.value.on(Hls.Events.MANIFEST_PARSED, () => {
      syncVideoMetrics()
    })
    hls.value.on(Hls.Events.LEVEL_LOADED, () => {
      stopAutoReload()
      isLoading.value = false
      syncVideoMetrics()
    })
    hls.value.on(Hls.Events.LEVEL_SWITCHED, () => {
      syncVideoMetrics()
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

function destroyYouTube() {
  if (ytPlayer.value) {
    try {
      ytPlayer.value.destroy()
    }
    catch {}
    ytPlayer.value = null
    ytPlayerReady.value = false
  }
}

// ─── Playback Controls ────────────────────────────────────────────────────────

function toggleMute() {
  if (isYouTube.value && ytPlayer.value) {
    if (ytPlayer.value.isMuted()) {
      ytPlayer.value.unMute()
      const v = Number(tempVolume.value) || 1
      ytPlayer.value.setVolume(v * 100)
      isMuted.value = false
      volume.value = v
      mutedData.value = false
    }
    else {
      ytPlayer.value.mute()
      isMuted.value = true
      volume.value = 0
      mutedData.value = true
    }
    return
  }
  if (video.value) {
    if (video.value.muted) unmute()
    else mute()
  }
}

function mute() {
  if (isYouTube.value && ytPlayer.value) {
    ytPlayer.value.mute()
    isMuted.value = true
    volume.value = 0
    return
  }
  if (video.value) {
    video.value.muted = true
    isMuted.value = true
  }
  else {
    setVolume(0)
  }
}

function unmute() {
  if (isYouTube.value && ytPlayer.value) {
    ytPlayer.value.unMute()
    const v = Number(tempVolume.value) || 1
    ytPlayer.value.setVolume(v * 100)
    isMuted.value = false
    volume.value = v
    return
  }
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
  if (isYouTube.value && ytPlayerReady.value && ytPlayer.value) {
    const state = ytPlayer.value.getPlayerState()
    if (state === 1 /* PLAYING */) {
      pausedByUser.value = true
      ytPlayer.value.pauseVideo()
    }
    else {
      pausedByUser.value = false
      ytPlayer.value.playVideo()
    }
    return
  }
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
    }
    catch (e) { console.error(e) }
    finally { isProcessingPlay.value = false }
  }
}

function reload() {
  stopAutoReload()
  try {
    if (isYouTube.value) {
      if (youtubeVideoId.value) {
        createYouTubePlayer(youtubeVideoId.value)
      }
    }
    else {
      createHLS(currentSource.value?.url ?? '')
    }
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
useEventListener(videoControl, 'focusin', () => {
  if (!isMobile) isFocusControl.value = true
})
useEventListener(videoControl, 'focusout', () => {
  isFocusControl.value = false
})

const { isSupported, orientation, lockOrientation, unlockOrientation } = useScreenOrientation()
const rotation = ref(0)
const isMiring = computed(() => (rotation.value / 90) % 2 !== 0)
const isLandscape = computed(() => videoHeight.value <= videoWidth.value)

watch(isLandscape, l => emit('isLandscape', l), { immediate: true })

const isBuiltInFullscreen = ref(false)
const { isFullscreen: isPlayerFullscreen, toggle } = useFullscreen(videoPlayer)
const isFullscreen = computed(() => isBuiltInFullscreen.value || isPlayerFullscreen.value)

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
    catch (e) { console.error(e) }
  }
  else {
    unlockOrientation()
    await toggle()
  }
}

function togglePictureInPicture() {
  // YouTube does not support PiP via API – skip silently
  if (isYouTube.value) return
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

  // Switching between YouTube ↔ HLS: destroy the old player first
  if (isYouTubeUrl(source.url ?? '')) {
    destroyVideo()
    const vid = extractYouTubeId(source.url ?? '')
    if (vid) createYouTubePlayer(vid)
  }
  else {
    destroyYouTube()
    reload()
  }
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
  { immediate: true },
)

async function play() {
  if (import.meta.server) return
  pausedByUser.value = false
  if (isYouTube.value && ytPlayerReady.value && ytPlayer.value) {
    ytPlayer.value.playVideo()
    return
  }
  if (video.value) {
    try {
      mutedData.value ? mute() : unmute()
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

// Poll YouTube current time
let ytPoller: ReturnType<typeof setInterval> | null = null
watch(isYouTube, (yt) => {
  if (yt) {
    ytPoller = setInterval(() => {
      if (!ytPlayerReady.value || !ytPlayer.value) return
      try {
        const d = ytPlayer.value.getDuration?.() ?? 0
        const t = ytPlayer.value.getCurrentTime?.() ?? 0
        if (d) duration.value = d
        if (!isSeekDragging.value) currentTime.value = t
      }
      catch {}
    }, 500)
  }
  else {
    if (ytPoller) {
      clearInterval(ytPoller)
      ytPoller = null
    }
  }
}, { immediate: true })

onBeforeUnmount(() => {
  destroyVideo()
  destroyYouTube()
  if (ytPoller) clearInterval(ytPoller)
  if (document?.pictureInPictureElement) {
    document.exitPictureInPicture()
  }
})

function videoClick() {
  if (!isMobile) {
    togglePlay()
  }
  else {
    if (!showControl.value) setShowControl(true)
    else setShowControl(false)
  }
}

function stop() {
  destroyVideo()
  destroyYouTube()
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
  const t = seekSlider.value
    ? (Number(seekSlider.value.value) / (Number(seekSlider.value.max) || 0)) * duration.value
    : 0
  if (isYouTube.value && ytPlayerReady.value && ytPlayer.value) {
    ytPlayer.value.seekTo(t, true)
  }
  else if (video.value) {
    video.value.currentTime = t
  }
  isSeekDragging.value = false
}

if (props.useShortcut) {
  onKeyStroke('ArrowLeft', () => {
    const val = currentTime.value - 2
    if (isYouTube.value && ytPlayer.value) ytPlayer.value.seekTo(val < 0 ? 0 : val, true)
    else if (video.value) video.value.currentTime = val < 0 ? 0 : val
  }, { eventName: 'keyup' })

  onKeyStroke('ArrowRight', () => {
    const val = currentTime.value + 2
    const maxTime = duration.value - 3
    if (isYouTube.value && ytPlayer.value) ytPlayer.value.seekTo(val > maxTime ? maxTime : val, true)
    else if (video.value) video.value.currentTime = val > maxTime ? maxTime : val
  }, { eventName: 'keyup' })
}

watch(videoProgess, (val) => {
  if (seekSlider.value) {
    seekSlider.value.value = String((val * (Number(seekSlider.value.max) || 0)) / 100)
  }
}, { immediate: true })

const currentTimeFloor = computed(() => Math.floor(currentTime.value))

function checkMute() {
  return video.value?.getAttribute('prop')
}

const volumeIcon = computed(() => {
  if (!isMuted.value && volume.value >= 0.5) return 'ic:round-volume-up'
  else if (!isMuted.value && volume.value > 0) return 'ic:round-volume-down'
  return 'ic:round-volume-off'
})

const playIcon = computed(() => isPlaying.value ? 'ic:round-pause' : 'ic:round-play-arrow')

function pause() {
  if (isYouTube.value && ytPlayer.value) {
    ytPlayer.value.pauseVideo()
    pausedByUser.value = true
    return
  }
  video.value?.pause()
  pausedByUser.value = true
}

function syncLive() {
  if (isYouTube.value && ytPlayer.value) {
    // Seek to live edge for YouTube live streams
    ytPlayer.value.seekTo(duration.value, true)
    return
  }
  if (video.value) video.value.currentTime = duration.value - 3
}

const enableRotate = ref(!isYouTube.value)

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

function calculateVideoSize() {
  const deg = rotation.value
  if (!video.value || !videoPlayer.value) return
  video.value.style.removeProperty('scale')
  const baseEl = video.value.parentElement as HTMLElement | null
  const rect = (baseEl ?? videoPlayer.value).getBoundingClientRect()
  const baseSize = { width: rect.width || 0, height: rect.height || 0 }
  if (!baseSize.width || !baseSize.height) return
  if ((deg / 90) % 2 !== 0) {
    const potrait = baseSize.height / baseSize.width
    const landscape = baseSize.width / baseSize.height
    let aspectRatio: number
    if (props.rotateFill === 'width') aspectRatio = landscape
    else aspectRatio = potrait
    if (isFullscreen.value) {
      aspectRatio = isFullscreenLandscape.value
        ? !isLandscape.value ? landscape : potrait
        : !isLandscape.value ? potrait : landscape
    }
    video.value.style.scale = `${aspectRatio}`
  }
}

watch(rotation, () => {
  const isLs = isLandscape.value ? !isMiring.value : isMiring.value
  emit('isLandscape', isLs)
  requestAnimationFrame(() => calculateVideoSize())
})

useEventListener(video, 'loadedmetadata', function () {
  videoWidth.value = (this as any).videoWidth
  videoHeight.value = (this as any).videoHeight
  requestAnimationFrame(() => calculateVideoSize())
})
useEventListener(video, 'loadeddata', function () {
  videoWidth.value = (this as any).videoWidth
  videoHeight.value = (this as any).videoHeight
  requestAnimationFrame(() => calculateVideoSize())
})
useEventListener(video, 'resize', () => {
  if (!video.value) return
  videoWidth.value = video.value.videoWidth
  videoHeight.value = video.value.videoHeight
  requestAnimationFrame(() => calculateVideoSize())
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
useEventListener(video, 'webkitfullscreenchange', () => checkBuiltInFullscreen())
useEventListener(video, 'mozfullscreenchange', () => checkBuiltInFullscreen())
useEventListener(video, 'fullscreenchange', () => checkBuiltInFullscreen())

const pipEnabled = ref(false)

onMounted(() => {
  useEventListener(window, 'resize', () => requestAnimationFrame(() => calculateVideoSize()))
  useResizeObserver(videoPlayer, () => requestAnimationFrame(() => calculateVideoSize()))
  pipEnabled.value = document.pictureInPictureEnabled

  try {
    navigator.mediaSession.setActionHandler('nexttrack', () => reload())
  }
  catch (e) { console.error(e) }

  if (video.value) {
    volume.value = Number(tempVolume.value) || 1
    setVolume(volume.value)
    isPlaying.value = !video.value.paused
  }

  nextTick(() => {
    if (!isYouTube.value) {
      if (!mutedData.value) unmute()
      else mute()
    }
  })
})

function getAspectRatio(width: number, height: number, rotate = false) {
  if (rotate) [width, height] = [height, width]
  return width / height
}

const aspectRatio = computed(() => {
  if (isYouTube.value) return 16 / 9 // anggap YouTube selalu 16:9
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
    ref="videoPlayer"
    class="overflow-hidden relative group flex items-center transform-all duration-300 size-full!"
    :style="{ aspectRatio: enableRotate && rotateFill === 'width' ? aspectRatio : (isYouTube ? aspectRatio : undefined) }"
    :class="{
      'cursor-none!': hideCursorWhenPlaying && !showControl && isPlaying,
    }"
  >
    <!-- ── YouTube iframe ─────────────────────────────────────────── -->
    <template v-if="isYouTube">
      <div
        class="absolute inset-0 z-0 w-full h-full"
        @click="videoClick"
      >
        <div :id="ytContainerId" class="w-full h-full pointer-events-none" />
        <div class="absolute inset-0 z-10" @click="videoClick" />
      </div>
    </template>

    <!-- ── HLS video ───────────────────────────────────────── -->
    <template v-else>
      <div
        :style="{
          aspectRatio: videoWidth / videoHeight,
        }"
        :class="{
          'w-full h-full': !enableRotate,
          'absolute top-1/2 -translate-y-1/2 z-0': enableRotate && !isFullscreen,
          'absolute top-1/2 -translate-y-1/2 z-0 -translate-x-1/2 left-1/2': enableRotate && isFullscreen,
          'w-full': (videoFill === 'width' && !isFullscreen && enableRotate) || (isFullscreen && (isLandscape || isMiring)),
          'h-full': (videoFill === 'height' && !isFullscreen && enableRotate) || (isFullscreen && (!isLandscape || isMiring)),
        }"
        @click="videoClick"
      >
        <video
          :id="id"
          ref="video"
          playsinline
          :controls="!(!useDefaultControl || enableRotate || hideControl)"
          :class="{ 'object-cover': !isFullscreen }"
          class="inset-0 w-full h-full transition-all duration-500 origin-center"
          :style="{ transform: enableRotate ? `rotate(${rotation}deg)` : 'none' }"
          :poster="poster"
        >
          <p class="vjs-no-js">
            To view this video please enable JavaScript, and consider upgrading to a web browser that
            <a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
          </p>
        </video>
      </div>
    </template>

    <!-- ── Shared overlay controls ───────────────────────────────── -->
    <div v-if="!useDefaultControl || enableRotate || isYouTube">
      <!-- Play button (center) -->
      <div
        v-if="!isPlaying && !isLoading"
        class="z-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1"
        :class="{ 'pointer-events-none': !isMobile }"
        @click="() => { if (isMobile) togglePlay() }"
      >
        <Icon name="ic:round-play-arrow" class="text-white/60" size="3rem" />
      </div>

      <!-- Pause button (center, mobile) -->
      <div
        v-if="isMobile && isPlaying && showControl && !isLoading"
        class="z-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1"
        :class="{ 'pointer-events-none': !isMobile }"
        @click="togglePlay"
      >
        <Icon name="ic:round-pause" class="text-white/60" size="3rem" />
      </div>

      <!-- Loading spinner -->
      <div
        v-if="isLoading"
        id="loading-spinner"
        class="absolute inset-0 z-0 flex items-center justify-center bg-black/30 text-black"
      >
        <Icon name="svg-spinners:270-ring-with-bg" class="text-white" size="3rem" />
      </div>

      <div
        v-if="title"
        :title="title"
        :class="{ 'opacity-100': showControl || isFocusControl || isHoverControl }"
        class="absolute inset-x-0 top-0 z-10 text-slate-200 opacity-0 duration-200 ease-in-out px-3 py-1 font-bold text-sm"
      >
        {{ title }}
      </div>

      <div
        class="absolute inset-0 z-0 transition-opacity duration-200 ease-in-out opacity-0"
        :class="{ 'opacity-100': showControl || isFocusControl || isHoverControl }"
        style="background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.5) 100%)"
      />
      <!-- Bottom control bar -->
      <div
        id="control"
        ref="videoControl"
        :class="{ 'opacity-100': showControl || isFocusControl || isHoverControl }"
        class="absolute inset-x-0 bottom-0 z-10 text-slate-200 opacity-0 duration-200 ease-in-out"
        @click="setShowControl(true)"
      >
        <div :class="{ 'pointer-events-none': isMobile && !showControl }">
          <!-- Seek bar -->
          <div class="group flex items-center justify-center">
            <div class="relative flex h-full w-full duration-200 group-hover/volume:w-20">
              <div
                :class="{ 'h-0.75': compact, 'h-1': !compact }"
                class="absolute bottom-0 z-0 w-full overflow-hidden bg-gray-200"
              >
                <div class="h-full bg-red-500" :style="{ width: `${videoProgess}%` }" />
              </div>
              <div
                :class="{
                  'opacity-0': !isMobile,
                  'h-3 w-3': !compact,
                  'h-2 w-2': compact,
                }"
                class="absolute bottom-0.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-red-500 transition-opacity duration-300 group-hover:opacity-100"
                :style="{ left: `${videoProgess}%` }"
              />
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

          <!-- Buttons row -->
          <div class="flex w-full px-1 duration-200 md:px-2 items-center">
            <button class="h-7 w-7 md:h-8 md:w-8 p-0.5 md:p-1" aria-label="Play" type="button" @click="togglePlay">
              <Icon :name="playIcon" class="h-full w-full" />
            </button>

            <div v-if="!compact" class="group/volume flex items-center gap-1">
              <button class="h-7 w-7 md:h-8 md:w-8 p-0.5 md:p-1" aria-label="Mute" type="button" @click="toggleMute">
                <Icon :name="volumeIcon" class="h-full w-full" />
              </button>
              <div class="relative flex h-full w-16 items-center duration-200 group-hover/volume:w-20 md:w-20">
                <div class="absolute inset-0 top-1/2 h-1 z-0 w-16 -translate-y-1/2 overflow-hidden rounded-xs bg-gray-100/25 md:w-20">
                  <div class="h-full bg-slate-100" :style="{ width: `${volume * 100}%` }" />
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
              {{ $dayjs.duration(currentTimeFloor, 'second').format('mm:ss') }}
              / {{ $dayjs.duration(duration, 'second').format('mm:ss') }}
            </div>

            <button class="h-7 w-7 md:h-8 md:w-8 p-0.5 md:p-1" aria-label="Reload" type="button" @click="reload">
              <Icon name="ic:round-refresh" class="h-full w-full p-px" />
            </button>

            <!-- Rotate only for native video -->
            <button
              v-if="enableRotate && !isYouTube"
              class="h-7 w-7 md:h-8 md:w-8 p-0.5 md:p-1"
              aria-label="Rotate"
              type="button"
              @click="rotate"
            >
              <Icon name="ic:outline-rotate-right" class="h-full w-full p-px" />
            </button>

            <Popover v-if="!compact">
              <PopoverButton aria-label="Setting" class="h-7 w-7 md:h-8 md:w-8 p-0.5 md:p-1">
                <Icon name="ic:baseline-settings" class="h-full w-full p-0.5 duration-300" />
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
                    <div class="flex w-55 flex-col py-1 text-base md:w-62.5">
                      <PopoverButton
                        v-for="source in sources"
                        :key="source.id"
                        class="flex items-center truncate text-left text-sm hover:bg-black/50"
                        @click="() => changeSource(source)"
                      >
                        <div class="h-10 w-10">
                          <Icon
                            v-if="currentSource?.id === source.id"
                            name="ic:round-check"
                            class="h-full w-full p-2.5"
                          />
                        </div>
                        <div>{{ source.label }}</div>
                      </PopoverButton>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </Popover>

            <!-- PiP: hide for YouTube -->
            <button
              v-if="pipEnabled && !isYouTube"
              class="group h-7 w-7 md:h-8 md:w-8 p-0.5 md:p-1"
              aria-label="Picture in Picture"
              type="button"
              @click="togglePictureInPicture"
            >
              <Icon name="ic:round-picture-in-picture" class="h-full w-full p-0.5 duration-300" />
            </button>

            <button
              class="group h-7 w-7 md:h-8 md:w-8 p-0.5 md:p-1"
              aria-label="Fullscreen"
              type="button"
              @click="toggleFullscreen"
            >
              <Icon v-if="!isFullscreen" name="ic:round-fullscreen" class="h-full w-full duration-300 hover:scale-125" />
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
  appearance: none;
  background: transparent;
  outline: none;
  border: none;
}
.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 10px;
  height: 10px;
  background: #000;
  border: none;
  border-radius: 100%;
}
.volume-slider::-moz-range-thumb {
  width: 10px;
  height: 10px;
  background: #000;
  border: none;
  border-radius: 100%;
  cursor: pointer;
  appearance: none;
}
.volume-slider.compact::-webkit-slider-thumb { width: 7px; height: 7px; }
.volume-slider.compact::-moz-range-thumb    { width: 7px; height: 7px; }
.volume-slider.hidden-slider::-webkit-slider-thumb { visibility: hidden; }
.volume-slider.hidden-slider::-moz-range-thumb     { visibility: hidden; }
.volume-slider::-webkit-progress-value { background: transparent; border: none; }
.volume-slider::-moz-range-progress    { background: transparent; border: none; appearance: none; }
.volume-slider::-moz-range-track       { appearance: none; }
.volume-slider:focus-visible::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; cursor: pointer; @apply ring-2 ring-blue-500; }
.volume-slider:focus-visible::-moz-range-thumb     { cursor: pointer; @apply ring-2 ring-blue-500; }
</style>
