<script setup lang="ts">
import type { MultiVideo } from '#components'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue'
import { Slider } from '#components'
import { useMultiVolume } from '~/store/multiVolume'

const props = defineProps<{
  videoPlayers: Map<string, InstanceType<typeof MultiVideo>>
}>()

const emit = defineEmits<{
  (event: 'expandedChange', expanded: boolean): void
  (event: 'heightChange', height: number): void
}>()

const videoPlayers = computed(() => {
  return [...props.videoPlayers.values()]
})

const multiVolume = useMultiVolume()
const expanded = ref(false)
const allVolumeSlider = ref<HTMLElement>()
const panelElement = ref<unknown>()
const headerElement = ref<HTMLElement>()
const headerHeight = ref(96)
const expandButton = ref<{ focus: () => void }>()
const isUnmounting = ref(false)
let panelObserver: ResizeObserver | undefined
let lastPanelHeight = 0
let playerVolumeFrame: number | undefined
let pendingPlayerVolume: { id: string, volume: number } | undefined

function open() {
  expanded.value = true
}

function close() {
  expanded.value = false
}

function focusExpandButton() {
  if (!isUnmounting.value) expandButton.value?.focus()
}

function getPanelElement() {
  const value = panelElement.value
  if (typeof Element !== 'undefined' && value instanceof Element) return value

  if (value && typeof value === 'object' && '$el' in value) {
    const element = (value as { $el?: unknown }).$el
    if (typeof Element !== 'undefined' && element instanceof Element) return element
  }
}

function emitPanelHeight() {
  const panel = getPanelElement()
  headerHeight.value = headerElement.value?.getBoundingClientRect().height || 0
  const height = expanded.value ? panel?.getBoundingClientRect().height || 0 : headerHeight.value
  if (height !== lastPanelHeight) {
    lastPanelHeight = height
    emit('heightChange', height)
  }
}

function observePanel() {
  panelObserver?.disconnect()
  panelObserver = undefined

  const element = getPanelElement()
  if (!element) return

  panelObserver = new ResizeObserver(() => {
    emitPanelHeight()
  })
  panelObserver.observe(element)
  if (headerElement.value) panelObserver.observe(headerElement.value)
  emitPanelHeight()
}

watch(expanded, async (value) => {
  emit('expandedChange', value)

  await nextTick()
  observePanel()
  focusExpandButton()
})

function playAll() {
  for (const player of videoPlayers.value) {
    player.video?.play()
  }
}

function pauseAll() {
  for (const player of videoPlayers.value) {
    player.video?.pause()
  }
}

function reloadAll() {
  for (const player of videoPlayers.value) {
    player.video?.reload()
  }
}

function muteAll() {
  multiVolume.setAllMuted(true, videoPlayers.value)
}

function unmuteAll() {
  multiVolume.setAllMuted(false, videoPlayers.value)
}

const allVolumeModel = computed({
  get: () => multiVolume.allVolume,
  set: (value: string | number) => {
    multiVolume.setAllVolume(Number(value), videoPlayers.value)
  },
})

const playerVolumeMarkers = computed(() => {
  if (!Object.keys(multiVolume.playerVolumes).length) return []

  return videoPlayers.value.flatMap((player) => {
    if (!Object.hasOwn(multiVolume.playerVolumes, player.id)) return []
    const volume = multiVolume.getPlayerVolume(player.id)

    return [{
      id: player.id,
      name: player.data.name,
      volume,
    }]
  })
})

function getPlayerById(id: string) {
  return videoPlayers.value.find(player => player.id === id)
}

function getVolumeFromPointer(event: PointerEvent) {
  const slider = allVolumeSlider.value
  if (!slider) return

  const rect = slider.getBoundingClientRect()
  if (!rect.width) return

  const value = (event.clientX - rect.left) / rect.width
  if (!Number.isFinite(value)) return
  return Math.min(1, Math.max(0, value))
}

function flushPlayerVolumeDrag() {
  if (playerVolumeFrame != null) {
    cancelAnimationFrame(playerVolumeFrame)
    playerVolumeFrame = undefined
  }

  const pending = pendingPlayerVolume
  pendingPlayerVolume = undefined
  if (!pending) return

  multiVolume.setPlayerVolume(pending.id, pending.volume, getPlayerById(pending.id))
}

function updatePlayerVolumeFromPointer(event: PointerEvent, id: string) {
  const volume = getVolumeFromPointer(event)
  if (volume == null) return

  pendingPlayerVolume = { id, volume }
  if (playerVolumeFrame != null) return

  playerVolumeFrame = requestAnimationFrame(() => {
    playerVolumeFrame = undefined
    flushPlayerVolumeDrag()
  })
}

