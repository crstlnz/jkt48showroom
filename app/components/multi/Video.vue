<script setup lang="ts">
import { DragGesture } from '@use-gesture/vanilla'
import { WatchVideo } from '#components'
import { useMultiVolume } from '~/store/multiVolume'
import { useNotifications } from '~/store/notifications'

interface DragPayload {
  id: string
  x: number
  y: number
}

interface TapState {
  pointerId: number
  pointerType: string
  clientX: number
  clientY: number
  target: EventTarget | null
  time: number
}

const props = defineProps<{
  video: Multi.Video
  index: number
  videosLength: number
  showVideoControl: boolean
  autoRemove: boolean
  rowCount: number
}>()

const emit = defineEmits<{
  (e: 'spaceChange', space: number): void
  (e: 'moveNext'): void
  (e: 'movePrevious'): void
  (e: 'delete', reason?: string): void
  (e: 'sourceNotFound'): void
  (e: 'dragStart', payload: DragPayload): void
  (e: 'dragMove', payload: DragPayload): void
  (e: 'dragEnd', payload: DragPayload): void
}>()

const multiVolume = useMultiVolume()
const effectiveVolume = computed(() => multiVolume.getPlayerVolume(props.video.id))
const effectiveMuted = computed(() => multiVolume.getPlayerMuted(props.video.id))
const controlSpan = computed(() => Math.max(1, Math.min(props.video.space, props.rowCount || 1)))
const videoElement = ref<InstanceType<typeof WatchVideo>>()
const pendingSeek = ref(0)
const previewSeek = ref(0)
const previewVisible = ref(false)
const previewPulse = ref(false)
const mediaArea = ref<HTMLDivElement | null>(null)
const tapState = ref<TapState>()
const lastTap = ref<TapState>()
const suppressNativeDoubleClickUntil = ref(0)

const DOUBLE_TAP_SEEK_SECONDS = 5
const KEYBOARD_SEEK_SECONDS = 5
const SEEK_COMMIT_DELAY = 350
const TOUCH_TAP_MAX_DELAY = 300
const TOUCH_TAP_MAX_DISTANCE = 24

let seekTimer: ReturnType<typeof setTimeout> | undefined
let tapTimer: ReturnType<typeof setTimeout> | undefined
let pulseTimer: ReturnType<typeof setTimeout> | undefined
let previewResetTimer: ReturnType<typeof setTimeout> | undefined

function refresh() {
  if (videoElement.value) {
    videoElement.value.reload()
  }
}

function mute() {
  if (videoElement.value) {
    videoElement.value.mute()
  }
}

function unmute() {
  if (videoElement.value) {
    videoElement.value.unmute()
  }
}

function onUserVolumeChange(volume: number) {
  multiVolume.setPlayerVolume(props.video.id, volume)
}

function onUserMuteChange(muted: boolean) {
  multiVolume.setPlayerMuted(props.video.id, muted)
}

function isMuted() {
  if (videoElement.value) {
    return videoElement.value.isMuted
  }
  return true
}

function changeSource(streamUrl: ShowroomAPI.StreamingURL) {
  if (videoElement.value) {
    videoElement.value.changeSource(streamUrl)
  }
}

const { addNotif } = useNotifications()
const updatedStreamURL = ref()
const stream_url = computed(() => {
  if (updatedStreamURL.value) return updatedStreamURL.value
  return props.video.stream_url
})

const sourceURLs = computed(() => {
  if (!stream_url.value) return []
  return [
    {
      is_default: true,
      url: stream_url.value,
      type: 'hls',
      id: 1,
      label: 'Default',
      quality: 1,
    },
  ]
})
// eslint-disable-next-line no-unused-vars, unused-imports/no-unused-vars
async function refreshShowroomStreamURL() {
  try {
    const res = await $apiFetch<Watch.WatchData>(`/api/watch/${props.video.original_url.replaceAll('https://www.showroom-live.com/r/', '')}`)
    const newStreamURL = res.streaming_url_list?.filter(a => a.type === 'hls')?.sort((a, b) => b.quality - a.quality)?.[0]?.url ?? res.streaming_url_list?.[0]?.url ?? ''
    updatedStreamURL.value = newStreamURL
    changeSource(sourceURLs.value[0]!)
    refresh()
    addNotif({
      message: props.video.name,
      title: 'Stream url refreshed!',
      type: 'info',
      duration: 2500,
    })
  }
  catch {
    addNotif({
      message: props.video.name,
      title: 'Stream url refresh failed!',
      type: 'danger',
      duration: 2500,
    })
  }
}

