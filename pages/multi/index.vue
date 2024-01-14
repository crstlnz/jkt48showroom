<script lang="ts" setup>
import { MultiMediaControl, MultiVideo } from '#components'
import { useIDNLives } from '~/store/idnLives'
import { useNotifications } from '~/store/notifications'
import { useOnLives } from '~/store/onLives'
import { useSettings } from '~/store/settings'

definePageMeta({
  layout: 'empty',
})

const videosMap = useSessionStorage<Map<string, Multi.Video>>('videoMultiSelected', new Map())

const videos = computed(() => {
  return [...videosMap.value.values()].sort((a, b) => a.order - b.order)
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
    return 190
  }
  return 160
})

const maxCount = computed(() => {
  return Math.floor(width.value / minWidth.value)
})

const rowCount = useLocalStorage('multiRowCount', 4, { deep: true })

onMounted(() => {
  if (rowCount.value > maxCount.value) {
    rowCount.value = maxCount.value
  }
})

watch(maxCount, (c) => {
  if (rowCount.value > c) {
    rowCount.value = c
  }
})

function rowCountChange(event: Event) {
  const inputEl = event.target as HTMLInputElement
  if (inputEl) {
    let row = Number(inputEl.value.slice(-1))
    if (row > maxCount.value) {
      row = maxCount.value
    }
    else if (row < 1) {
      row = 1
    }
    rowCount.value = row
    inputEl.value = String(row)
  }
}

function changeRow(row: number) {
  if (row > maxCount.value) {
    row = maxCount.value
  }
  else if (row < 1) {
    row = 1
  }
  rowCount.value = row
}

const { group } = useSettings()

function movePrevious(i: number) {
  const vids = [...videos.value]
  const pick = vids[i]
  vids.splice(i, 1)
  vids.splice(i - 1, 0, pick)
  for (const [idx, v] of vids.entries()) {
    v.order = idx + 1
  }
}

function moveNext(i: number) {
  const vids = [...videos.value]
  const pick = vids[i]
  vids.splice(i, 1)
  vids.splice(i + 1, 0, pick)
  for (const [idx, v] of vids.entries()) {
    v.order = idx + 1
  }
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
const centerVideos = useLocalStorage('center_videos', () => false)
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
const { data } = storeToRefs(onLives)
const { t } = useI18n()

const idnLives = useIDNLives()
const { data: idnData } = storeToRefs(idnLives)

const livesIds = computed(() => {
  return [...(data.value?.map(i => String(i.room_id)) || []), ...(idnData.value?.map(i => String(i.user?.id)) || [])]
})

watch(livesIds, (ids) => {
  if (autoRemove.value) {
    for (const v of videoPlayers.value.values()) {
      if (!ids.includes(v.id)) {
        v.remove()
      }
    }
  }
})

function checkLive(video: Multi.Video) {
  const showroomLives = data.value ?? []
  const idnLives = idnData.value ?? []
  const showroomRoom = showroomLives.find(i => video.id === String(i.room_id))
  const idnRoom = idnLives.find(i => video.id === i.user.id)
  if (!showroomRoom && !idnRoom) {
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
      if (showroomRoom) {
        videosMap.value.set(oldVideo.id, {
          ...convertShowroom(showroomRoom),
          order: oldVideo.order,
        })
      }
      else if (idnRoom) {
        videosMap.value.set(oldVideo.id, {
          ...convertIDNLive(idnRoom),
          order: oldVideo.order,
        })
      }
    }
  }
}

function applyVideoRefs(ref: any, video: Multi.Video) {
  console.log('Apply refs for', video.id)
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
  return `Multi viewer for ${getGroupTitle(group)} Live Streams!`
})

watch(rowCount, () => {
  for (const v of videoPlayers.value.values()) {
    v.video?.calculateVideoSize()
  }
})

useSeoMeta({
  description,
  ogDescription: () => description.value,

})
const mediaControl = ref<InstanceType<typeof MultiMediaControl>>()
function openMediaControl() {
  if (mediaControl.value) mediaControl.value.open()
}
</script>

