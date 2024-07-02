<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    sources: { id: number, label: string, url: string, type: string }[]
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

const wrapper = ref<HTMLElement>()
const { isMobile } = useDevice()
const videoDimens = ref<{ width: number, height: number }>({ width: 0, height: 0 })
const hlsLoaded = ref(false)
const plyrLoaded = ref(false)
const { load: loadHls } = useScriptTag(
  useAppConfig().hlsUrl,
  () => {
    hlsLoaded.value = true
  },
  {
    manual: true,
  },
)

const { load: loadPlyr } = useScriptTag(
  'https://cdn.plyr.io/3.7.8/plyr.polyfilled.js',
  () => {
    plyrLoaded.value = true
  },
  {
    manual: true,
  },
)

const player = ref<any>()
const { rotate, rotation, videoScale, isRotateFeatureEnabled } = useVideoRotate(videoDimens)
watch(rotation, () => {
  const video = wrapper.value?.querySelector('video')
  if (video) {
    video.style.transform = `rotate(${rotation.value}deg) scale(${videoScale.value})`
  }
})

const sources = ref(props.sources)
watch(() => props.sources, () => {
  if (player.value) {
    player.value.quality = createQuality()
  }
})
const qualityId = useLocalStorage('quality-id', 2)
const currentSource = ref(
  (sources.value ?? []).find(i => qualityId.value === i.id) ?? sources.value[0],
)

const id = useId()
const video = ref<HTMLVideoElement>()

function destroyHls() {
  if (window.hls) {
    window.hls.destroy()
    window.hls = undefined
  }
}

function destroyPlayer() {
  if (player.value) player.value.destroy()
  destroyHls()
}

function createQuality() {
  return {
    default: qualityId.value, // Default - AUTO
    options: sources.value.map(i => i.id),
    forced: true,
    onChange: (e: number) => updateQuality(e),
  }
}

function createRefreshButton(player: any) {
  const downloadButton = document.createElement('button')
  downloadButton.classList.add('plyr__control')
  downloadButton.innerHTML = '<svg role="presentation" focusable="false"><use xlink:href="#plyr-restart"></use></svg>'
  downloadButton.addEventListener('click', () => {
    createHls()
  })

  const controls = player.elements.controls
  const fullscreenButton = controls.querySelector('.plyr__control[data-plyr=\'fullscreen\']')
  controls.insertBefore(downloadButton, fullscreenButton)
}

function createRotateButton(player: any) {
  const downloadButton = document.createElement('button')
  downloadButton.classList.add('plyr__control')
  downloadButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#ffffff" d="M4 2h3a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m16 13a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-9v-7zM14 4a8 8 0 0 1 8 8l-.06 1h-2.02l.08-1a6 6 0 0 0-6-6v3l-4-4l4-4z"/></svg>'
  downloadButton.addEventListener('click', () => {
    rotate()
  })

  // Insert the download button before the fullscreen button
  const controls = player.elements.controls
  const fullscreenButton = controls.querySelector('.plyr__control[data-plyr=\'fullscreen\']')
  controls.insertBefore(downloadButton, fullscreenButton)
}

function createVideoPlayer() {
  if (!video.value) return
  const defaultOptions: Record<string, any> = {
    controls: [
      'play-large', // The large play button in the center
      'play', // Play/pause playback
      'fast-forward', // Fast forward by the seek time (default 10 seconds)
      'progress', // The progress bar and scrubber for playback and buffering
      'current-time', // The current time of playback
      'duration', // The full duration of the media
      'mute', // Toggle mute
      'volume', // Volume control
      'settings', // Settings menu
      'pip', // Picture-in-picture (currently Safari only)
      'airplay', // Airplay (currently Safari only)
      // 'restart', // Restart playback
      'fullscreen', // Toggle fullscreen
    ],
    speed: {
      selected: 1,
      options: [1],
    },
    poster: props.poster,
  }
  defaultOptions.quality = createQuality()

  const qualityLabel: Record<number, string> = {}

  for (const source of sources.value) {
    qualityLabel[source.id] = source.label
  }
  // Add Auto Label
  defaultOptions.i18n = {
    qualityLabel,
  }

  player.value = new Plyr(video.value, defaultOptions)

  player.value.on('loadeddata', (e: any) => {
    const el = e.target?.querySelector('video')
    videoDimens.value = {
      width: el.videoWidth,
      height: el.videoHeight,
    }
  })

  player.value.on('loadedmetadata', (e: any) => {
    const el = e.target?.querySelector('video')
    videoDimens.value = {
      width: el.videoWidth,
      height: el.videoHeight,
    }
  })

  if (!isMobile) { createRefreshButton(player.value) }
  if (isRotateFeatureEnabled.value) { createRotateButton(player.value) }
  createHls()
}

