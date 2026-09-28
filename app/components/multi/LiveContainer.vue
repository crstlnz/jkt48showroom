<script lang="ts" setup>
import type SwipeDetector from '~/library/plugins/swipeDetector'
import { useOnLives } from '~/store/onLives'
import { convertShowroom } from '~/utils/multi'
import { extractYouTubeId } from '~/utils/youtube'

const props = defineProps<{
  selected: Map<string, Multi.Video>
}>()
const emit = defineEmits<{
  (e: 'select', id: Multi.Video): void
  (e: 'openChange', open: boolean): void
  (e: 'requestCollapse'): void
}>()
const route = useRoute()
const { t } = useI18n()
const isMockup = ref(route.query.mockup != null)
const isIDNMultiBypassEnabled = ref(false)
const isBetaDeviceChecked = ref(false)
const liveOpen = ref(false)
const sourceUrl = ref('')
const sourceError = ref('')
const livePanel = ref<HTMLElement>()
const liveScroller = ref<HTMLElement>()
const swipeOffset = ref(0)
const isSwiping = ref(false)
const touchGesture = ref<{
  identifier: number
  startX: number
  startY: number
  originY: number
  source: 'sheet' | 'content'
  scrollerWasAtTop: boolean
  direction?: 'horizontal' | 'up' | 'down'
  dragging: boolean
  swipeDetector?: SwipeDetector
}>()

let removeGestureListeners: (() => void) | undefined
let escapeListenerAttached = false

const SWIPE_CLOSE_DISTANCE = 80
const SWIPE_CLOSE_RATIO = 0.4
const TOUCH_MOVE_SLOP = 10

const { $createSwipeDetector } = useNuxtApp()

function takeUnlockIDNKey() {
  const hash = new URLSearchParams(window.location.hash.slice(1))
  const key = hash.get('betakey') || hash.get('betaKey') || undefined
  if (!key) return undefined

  hash.delete('betakey')
  hash.delete('betaKey')
  const remainingHash = hash.toString()
  const cleanUrl = `${window.location.pathname}${window.location.search}${remainingHash ? `#${remainingHash}` : ''}`
  window.history.replaceState(window.history.state, '', cleanUrl)
  return key
}

onMounted(async () => {
  const key = takeUnlockIDNKey()
  if (!key && !hasBetaDeviceId()) {
    isBetaDeviceChecked.value = true
    return
  }

  try {
    const deviceId = await useBetaDeviceId()
    const result = await $apiFetch<{ enabled: boolean }>('/api/beta', {
      method: 'POST',
      body: { fingerprint: deviceId, key },
    })
    isIDNMultiBypassEnabled.value = result.enabled
  }
  catch {
    isIDNMultiBypassEnabled.value = false
  }
  finally {
    isBetaDeviceChecked.value = true
  }
})

function select(video: Omit<Multi.Video, 'order'>) {
  emit('select', {
    ...video,
    order: props.selected.size + 1,
  })
}

function addSourceUrl() {
  const url = sourceUrl.value.trim()
  sourceError.value = ''

  if (!url) {
    sourceError.value = t('multi.source_url_required')
    return
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  }
  catch {
    sourceError.value = t('multi.source_url_invalid')
    return
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    sourceError.value = t('multi.source_url_protocol')
    return
  }

  const youtubeId = extractYouTubeId(url)
  const video: Omit<Multi.Video, 'order'> = youtubeId
    ? {
        id: `yt-${youtubeId}`,
        name: `YouTube ${youtubeId}`,
        poster: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
        image: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
        stream_url: url,
        original_url: url,
        icon: '',
        landscape: true,
        space: 1,
        type: 'youtube',
        is_mockup: false,
      }
    : {
        id: `source-${url}`,
        name: parsedUrl.hostname,
        poster: '',
        image: '',
        stream_url: url,
        original_url: url,
        icon: '',
        landscape: true,
        space: 1,
        type: 'showroom',
        is_mockup: false,
      }

  if (props.selected.has(video.id)) {
    sourceError.value = t('multi.source_url_exists')
    return
  }

  select(video)
  sourceUrl.value = ''
}