function onSourceNotFound() {
  if (props.autoRemove) {
    emit(`sourceNotFound`)
  }
}

function remove() {
  emit('delete')
}

function rotate() {
  if (videoElement.value) {
    videoElement.value.rotate()
  }
}

function pauseVideo() {
  videoElement.value?.pause()
}

function clearSeekTimer() {
  if (seekTimer) clearTimeout(seekTimer)
  seekTimer = undefined
}

function schedulePreviewReset() {
  if (previewResetTimer) clearTimeout(previewResetTimer)
  previewResetTimer = setTimeout(() => {
    previewSeek.value = 0
    previewResetTimer = undefined
  }, 200)
}

function triggerPreviewPulse() {
  previewPulse.value = false
  if (pulseTimer) clearTimeout(pulseTimer)
  pulseTimer = setTimeout(() => {
    previewPulse.value = false
    pulseTimer = undefined
  }, 200)
  nextTick(() => {
    if (previewVisible.value) previewPulse.value = true
  })
}

function commitPendingSeek() {
  const offset = pendingSeek.value
  if (!offset) return

  try {
    videoElement.value?.seekBy(offset)
  }
  finally {
    pendingSeek.value = 0
    previewVisible.value = false
    previewPulse.value = false
    schedulePreviewReset()
    seekTimer = undefined
  }
}

function queueSeek(offset: number, combineOpposite = false) {
  if (!offset || !videoElement.value?.canSeek()) return false

  if (pendingSeek.value === 0 || combineOpposite || Math.sign(pendingSeek.value) === Math.sign(offset)) {
    pendingSeek.value += offset
  }
  else {
    pendingSeek.value = offset
  }

  if (pendingSeek.value === 0) {
    clearSeekTimer()
    previewVisible.value = false
    previewPulse.value = false
    schedulePreviewReset()
    return true
  }

  if (previewResetTimer) clearTimeout(previewResetTimer)
  previewResetTimer = undefined
  previewSeek.value = pendingSeek.value
  previewVisible.value = true
  clearSeekTimer()
  seekTimer = setTimeout(commitPendingSeek, SEEK_COMMIT_DELAY)
  triggerPreviewPulse()
  return true
}
// const enableRotate = useLocalStorage<boolean>('rotate_feature_v1', () => false)
const enableRotate = ref(!isYouTubeUrl(props.video.stream_url))
const useSpace = ref(1)

function expandSpace() {
  emit('spaceChange', props.video.space + 1)
}

function reduceSpace() {
  emit('spaceChange', props.video.space - 1)
}

// DRAG GESTURE
const container = ref<HTMLDivElement | null>(null)
const dragHandle = ref<HTMLElement | null>(null)
const gesture = ref()
const isDragging = ref(false)

function isVideoSlider(event: Event) {
  return event.composedPath().some(target => target instanceof HTMLInputElement && target.type === 'range')
}

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  return target.closest('button, input, textarea, select, a, [contenteditable], #control') !== null
}

function isTouchPointer(event: PointerEvent) {
  return event.pointerType === 'touch' || event.pointerType === 'pen'
}

function isPointInMedia(clientX: number, clientY: number) {
  const rect = mediaArea.value?.getBoundingClientRect()
  if (!rect) return false
  return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom
}

function isInteractiveKeyboardTarget(target: EventTarget | null) {
  return isInteractiveTarget(target)
}

function getMediaSeekOffset(event: MouseEvent | PointerEvent) {
  const rect = mediaArea.value?.getBoundingClientRect()
  if (!rect || !rect.width) return null

  const position = (event.clientX - rect.left) / rect.width
  if (position < 0.35) return -DOUBLE_TAP_SEEK_SECONDS
  if (position > 0.65) return DOUBLE_TAP_SEEK_SECONDS
  return null
}

function handleKeydown(event: KeyboardEvent) {
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return
  if (isInteractiveKeyboardTarget(event.target)) return

  const offset = event.key === 'ArrowLeft' ? -KEYBOARD_SEEK_SECONDS : KEYBOARD_SEEK_SECONDS
  if (queueSeek(offset, true)) {
    videoElement.value?.showControls()
    event.preventDefault()
  }
}

