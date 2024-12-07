<script lang="ts" setup>
import { getVideoId } from '~/utils'

const props = defineProps<{
  url: string
}>()

const ytEmbedUrl = computed(() => {
  const id = getVideoId(props.url)
  return `https://www.youtube.com/embed/${id}`
})
</script>

<template>
  <div class="mx-3 md:mx-4 bg-container p-3 md:p-4 rounded-xl">
    <div class="flex items-center gap-2 text-lg xl:text-xl font-semibold">
      <Icon name="material-symbols:person-rounded" class="text-blue-500 text-xl xl:text-2xl" />
      <span class="flex-1">Profile Video</span>
    </div>
    <div class="aspect-video mt-2 rounded-xl overflow-hidden">
      <iframe class="size-full" :src="ytEmbedUrl" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />
    </div>
  </div>
</template>
