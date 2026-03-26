<script setup lang="ts">
const props = defineProps<{
  active: boolean
  centerVideos: boolean
  dragId: string
  overId: string | null
  overSlotIndex: number | null
  pointerX: number
  pointerY: number
  rowCount: number
  sortedEntries: [string, number][]
  visible: boolean
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
let frame = 0

const orderMap = computed(() => new Map(props.sortedEntries))

interface GridRow {
  height: number
  left: number
  top: number
}

interface ItemRow {
  span: number
}

function getGridRows(containerRect: DOMRect, viewportHeight: number) {
  const rows = new Map<number, GridRow>()

  for (const tile of document.querySelectorAll<HTMLElement>('[data-video-id]')) {
    const rect = tile.getBoundingClientRect()
    const key = Math.round(rect.top)
    const existing = rows.get(key)

    if (existing) {
      existing.height = Math.max(existing.height, rect.height)
      existing.left = Math.min(existing.left, rect.left)
    }
    else {
      rows.set(key, { top: rect.top, height: rect.height, left: rect.left })
    }
  }

  const detectedRows = [...rows.values()].sort((a, b) => a.top - b.top)

  if (!rows.size) {
    const fallbackHeight = Math.max(containerRect.width / Math.max(props.rowCount, 1) * 0.62, 180)
    const generatedRows: GridRow[] = []
    for (let top = containerRect.top; top < viewportHeight; top += fallbackHeight) {
      generatedRows.push({ top, height: fallbackHeight, left: containerRect.left })
    }
    return generatedRows
  }

  const generatedRows = [...detectedRows]
  const lastRow = generatedRows[generatedRows.length - 1]
  if (!lastRow) return generatedRows

  const fallbackHeight = lastRow.height || detectedRows[0]?.height || 1
  let nextTop = lastRow.top + lastRow.height

  while (nextTop < viewportHeight) {
    generatedRows.push({
      top: nextTop,
      height: fallbackHeight,
      left: lastRow.left || containerRect.left,
    })
    nextTop += fallbackHeight
  }

  return generatedRows
}

function getItemRows() {
  const rows: ItemRow[] = []
  let occupiedSpan = 0

  for (const tile of document.querySelectorAll<HTMLElement>('[data-video-id]')) {
    const span = Math.max(1, Math.min(Number(tile.dataset.space) || 1, props.rowCount))

    if (occupiedSpan > 0 && occupiedSpan + span > props.rowCount) {
      rows.push({ span: occupiedSpan })
      occupiedSpan = 0
    }

    occupiedSpan += span

    if (occupiedSpan === props.rowCount) {
      rows.push({ span: occupiedSpan })
      occupiedSpan = 0
    }
  }

  if (occupiedSpan > 0) {
    rows.push({ span: occupiedSpan })
  }

  return rows
}

function draw() {
  const el = canvas.value
  if (!el || !props.visible || import.meta.server) return

  const dpr = window.devicePixelRatio || 1
  const width = window.innerWidth
  const height = window.innerHeight

  if (el.width !== Math.round(width * dpr) || el.height !== Math.round(height * dpr)) {
    el.width = Math.round(width * dpr)
    el.height = Math.round(height * dpr)
    el.style.width = `${width}px`
    el.style.height = `${height}px`
  }

  const ctx = el.getContext('2d')
  if (!ctx) return

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = 'rgba(6, 10, 20, 0.2)'
  ctx.fillRect(0, 0, width, height)

  const container = document.querySelector<HTMLElement>('[data-multi-grid]')
  const containerRect = container?.getBoundingClientRect()
  if (containerRect && props.rowCount > 0) {
    const rows = getGridRows(containerRect, height)
    const cellWidth = containerRect.width / props.rowCount
    const itemRows = getItemRows()
    let slotIndex = 0

    for (const [rowIndex, row] of rows.entries()) {
      const occupiedSpan = itemRows[rowIndex]?.span ?? props.rowCount
      const rowLeft = rowIndex < itemRows.length && props.centerVideos
        ? row.left
        : containerRect.left

      for (let col = 0; col < occupiedSpan; col += 1) {
        const left = rowLeft + col * cellWidth
        const isOverSlot = props.overSlotIndex === slotIndex

        if (isOverSlot) {
          ctx.fillStyle = 'rgba(250, 204, 21, 0.2)'
          ctx.strokeStyle = 'rgba(250, 204, 21, 0.95)'
          ctx.lineWidth = 2
        }
        else {
          ctx.strokeStyle = 'rgba(248, 250, 252, 0.18)'
          ctx.lineWidth = 1
          ctx.fillStyle = 'rgba(148, 163, 184, 0.06)'
        }

        ctx.fillRect(left, row.top, cellWidth, row.height)
        ctx.strokeRect(left, row.top, cellWidth, row.height)
        slotIndex += 1
      }
    }

    ctx.strokeStyle = 'rgba(248, 250, 252, 0.3)'
    ctx.lineWidth = 1.5
    ctx.strokeRect(containerRect.left, containerRect.top, containerRect.width, containerRect.height)
  }

  for (const tile of document.querySelectorAll<HTMLElement>('[data-video-id]')) {
    const id = tile.dataset.videoId
    if (!id) continue

    const rect = tile.getBoundingClientRect()
    const isDragged = props.active && props.dragId === id
    const isOver = props.overId === id
    const order = orderMap.value.get(id)

    ctx.fillStyle = isDragged
      ? 'rgba(244, 63, 94, 0.22)'
      : isOver
        ? 'rgba(132, 204, 22, 0.22)'
        : 'rgba(34, 211, 238, 0.18)'
    ctx.strokeStyle = isDragged
      ? 'rgba(251, 113, 133, 0.95)'
      : isOver
        ? 'rgba(163, 230, 53, 0.95)'
        : 'rgba(103, 232, 249, 0.95)'
    ctx.lineWidth = isDragged || isOver ? 2.5 : 1.5

    ctx.fillRect(rect.left, rect.top, rect.width, rect.height)
    ctx.strokeRect(rect.left, rect.top, rect.width, rect.height)

    ctx.fillStyle = 'rgba(2, 6, 23, 0.88)'
    ctx.fillRect(rect.left + 8, rect.top + 8, Math.min(rect.width - 16, 160), 34)

    ctx.fillStyle = '#f8fafc'
    ctx.font = '600 12px ui-monospace, SFMono-Regular, Menlo, monospace'
    ctx.fillText(`#${order ?? '?'} ${id}`, rect.left + 14, rect.top + 21)
    ctx.fillStyle = 'rgba(226, 232, 240, 0.9)'
    ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace'
    ctx.fillText(`${Math.round(rect.width)}x${Math.round(rect.height)}`, rect.left + 14, rect.top + 36)
  }

  if (props.active) {
    ctx.beginPath()
    ctx.arc(props.pointerX, props.pointerY, 6, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(251, 113, 133, 0.95)'
    ctx.fill()
  }
}

function loop() {
  if (!props.visible) {
    frame = 0
    return
  }

  draw()
  frame = window.requestAnimationFrame(loop)
}

function start() {
  if (import.meta.server || frame) return
  loop()
}

function stop() {
  if (!frame || import.meta.server) return
  window.cancelAnimationFrame(frame)
  frame = 0

  const el = canvas.value
  const ctx = el?.getContext('2d')
  if (el && ctx) {
    ctx.clearRect(0, 0, el.width, el.height)
  }
}

watch(() => props.visible, (visible) => {
  if (visible) {
    start()
  }
  else {
    stop()
  }
}, { immediate: true })

onUnmounted(() => {
  stop()
})
</script>

<template>
  <canvas
    v-if="visible"
    ref="canvas"
    class="pointer-events-none fixed inset-0 z-9998"
  />
</template>