<template>
  <div>
    <SplashScreen>
      <div key="multiviewer" class="min-h-[100vh] flex flex-col">
        <MultiMediaControl ref="mediaControl" :video-players="videoPlayers" />
        <nav class="flex items-center gap-4 p-4 md:p-5 justify-between mx-auto max-w-[648px] w-full">
          <div class="text-base font-bold flex flex-col sm:flex-row sm:items-end sm:gap-0.5">
            <NuxtLink to="/" :class="$getGroup(group) === 'jkt48' ? 'text-red-500' : 'text-sky-400'" class="text-3xl lg:text-4xl max-sm:leading-8">
              {{ $getGroupTitle(group) }}
            </NuxtLink>
            <span class="leading-1 text-sm lg:text-base">Multi Viewer</span>
          </div>
          <div class="flex gap-3 items-center">
            <div class="flex md:flex-row border border-black/5 dark:border-white/5 rounded-md overflow-hidden">
              <button v-ripple type="button" class="flex h-8 w-8 bg-container hover:bg-container border-r border-black/5 dark:border-white/5  p-1.5" @click="() => videosMap.clear()">
                <Icon name="mingcute:broom-fill" class="w-full h-full" />
              </button>
              <button v-ripple type="button" class="flex h-8 w-8 bg-container hover:bg-container border-r border-black/5 dark:border-white/5  p-1.5" @click="refreshAll">
                <Icon name="material-symbols:sync" class="w-full h-full" />
              </button>
              <button v-ripple type="button" class="flex h-8 w-8 bg-container hover:bg-container p-1.5" @click="openMediaControl">
                <Icon name="icon-park-outline:equalizer" class="w-full h-full p-0.5" />
              </button>
            </div>
            <div class="flex gap-2 bg-white dark:bg-white/5 px-3 py-2 rounded-md items-center overflow-hidden text-sm md:text-base">
              <div>Row</div>
              <input :value="rowCount" type="number" class="inputRow rounded-md text-center min-w-[20px] bg-transparent outline-none" max="8" min="1" placeholder="Row Count" @input="rowCountChange">
              <div class="flex flex-col -my-2 -mr-3">
                <button v-ripple type="button" class="h-5 w-5 md:w-6 md:h-6 flex border-l border-b border-black/5 dark:border-white/5" @click="changeRow(rowCount + 1)">
                  <Icon name="material-symbols:arrow-drop-up-rounded" class="w-full h-full" />
                </button>
                <button v-ripple type="button" class="h-5 w-5 md:w-6 md:h-6 flex border-l border-black/5 dark:border-white/5" @click="changeRow(rowCount - 1)">
                  <Icon name="material-symbols:arrow-drop-down-rounded" class="w-full h-full" />
                </button>
              </div>
            </div>
          </div>
        </nav>
        <div class="fixed bottom-0 inset-x-0 w-screen pointer-events-none z-aboveNav">
          <MultiLiveContainer :selected="videosMap" class="pointer-events-auto" @select="add" />
        </div>

        <div v-if="videos.length" class="flex-1">
          <TransitionGroup v-if="videos.length" name="multivideo" tag="div" class="flex flex-wrap" :class="{ 'justify-center': centerVideos }" @before-leave="onBeforeLeave">
            <MultiVideo
              v-for="[idx, video] in videos.entries()"
              :ref="(ref) => applyVideoRefs(ref, video)"
              :key="video.id"
              :style="{ flex: `0 0 ${100 / (rowCount || 4)}%` }"
              :class="{ 'transition-all duration-300': videos.length === 1 }"
              :index="idx"
              :videos-length="videos.length"
              :video="video"
              :show-video-control="showVideoControl"
              @delete="(reason) => deleteVideo(video, reason)"
              @source-not-found="() => checkLive(video)"
              @move-next="() => moveNext(idx)"
              @move-previous="() => movePrevious(idx)"
            />
          </TransitionGroup>
        </div>
        <div v-else class="flex flex-1 justify-center items-center text-2xl font-semibold text-center px-3">
          {{ $t("selectvideofirst") }}
        </div>

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
