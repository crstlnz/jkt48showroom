<script lang="ts" setup>
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { useIDNLives } from '~/store/idnLives'
import { useOnLives } from '~/store/onLives'

const props = defineProps<{
  selected: Map<string, Multi.Video>
}>()

const emit = defineEmits<{ (e: 'select', id: Multi.Video): void }>()

const { idnLiveUrl, liveURL, idnLiveIcon, showroomIcon } = useAppConfig()

function selectIDNLives(room: IDNLives) {
  emit('select', {
    id: room.user?.id,
    name: room.user?.name,
    image: room.image,
    landscape: false,
    original_url: idnLiveUrl(room.user?.username, room.slug),
    icon: idnLiveIcon,
    stream_url: room.stream_url,
    order: props.selected.size + 1,
  })
}

function selectShowroom(room: IRoomLive) {
  emit('select', {
    id: String(room.room_id),
    name: room.name,
    image: room.img,
    landscape: true,
    stream_url: room.streaming_url_list.find(i => i.id === 3 || i.id === 4)?.url ?? room.streaming_url_list[0]?.url ?? '',
    original_url: liveURL(room.url),
    icon: showroomIcon,
    order: props.selected.size + 1,
  })
}
const onLives = useOnLives()
const { data, pending, liveCount, hasLives, error } = storeToRefs(onLives)

const idnLives = useIDNLives()
const { data: idnData, pending: idnPending, liveCount: idnCount, hasLives: idnHasLive, error: idnError } = storeToRefs(idnLives)
</script>

<template>
  <Popover class="pointer-events-auto">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 translate-x-1 opacity-0"
      enter-to-class="translate-y-0 translate-x-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 translate-x-x opacity-100"
      leave-to-class="translate-y-2 translate-x-1 opacity-0"
    >
      <PopoverPanel class="absolute -bottom-3 flex flex-col -right-3 z-0 rounded-[28px] overflow-hidden bg-white drop-shadow-lg border-black/10 border dark:border-white/10 dark:bg-dark-2 w-[450px] md:min-w-[450px] max-w-[calc(100vw_-_4px)] min-h-[550px] max-h-[85vh]">
        <div class="flex flex-col px-8 py-6 text-lg 2xl:text-xl font-bold">
          Daftar Live
        </div>
        <div v-if="idnData?.length || data?.length" class="flex flex-col font-bold pb-16 overflow-y-auto flex-1">
          <div v-for="idnRoom in idnData" :key="idnRoom.user?.username" class="group flex gap-3 px-4 py-5 items-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5">
            <NuxtLink :to="$idnLiveUrl(idnRoom.user?.username, idnRoom.slug)" target="_blank" :external="true" no-prefetch>
              <NuxtImg src="https://upload.wikimedia.org/wikipedia/commons/b/ba/IDN_Live.svg" size="64px" class="w-20 h-6 object-cover" />
            </NuxtLink>
            <div class="w-0 flex-1 truncate">
              {{ idnRoom.user?.name }}
            </div>
            <button type="button" :class="{ 'bg-blue-500 md:invisible md:group-hover:visible': !selected.has(String(idnRoom.user?.id)), 'bg-red-500': selected.has(String(idnRoom.user?.id)) }" class="px-2 py-0.5 rounded-md text-base text-white" @click="() => selectIDNLives(idnRoom)">
              {{ selected.has(idnRoom.user?.id) ? 'Delete' : 'Add' }}
            </button>
          </div>
          <div v-for="room in data || []" :key="room.room_id" class="group flex gap-3 px-4 py-5 items-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5" target="_blank" :external="true" no-prefetch>
            <NuxtLink :to="$liveURL(room.url)" target="_blank" :external="true" no-prefetch class="w-20 text-xs text-white bg-black/50 rounded-md h-6 flex items-center justify-center">
              Showroom
            </NuxtLink>
            <div class="w-0 flex-1 truncate">
              {{ room.name }}
            </div>
            <button type="button" :class="{ 'bg-blue-500 md:invisible md:group-hover:visible': !selected.has(String(room.room_id)), 'bg-red-500': selected.has(String(room.room_id)) }" class="shrink-0 px-2 py-0.5 rounded-md text-base text-white" @click="() => selectShowroom(room)">
              {{ selected.has(String(room.room_id)) ? 'Delete' : 'Add' }}
            </button>
          </div>
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