function startPlayerVolumeDrag(event: PointerEvent, id: string) {
  event.preventDefault()
  event.stopPropagation()
  const marker = event.currentTarget as HTMLElement
  marker.setPointerCapture(event.pointerId)
  updatePlayerVolumeFromPointer(event, id)
}

function movePlayerVolumeDrag(event: PointerEvent, id: string) {
  const marker = event.currentTarget as HTMLElement
  if (marker.hasPointerCapture(event.pointerId)) {
    event.preventDefault()
    updatePlayerVolumeFromPointer(event, id)
  }
}

function endPlayerVolumeDrag(event: PointerEvent, id: string) {
  const marker = event.currentTarget as HTMLElement
  if (marker.hasPointerCapture(event.pointerId)) {
    marker.releasePointerCapture(event.pointerId)
  }
  if (pendingPlayerVolume?.id === id) flushPlayerVolumeDrag()
}

function syncLive() {
  for (const player of videoPlayers.value) {
    player.video?.syncLive()
  }
}

const autoRemove = useLocalStorage('auto_remove_player', () => true)
const centerVideos = useLocalStorage('center_videos', () => false)
const showVideoControl = useLocalStorage('show_video_control', () => true)

const swipeStart = ref<{ pointerId: number, x: number, y: number }>()

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && !!target.closest('button, input, textarea, select, a, [role="slider"], [contenteditable="true"]')
}

function startSwipe(event: PointerEvent) {
  if (!['touch', 'pen'].includes(event.pointerType) || isInteractiveTarget(event.target)) return

  swipeStart.value = {
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
  }
}

function endSwipe(event: PointerEvent) {
  const start = swipeStart.value
  swipeStart.value = undefined
  if (!start || start.pointerId !== event.pointerId) return

  const deltaX = event.clientX - start.x
  const deltaY = event.clientY - start.y
  if (deltaY > 80 && Math.abs(deltaY) > Math.abs(deltaX)) close()
}

function cancelSwipe() {
  swipeStart.value = undefined
}

onMounted(async () => {
  await nextTick()
  observePanel()
})

onBeforeUnmount(() => {
  isUnmounting.value = true
  panelObserver?.disconnect()
  if (playerVolumeFrame != null) cancelAnimationFrame(playerVolumeFrame)
  playerVolumeFrame = undefined
  pendingPlayerVolume = undefined
  swipeStart.value = undefined
})

defineExpose({ open })
</script>

