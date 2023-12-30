<script lang="ts" setup>
import { MultiVideo } from '#components'
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
const minWidth = 160
const maxCount = computed(() => {
  return Math.floor(width.value / minWidth)
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

const videoPlayers = ref<Map<string, typeof MultiVideo>>(new Map())
function refreshAll() {
  for (const video of videoPlayers.value.values()) {
    video.refresh()
  }
}

const { addNotif } = useNotifications()

function deleteVideo(video: Multi.Video, reason?: string) {
  if (reason) {
    addNotif({
      type: 'info',
      title: reason,
      message: `${video.name} Room`,
    })
  }
  add(video)
}

const onLives = useOnLives()
const { data } = storeToRefs(onLives)
const { t } = useI18n()

const idnLives = useIDNLives()
const { data: idnData } = storeToRefs(idnLives)
function checkLive(video: Multi.Video) {
  const showroomLives = data.value ?? []
  const idnLives = idnData.value ?? []
  const showroomRoom = showroomLives.find(i => video.id === String(i.room_id))
  const idnRoom = idnLives.find(i => video.id === i.user.id)
  if (!showroomRoom && !idnRoom) {
    add(video) /// delete
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

useSeoMeta({
  description,
  ogDescription: () => description.value,

})
</script>

<template>
  <div>
    <SplashScreen>
      <div key="multiviewer" class="min-h-[100vh] flex flex-col">
        <nav class="flex sm:justify-center items-center gap-10 p-4 md:p-5 justify-between">
          <div class="text-base font-bold flex flex-col sm:flex-row sm:items-end sm:gap-0.5">
            <NuxtLink to="/" :class="$getGroup(group) === 'jkt48' ? 'text-red-500' : 'text-sky-400'" class="text-4xl max-sm:leading-8">
              {{ $getGroupTitle(group) }}
            </NuxtLink>
            <span class="leading-1">Multi Viewer</span>
          </div>
          <div class="flex gap-3 items-center">
            <div class="flex gap-2 flex-col md:flex-row">
              <button type="button" class="h-5 w-5 md:w-6 md:h-6" @click="() => videosMap.clear()">
                <Icon name="mingcute:broom-fill" class="w-full h-full" />
              </button>
              <button type="button" class="h-5 w-5 md:w-6 md:h-6" @click="refreshAll">
                <Icon name="material-symbols:sync" class="w-full h-full" />
              </button>
            </div>
            <div class="flex gap-3 bg-black/5 dark:bg-white/5 px-3 py-2 rounded-md">
              <div>Row</div>
              <input :value="rowCount" type="number" class="inputRow rounded-md text-center min-w-[50px] bg-black/25" max="8" min="1" placeholder="Row Count" @input="rowCountChange">
            </div>
          </div>
        </nav>
        <MultiLiveContainer :selected="videosMap" @select="add" />

        <div v-if="videos.length" class="flex-1">
          <TransitionGroup v-if="videos.length" name="multivideo" tag="div" class="grid" :style="{ gridTemplateColumns: `repeat(${rowCount || 4}, minmax(0, 1fr))` }" @before-leave="onBeforeLeave">
            <MultiVideo
              v-for="[idx, video] in videos.entries()"
              :ref="(ref) => applyVideoRefs(ref, video)"
              :key="video.id"
              :index="idx"
              :videos-length="videos.length"
              :video="video"
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