function onMediaDoubleTap(event: MouseEvent | PointerEvent) {
  if (!(event instanceof PointerEvent) && performance.now() < suppressNativeDoubleClickUntil.value) {
    suppressNativeDoubleClickUntil.value = 0
    return false
  }

  if (isInteractiveTarget(event.target)) return false

  const seekOffset = getMediaSeekOffset(event)
  let handled = false

  if (seekOffset != null) {
    handled = queueSeek(seekOffset)
  }
  else if (videoElement.value) {
    pauseVideo()
    handled = true
  }

  if (handled) {
    event.preventDefault()
    event.stopPropagation()
  }
  return handled
}

function resetTapState() {
  tapState.value = undefined
  lastTap.value = undefined
  if (tapTimer) clearTimeout(tapTimer)
  tapTimer = undefined
}

function handlePointerUp(event: PointerEvent) {
  const currentTap = tapState.value
  tapState.value = undefined
  const isTouch = isTouchPointer(event)
  if (!currentTap || currentTap.pointerId !== event.pointerId || isDragging.value) {
    resetTapState()
    return
  }
  if (isInteractiveTarget(currentTap.target) || isInteractiveTarget(event.target)) {
    resetTapState()
    return
  }
  if (!isPointInMedia(event.clientX, event.clientY)) {
    resetTapState()
    return
  }

  const distance = Math.hypot(event.clientX - currentTap.clientX, event.clientY - currentTap.clientY)
  if (distance > TOUCH_TAP_MAX_DISTANCE) {
    resetTapState()
    return
  }

  const now = performance.now()

  // Once a seek is pending, one more valid side tap extends the same seek
  // window without requiring another complete double-tap pair.
  const pendingTapOffset = getMediaSeekOffset(event)
  if (pendingSeek.value !== 0 && pendingTapOffset != null) {
    if (queueSeek(pendingTapOffset)) {
      lastTap.value = {
        pointerId: event.pointerId,
        pointerType: currentTap.pointerType,
        clientX: event.clientX,
        clientY: event.clientY,
        target: currentTap.target,
        time: now,
      }
      if (tapTimer) clearTimeout(tapTimer)
      tapTimer = setTimeout(() => {
        lastTap.value = undefined
        tapTimer = undefined
      }, TOUCH_TAP_MAX_DELAY)
      if (!isTouch) {
        suppressNativeDoubleClickUntil.value = now + TOUCH_TAP_MAX_DELAY
      }
      return
    }
  }

  if (!isTouch) return

  const anchorDistance = lastTap.value
    ? Math.hypot(event.clientX - lastTap.value.clientX, event.clientY - lastTap.value.clientY)
    : Infinity
  const isTapSequence = Boolean(
    lastTap.value
    && lastTap.value.pointerType === currentTap.pointerType
    && now - lastTap.value.time <= TOUCH_TAP_MAX_DELAY
    && anchorDistance <= TOUCH_TAP_MAX_DISTANCE,
  )

  if (isTapSequence) {
    const handled = onMediaDoubleTap(event)
    lastTap.value = {
      pointerId: event.pointerId,
      pointerType: currentTap.pointerType,
      clientX: event.clientX,
      clientY: event.clientY,
      target: currentTap.target,
      time: now,
    }
    if (tapTimer) clearTimeout(tapTimer)
    tapTimer = setTimeout(() => {
      lastTap.value = undefined
      tapTimer = undefined
    }, TOUCH_TAP_MAX_DELAY)
    if (handled) {
      suppressNativeDoubleClickUntil.value = now + TOUCH_TAP_MAX_DELAY
    }
    return
  }

  lastTap.value = {
    pointerId: event.pointerId,
    pointerType: currentTap.pointerType,
    clientX: event.clientX,
    clientY: event.clientY,
    target: currentTap.target,
    time: now,
  }
  if (tapTimer) clearTimeout(tapTimer)
  tapTimer = setTimeout(() => {
    lastTap.value = undefined
    tapTimer = undefined
  }, TOUCH_TAP_MAX_DELAY)
}