function close() {
  cleanupGestureController()
  if (!liveOpen.value) return
  liveOpen.value = false
  emit('openChange', false)
}

function getTouch(event: TouchEvent, identifier: number) {
  return Array.from(event.touches).find(touch => touch.identifier === identifier)
    || Array.from(event.changedTouches).find(touch => touch.identifier === identifier)
}

function getPanelHeight() {
  return livePanel.value?.getBoundingClientRect().height || window.innerHeight
}

function resetTouchGesture() {
  touchGesture.value = undefined
  swipeOffset.value = 0
  isSwiping.value = false
}

function startPanelDrag(gesture: NonNullable<typeof touchGesture.value>, touch: Touch, event: TouchEvent, resetOrigin: boolean) {
  if (resetOrigin) {
    gesture.originY = touch.clientY
    gesture.swipeDetector = $createSwipeDetector(touch.clientX, touch.clientY)
    swipeOffset.value = 0
  }
  else {
    gesture.originY = gesture.startY
    gesture.swipeDetector = $createSwipeDetector(gesture.startX, gesture.startY)
  }

  gesture.dragging = true
  isSwiping.value = true
  if (event.cancelable) event.preventDefault()

  if (!resetOrigin) {
    swipeOffset.value = Math.min(Math.max(touch.clientY - gesture.originY, 0), getPanelHeight())
  }
}

function handleTouchStart(event: TouchEvent) {
  if (touchGesture.value) return

  const touch = event.changedTouches.item(0)
  if (!touch) return

  const target = event.target
  const source = target instanceof Node && liveScroller.value?.contains(target) ? 'content' : 'sheet'
  const scrollerWasAtTop = source === 'content' ? (liveScroller.value?.scrollTop ?? 0) <= 0 : true

  touchGesture.value = {
    identifier: touch.identifier,
    startX: touch.clientX,
    startY: touch.clientY,
    originY: touch.clientY,
    source,
    scrollerWasAtTop,
    dragging: false,
  }
}

function handleTouchMove(event: TouchEvent) {
  const gesture = touchGesture.value
  if (!gesture) return

  const touch = getTouch(event, gesture.identifier)
  if (!touch) return

  const deltaX = touch.clientX - gesture.startX
  const deltaY = touch.clientY - gesture.startY

  if (!gesture.direction) {
    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < TOUCH_MOVE_SLOP) return

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      gesture.direction = 'horizontal'
      return
    }

    gesture.direction = deltaY < 0 ? 'up' : 'down'
  }

  if (gesture.direction !== 'down') return

  const scrollerAtTop = (liveScroller.value?.scrollTop ?? 0) <= 0
  if (gesture.source === 'content' && !gesture.dragging && !scrollerAtTop) return

  if (!gesture.dragging) {
    const isHandoff = gesture.source === 'content' && !gesture.scrollerWasAtTop
    startPanelDrag(gesture, touch, event, isHandoff)
  }

  if (!gesture.dragging) return

  if (event.cancelable) event.preventDefault()
  swipeOffset.value = Math.min(Math.max(touch.clientY - gesture.originY, 0), getPanelHeight())
}

function handleTouchEnd(event: TouchEvent) {
  const gesture = touchGesture.value
  if (!gesture) return

  const touch = getTouch(event, gesture.identifier)
  if (!touch) {
    resetTouchGesture()
    return
  }

  if (!gesture.dragging) {
    resetTouchGesture()
    return
  }

  const panelHeight = getPanelHeight()
  const closeDistance = Math.max(SWIPE_CLOSE_DISTANCE, panelHeight * SWIPE_CLOSE_RATIO)
  const isFastSwipe = gesture.swipeDetector?.finish(touch.clientX, touch.clientY) ?? false
  const shouldClose = gesture.direction === 'down'
    && (swipeOffset.value >= closeDistance || isFastSwipe)

  if (shouldClose) {
    close()
    return
  }

  resetTouchGesture()
}

function handleTouchCancel() {
  resetTouchGesture()
}

function handleEscape(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  event.preventDefault()
  close()
}

