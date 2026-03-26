<script lang="ts" setup>
import { MultiMediaControl, MultiVideo } from '#components'
import { useNotifications } from '~/store/notifications'
import { useOnLives } from '~/store/onLives'
import { useSettings } from '~/store/settings'
import { isYouTubeUrl } from '~/utils/youtube'

definePageMeta({
  layout: 'empty',
})

const selectedVideos = useSessionStorage<Map<string, Multi.Video>>('videoMultiSelected', new Map())

const videos = computed(() => {
  return [...selectedVideos.value.values()].sort((a, b) => a.order - b.order)
})

const renderVideos = computed(() => {
  return [...selectedVideos.value.values()]
})

const sortedIndexById = computed(() => {
  const sortedIndex = new Map<string, number>()
  for (const [i, v] of videos.value.entries()) {
    sortedIndex.set(v.id, i)
  }
  return sortedIndex
})

function toggleVideo(video: Multi.Video) {
  if (selectedVideos.value.has(video.id)) {
    selectedVideos.value.delete(video.id)
    for (const [i, video] of videos.value.entries()) {
      video.order = i + 1
    }
  }
  else {
    selectedVideos.value.set(video.id, video)
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
const autoRemove = useLocalStorage('auto_remove_player', () => true)
const centerVideos = useLocalStorage('center_videos', () => true)
const showVideoControl = useLocalStorage('show_video_control', () => true)

interface DragPayload {
  id: string
  x: number
  y: number
}

interface DragReorderDecision {
  shouldReorder: boolean
  from: number
  slotIndex: number | null
  to: number
}

interface DragLayoutRect {
  bottom: number
  height: number
  id: string
  left: number
  right: number
  top: number
  width: number
}

interface DragGridRow {
  height: number
  left: number
  top: number
}

interface DragGridSlot {
  bottom: number
  index: number
  left: number
  right: number
  top: number
}

interface DragLayoutItem {
  id: string
  span: number
}

interface DragItemRow {
  span: number
}

const tileEls = shallowRef<Map<string, HTMLElement>>(new Map())
const dragLayoutRects = shallowRef<Map<string, DragLayoutRect>>(new Map())
const dragLayoutItems = shallowRef<DragLayoutItem[]>([])
const dragGridSlots = shallowRef<DragGridSlot[]>([])
const tileAnimationTimers = new WeakMap<HTMLElement, number>()
const dragState = reactive({
  active: false,
  id: '' as string,
  lastReorderSlotIndex: null as number | null,
  startX: 0,
  startY: 0,
  x: 0,
  y: 0,
  deltaX: 0,
  deltaY: 0,
  overSlotIndex: null as number | null,
})

function clampVideoSpan(space: number) {
  return Math.max(1, Math.min(space, rowCount.value || 1))
}

function getTileStyle(video: Multi.Video) {
  const isDragged = dragState.active && dragState.id === video.id
  const currentRowCount = rowCount.value || 4
  const span = clampVideoSpan(video.space)
  const basis = `${(100 * span) / currentRowCount}%`

  return {
    order: video.order,
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: basis,
    maxWidth: basis,
    minWidth: 0,
    transition: 'flex-basis 220ms ease, max-width 220ms ease, transform 220ms ease, scale 220ms ease, opacity 220ms ease',
    opacity: isDragged ? 0.4 : 1,
    scale: isDragged ? '0.92' : undefined,
  } as const
}

function collectTileElements() {
  if (import.meta.server) return

  const map = new Map<string, HTMLElement>()
  for (const el of document.querySelectorAll<HTMLElement>('[data-video-id]')) {
    const id = el.dataset.videoId
    if (id) map.set(id, el)
  }
  tileEls.value = map
}

function getTileRects() {
  const rects = new Map<string, DOMRect>()
  for (const [id, el] of tileEls.value.entries()) {
    rects.set(id, el.getBoundingClientRect())
  }
  return rects
}

function waitForLayoutFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

function buildGridRows(containerRect: DOMRect, rects: Iterable<DragLayoutRect>, viewportHeight: number, includeTrailingRows = true) {
  const rows = new Map<number, DragGridRow>()

  for (const rect of rects) {
    const key = Math.round(rect.top)
    const existing = rows.get(key)
    if (existing) {
      existing.height = Math.max(existing.height, rect.height)
      existing.left = Math.min(existing.left, rect.left)
    }
    else {
      rows.set(key, {
        top: rect.top,
        height: rect.height,
        left: rect.left,
      })
    }
  }

  const detectedRows = [...rows.values()].sort((a, b) => a.top - b.top)
  if (!detectedRows.length) {
    const fallbackHeight = Math.max(containerRect.width / Math.max(rowCount.value, 1) * 0.62, 180)
    if (!includeTrailingRows) return []
    const generatedRows: DragGridRow[] = []
    for (let top = containerRect.top; top < viewportHeight; top += fallbackHeight) {
      generatedRows.push({ top, height: fallbackHeight, left: containerRect.left })
    }
    return generatedRows
  }

  if (!includeTrailingRows) {
    return detectedRows
  }

  const generatedRows = [...detectedRows]
  const fallbackHeight = generatedRows[generatedRows.length - 1]?.height || detectedRows[0]?.height || 1
  let nextTop = (generatedRows[generatedRows.length - 1]?.top || containerRect.top) + fallbackHeight

  while (nextTop < viewportHeight) {
    generatedRows.push({
      top: nextTop,
      height: fallbackHeight,
      left: generatedRows[generatedRows.length - 1]?.left || containerRect.left,
    })
    nextTop += fallbackHeight
  }

  return generatedRows
}

function packItemRows(items: DragLayoutItem[]) {
  const rows: DragItemRow[] = []
  let occupiedSpan = 0

  for (const item of items) {
    const span = clampVideoSpan(item.span)
    if (occupiedSpan > 0 && occupiedSpan + span > rowCount.value) {
      rows.push({ span: occupiedSpan })
      occupiedSpan = 0
    }

    occupiedSpan += span

    if (occupiedSpan === rowCount.value) {
      rows.push({ span: occupiedSpan })
      occupiedSpan = 0
    }
  }

  if (occupiedSpan > 0) {
    rows.push({ span: occupiedSpan })
  }

  return rows
}

function getMultiGridContainerRect() {
  return document.querySelector<HTMLElement>('[data-multi-grid]')?.getBoundingClientRect() ?? null
}

function snapshotGridSlots() {
  if (import.meta.server) return

  const containerRect = getMultiGridContainerRect()
  if (!containerRect || rowCount.value <= 0) {
    dragGridSlots.value = []
    return
  }

  const rows = buildGridRows(containerRect, dragLayoutRects.value.values(), window.innerHeight, false)
  const cellWidth = containerRect.width / rowCount.value
  const itemRows = packItemRows(dragLayoutItems.value)
  const slots: DragGridSlot[] = []
  let slotIndex = 0

  for (const [rowIndex, row] of rows.entries()) {
    const occupiedSpan = itemRows[rowIndex]?.span ?? rowCount.value
    const rowLeft = centerVideos.value ? row.left : containerRect.left

    for (let col = 0; col < occupiedSpan; col += 1) {
      const left = rowLeft + col * cellWidth
      slots.push({
        index: slotIndex,
        left,
        right: left + cellWidth,
        top: row.top,
        bottom: row.top + row.height,
      })
      slotIndex += 1
    }
  }

  dragGridSlots.value = slots
}

function clearTileAnimation(el: HTMLElement) {
  const timer = tileAnimationTimers.get(el)
  if (timer) {
    clearTimeout(timer)
    tileAnimationTimers.delete(el)
  }

  el.style.removeProperty('transform')
  el.style.removeProperty('transition')
  el.style.removeProperty('will-change')
}

async function animateTilesAfterSpaceChange(changedId: string) {
  if (import.meta.server) return

  collectTileElements()
  const beforeRects = getTileRects()
  await nextTick()
  await waitForLayoutFrame()
  collectTileElements()
  const afterRects = getTileRects()

  for (const [id, el] of tileEls.value.entries()) {
    if (id === changedId) continue

    const before = beforeRects.get(id)
    const after = afterRects.get(id)
    if (!before || !after) continue

    const deltaX = before.left - after.left
    const deltaY = before.top - after.top
    if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) continue

    clearTileAnimation(el)
    el.style.transition = 'none'
    el.style.transform = `translate(${deltaX}px, ${deltaY}px)`
    el.style.willChange = 'transform'
  }

  void document.body.offsetHeight

  for (const [id, el] of tileEls.value.entries()) {
    if (id === changedId) continue

    const before = beforeRects.get(id)
    const after = afterRects.get(id)
    if (!before || !after) continue

    const deltaX = before.left - after.left
    const deltaY = before.top - after.top
    if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) continue

    el.style.transition = 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)'
    el.style.transform = 'translate(0, 0)'

    const timer = window.setTimeout(() => {
      clearTileAnimation(el)
    }, 260)
    tileAnimationTimers.set(el, timer)
  }
}