<template>
  <Dialog :open="expanded" static as="div" class="relative z-nav" @close="close">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="expanded" class="fixed inset-0 bg-transparent" />
    </Transition>

    <div class="pointer-events-none fixed inset-x-0 bottom-0 flex justify-center">
      <DialogPanel
        id="multi-media-control-bottomsheet"
        ref="panelElement"
        class="pointer-events-auto flex max-h-[85dvh] w-full max-w-162 flex-col overflow-visible rounded-t-3xl border-x! border-t! border-color-2 bg-dark-2 text-left shadow-xl transition-transform duration-300 ease-out"
        :style="{ transform: expanded ? 'translateY(0)' : `translateY(calc(100% - ${headerHeight}px))` }"
      >
        <div
          ref="headerElement"
          data-media-control-header
          class="flex shrink-0 touch-none items-center gap-2 border-b border-color-2 px-2 pb-2 pt-3 md:gap-4 md:px-4 md:pb-2 md:pt-3.5"
          @pointerdown="startSwipe"
          @pointerup="endSwipe"
          @pointercancel="cancelSwipe"
        >
          <DialogTitle class="sr-only" as="h3">
            {{ $t('media_controls') }}
          </DialogTitle>
          <div class="flex shrink-0 items-center">
            <CircleButton class="size-7! md:size-9!" aria-label="Play all" @click="playAll">
              <Icon name="ic:round-play-arrow" class="h-full w-full" />
            </CircleButton>
            <CircleButton class="size-7! md:size-9!" aria-label="Pause all" @click="pauseAll">
              <Icon name="ic:round-pause" class="h-full w-full" />
            </CircleButton>
            <CircleButton class="size-7! md:size-9!" aria-label="Sync live" @click="syncLive">
              <Icon name="ic:round-fast-forward" class="h-full w-full" />
            </CircleButton>
            <CircleButton class="size-7! md:size-9!" aria-label="Reload all" @click="reloadAll">
              <Icon name="ic:round-refresh" class="h-full w-full p-px" />
            </CircleButton>
            <CircleButton class="size-7! md:size-9!" aria-label="Unmute all" @click="unmuteAll">
              <Icon name="ic:round-volume-up" class="h-full w-full p-px" />
            </CircleButton>
            <CircleButton class="size-7! md:size-9!" aria-label="Mute all" @click="muteAll">
              <Icon name="ic:round-volume-off" class="h-full w-full p-px" />
            </CircleButton>
          </div>
          <div class="flex min-w-0 flex-1 items-center gap-4 ">
            <div ref="allVolumeSlider" data-all-volume-slider class="relative min-w-0 flex-1">
              <div v-if="playerVolumeMarkers.length" class="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-4 -translate-y-1/2 max-sm:hidden">
                <span
                  v-for="marker in playerVolumeMarkers"
                  :key="marker.id"
                  class="group pointer-events-auto absolute inset-y-0 z-20 w-4 -translate-x-1/2 cursor-pointer touch-none"
                  :style="{ left: `${marker.volume * 100}%` }"
                  :aria-label="`${marker.name}: ${Math.round(marker.volume * 100)}%`"
                  tabindex="0"
                  @pointerdown="startPlayerVolumeDrag($event, marker.id)"
                  @pointermove="movePlayerVolumeDrag($event, marker.id)"
                  @pointerup="endPlayerVolumeDrag($event, marker.id)"
                  @pointercancel="endPlayerVolumeDrag($event, marker.id)"
                >
                  <span class="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-300 bg-blue-300 shadow-sm transition-transform group-hover:scale-125 group-focus-visible:scale-125" />
                  <span class="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-container-2 px-2 py-1 text-xs shadow-lg opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    {{ marker.name }} · {{ Math.round(marker.volume * 100) }}%
                  </span>
                </span>
              </div>
              <Slider v-model="allVolumeModel" class="w-full max-sm:hidden" :min="0" :max="1" :step="0.01" />
            </div>
            <slot name="live-control" :collapse="close" />
            <CircleButton
              ref="expandButton"
              class="size-7! md:size-9!"
              :aria-label="expanded ? 'Close media controls' : 'Open media controls'"
              aria-controls="multi-media-control-bottomsheet"
              :aria-expanded="expanded"
              @click="expanded ? close() : open()"
            >
              <Icon :name="expanded ? 'ic:round-keyboard-arrow-down' : 'ic:round-keyboard-arrow-up'" class="h-full w-full" />
            </CircleButton>
          </div>
        </div>

        <div
          class="min-h-0 flex flex-col transition-opacity duration-200"
          :class="[
            videoPlayers.length ? 'flex-1' : '',
            expanded ? 'opacity-100' : 'pointer-events-none opacity-0',
          ]"
          :aria-hidden="!expanded"
          :inert="!expanded"
        >
          <div class="min-h-0 overflow-y-auto items-stretch border-b border-color-1" :class="{ 'flex-1': videoPlayers.length }">
            <div v-if="!videoPlayers.length" class="pt-6 pb-4 text-base text-gray-400 px-4 md:px-5">
              {{ $t('no_video_player') }}
            </div>
            <MultiVideoMediaControl v-for="player in videoPlayers" v-else :key="player.id" :player="player" class="border-b border-color-2 py-2 px-3 md:px-4 md:py-2.5" />
          </div>

          <div class="shrink-0 px-3 md:px-5 pb-5">
            <button type="button" class="mt-3 flex items-center gap-2.5 text-left text-xs font-light opacity-80 md:text-sm" @click="centerVideos = !centerVideos">
              <input v-model="centerVideos" type="checkbox" class="cursor-pointer">
              <div>{{ $t('multi.center') }}</div>
            </button>
            <button type="button" class="mt-2 flex items-center gap-2.5 text-left text-xs font-light opacity-80 md:text-sm" @click="showVideoControl = !showVideoControl">
              <input v-model="showVideoControl" type="checkbox" class="cursor-pointer">
              <div>{{ $t('multi.showvideocontrol') }}</div>
            </button>
            <button type="button" class="mt-1 flex items-center gap-2.5 text-left text-xs font-light opacity-80 md:text-sm" @click="autoRemove = !autoRemove">
              <input v-model="autoRemove" type="checkbox" class="cursor-pointer">
              <div>{{ $t('multi.auto_remove') }}</div>
            </button>
          </div>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>
