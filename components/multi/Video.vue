<script setup lang="ts">
import { WatchVideo } from '#components'
import { useNotifications } from '~/store/notifications'

const props = defineProps<{
  video: Multi.Video
  index: number
  videosLength: number
  showVideoControl: boolean
}>()

const emit = defineEmits<{ (e: 'spaceChange', space: number): void, (e: 'moveNext'): void, (e: 'movePrevious'): void, (e: 'delete', reason?: string): void, (e: 'sourceNotFound'): void }>()
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
async function refreshShowroomStreamURL() {
  try {
    const res = await $apiFetch<Watch.WatchData>(`/api/watch/${props.video.original_url.replaceAll('https://www.showroom-live.com/r/', '')}`)
    const newStreamURL = res.streaming_url_list?.filter(a => a.type === 'hls')?.sort((a, b) => b.quality - a.quality)?.[0]?.url ?? res.streaming_url_list?.[0]?.url ?? ''
    updatedStreamURL.value = newStreamURL
    changeSource(sourceURLs.value[0])
    refresh()
    addNotif({
      message: props.video.name,
      title: 'Stream url refreshed!',
      type: 'info',
      duration: 2500,
    })
  }
  catch (e) {
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
const enableRotate = useLocalStorage<boolean>('rotate_feature_v1', () => false)
const useSpace = ref(1)

function expandSpace() {
  emit('spaceChange', props.video.space + 1)
}

function reduceSpace() {
  emit('spaceChange', props.video.space - 1)
}
const rowCount = useLocalStorage('multiRowCount', 4, { deep: true })
defineExpose({ refresh, video: videoElement, data: props.video, remove, id: props.video.id, useSpace })
</script>

<template>
  <div class="flex items-center flex-col">
    <div class="overflow-hidden flex-1 h-0 bg-black/50 self-stretch flex items-center">
      <div class="w-full relative">
        <div class="absolute left-1 top-0.5 md:left-2 md:top-2 z-10">
          <NuxtLink v-if="video.type === 'idn'" :to="video.original_url" :external="true" target="_blank" class="inline-block">
            <NuxtImg :src="video.icon" size="64px" class="h-3 md:h-5 object-contain max-w-[90px]" />
          </NuxtLink>
        </div>
        <WatchVideo
          ref="videoElement"
          :key="`video-${video.id}`"
          :poster="video.poster"
          :sources="sourceURLs"
          class="flex-1 w-full object-fill"
          :use-shortcut="false"
          :max-buffer-size="300 * 1000 * 1000"
          :max-max-buffer-length="300"
          :save-state="false"
          :compact="true"
          :use-default-control="true"
          @source-error="onSourceNotFound"
        />
      </div>
    </div>
    <div v-if="showVideoControl" class="relative p-1 md:p-2 xl:p-3 gap-1 md:gap-2 xl:gap-3 w-full bg-white border border-black/10 drop-shadow-sm dark:border-white/10 dark:bg-black/20">
      <div class="absolute inset-0 flex justify-between p-1 md:p-2 xl:p-3 pointer-events-none">
        <button :disabled="index === 0" type="button" class="pointer-events-auto bg-black/10 dark:bg-white/5 h-6 w-6 md:w-7 md:h-7 rounded-full disabled:opacity-40 disabled:cursor-not-allowed" @click="$emit('movePrevious')">
          <Icon name="material-symbols:arrow-left" size="1.5rem" />
        </button>
        <button :disabled="index === videosLength - 1" type="button" class="pointer-events-auto bg-black/10 dark:bg-white/5 h-6 w-6 md:w-7 md:h-7 rounded-full disabled:opacity-40 disabled:cursor-not-allowed" @click="$emit('moveNext')">
          <Icon name="material-symbols:arrow-right" size="1.5rem" />
        </button>
      </div>
      <div class="flex gap-1 md:gap-2 w-full flex-col lg:flex-row items-center lg:px-10">
        <div :title="video.name" class="self-stretch lg:flex-1 max-lg:mx-8 flex items-center">
          <div class="flex-1 w-0 truncate text-sm max-md:text-center leading-6 md:leading-7">
            {{ video.name }}
          </div>
        </div>
        <div class="flex gap-1 md:gap-1.5">
          <button v-if="enableRotate" type="button" class="bg-blue-500 text-white h-6 w-6 md:w-7 md:h-7 flex justify-center items-center rounded-md text-sm" @click="rotate">
            <Icon name="ic:outline-sync" class="w-full h-full p-1" />
          </button>
          <button type="button" class="bg-blue-500 text-white h-6 w-6 md:w-7 md:h-7 flex justify-center items-center rounded-md text-sm" @click="refresh">
            <Icon name="material-symbols:refresh-rounded" class="w-full h-full p-1" />
          </button>
          <button
            type="button"
            class="bg-blue-500 text-white h-6 w-6 md:w-7 md:h-7 flex justify-center items-center rounded-md text-sm disabled:opacity-45 disabled:cursor-not-allowed"
            :disabled="video.space <= 1"
            @click="reduceSpace"
          >
            <Icon name="iconoir:arrow-union" class="w-full h-full p-1" />
          </button>
          <button
            type="button"
            class="bg-blue-500 text-white h-6 w-6 md:w-7 md:h-7 flex justify-center items-center rounded-md text-sm disabled:opacity-45 disabled:cursor-not-allowed"
            :disabled="video.space >= rowCount"
            @click="expandSpace"
          >
            <Icon name="iconoir:arrow-separate" class="w-full h-full p-1" />
          </button>
          <!-- <NuxtLink :to="video.original_url" target="_blank" :external="true" no-prefetch type="button" class="bg-blue-500 flex items-center h-6 w-6 md:w-7 md:h-7 justify-center  text-white rounded-md text-sm">
            <Icon name="octicon:link-external-16" class="w-full h-full p-1.5" />
          </NuxtLink> -->
          <button type="button" class="bg-red-500 text-white h-6 w-6 md:w-7 md:h-7 flex justify-center items-center rounded-md text-sm" @click="$emit('delete')">
            <Icon name="heroicons:trash" class="w-full h-full p-1.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
