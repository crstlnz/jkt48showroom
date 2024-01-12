<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import { Slider } from '#components'
import type { MultiVideo } from '#components'

const props = defineProps<{
  videoPlayers: Map<string, InstanceType<typeof MultiVideo>>
}>()

const videoPlayers = computed(() => {
  return [...props.videoPlayers.values()]
})

const isOpen = ref(false)

function closeModal() {
  isOpen.value = false
}
function openModal() {
  isOpen.value = true
}

// const isAllMuted = computed(() => {
//   return videoPlayers.value.some((v) => {
//     return v.video?.checkMute()
//   })
// })

function playAll() {
  for (const player of videoPlayers.value) {
    player.video?.play()
  }
}

function pauseAll() {
  for (const player of videoPlayers.value) {
    player.video?.pause()
  }
}

function reloadAll() {
  for (const player of videoPlayers.value) {
    player.video?.reload()
  }
}

function muteAll() {
  for (const player of videoPlayers.value) {
    player.video?.mute()
  }
}

function unmuteAll() {
  for (const player of videoPlayers.value) {
    player.video?.unmute()
  }
}

const allVolume = ref(0)
const useAllVolume = ref(false)
// const TO = ref<NodeJS.Timeout | null>()

function syncLive() {
  for (const player of videoPlayers.value) {
    player.video?.syncLive()
  }
}

const autoRemove = useLocalStorage('auto_remove_player', () => true)
const centerVideos = useLocalStorage('center_videos', () => false)
const showVideoControl = useLocalStorage('show_video_control', () => true)

function onVolumeChange(vol: number | undefined) {
  console.log(vol)
}

const isAllVolumeSame = computed(() => {
  return videoPlayers.value.every(a => a.video?.volume === videoPlayers.value[0]?.video?.volume)
})
defineExpose({ open: openModal })

const slider = ref<InstanceType<typeof Slider>>()

const { start } = useTimeoutFn(() => {
  if (!isAllVolumeSame.value) {
    slider.value?.silentUpdate(0)
  }
}, 50)

watch(isAllVolumeSame, () => {
  nextTick(() => {
    start()
  })
})

watch(allVolume, (volume) => {
  // if (TO.value) clearTimeout(TO.value)
  // TO.value = setTimeout(() => {
  for (const player of videoPlayers.value) {
    player.video?.setVolume(volume)
  }
  // }, 50)
})

onMounted(() => {
  if (slider.value?.slider) {
    useEventListener(slider.value.slider, 'change', () => {
      console.log('okeeey')
    })
  }
})
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-notification" @close="closeModal">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/40" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto w-screen">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <TransitionChild
            as="template"
            enter="duration-100 ease-out"
            enter-from="opacity-0 scale-75"
            enter-to="opacity-100 scale-100"
            leave="duration-100 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-75"
          >
            <DialogPanel
              class="w-full max-w-lg transform overflow-hidden rounded-2xl bg-container p-6 text-left align-middle shadow-xl transition-all max-h-[90vh] flex flex-col"
            >
              <DialogTitle
                as="h3"
                class="text-lg md:text-xl font-medium leading-6"
              >
                {{ $t('media_controls') }}
              </DialogTitle>
              <div class="mt-2 flex-1 flex flex-col h-0">
                <div v-if="!videoPlayers.length" class="text-base text-gray-400">
                  {{ $t('no_video_player') }}
                </div>
                <div v-else class="flex flex-col flex-1 h-0">
                  <div class="flex-col max-md:items-stretch md:flex-row border-b-2 border-black/10 dark:border-white/10 py-2 md:px-4 md:py-2.5 flex items-center md:gap-4 justify-between">
                    <div class="flex items-center max-md:justify-around">
                      <button v-ripple type="button" class="flex w-8 h-8 md:w-9 md:h-9 hover:bg-hover-2 rounded-full p-1" @click="playAll">
                        <Icon name="ic:round-play-arrow" class="h-full w-full" />
                      </button>
                      <button v-ripple type="button" class="flex w-8 h-8 md:w-9 md:h-9 hover:bg-hover-2 rounded-full p-1" @click="pauseAll">
                        <Icon name="ic:round-pause" class="h-full w-full" />
                      </button>
                      <button v-ripple type="button" class="flex w-8 h-8 md:w-9 md:h-9 hover:bg-hover-2 rounded-full p-1" @click="syncLive">
                        <Icon name="ic:round-fast-forward" class="h-full w-full" />
                      </button>
                      <button v-ripple type="button" class="flex w-8 h-8 md:w-9 md:h-9 hover:bg-hover-2 rounded-full p-1" @click="reloadAll">
                        <Icon name="ic:round-refresh" class="h-full w-full p-[1px]" />
                      </button>
                      <button v-ripple type="button" class="flex w-8 h-8 md:w-9 md:h-9 hover:bg-hover-2 rounded-full p-1" @click="unmuteAll">
                        <Icon name="ic:round-volume-up" class="h-full w-full p-[1px]" />
                      </button>
                      <button v-ripple type="button" class="flex w-8 h-8 md:w-9 md:h-9 hover:bg-hover-2 rounded-full p-1" @click="muteAll">
                        <Icon name="ic:round-volume-off" class="h-full w-full p-[1px]" />
                      </button>
                    </div>
                    <Slider ref="slider" v-model="allVolume" :hide-slider-value="useAllVolume" class="w-full md:w-[200px]" :min="0" :max="1" :step="0.01" />
                  </div>
                  <div class="overflow-y-auto items-stretch flex-1">
                    <MultiVideoMediaControl v-for="[idx, player] in videoPlayers.entries()" :key="idx" :player="player" class="border-b-2 border-black/10 dark:border-white/10 py-2 md:px-4 md:py-2.5" />
                  </div>
                </div>
              </div>
              <button type="button" class="flex items-center gap-2.5 text-xs text-left md:text-sm opacity-80 font-light mt-3" @click="centerVideos = !centerVideos">
                <input v-model="centerVideos" type="checkbox" class="cursor-pointer">
                <div>{{ $t("multi.center") }}</div>
              </button>
              <button type="button" class="flex items-center gap-2.5 text-xs text-left md:text-sm opacity-80 font-light mt-2" @click="showVideoControl = !showVideoControl">
                <input v-model="showVideoControl" type="checkbox" class="cursor-pointer">
                <div>{{ $t("multi.showvideocontrol") }}</div>
              </button>
              <button type="button" class="flex items-center gap-2.5 text-xs text-left md:text-sm opacity-80 font-light mt-1" @click="autoRemove = !autoRemove">
                <input v-model="autoRemove" type="checkbox" class="cursor-pointer">
                <div>{{ $t("multi.auto_remove") }}</div>
              </button>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
