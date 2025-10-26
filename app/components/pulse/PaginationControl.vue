<script lang="ts" setup>
defineProps<{
  maxDots?: number
}>()
</script>

<template>
  <div class="flex w-full animate-pulse justify-between gap-2">
    <div v-for="num in ((maxDots ?? 7) + 2)" :key="num" class="pulse-color h-7 w-7 rounded-xl text-center text-xs leading-7 transition-[background-color,border-color] duration-300 sm:h-8 sm:w-8 sm:leading-8" />
  </div>
</template>