function changeVideoSpace(video: Multi.Video, space: number) {
  const nextSpace = clampVideoSpan(space)
  if (video.space === nextSpace) return

  collectTileElements()
  video.space = nextSpace
  void animateTilesAfterSpaceChange(video.id)
}

function snapshotDragLayout() {
  const rectMap = new Map<string, DragLayoutRect>()
  const items: DragLayoutItem[] = []

  for (const video of videos.value) {
    const el = tileEls.value.get(video.id)
    if (!el) continue

    const rect = el.getBoundingClientRect()
    rectMap.set(video.id, {
      bottom: rect.bottom,
      height: rect.height,
      id: video.id,
      left: rect.left,
      right: rect.right,
      top: rect.top,
      width: rect.width,
    })
    items.push({
      id: video.id,
      span: clampVideoSpan(video.space),
    })
  }

  dragLayoutRects.value = rectMap
  dragLayoutItems.value = items
  snapshotGridSlots()
}

function clearDragLayout() {
  dragLayoutRects.value = new Map()
  dragLayoutItems.value = []
  dragGridSlots.value = []
}

function setDraggingCursor(active: boolean) {
  if (import.meta.server) return

  const cursor = active ? 'grabbing' : ''
  document.body.style.cursor = cursor
  document.documentElement.style.cursor = cursor
}

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

