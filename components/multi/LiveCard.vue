<script lang="ts" setup>
defineProps<{
  live: Omit<Multi.Video, 'order'>
  selected: boolean
}>()

defineEmits<{ (e: 'liveClick', video: Omit<Multi.Video, 'order'>): void }>()
</script>

<template>
  <div class="group flex gap-3 px-4 py-3 items-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5">
    <NuxtImg :src="live.image" size="80px" class="aspect-[5/6] rounded-md w-16 md:w-20 object-cover" />
    <div class="w-0 flex-1 truncate flex flex-col justify-start items-start self-start gap-1">
      <NuxtLink :to="live.original_url" :external="true" target="_blank">
        <NuxtImg :src="live.icon" size="64px" class="h-5 object-contain max-w-[90px]" />
      </NuxtLink>
      <div class="flex items-stretch self-stretch">
        <div class="flex-1 w-0 truncate">
          {{ live.name }}
        </div>
      </div>
    </div>
    <button type="button" :class="{ 'bg-blue-500 visible': !selected, 'bg-red-500': selected }" class="self-end px-2 py-0.5 rounded-md text-base text-white" @click="$emit('liveClick', live)">
      {{ selected ? 'Delete' : 'Add' }}
    </button>
  </div>
</template>
