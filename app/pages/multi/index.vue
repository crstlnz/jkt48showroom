<script lang="ts" setup>
import { MultiMediaControl, MultiVideo } from '#components'
import { useNotifications } from '~/store/notifications'
import { useOnLives } from '~/store/onLives'
import { useSettings } from '~/store/settings'
import { isYouTubeUrl } from '~/utils/youtube'

definePageMeta({
  layout: 'empty',
})

const videosMap = useSessionStorage<Map<string, Multi.Video>>('videoMultiSelected', new Map())

const videos = computed(() => {
  return [...videosMap.value.values()].sort((a, b) => a.order - b.order)
})

// Stable render order (Map insertion order). Visual order is controlled via CSS `order`.
const videosRaw = computed(() => {
  return [...videosMap.value.values()]
})

const sortedIndexById = computed(() => {
  const m = new Map<string, number>()
  for (const [i, v] of videos.value.entries()) {
    m.set(v.id, i)
  }
  return m
})

function add(video: Multi.Video) {
  if (videosMap.value.has(video.id)) {
    videosMap.value.delete(video.id)
    for (const [i, video] of videos.value.entries()) {
      video.order = i + 1
    }
  }
  else {
    videosMap.value.set(video.id, video)
  }
}

const { width } = useWindowSize()
const { isSmall } = useResponsive()
const minWidth = computed(() => {
  if (!isSmall.value) {
    return 260
  }
  return 130
})

const maxCount = computed(() => {
  return Math.max(1, Math.floor(width.value / minWidth.value))
})

const rowCount = useLocalStorage('multiRowCount', 4, { deep: true })

function clampRowCount(row: number, max = maxCount.value) {
  return Math.min(Math.max(1, row), max)
}

const rowCountModel = computed({
  get: () => rowCount.value,
  set: (val: unknown) => {
    const row = Number(val)
    if (!Number.isFinite(row)) return
    rowCount.value = clampRowCount(Math.trunc(row))
  },
})

onMounted(() => {
  rowCount.value = clampRowCount(rowCount.value)
})

watch(maxCount, (c) => {
  rowCount.value = clampRowCount(rowCount.value, c)
})

function changeRow(row: number) {
  rowCount.value = clampRowCount(row)
}

const { group } = useSettings()

interface DragPayload {
  id: string
  x: number
  y: number
}
const draggingId = ref<string | null>(null)
const lastSwapAt = ref(0)
const lastSwapTargetId = ref<string | null>(null)
const tileEls = shallowRef<Map<string, HTMLElement>>(new Map())

const ghost = reactive({
  active: false,
  id: '' as string,
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  offsetX: 0,
  offsetY: 0,
})

const ghostVideo = computed(() => {
  if (!ghost.active) return null
  return videosMap.value.get(ghost.id) ?? null
})

function renumberOrders(vids: Multi.Video[]) {
  for (const [idx, v] of vids.entries()) v.order = idx + 1
}

function reorderBySortedIndex(from: number, to: number) {
  if (from === to) return
  const vids = [...videos.value]
  const pick = vids[from]
  if (!pick) return
  vids.splice(from, 1)
  vids.splice(to, 0, pick)
  renumberOrders(vids)
}

function movePrevious(i: number) {
  if (i <= 0) return
  reorderBySortedIndex(i, i - 1)
}

function moveNext(i: number) {
  if (i >= videos.value.length - 1) return
  reorderBySortedIndex(i, i + 1)
}

function findTargetIdAtPoint(x: number, y: number, excludeId: string) {
  if (import.meta.server) return null
  for (const [id, el] of tileEls.value.entries()) {
    if (!id || id === excludeId) continue
    const rect = el.getBoundingClientRect()
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      return id
    }
  }
  return null
}

