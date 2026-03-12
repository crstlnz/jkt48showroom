<script lang="ts" setup>
import { getVideoId } from '~/utils'
import 'lite-youtube-embed/src/lite-yt-embed.css'
import 'lite-youtube-embed/src/lite-yt-embed.js'

interface YoutubeIframePlayer {
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void
  playVideo: () => void
  pauseVideo?: () => void
  stopVideo?: () => void
  getPlayerState?: () => number
  mute?: () => void
  unMute?: () => void
  destroy?: () => void
  addEventListener?: (eventName: string, listener: (event: unknown) => void) => void
  removeEventListener?: (eventName: string, listener: (event: unknown) => void) => void
}

interface LiteYoutubeElement extends HTMLDivElement {
  getYTPlayer?: () => Promise<YoutubeIframePlayer>
}

const props = withDefaults(defineProps<{
  url?: string
  videoId?: string
  title?: string
  params?: string
  noCookie?: boolean
  adNetwork?: boolean
  jsApi?: boolean
}>(), {
  url: '',
  videoId: '',
  title: 'YouTube video',
  params: '',
  noCookie: true,
  adNetwork: false,
  jsApi: true,
})
const emit = defineEmits<{
  (e: 'ended'): void
  (e: 'stateChange', state: number): void
}>()

const resolvedVideoId = computed(() => {
  if (props.videoId) return props.videoId
  if (!props.url) return null
  return getVideoId(props.url)
})

const litePlayerRef = ref<LiteYoutubeElement | null>(null)
let playerApiPromise: Promise<YoutubeIframePlayer | null> | null = null
let playerStateListenerApi: YoutubeIframePlayer | null = null

const YT_ENDED_STATE = 0

function handlePlayerStateChange(event: unknown) {
  const state = Number((event as { data?: number } | null)?.data ?? event)
  if (!Number.isFinite(state)) return
  emit('stateChange', state)
  if (state === YT_ENDED_STATE) {
    emit('ended')
  }
}

function detachPlayerStateListener() {
  if (!playerStateListenerApi) return
  try {
    playerStateListenerApi.removeEventListener?.('onStateChange', handlePlayerStateChange)
  }
  catch {}
  playerStateListenerApi = null
}

function attachPlayerStateListener(playerApi: YoutubeIframePlayer) {
  if (playerStateListenerApi === playerApi) return
  detachPlayerStateListener()
  try {
    playerApi.addEventListener?.('onStateChange', handlePlayerStateChange)
    playerStateListenerApi = playerApi
  }
  catch {}
}

async function getPlayer() {
  if (import.meta.client) {
    try {
      await customElements.whenDefined('lite-youtube')
    }
    catch {}
  }
  await nextTick()
  const playerElement = litePlayerRef.value
  if (!playerElement || typeof playerElement.getYTPlayer !== 'function') {
    return null
  }

  if (!playerApiPromise) {
    playerApiPromise = playerElement.getYTPlayer()
      .then(player => player ?? null)
      .catch(() => null)
  }
  const playerApi = await playerApiPromise
  if (playerApi) {
    attachPlayerStateListener(playerApi)
  }
  return playerApi
}

async function play() {
  const player = await getPlayer()
  player?.playVideo()
}

async function pause() {
  const player = await getPlayer()
  player?.pauseVideo?.()
}

async function seekTo(seconds: number, allowSeekAhead = true) {
  const player = await getPlayer()
  player?.seekTo(seconds, allowSeekAhead)
}

async function mute() {
  const player = await getPlayer()
  player?.mute?.()
}

async function unMute() {
  const player = await getPlayer()
  player?.unMute?.()
}

async function destroyPlayer() {
  let player: YoutubeIframePlayer | null = null
  if (playerApiPromise) {
    player = await playerApiPromise.catch(() => null)
  }
  else {
    player = await getPlayer()
  }

  detachPlayerStateListener()
  try {
    player?.stopVideo?.()
    player?.destroy?.()
  }
  catch {}

  playerApiPromise = null
  litePlayerRef.value = null
}

watch(resolvedVideoId, () => {
  detachPlayerStateListener()
  playerApiPromise = null
})

onScopeDispose(() => {
  void destroyPlayer()
})

defineExpose({
  getPlayer,
  play,
  pause,
  seekTo,
  mute,
  unMute,
  destroyPlayer,
})
</script>

<template>
  <div>
    <lite-youtube
      v-if="resolvedVideoId"
      ref="litePlayerRef"
      class="size-full max-w-none!"
      :videoid="resolvedVideoId"
      :title="title"
      :params="params || undefined"
      :nocookie="noCookie ? true : undefined"
      :adnetwork="adNetwork ? true : undefined"
      :js-api="jsApi ? true : undefined"
    />
    <div v-else class="size-full flex items-center justify-center bg-black/20 text-xs opacity-75">
      Invalid YouTube URL
    </div>
  </div>
</template>
