<script setup lang="ts">
import { WatchVideo } from '#components'
import { DragGesture } from '@use-gesture/vanilla'
import { useNotifications } from '~/store/notifications'

interface DragPayload {
  id: string
  x: number
  y: number
}

const props = defineProps<{
  video: Multi.Video
  index: number
  videosLength: number
  showVideoControl: boolean
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
const autoRemove = useLocalStorage('auto_remove_player', () => true)
const videoElement = ref<InstanceType<typeof WatchVideo>>()

function refresh() {
  if (videoElement.value) {
    videoElement.value.reload()
  }
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
  if (autoRemove.value) {
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
// const enableRotate = useLocalStorage<boolean>('rotate_feature_v1', () => false)
const enableRotate = ref(!isYouTubeUrl(props.video.stream_url))
const useSpace = ref(1)

function expandSpace() {
  emit('spaceChange', props.video.space + 1)
}

function reduceSpace() {
  emit('spaceChange', props.video.space - 1)
}
const rowCount = useLocalStorage('multiRowCount', 4, { deep: true })

// DRAG GESTURE
const container = ref<HTMLDivElement | null>(null)
const dragHandle = ref<HTMLElement | null>(null)
const gesture = ref()
const isDragging = ref(false)

function capturePointer(e: PointerEvent) {
  try {
    ;(e.currentTarget as HTMLElement | null)?.setPointerCapture?.(e.pointerId)
  }
  catch {}
}

onMounted(() => {
  const el = dragHandle.value ?? container.value
  if (!el) return
  gesture.value = new DragGesture(
    el,
    ({ first, last, active, xy, event }) => {
      const e = event as any
      const x = e?.clientX ?? xy[0]
      const y = e?.clientY ?? xy[1]
      const payload: DragPayload = {
        id: props.video.id,
        x,
        y,
      }

      if (first) {
        isDragging.value = true
        emit('dragStart', payload)
      }
      if (active) emit('dragMove', payload)
      if (last) {
        isDragging.value = false
        emit('dragEnd', payload)
      }
    },
    { filterTaps: true, threshold: 6 },
  )
})

onUnmounted(() => gesture.value?.destroy())

defineExpose({ refresh, video: videoElement, data: props.video, remove, id: props.video.id, useSpace })
</script>

<template>
  <div
    ref="container"
    class="flex items-center flex-col touch-none"
    :data-dragging="isDragging ? 'true' : 'false'"
    @pointerdown="capturePointer"
  >
    <div class="overflow-hidden flex-1 h-0 bg-black/50 self-stretch flex items-center">
      <div class="size-full relative">
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
        />
      </div>
    </div>
    <div v-if="showVideoControl" class="relative p-1 md:p-2 xl:p-2 gap-1 md:gap-2 xl:gap-3 w-full bg-white t border border-black/10 drop-shadow-xs dark:border-white/10 dark:bg-black/20">
      <div class="absolute inset-0 flex justify-between p-1 md:p-2 xl:p-3 pointer-events-none items-center">
        <button :disabled="index === 0" type="button" class="pointer-events-auto bg-black/10 dark:bg-white/5 h-6 w-6 md:w-7 md:h-7 rounded-full disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center" @click="$emit('movePrevious')">
          <Icon name="material-symbols:arrow-left" size="1.5rem" />
        </button>
        <button :disabled="index === videosLength - 1" type="button" class="pointer-events-auto bg-black/10 dark:bg-white/5 h-6 w-6 md:w-7 md:h-7 rounded-full disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center" @click="$emit('moveNext')">
          <Icon name="material-symbols:arrow-right" size="1.5rem" />
        </button>
      </div>
      <div class="flex gap-0.5 w-full flex-col items-center lg:px-10">
        <div class="flex gap-0.5 sm:gap-1">
          <button v-if="enableRotate" type="button" class="bg-blue-500 text-white size-5 sm:size-6 md:size-7 flex justify-center items-center rounded-md text-sm" @click="rotate">
            <Icon name="ic:outline-sync" class="w-full h-full p-1" />
          </button>
          <button type="button" class="bg-blue-500 text-white size-5 sm:size-6 md:size-7 flex justify-center items-center rounded-md text-sm" @click="refresh">
            <Icon name="material-symbols:refresh-rounded" class="w-full h-full p-1" />
          </button>
          <button
            type="button"
            class="bg-blue-500 text-white size-5 sm:size-6 md:size-7 flex justify-center items-center rounded-md text-sm disabled:opacity-45 disabled:cursor-not-allowed"
            :disabled="video.space <= 1"
            @click="reduceSpace"
          >
            <Icon name="iconoir:arrow-union" class="w-full h-full p-1" />
          </button>
          <button
            type="button"
            class="bg-blue-500 text-white size-5 sm:size-6 md:size-7 flex justify-center items-center rounded-md text-sm disabled:opacity-45 disabled:cursor-not-allowed"
            :disabled="video.space >= rowCount"
            @click="expandSpace"
          >
            <Icon name="iconoir:arrow-separate" class="w-full h-full p-1" />
          </button>
          <!-- <NuxtLink :to="video.original_url" target="_blank" :external="true" no-prefetch type="button" class="bg-blue-500 flex items-center size-5 sm:size-6 md:size-7 justify-center  text-white rounded-md text-sm">
            <Icon name="octicon:link-external-16" class="w-full h-full p-1.5" />
          </NuxtLink> -->
          <button type="button" class="bg-red-500 text-white size-5 sm:size-6 md:size-7 flex justify-center items-center rounded-md text-sm" @click="$emit('delete')">
            <Icon name="heroicons:trash" class="w-full h-full p-1.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
