<script lang="ts" setup>
defineProps<{
  live: Omit<Multi.Video, 'order'>
  selected: boolean
}>()

defineEmits<{ (e: 'liveClick', video: Omit<Multi.Video, 'order'>): void }>()
</script>

<template>
  <div class="group flex gap-3 px-4 py-3 items-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5">
    <Image :src="live.image" sizes="64px md:80px" class="aspect-5/6 rounded-md w-16 md:w-20 object-cover bg-container" />
    <div class="w-0 flex-1 truncate flex flex-col justify-start items-start self-start gap-1">
      <NuxtLink :to="live.original_url" :external="true" target="_blank">
        <Image :src="live.icon" size="64px" class="h-5 object-contain max-w-22.5" />
      </NuxtLink>
      <div class="flex items-stretch self-stretch">
        <div class="flex-1 w-0 truncate">
          {{ live.name }}
        </div>
      </div>
    </div>
    <button
      v-ripple
      type="button"
      :aria-label="selected ? $t('delete') : $t('add')"
      :title="selected ? $t('delete') : $t('add')"
      class="flex size-8 shrink-0 items-center justify-center rounded-lg border p-1.5 transition-colors md:size-9"
      :class="selected
        ? 'border-red-500/40 bg-red-500/10 text-red-500 hover:bg-red-500/20'
        : 'border-blue-500/40 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'"
      @click="$emit('liveClick', live)"
    >
      <Icon :name="selected ? 'ic:baseline-delete-outline' : 'ic:round-add'" class="size-full" />
    </button>
  </div>
</template>
