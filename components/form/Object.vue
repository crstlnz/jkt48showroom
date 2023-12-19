<script lang="ts" setup>
defineProps<{
  title?: string
  keys: string[]
  data?: any
}>()
</script>

<template>
  <div class="bg-container border-black/10 dark:border-white/10 drop-shadow-md border text-left p-3 md:p-4 rounded-md flex flex-col gap-3">
    <div v-if="title" class="text-sm md:text-base">
      {{ title }}
    </div>
    <div v-for="key in keys" :key="key" class="flex gap-3 items-center text-xs md:text-sm font-light">
      <div class="w-[40px] md:w-[45px] truncate">
        {{ key[0].toUpperCase() + key.slice(1, key.length) }}
      </div>
      <input :id="key" type="text" :name="key" :value="data?.[key]" class="bg-container-2 px-2.5 py-0.5 md:py-1 rounded-md outline-none">
    </div>
    <button type="button" class="px-2 md:px-3 py-0.5 md:py-1 bg-blue-500 self-end rounded-md text-xs md:text-sm">
      {{ data ? 'Save' : 'Add' }}
    </button>
  </div>
</template>