function createHls() {
  if (!video.value) return
  if (window.hls) window.hls.destroy()
  const source = currentSource.value
  console.log(source)

  // if (source.type === 'hls') {
  if (!Hls.isSupported()) {
    video.value.src = source.url
  }
  else {
    // For more Hls.js options, see https://github.com/dailymotion/hls.js
    // if (window.hls) window.hls.destroy()
    const hls = new Hls()
    hls.loadSource(source.url)
    hls.attachMedia(video.value)
    window.hls = hls
  }
  // }
  // else {
  //   console.log('Use default player')
  //   video.value.src = source.url
  // }

  play()
}

async function play(retry: number = 0) {
  if (import.meta.server) return
  if (!video.value) return
  try {
    await video.value.play()
  }
  catch (e) {
    if (retry < 5) {
      setTimeout(() => {
        play(retry + 1)
      }, 100)
    }
    else {
      video.value.muted = true
      play(retry + 1)
    }
    console.error(e)
  }
}

function updateQuality(newQuality: number) {
  if (currentSource.value.id === newQuality) return
  const selectedQuality = sources.value.find(i => i.id === newQuality)
  if (selectedQuality) {
    currentSource.value = selectedQuality
    createHls()
  }
}

onBeforeUnmount(() => {
  destroyPlayer()
})

onMounted(async () => {
  await loadHls()
  await loadPlyr()
  createVideoPlayer()
})
</script>

<template>
  <div ref="wrapper" class="x-video-wrapper rotate [&>video]:transform [&>video]:duration-500">
    <video :id="id" ref="video" :poster="poster" class="size-full" />
  </div>
</template>

<style lang="scss">
@import url("https://cdn.plyr.io/3.7.8/plyr.css");

:root {
  --plyr-color-main: #ef4444
}

.x-video-wrapper {
  .plyr__video-wrapper{
      video {
         transition: 0.7s ease-out
      }
    }
}

.plyr {
  @apply size-full;

  .plyr__control {
    &::before {
      // background-color: white;
      transition: 0s !important;
    }
    transition: 0s !important;
  }

  &.plyr--loading::after {
    content: "";
    /* You can replace this with an image or spinner */
    position: absolute;
    top: calc(50% - 25px);
    left: calc(50% - 25px);
    border-radius: 50%;
    width: 50px;
    border: 8px solid #ffffff;
    aspect-ratio: 1;
    /* Adjust font size as needed */
    z-index: 10;
    animation:  l20-1 0.8s infinite linear alternate, l20-2 1.6s infinite linear;
  }
}

/* HTML: <div class="loader"></div> */
.loader {
  width: 50px;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 8px solid #514b82;
  animation:
    l20-1 0.8s infinite linear alternate,
    l20-2 1.6s infinite linear;
}
@keyframes l20-1{
   0%    {clip-path: polygon(50% 50%,0       0,  50%   0%,  50%    0%, 50%    0%, 50%    0%, 50%    0% )}
   12.5% {clip-path: polygon(50% 50%,0       0,  50%   0%,  100%   0%, 100%   0%, 100%   0%, 100%   0% )}
   25%   {clip-path: polygon(50% 50%,0       0,  50%   0%,  100%   0%, 100% 100%, 100% 100%, 100% 100% )}
   50%   {clip-path: polygon(50% 50%,0       0,  50%   0%,  100%   0%, 100% 100%, 50%  100%, 0%   100% )}
   62.5% {clip-path: polygon(50% 50%,100%    0, 100%   0%,  100%   0%, 100% 100%, 50%  100%, 0%   100% )}
   75%   {clip-path: polygon(50% 50%,100% 100%, 100% 100%,  100% 100%, 100% 100%, 50%  100%, 0%   100% )}
   100%  {clip-path: polygon(50% 50%,50%  100%,  50% 100%,   50% 100%,  50% 100%, 50%  100%, 0%   100% )}
}
@keyframes l20-2{
  0%    {transform:scaleY(1)  rotate(0deg)}
  49.99%{transform:scaleY(1)  rotate(135deg)}
  50%   {transform:scaleY(-1) rotate(0deg)}
  100%  {transform:scaleY(-1) rotate(-135deg)}
}
</style>
