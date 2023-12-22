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

defineExpose({ refresh })
</script>

<template>
  <div class="flex items-center flex-col">
    <div class="overflow-hidden flex-1 h-0 bg-black/50 self-stretch flex items-center">
      <div class="w-full">
        <LazyWatchVideo ref="videoElement" :key="video.id" poster="" :sources="sourceURLs" class="flex-1 w-full object-fill" :use-shortcut="false" :use-default-control="true" />
      </div>
    </div>
    <div class="relative p-1 md:p-2 xl:p-3 gap-1 md:gap-2 xl:gap-3 w-full bg-white border border-black/10 drop-shadow-sm dark:border-white/10 dark:bg-black/20">
      <div class="absolute inset-0 flex justify-between p-1 md:p-2 xl:p-3 pointer-events-none">
        <button :disabled="index === 0" type="button" class="pointer-events-auto bg-black/10 dark:bg-white/5 h-6 w-6 md:w-7 md:h-7 rounded-full disabled:opacity-40 disabled:cursor-not-allowed" @click="$emit('movePrevious')">
          <Icon name="material-symbols:arrow-left" size="1.5rem" />
        </button>
        <button :disabled="index === videosLength - 1" type="button" class="pointer-events-auto bg-black/10 dark:bg-white/5 h-6 w-6 md:w-7 md:h-7 rounded-full disabled:opacity-40 disabled:cursor-not-allowed" @click="$emit('moveNext')">
          <Icon name="material-symbols:arrow-right" size="1.5rem" />
        </button>
      </div>
      <div class="flex gap-1 md:gap-2 w-full flex-col lg:flex-row items-center lg:px-10">
        <div :title="video.name" class="self-stretch lg:flex-1 max-lg:mx-8 flex items-center">
          <div class="flex-1 w-0 truncate text-sm max-md:text-center leading-6 md:leading-7">
            {{ video.name }}
          </div>
        </div>
        <div class="flex gap-1 md:gap-1.5">
          <button type="button" class="bg-blue-500 text-white h-6 w-6 md:w-7 md:h-7 flex justify-center items-center rounded-md text-sm" @click="refresh()">
            <Icon name="material-symbols:refresh-rounded" class="w-full h-full p-1" />
          </button>
          <NuxtLink :to="video.original_url" target="_blank" :external="true" no-prefetch type="button" class="bg-blue-500 flex items-center h-6 w-6 md:w-7 md:h-7 justify-center  text-white rounded-md text-sm">
            <Icon name="octicon:link-external-16" class="w-full h-full p-1.5" />
          </NuxtLink>
          <button type="button" class="bg-red-500 text-white h-6 w-6 md:w-7 md:h-7 flex justify-center items-center rounded-md text-sm" @click="$emit('delete')">
            <Icon name="heroicons:trash" class="w-full h-full p-1.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