function findGridSlotIndexAtPoint(x: number, y: number) {
  if (dragGridSlots.value.length && dragGridSlots.value.length <= rowCount.value) {
    for (const slot of dragGridSlots.value) {
      if (x >= slot.left && x <= slot.right) {
        return slot.index
      }
    }
    return null
  }

  for (const slot of dragGridSlots.value) {
    if (x >= slot.left && x <= slot.right && y >= slot.top && y <= slot.bottom) {
      return slot.index
    }
  }
  return null
}

function getInsertedItemSlotRange(items: DragLayoutItem[], insertionIndex: number, draggingId: string) {
  let cursor = 0
  const currentRowCount = Math.max(1, rowCount.value)

  for (const [index, item] of items.entries()) {
    const span = Math.max(1, Math.min(item.span, currentRowCount))
    const column = cursor % currentRowCount
    if (column + span > currentRowCount) {
      cursor += currentRowCount - column
    }

    if (index === insertionIndex && item.id === draggingId) {
      return {
        end: cursor + span - 1,
        start: cursor,
      }
    }

    cursor += span
  }

  return null
}

function getInsertionIndexForSlot(slotIndex: number, draggingId: string) {
  const draggingItem = dragLayoutItems.value.find(item => item.id === draggingId)
  if (!draggingItem) return null

  const remainingItems = dragLayoutItems.value.filter(item => item.id !== draggingId)
  let bestInsertionIndex = 0
  let bestDistance = Number.POSITIVE_INFINITY

  for (let insertionIndex = 0; insertionIndex <= remainingItems.length; insertionIndex += 1) {
    const candidateItems = [...remainingItems]
    candidateItems.splice(insertionIndex, 0, draggingItem)

    const placement = getInsertedItemSlotRange(candidateItems, insertionIndex, draggingId)
    if (!placement) continue

    const distance = slotIndex < placement.start
      ? placement.start - slotIndex
      : slotIndex > placement.end
        ? slotIndex - placement.end
        : 0

    if (distance < bestDistance) {
      bestDistance = distance
      bestInsertionIndex = insertionIndex
    }
  }

  return bestInsertionIndex
}

function getDragReorderDecision(p: DragPayload): DragReorderDecision {
  if (!dragState.active || dragState.id !== p.id) {
    return {
      shouldReorder: false,
      from: -1,
      slotIndex: null,
      to: -1,
    }
  }

  const slotIndex = findGridSlotIndexAtPoint(p.x, p.y)
  const from = videos.value.findIndex(v => v.id === p.id)
  if (slotIndex === null) {
    return {
      shouldReorder: false,
      from,
      slotIndex: null,
      to: -1,
    }
  }

  const to = getInsertionIndexForSlot(slotIndex, p.id) ?? -1
  if (from < 0 || to < 0 || from === to) {
    return {
      shouldReorder: false,
      from,
      slotIndex,
      to,
    }
  }

  return {
    shouldReorder: true,
    from,
    slotIndex,
    to,
  }
}