function shouldSwapIntoTarget(p: DragPayload, draggedRect: DOMRect, targetRect: DOMRect) {
  // Swap only after the pointer enters a stable portion of the target tile.
  // This avoids jitter at boundaries while keeping swaps responsive.
  const swapFrac = 0.35
  const draggedCenter = { x: draggedRect.left + draggedRect.width / 2, y: draggedRect.top + draggedRect.height / 2 }
  const targetCenter = { x: targetRect.left + targetRect.width / 2, y: targetRect.top + targetRect.height / 2 }
  const dx = targetCenter.x - draggedCenter.x
  const dy = targetCenter.y - draggedCenter.y

  if (Math.abs(dx) >= Math.abs(dy)) {
    if (dx >= 0) return p.x >= (targetRect.left + targetRect.width * swapFrac)
    return p.x <= (targetRect.right - targetRect.width * swapFrac)
  }
  else {
    if (dy >= 0) return p.y >= (targetRect.top + targetRect.height * swapFrac)
    return p.y <= (targetRect.bottom - targetRect.height * swapFrac)
  }
}

function onDragStart(p: DragPayload) {
  draggingId.value = p.id
  lastSwapAt.value = 0
  lastSwapTargetId.value = null
  if (!import.meta.server) {
    const map = new Map<string, HTMLElement>()
    for (const el of document.querySelectorAll<HTMLElement>('[data-video-id]')) {
      const id = el.dataset.videoId
      if (id) map.set(id, el)
    }
    tileEls.value = map
  }
  ghost.active = true
  ghost.id = p.id
  const el = tileEls.value.get(p.id)
  const rect = el?.getBoundingClientRect()
  ghost.width = rect?.width ?? ghost.width
  ghost.height = rect?.height ?? ghost.height
  ghost.offsetX = rect ? (p.x - rect.left) : 0
  ghost.offsetY = rect ? (p.y - rect.top) : 0
  ghost.x = p.x - ghost.offsetX
  ghost.y = p.y - ghost.offsetY
}

function onDragMove(p: DragPayload) {
  if (!draggingId.value) return
  if (ghost.active && ghost.id === p.id) {
    ghost.x = p.x - ghost.offsetX
    ghost.y = p.y - ghost.offsetY
  }

  const targetId = findTargetIdAtPoint(p.x, p.y, draggingId.value)
  if (!targetId) return

  // Reorder while dragging, but throttle to keep it stable.
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
  if (now - lastSwapAt.value < 80) return
  if (lastSwapTargetId.value === targetId) return

  const from = videos.value.findIndex(v => v.id === draggingId.value)
  const to = videos.value.findIndex(v => v.id === targetId)
  if (from < 0 || to < 0 || from === to) return

  // Hysteresis: avoid swapping at the tile edge (prevents jitter).
  const draggedEl = tileEls.value.get(draggingId.value)
  const targetEl = tileEls.value.get(targetId)
  const draggedRect = draggedEl?.getBoundingClientRect()
  const targetRect = targetEl?.getBoundingClientRect()
  if (draggedRect && targetRect) {
    if (!shouldSwapIntoTarget(p, draggedRect, targetRect)) return
  }
  lastSwapAt.value = now
  lastSwapTargetId.value = targetId
  reorderBySortedIndex(from, to)
}

function onDragEnd() {
  draggingId.value = null
  lastSwapTargetId.value = null
  ghost.active = false
}

function onBeforeLeave(el: Element) {
  const rect = el.getBoundingClientRect()
  const element = el as HTMLElement
  element.style.top = `${rect.top}px`
  element.style.left = `${rect.left}px`
  element.style.height = `${rect.height}px`
  element.style.width = `${rect.width}px`
}

const videoPlayers = ref<Map<string, InstanceType<typeof MultiVideo>>>(new Map())
function refreshAll() {
  for (const video of videoPlayers.value.values()) {
    video.refresh()
  }
}

const { addNotif } = useNotifications()

const autoRemove = useLocalStorage('auto_remove_player', () => true)
const centerVideos = useLocalStorage('center_videos', () => true)
const showVideoControl = useLocalStorage('show_video_control', () => true)

function deleteVideo(video: Multi.Video, reason?: string) {
  if (reason) {
    if (autoRemove.value) add(video) // add is for deleting video because add function is toggle
    addNotif({
      type: 'info',
      title: reason,
      message: `${video.name} Room`,
    })
  }
  else {
    add(video)
  }
}

const onLives = useOnLives()
const { data: raw } = storeToRefs(onLives)
const data = computed(() => {
  return raw.value
})
const { t } = useI18n()