function capturePointer(e: PointerEvent) {
  container.value?.focus({ preventScroll: true })
  if (isVideoSlider(e)) {
    resetTapState()
    return
  }

  if (!isTouchPointer(e)) {
    if (pendingSeek.value !== 0 && !isInteractiveTarget(e.target) && isPointInMedia(e.clientX, e.clientY)) {
      tapState.value = {
        pointerId: e.pointerId,
        pointerType: e.pointerType,
        clientX: e.clientX,
        clientY: e.clientY,
        target: e.target,
        time: performance.now(),
      }
    }
    else {
      tapState.value = undefined
    }
  }
  else if (isInteractiveTarget(e.target) || !isPointInMedia(e.clientX, e.clientY)) {
    resetTapState()
  }
  else {
    tapState.value = {
      pointerId: e.pointerId,
      pointerType: e.pointerType,
      clientX: e.clientX,
      clientY: e.clientY,
      target: e.target,
      time: performance.now(),
    }
  }
  try {
    ;(e.currentTarget as HTMLElement | null)?.setPointerCapture?.(e.pointerId)
  }
  catch {}
}

onMounted(() => {
  if (videoElement.value) {
    videoElement.value.setVolume(effectiveVolume.value)
    if (effectiveMuted.value) videoElement.value.mute()
    else if (effectiveVolume.value > 0) videoElement.value.unmute()
  }
  const el = dragHandle.value ?? container.value
  if (!el) return
  gesture.value = new DragGesture(
    el,
    ({ first, last, active, xy, event }) => {
      const e = event as any
      if (isVideoSlider(e)) return

      const x = e?.clientX ?? xy[0]
      const y = e?.clientY ?? xy[1]
      const payload: DragPayload = {
        id: props.video.id,
        x,
        y,
      }

      if (first) {
        resetTapState()
        isDragging.value = true
        emit('dragStart', payload)
      }
      if (active) emit('dragMove', payload)
      if (last) {
        isDragging.value = false
        emit('dragEnd', payload)
      }
    },
    {
      filterTaps: true,
      threshold: 120,
      pointer: {
        keys: false,
      },
    },
  )
})

onUnmounted(() => {
  gesture.value?.destroy()
  clearSeekTimer()
  resetTapState()
  if (pulseTimer) clearTimeout(pulseTimer)
  if (previewResetTimer) clearTimeout(previewResetTimer)
})

defineExpose({ refresh, video: videoElement, data: props.video, remove, id: props.video.id, useSpace, mute, unmute, isMuted })
</script>