function attachGestureController() {
  if (!liveOpen.value || !livePanel.value || removeGestureListeners) return

  const panel = livePanel.value
  const touchStartOptions = { passive: true, capture: true }
  const touchMoveOptions = { passive: false, capture: true }
  const touchEndOptions = { passive: true, capture: true }
  const touchCancelOptions = { passive: true, capture: true }

  panel.addEventListener('touchstart', handleTouchStart, touchStartOptions)
  panel.addEventListener('touchmove', handleTouchMove, touchMoveOptions)
  panel.addEventListener('touchend', handleTouchEnd, touchEndOptions)
  panel.addEventListener('touchcancel', handleTouchCancel, touchCancelOptions)

  window.addEventListener('keydown', handleEscape)
  escapeListenerAttached = true

  removeGestureListeners = () => {
    panel.removeEventListener('touchstart', handleTouchStart, touchStartOptions)
    panel.removeEventListener('touchmove', handleTouchMove, touchMoveOptions)
    panel.removeEventListener('touchend', handleTouchEnd, touchEndOptions)
    panel.removeEventListener('touchcancel', handleTouchCancel, touchCancelOptions)
    if (escapeListenerAttached) {
      window.removeEventListener('keydown', handleEscape)
      escapeListenerAttached = false
    }
    removeGestureListeners = undefined
  }
}

function cleanupGestureController() {
  removeGestureListeners?.()
  resetTouchGesture()
}

watch(liveOpen, async open => {
  if (open) {
    await nextTick()
    if (liveOpen.value && livePanel.value) attachGestureController()
  }
  else {
    cleanupGestureController()
  }
})

onBeforeUnmount(() => {
  cleanupGestureController()
})

function toggleLive() {
  liveOpen.value = !liveOpen.value
  if (!liveOpen.value) cleanupGestureController()
  emit('openChange', liveOpen.value)
  if (liveOpen.value) nextTick(() => emit('requestCollapse'))
}

const onLives = useOnLives()
const { data: raw, pending } = storeToRefs(onLives)
const data = computed(() => {
  return raw.value
})

