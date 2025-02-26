<script lang="ts" setup>
import type { MediaPlayerElement } from 'vidstack/elements'
import 'vidstack/bundle'

const props = withDefaults(
  defineProps<{
    sources: { id: number, label: string, url: string, type: string }[]
    title: string
    poster: string
  }>(),
  {

  },
)

const player = ref<MediaPlayerElement | undefined>()
const firstLoad = ref(true)

onMounted(async () => {
  if (!player.value) return

  player.value.subscribe(({ canPlay }) => {
    if (canPlay && firstLoad.value) {
      firstLoad.value = false
      player.value!.play().catch(() => {
        player.value!.muted = true
        player.value!.play()
      })
    }
  })

  player.value.subscribe(({ error }) => {
    console.log('error code', error?.code)
  })
})
</script>

<template>
  <media-player ref="player" :poster="props.poster" :title="props.title" :src="props.sources[0].url" :auto-play="false" plays-inline>
    <ClientOnly>
      <media-provider />
      <media-video-layout />
    </ClientOnly>
  </media-player>
</template>

<style>
:root {
  --video-border-radius : 0px
}
</style>