<template>
  <div
    ref="container"
    tabindex="0"
    class="group relative flex items-center flex-col touch-none outline-none"
    :data-dragging="isDragging ? 'true' : 'false'"
    @pointerdown="capturePointer"
    @pointerup="handlePointerUp"
    @pointercancel="resetTapState"
    @keydown="handleKeydown"
  >
    <div class="overflow-hidden flex-1 h-0 bg-black/50 self-stretch flex items-center">
      <div ref="mediaArea" class="size-full relative" @dblclick="onMediaDoubleTap">
        <!-- <button
          ref="dragHandle"
          type="button"
          aria-label="Drag to reorder"
          title="Drag to reorder"
          class="absolute right-1 top-1 md:right-2 md:top-2 z-20 pointer-events-auto bg-black/40 hover:bg-black/55 text-white/90 rounded-md cursor-grab active:cursor-grabbing touch-none select-none"
        >
          <Icon name="material-symbols:drag-handle" class="w-6 h-6 p-0.5 md:w-7 md:h-7 md:p-1" />
        </button> -->
        <div class="absolute left-1 top-0.5 md:left-2 md:top-2 z-10">
          <!-- <NuxtLink v-if="video.type === 'idn'" :to="video.original_url" :external="true" target="_blank" class="inline-block">
            <Image :src="video.icon" size="64px" class="h-3 md:h-5 object-contain max-w-22.5" />
          </NuxtLink> -->
        </div>
        <WatchVideo
          ref="videoElement"
          :key="video.id"
          :title="video.name"
          :poster="video.poster"
          :muted="effectiveMuted"
          :volume="effectiveVolume"
          :seek-preview-offset="previewVisible ? previewSeek : null"
          :sources="sourceURLs"
          class="flex-1 w-full object-fill"
          :use-shortcut="false"
          :max-buffer-size="300 * 1000 * 1000"
          :max-max-buffer-length="300"
          :save-state="false"
          :compact="true"
          :hide-cursor-when-playing="false"
          :use-default-control="true"
          @source-error="onSourceNotFound"
          @user-mute-change="onUserMuteChange"
          @user-volume-change="onUserVolumeChange"
        />
        <div
          aria-live="polite"
          class="pointer-events-none absolute top-1/2 z-20 flex -translate-y-1/2 scale-95 items-center gap-1 rounded-full bg-black/60 px-3 py-2 text-white opacity-0 transition-all duration-200"
          :class="[
            previewSeek < 0 ? 'left-4' : 'right-4',
            previewVisible ? 'scale-100 opacity-100' : '',
            previewPulse && previewVisible ? 'scale-110' : '',
          ]"
        >
          <Icon :name="previewSeek < 0 ? 'material-symbols:fast-rewind-rounded' : 'material-symbols:fast-forward-rounded'" size="1.5rem" />
          <span>{{ previewSeek < 0 ? '−' : '+' }}{{ Math.abs(previewSeek) }}s</span>
        </div>
      </div>
    </div>
    <div v-if="showVideoControl" class="relative max-h-10 w-full gap-1 bg-white transition-all duration-150 group-focus-within:bg-gray-600/5 group-focus-within:brightness-110 drop-shadow-xs border border-dark-1 dark:bg-black/20 md:gap-2 xl:gap-3">
      <div aria-hidden="true" class="invisible aspect-50/4.5 min-h-7 max-h-10" :style="{ width: `${100 / controlSpan}%` }" />
      <div class="absolute inset-0 flex items-center justify-between pointer-events-none">
        <button :disabled="index === 0" type="button" class="@container pointer-events-auto hover:bg-white/5 h-full aspect-4/5 md:aspect-square disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center" @click="$emit('movePrevious')">
          <Icon name="material-symbols:arrow-left" class="text-[60cqw]" />
        </button>
        <button :disabled="index === videosLength - 1" type="button" class="@container pointer-events-auto hover:bg-white/5 h-full aspect-4/5 md:aspect-square disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center" @click="$emit('moveNext')">
          <Icon name="material-symbols:arrow-right" class="text-[60cqw]" />
        </button>
      </div>
      <div class="absolute inset-0 flex h-full w-full max-w-full flex-col items-center lg:px-10">
        <div class="flex max-w-full justify-center gap-0.5 sm:gap-1 h-full">
          <button v-if="enableRotate" type="button" class="pointer-events-auto flex shrink-0 items-center justify-center @container hover:bg-white/5 h-full aspect-4/5 md:aspect-square" @click="rotate">
            <Icon name="ic:outline-sync" class="text-[50cqw]" />
          </button>
          <button type="button" class="pointer-events-auto flex shrink-0 items-center justify-center @container hover:bg-white/5 h-full aspect-4/5 md:aspect-square" @click="refresh">
            <Icon name="material-symbols:refresh-rounded" class="text-[50cqw]" />
          </button>
          <button
            type="button"
            class="pointer-events-auto flex shrink-0 items-center justify-center @container hover:bg-white/5 h-full aspect-4/5 md:aspect-square disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="video.space <= 1"
            @click="reduceSpace"
          >
            <Icon name="iconoir:arrow-union" class="text-[50cqw]" />
          </button>
          <button
            type="button"
            class="pointer-events-auto flex shrink-0 items-center justify-center @container hover:bg-white/5 h-full aspect-4/5 md:aspect-square disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="video.space >= props.rowCount"
            @click="expandSpace"
          >
            <Icon name="iconoir:arrow-separate" class="text-[50cqw]" />
          </button>
          <!-- <NuxtLink :to="video.original_url" target="_blank" :external="true" no-prefetch type="button" class="bg-blue-500 flex items-center size-5 h-full aspect-4/5 md:aspect-square justify-center  text-white rounded-md text-sm">
            <Icon name="octicon:link-external-16" class="text-[50cqw]" />
          </NuxtLink> -->
          <button type="button" class="pointer-events-auto flex shrink-0 items-center justify-center @container text-red-500 hover:bg-white/5 h-full aspect-4/5 md:aspect-square dark:text-red-400" @click="$emit('delete')">
            <Icon name="heroicons:trash" class="text-[50cqw]" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