const mockupVideos = [
  { src: 'https://placeholdervideo.dev/720x1280', title: 'Potrait Video' },
  { src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', title: 'Big Buck Bunny' },
  { src: 'https://cdn.jwplayer.com/manifests/pZxWPRg4.m3u8', title: 'FDR CDN 1080p' },
  { src: 'https://test-streams.mux.dev/x36xhzz/url_6/193039199_mp4_h264_aac_hq_7.m3u8', title: 'Big Buck Bunny 480p' },
  { src: 'https://playertest.longtailvideo.com/adaptive/captions/playlist.m3u8', title: 'CNN Special Report' },
  { src: 'https://test-streams.mux.dev/dai-discontinuity-deltatre/manifest.m3u8', title: 'Ad insertion in event stream' },
  { src: 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s-fmp4/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8', title: 'HLS by Bitmovin' },
  { src: 'https://mtoczko.github.io/hls-test-streams/test-group/playlist.m3u8', title: '1080p' },
  { src: 'https://mtoczko.github.io/hls-test-streams/test-group/playlist.m3u8', title: '1080p1' },
  { src: 'https://mtoczko.github.io/hls-test-streams/test-group/playlist.m3u8', title: '1080p2' },
  { src: 'https://mtoczko.github.io/hls-test-streams/test-group/playlist.m3u8', title: '1080p3' },
  { src: 'https://www.youtube.com/watch?v=KvhGeQFkxaU', title: 'AKB' },
]

const lives = computed<Omit<Multi.Video, 'order'>[]>(() => {
  const result: Omit<Multi.Video, 'order'>[] = []
  for (const live of (data.value || [])) {
    if (live.type === 'showroom') {
      result.push(convertShowroom(live))
    }
    else if (live.type === 'idn') {
      if (isIDNMultiBypassEnabled.value && !live.is_premium) {
        result.push(convertIDNLive(live))
      }
    }
    else {
      result.push(convertYoutube(live as YoutubeLive))
    }
  }

  if (isMockup.value) {
    for (const vid of mockupVideos) {
      result.push(
        {
          id: vid.title,
          name: vid.title,
          poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Aspect-ratio-16x9.svg/2560px-Aspect-ratio-16x9.svg.png',
          image: 'https://www.aandmedu.in/wp-content/uploads/2021/11/4-5-Aspect-Ratio-819x1024.jpg',
          landscape: true,
          original_url: vid.src,
          icon: 'https://cdn1.iconfinder.com/data/icons/logotypes/32/youtube-512.png',
          stream_url: vid.src,
          space: 1,
          is_mockup: true,
          type: 'showroom',
        },
      )
    }
  }

  return result
})

defineExpose({ close })
</script>

<template>
  <div data-multi-live-root class="pointer-events-auto relative size-8 md:size-9">
    <Teleport to="body">
      <div v-if="liveOpen" class="fixed inset-0 z-belowNav bg-transparent" @click="close" />
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-y-full opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-full opacity-0"
      >
        <div
          v-if="liveOpen"
          ref="livePanel"
          data-multi-live-panel
          class="fixed inset-x-0 bottom-0 z-belowNav mx-auto flex max-h-[85dvh] w-full max-w-162 flex-col overflow-hidden rounded-t-3xl border border-color-1 bg-dark-1 text-left shadow-xl"
          :class="{ 'transition-transform duration-300 ease-out': !isSwiping }"
          :style="isSwiping ? { transform: `translateY(${swipeOffset}px)` } : undefined"
          tabindex="-1"
          @click.stop
        >
          <div class="touch-none select-none">
            <div class="mx-auto mt-2 h-1 w-10 rounded-full bg-hover-2" />
            <div class="flex justify-between border-b border-color-1 px-3 pb-3 pt-3 text-base font-bold md:px-5 md:pb-4 md:pt-4 md:text-lg">
              <div>
                Daftar Live
              </div>
            </div>
          </div>
          <form class="touch-none flex flex-col gap-1.5 border-b border-color-1 px-3 py-3 md:px-5" @submit.prevent="addSourceUrl">
            <div class="flex gap-2">
              <input
                v-model="sourceUrl"
                type="url"
                :placeholder="$t('multi.source_url_placeholder')"
                :aria-label="$t('multi.source_url')"
                class="select-text min-w-0 flex-1 rounded-lg border border-color-1 bg-container-2 px-3 py-2 text-sm outline-hidden transition focus:border-blue-500"
              >
              <button v-ripple type="submit" :aria-label="$t('multi.add_source')" class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white transition-colors hover:bg-blue-600">
                <Icon name="ic:round-add" class="size-5" />
              </button>
            </div>
            <div v-if="sourceError" class="text-xs text-red-500">
              {{ sourceError }}
            </div>
          </form>
          <div v-if="isBetaDeviceChecked && !isIDNMultiBypassEnabled" class="touch-none select-none mx-3 mb-2 mt-2 rounded-md bg-red-500/20 px-3 py-1.5 text-xs">
            {{ $t("idn_live_hidden") }}
          </div>
          <div
            ref="liveScroller"
            class="touch-pan-y min-h-0 overflow-y-auto overscroll-contain mb-16"
          >
            <div v-if="pending " class="flex justify-center p-10">
              <Icon name="svg-spinners:ring-resize" size="1.7rem" />
            </div>
            <div v-else-if="lives?.length" class="flex flex-1 flex-col pb-16 font-bold">
              <MultiLiveCard v-for="live in lives" :key="live.id" :live="live" :selected="selected.has(live.id)" @live-click="select(live)" />
            </div>
            <div v-else class="flex px-8 py-2 text-center text-base font-light">
              {{ $t('nolive') }}
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    <button v-ripple data-multi-live-button type="button" aria-label="Add live" :aria-expanded="liveOpen" class="group relative flex size-8 items-center justify-center border rounded-lg border-color-1 hover:bg-hover-2 text-red-500 transition-colors md:size-9" @click="toggleLive">
      <Icon name="streamline:live-video-solid" class="size-4 transition-transform group-hover:scale-105 md:size-5" />
    </button>
  </div>
</template>
