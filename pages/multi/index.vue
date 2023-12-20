<script lang="ts" setup>
import { useSettings } from '~/store/settings'

definePageMeta({
  layout: false,
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

const rowCount = useLocalStorage('multiRowCount', 4, { deep: true })

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
</script>

<template>
  <div>
    <SplashScreen>
      <div class="min-h-[100vh] flex flex-col">
        <nav class="flex justify-center items-center gap-10 p-5">
          <div class="text-base font-bold">
            <NuxtLink to="/" :class="$getGroup(group) === 'jkt48' ? 'text-red-500' : 'text-sky-400'" class="text-4xl">
              {{ $getGroupTitle(group) }}
            </NuxtLink> <span class="leading-1">Multi Viewer</span>
          </div>
          <div class="flex gap-3 items-center">
            <div class="flex gap-3 bg-black/5 dark:bg-white/5 px-3 py-2 rounded-md">
              <div>Row</div>
              <input v-model="rowCount" type="number" class="inputRow rounded-md text-center min-w-[50px] bg-black/25" max="8" min="1" placeholder="Row Count">
            </div>
            <button type="button" class="w-6 h-6" @click="() => videosMap.clear()">
              <Icon name="mingcute:broom-fill" class="w-full h-full" />
            </button>
          </div>
        </nav>
        <div class="fixed bottom-4 right-4 md:bottom-8 md:right-10 xl:bottom-10 xl:right-12 z-aboveNav">
          <MultiLiveContainer :selected="videosMap" @select="add" />
        </div>
        <div v-if="videos.length" clss="flex-1">
          <div class="grid flex-1" :style="{ gridTemplateColumns: `repeat(${rowCount || 4}, minmax(0, 1fr))` }">
            <MultiVideo
              v-for="[idx, video] in videos.entries()"
              :key="video.id"
              :index="idx"
              :videos-length="videos.length"
              :video="video"
              @delete="add(video)"
              @move-next="() => moveNext(idx)"
              @move-previous="() => movePrevious(idx)"
            />
          </div>
        </div>
        <div v-else class="flex flex-1 justify-center items-center text-2xl font-semibold text-center px-3">
          Tambah videonya di kanan bawah!
        </div>

        <footer class="text-center py-20">
          <div class="opacity-50 text-sm">
            Created by <NuxtLink to="https://twitter.com/crstlnz" target="_blank" class="">
              @crstlnz
            </NuxtLink>
          </div>
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
