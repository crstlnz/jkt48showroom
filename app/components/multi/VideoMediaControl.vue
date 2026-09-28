<script lang="ts" setup>
import type { MultiVideo } from '#components'
import { Slider } from '#components'
import { useMultiVolume } from '~/store/multiVolume'

const props = defineProps<{
  player: InstanceType<typeof MultiVideo>
}>()

const multiVolume = useMultiVolume()

function toggleMute() {
  multiVolume.setPlayerMuted(
    props.player.id,
    !multiVolume.getPlayerMuted(props.player.id),
    props.player,
  )
}

const volume = ref(multiVolume.getPlayerVolume(props.player.id))
const isMuted = computed(() => multiVolume.getPlayerMuted(props.player.id))

watch(() => multiVolume.getPlayerVolume(props.player.id), (vol) => {
  volume.value = vol
})

function onVolumeChange(val: string | number) {
  const n = Number(val)
  multiVolume.setPlayerVolume(props.player.id, n, props.player)
}
</script>

<template>
  <div class="flex gap-3 items-center">
    <Image v-if="player.data.image" :src="player.data.image" alt="" class="w-14 md:w-16 aspect-square object-cover rounded-lg bg-container-2" />
    <DummyProfilePicture v-else :name="player.data.name" class="w-14 md:w-16 aspect-square rounded-lg" />
    <div class="flex-1 w-0">
      <div>
        <div class="truncate text-sm md:text-base">
          {{ player.data.name }}
        </div>
      </div>
      <div class="flex flex-col md:flex-row md:gap-3">
        <div class="flex items-center mt-0.5">
          <button v-ripple type="button" class="w-7 h-7 md:h-7 md:w-7 flex hover:bg-hover-2 rounded-full p-1" @click="player.video?.togglePlay()">
            <Icon v-if="!player.video?.isPlaying" name="ic:round-play-arrow" class="h-full w-full" />
            <Icon v-else name="ic:round-pause" class="h-full w-full" />
          </button>

          <button v-ripple type="button" class="w-7 h-7 md:h-7 md:w-7 flex hover:bg-hover-2 rounded-full p-1" @click="player.refresh()">
            <Icon name="ic:round-refresh" class="h-full w-full p-px" />
          </button>

          <button v-ripple type="button" class="w-7 h-7 md:h-7 md:w-7 flex hover:bg-hover-2 rounded-full p-1" @click="player.video?.syncLive()">
            <Icon name="ic:round-fast-forward" class="h-full w-full p-px" />
          </button>

          <button v-ripple type="button" class="w-7 h-7 md:h-7 md:w-7 flex hover:bg-hover-2 rounded-full p-1" @click="toggleMute">
            <Icon v-if="!isMuted" name="ic:round-volume-up" class="h-full w-full p-px" />
            <Icon v-else name="ic:round-volume-off" class="h-full w-full p-px" />
          </button>
        </div>
        <div class="flex gap-3 flex-1">
          <Slider v-model="volume" class="w-full flex-1" :min="0" :max="1" :step="0.01" @update:model-value="onVolumeChange" />
          <button v-ripple type="button" class="w-7 h-7 md:h-7 md:w-7 flex hover:bg-red-500/20 rounded-full p-1 text-red-500" @click="player.remove">
            <Icon name="ic:baseline-delete" class="h-full w-full p-px" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
