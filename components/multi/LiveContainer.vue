<script lang="ts" setup>
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { useIDNLives } from '~/store/idnLives'
import { useOnLives } from '~/store/onLives'
import { useSettings } from '~/store/settings'
import { convertShowroom } from '~/utils/multi'

const props = defineProps<{
  selected: Map<string, Multi.Video>
}>()

const emit = defineEmits<{ (e: 'select', id: Multi.Video): void }>()

function select(video: Omit<Multi.Video, 'order'>) {
  emit('select', {
    ...video,
    order: props.selected.size + 1,
  })
}

const onLives = useOnLives()
const { data, pending } = storeToRefs(onLives)

const idnLives = useIDNLives()
const { data: idnData, pending: idnPending } = storeToRefs(idnLives)

const lives = computed<Omit< Multi.Video, 'order'>[]>(() => {
  const showroomLive = data.value || []
  const idnLives = idnData.value || []
  const result: Omit< Multi.Video, 'order'>[] = []

  for (const live of showroomLive) {
    result.push(convertShowroom(live))
  }

  for (const live of idnLives) {
    result.push(convertIDNLive(live))
  }

  return result
})

const { group } = useSettings()

function forceRefresh() {
  if (group === 'jkt48') {
    idnLives.refresh()
  }
  onLives.refresh()
}
</script>

<template>
  <Popover class="pointer-events-auto absolute bottom-4 right-4 md:bottom-8 md:right-10 xl:bottom-10 xl:right-14">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 translate-x-1 opacity-0"
      enter-to-class="translate-y-0 translate-x-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 translate-x-x opacity-100"
      leave-to-class="translate-y-2 translate-x-1 opacity-0"
    >
      <PopoverPanel class="absolute -bottom-3 flex flex-col -right-3 z-0 rounded-[28px] overflow-hidden bg-white drop-shadow-lg border-black/10 border dark:border-white/10 dark:bg-dark-2 w-[450px] md:min-w-[450px] max-w-[calc(100vw_-_8px)] min-h-[550px] max-h-[85vh]">
        <div class="flex justify-between px-6 py-6 text-lg 2xl:text-xl font-bold">
          <div>
            Daftar Live
          </div>
          <button v-ripple type="button" class="w-8 h-8 hover:bg-black/10 hover:dark:bg-white/5 flex items-center justify-center rounded-full" @click="forceRefresh">
            <Icon name="ic:round-refresh" class="h-full w-full p-1" />
          </button>
        </div>
        <div v-if="pending && idnPending" class="p-10 flex justify-center">
          <Icon name="svg-spinners:ring-resize" size="1.7rem" />
        </div>
        <div v-else-if="lives?.length" class="flex flex-col font-bold pb-16 overflow-y-auto flex-1">
          <MultiLiveCard v-for="live in lives" :key="live.id" :live="live" :selected="selected.has(live.id)" @live-click="select(live)" />
        </div>
        <div v-else class="text-center py-2 flex px-8 text-base font-light">
          Tidak ada live
        </div>
      </PopoverPanel>
    </Transition>
    <PopoverButton aria-label="Setting" class="absolute bottom-0 right-0 rounded-full z-[1000] p-1 w-12 h-12 2xl:w-14 2xl:h-14 bg-red-500 hover:bg-red-600 text-white">
      <Icon name="streamline:live-video-solid" size="2rem" />
    </PopoverButton>
  </Popover>
</template>
