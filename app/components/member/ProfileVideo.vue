<script lang="ts" setup>
const props = defineProps<{
  url: string
}>()
</script>

<template>
  <div class="mx-3 md:mx-4 bg-container p-3 md:p-4 rounded-xl">
    <div class="flex items-center gap-2 text-lg xl:text-xl font-semibold">
      <Icon name="material-symbols:person-rounded" class="text-blue-500 text-xl xl:text-2xl" />
      <span class="flex-1">Profile Video</span>
    </div>
    <div class="aspect-video mt-2 rounded-xl overflow-hidden">
      <VideoLiteYoutubeEmbed :url="props.url" title="Profile video" />
    </div>
  </div>
</template>
