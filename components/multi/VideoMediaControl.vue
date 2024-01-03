<script lang="ts" setup>
import { Slider } from '#components'
import type { MultiVideo } from '#components'

const props = defineProps<{
  player: InstanceType<typeof MultiVideo>
}>()

function toggleMute() {
  if (props.player.video?.isMuted) {
    props.player.video?.unmute()
  }
  else {
    props.player.video?.mute()
  }
}

const volume = ref(props.player.video?.volume || 1)

watch(() => props.player.video?.volume, (vol) => {
  volume.value = vol || 0
})

const slider = ref<InstanceType<typeof Slider>>()
onMounted(() => {
  if (slider.value) {
    slider.value.slider?.addEventListener('input', (evt) => {
      props.player.video?.setVolume((evt.target as HTMLInputElement).value)
    })
  }
})
</script>

<template>
  <div class="flex gap-3 md:gap-4 items-end">
    <img :src="player.data.image" class="w-16 aspect-square object-cover rounded-full">
    <div class="flex-1 w-0">
      <div>
        <div class="truncate text-sm md:text-base">
          {{ player.data.name }}
        </div>
      </div>
      <div class="flex flex-col md:flex-row md:gap-3 justify-between">
        <div class="flex items-center mt-0.5">
          <button v-ripple type="button" class="w-7 h-7 md:h-7 md:w-7 flex hover:bg-hover-2 rounded-full p-1" @click="player.video?.togglePlay()">
            <Icon v-if="!player.video?.isPlaying" name="ic:round-play-arrow" class="h-full w-full" />
            <Icon v-else name="ic:round-pause" class="h-full w-full" />
          </button>

          <button v-ripple type="button" class="w-7 h-7 md:h-7 md:w-7 flex hover:bg-hover-2 rounded-full p-1" @click="player.refresh()">
            <Icon name="ic:round-refresh" class="h-full w-full p-[1px]" />
          </button>

          <button v-ripple type="button" class="w-7 h-7 md:h-7 md:w-7 flex hover:bg-hover-2 rounded-full p-1" @click="player.video?.syncLive()">
            <Icon name="ic:round-fast-forward" class="h-full w-full p-[1px]" />
          </button>

          <button v-ripple type="button" class="w-7 h-7 md:h-7 md:w-7 flex hover:bg-hover-2 rounded-full p-1" @click="toggleMute">
            <Icon v-if="!player.video?.isMuted" name="ic:round-volume-up" class="h-full w-full p-[1px]" />
            <Icon v-else name="ic:round-volume-off" class="h-full w-full p-[1px]" />
          </button>
          <button v-ripple type="button" class="w-7 h-7 md:h-7 md:w-7 flex hover:bg-hover-2 rounded-full p-1">
            <Icon name="ic:baseline-delete" class="h-full w-full p-[1px]" />
          </button>
        </div>
        <Slider ref="slider" v-model="volume" class="w-full md:w-[200px] max-w-full" :min="0" :max="1" :step="0.01" />
      </div>
    </div>
  </div>
</template>