function checkLive(video: Multi.Video) {
  if (video.is_mockup) return true
  const live = (data.value ?? []).find((i: any) => video.id === `${i.type}-${i.room_id}`)
  if (!live) {
    if (autoRemove.value) add(video) /// delete
    addNotif({
      type: 'info',
      title: t('notif.live.ended'),
      message: `${video.name} Room`,
    })
  }
  else {
    const oldVideo = videosMap.value.get(video.id)
    if (oldVideo) {
      videosMap.value.set(oldVideo.id, {
        ...(live.type === 'showroom' ? convertShowroom(live) : (live.type === 'idn' ? convertIDNLive(live) : convertYoutube(live as YoutubeLive))),
        order: oldVideo.order,
      })
    }
  }
}

function applyVideoRefs(ref: any, video: Multi.Video) {
  if (ref) {
    videoPlayers.value.set(video.id, ref)
  }
  else {
    videoPlayers.value.delete(video.id)
  }
}
const { getGroupTitle } = useAppConfig()
useHeadSafe({
  title: `${getGroupTitle(group)} Multi Viewer`,
})

const description = computed(() => {
  return `Multi viewer adalah aplikasi yang memungkinkan kamu untuk menonton member ${getGroupTitle(group)} favoritmu sercara bersamaan!`
})

watch(rowCount, () => {
  for (const v of videoPlayers.value.values()) {
    v.video?.calculateVideoSize()
  }

  for (const v of videos.value) {
    if (v.space > rowCount.value) v.space = rowCount.value
  }
})

useSeoMeta({
  description,
  ogDescription: () => description.value,
  twitterDescription: () => description.value,
  keywords: 'jkt48 multi viewer, jkt48 multi stream, jkt48 live multi stream, nonton jkt48, nonton jkt48 bersamaan',
  twitterCard: 'summary',
})
const mediaControl = ref<InstanceType<typeof MultiMediaControl>>()
function openMediaControl() {
  if (mediaControl.value) mediaControl.value.open()
}
</script>