function onDragStart(p: DragPayload) {
  dragState.active = true
  dragState.id = p.id
  dragState.lastReorderSlotIndex = null
  dragState.startX = p.x
  dragState.startY = p.y
  dragState.x = p.x
  dragState.y = p.y
  dragState.deltaX = 0
  dragState.deltaY = 0
  dragState.overSlotIndex = null
  collectTileElements()
  snapshotDragLayout()
  setDraggingCursor(true)
}

function onDragMove(p: DragPayload) {
  if (!dragState.active || dragState.id !== p.id) return

  dragState.x = p.x
  dragState.y = p.y
  dragState.deltaX = p.x - dragState.startX
  dragState.deltaY = p.y - dragState.startY
  const decision = getDragReorderDecision(p)
  dragState.overSlotIndex = decision.slotIndex

  if (!decision.shouldReorder || decision.slotIndex === null) return
  if (dragState.lastReorderSlotIndex === decision.slotIndex) return

  dragState.lastReorderSlotIndex = decision.slotIndex
  reorderBySortedIndex(decision.from, decision.to)
}

function onDragEnd() {
  dragState.active = false
  dragState.id = ''
  dragState.lastReorderSlotIndex = null
  dragState.overSlotIndex = null
  dragState.deltaX = 0
  dragState.deltaY = 0
  clearDragLayout()
  setDraggingCursor(false)
}

function onBeforeLeave(el: Element) {
  const rect = el.getBoundingClientRect()
  const element = el as HTMLElement
  element.style.top = `${rect.top}px`
  element.style.left = `${rect.left}px`
  element.style.height = `${rect.height}px`
  element.style.width = `${rect.width}px`
}

onBeforeUnmount(() => {
  setDraggingCursor(false)
  for (const el of tileEls.value.values()) {
    clearTileAnimation(el)
  }
})

const videoPlayers = ref<Map<string, InstanceType<typeof MultiVideo>>>(new Map())
function refreshAll() {
  for (const video of videoPlayers.value.values()) {
    video.refresh()
  }
}

const { addNotif } = useNotifications()

function deleteVideo(video: Multi.Video, reason?: string) {
  if (reason) {
    if (autoRemove.value) toggleVideo(video)
    addNotif({
      type: 'info',
      title: reason,
      message: `${video.name} Room`,
    })
  }
  else {
    toggleVideo(video)
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
    if (autoRemove.value) toggleVideo(video)
    addNotif({
      type: 'info',
      title: t('notif.live.ended'),
      message: `${video.name} Room`,
    })
  }
  else {
    const oldVideo = selectedVideos.value.get(video.id)
    if (oldVideo) {
      selectedVideos.value.set(oldVideo.id, {
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
    v.space = clampVideoSpan(v.space)
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
              <button v-ripple type="button" class="flex h-8 w-8 bg-container hover:bg-container border-r border-color-1  p-1.5" @click="() => selectedVideos.clear()">
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
          <MultiLiveContainer :selected="selectedVideos" class="pointer-events-auto" @select="toggleVideo" />
        </div>

        <div v-if="renderVideos.length" class="flex-1">
          <TransitionGroup v-if="renderVideos.length" name="multivideo" tag="div" class="flex flex-wrap" :class="{ 'justify-center': centerVideos }" data-multi-grid @before-leave="onBeforeLeave">
            <div
              v-for="video in renderVideos"
              :key="video.id"
              :data-video-id="video.id"
              :data-is-youtube="isYouTubeUrl(video.stream_url)"
              :data-space="video.space"
              :style="getTileStyle(video)"
              class="will-change-auto relative"
            >
              <MultiVideo
                :id="video.id"
                :ref="(ref) => applyVideoRefs(ref, video)"
                :index="sortedIndexById.get(video.id) ?? 0"
                :data-space="video.space"
                :data-size="(rowCount || 4) - (video.space - 1)"
                :videos-length="renderVideos.length"
                :video="video"
                :show-video-control="showVideoControl"
                class="w-full h-full"
                @space-change="(space) => changeVideoSpace(video, space)"
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
        <footer class="text-center pt-10 py-10 flex flex-col gap-1 items-center">
          <div class="opacity-50 text-xs">
            <span>
              Created by
            </span>
            <NuxtLink to="https://twitter.com/crstlnz" target="_blank" class="">
              @crstlnz
            </NuxtLink>
          </div>
          <Footer class="opacity-50" />
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
