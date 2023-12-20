<script setup lang="ts">
const props = defineProps<{
  video: Multi.Video
  index: number
  videosLength: number
}>()
defineEmits<{ (e: 'moveNext'): void, (e: 'movePrevious'): void, (e: 'delete'): void }>()

const videoElement = ref()

const sourceURLs = computed(() => {
  if (!props.video.stream_url) return []
  return [
    {
      is_default: true,
      url: props.video.stream_url,
      type: 'hls',
      id: 1,
      label: 'Default',
      quality: 1,
    },
  ]
})

function refresh() {
  if (videoElement.value) {
    videoElement.value.reload()
  }
}
</script>

<template>
  <div class="flex gap-3 items-center flex-col mb-5">
    <div class="overflow-hidden flex-1 h-0 bg-black/50 self-stretch flex items-center">
      <div class="w-full">
        <LazyWatchVideo ref="videoElement" :key="video.id" poster="" :sources="sourceURLs" class="flex-1 w-full object-fill" :use-shortcut="false" :use-default-control="true" />
      </div>
    </div>
    <div class="p-3 flex gap-3 w-[85%] bg-white border border-black/10 drop-shadow-sm dark:border-white/10 dark:bg-black/20 rounded-full">
      <button :disabled="index === 0" type="button" class="bg-black/10 dark:bg-white/5 w-7 h-7 rounded-full disabled:opacity-40 disabled:cursor-not-allowed" @click="$emit('movePrevious')">
        <Icon name="material-symbols:arrow-left" size="1.5rem" />
      </button>
      <div class="flex-1 flex items-center">
        <div class="flex-1 w-0 truncate text-sm">
          {{ video.name }}
        </div>
      </div>
      <button type="button" class="bg-blue-500 text-white w-7 h-7 flex justify-center items-center rounded-md text-sm" @click="refresh()">
        <Icon name="material-symbols:refresh-rounded" class="w-full h-full p-1" />
      </button>
      <NuxtLink :to="video.original_url" target="_blank" :external="true" no-prefetch type="button" class="bg-blue-500 flex items-center w-7 h-7 justify-center  text-white rounded-md text-sm">
        <Icon name="octicon:link-external-16" class="w-full h-full p-1.5" />
      </NuxtLink>
      <button type="button" class="bg-red-500 text-white w-7 h-7 flex justify-center items-center rounded-md text-sm" @click="$emit('delete')">
        <Icon name="heroicons:trash" class="w-full h-full p-1.5" />
      </button>
      <button :disabled="index === videosLength - 1" type="button" class="bg-black/10 dark:bg-white/5 w-7 h-7 rounded-full disabled:opacity-40 disabled:cursor-not-allowed" @click="$emit('moveNext')">
        <Icon name="material-symbols:arrow-right" size="1.5rem" />
      </button>
    </div>
  </div>
</template>