<template>
  <div>
    <SplashScreen>
      <div key="multiviewer" class="min-h-screen flex flex-col">
        <MultiMediaControl ref="mediaControl" :video-players="videoPlayers" />
        <nav class="flex items-center gap-4 p-4 md:p-5 justify-between mx-auto max-w-162 w-full">
          <div class="text-base font-bold flex flex-col sm:flex-row sm:items-end sm:gap-0.5">
            <NuxtLink to="/" :class="$getGroup(group) === 'jkt48' ? 'text-red-500' : 'text-sky-400'" class="text-3xl lg:text-4xl max-sm:leading-8">
              {{ $getGroupTitle(group) }}
            </NuxtLink>
            <span class="leading-6 text-sm lg:text-base">Multi Viewer</span>
          </div>
          <div class="flex gap-3 items-center">
            <div class="flex md:flex-row t border border-color-1 rounded-md overflow-hidden">
              <button v-ripple type="button" class="flex h-8 w-8 bg-container hover:bg-container border-r border-color-1  p-1.5" @click="() => videosMap.clear()">
                <Icon name="mingcute:broom-fill" class="w-full h-full" />
              </button>
              <button v-ripple type="button" class="flex h-8 w-8 bg-container hover:bg-container border-r border-color-1  p-1.5" @click="refreshAll">
                <Icon name="material-symbols:sync" class="w-full h-full" />
              </button>
              <button v-ripple type="button" class="flex h-8 w-8 bg-container hover:bg-container p-1.5" @click="openMediaControl">
                <Icon name="icon-park-outline:equalizer" class="w-full h-full p-0.5" />
              </button>
            </div>
            <div class="flex gap-2 bg-white dark:bg-white/5 px-3 py-2 rounded-md items-center overflow-hidden text-sm md:text-base">
              <div>Row</div>
              <input v-model.number="rowCountModel" type="number" step="1" class="inputRow rounded-md text-center min-w-5 bg-transparent outline-hidden [&::-webkit-outer-spin-button]:appearance-none" :max="maxCount" min="1" placeholder="Row Count" @blur="rowCount = clampRowCount(rowCount)">
              <div class="flex flex-col -my-2 -mr-3">
                <button v-ripple type="button" class="h-5 w-5 md:w-6 md:h-6 flex border-l border-b border-color-1 disabled:opacity-50" :disabled="rowCount >= maxCount" @click="changeRow(rowCount + 1)">
                  <Icon name="material-symbols:arrow-drop-up-rounded" class="w-full h-full" />
                </button>
                <button v-ripple type="button" class="h-5 w-5 md:w-6 md:h-6 flex border-l border-color-1 disabled:opacity-50" :disabled="rowCount <= 1" @click="changeRow(rowCount - 1)">
                  <Icon name="material-symbols:arrow-drop-down-rounded" class="w-full h-full" />
                </button>
              </div>
            </div>
          </div>
        </nav>
        <div class="fixed bottom-0 inset-x-0 w-screen pointer-events-none z-aboveNav">
          <MultiLiveContainer :selected="videosMap" class="pointer-events-auto" @select="add" />
        </div>

        <div v-if="videosRaw.length" class="flex-1">
          <TransitionGroup v-if="videosRaw.length" :css="!ghost.active" name="multivideo" tag="div" class="flex flex-wrap" :class="{ 'justify-center': centerVideos }" @before-leave="onBeforeLeave">
            <div
              v-for="video in videosRaw"
              :key="video.id"
              :data-video-id="video.id"
              :data-is-youtube="isYouTubeUrl(video.stream_url)"
              :style="{
                order: video.order,
                flexGrow: 0,
                flexShrink: 1,
                flexBasis: `${100 / ((rowCount || 4) - (video.space - 1))}%`,
                width: 0,
                transition: 'flex-basis 300ms ease, opacity 300ms ease, transform 300ms ease',
              }"
              class="will-change-auto"
            >
              <MultiVideo
                :id="video.id"
                :ref="(ref) => applyVideoRefs(ref, video)"
                :index="sortedIndexById.get(video.id) ?? 0"
                :data-space="video.space"
                :data-size="(rowCount || 4) - (video.space - 1)"
                :videos-length="videosRaw.length"
                :video="video"
                :show-video-control="showVideoControl"
                class="w-full h-full"
                @space-change="(space) => {
                  video.space = Math.max(1, Math.min(space, rowCount))
                }"
                @delete="(reason) => deleteVideo(video, reason)"
                @source-not-found="() => checkLive(video)"
                @move-next="() => moveNext(sortedIndexById.get(video.id) ?? 0)"
                @move-previous="() => movePrevious(sortedIndexById.get(video.id) ?? 0)"
                @drag-start="onDragStart"
                @drag-move="onDragMove"
                @drag-end="onDragEnd"
              />
            </div>
          </TransitionGroup>
        </div>
        <div v-else class="flex flex-1 justify-center items-center text-2xl font-semibold text-center px-3">
          {{ $t("selectvideofirst") }}
        </div>
        <Teleport v-if="ghost.active && ghostVideo" to="body">
          <div
            class="pointer-events-none fixed z-9999 rounded-lg overflow-hidden shadow-2xl ring-1 ring-black/20 bg-black/70 backdrop-blur-sm select-none"
            :style="{
              left: `${ghost.x}px`,
              top: `${ghost.y}px`,
              width: ghost.width ? `${ghost.width}px` : undefined,
              height: ghost.height ? `${ghost.height}px` : undefined,
              transform: 'scale(0.96)',
              transformOrigin: 'top left',
            }"
          >
            <div class="absolute inset-0 opacity-80">
              <img :src="ghostVideo.poster" alt="" class="w-full h-full object-cover">
            </div>
            <div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/15 to-transparent" />
            <div class="absolute inset-x-0 bottom-0 p-2 text-white">
              <div class="text-xs font-bold line-clamp-2">
                {{ ghostVideo.name }}
              </div>
            </div>
          </div>
        </Teleport>

        <footer class="text-center pt-10 py-10 flex flex-col gap-3 items-center">
          <div class="opacity-50 text-sm">
            <span>
              Created by
            </span>
            <NuxtLink to="https://twitter.com/crstlnz" target="_blank" class="">
              @crstlnz
            </NuxtLink>
          </div>
          <Footer class="opacity-50 scale-75" />
        </footer>
      </div>
    </SplashScreen>
  </div>
</template>

<style lang="scss">
.inputRow {
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    opacity: 1;
  }
}
</style>
