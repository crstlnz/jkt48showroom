<script lang="ts" setup>
defineProps<{
  data: SousenkyoMember
}>()
</script>

<template>
  <div class="mx-3 md:mx-4 bg-container p-3 md:p-4 rounded-xl">
    <div class="flex items-center gap-2 text-lg xl:text-xl font-semibold">
      <Icon name="mdi:crown-outline" class="text-yellow-500 text-xl xl:text-2xl" />
      <span class="flex-1">Sousenkyou 2024</span>
      <a href="https://ssk.jkt48.com/2024/id/vote" target="_blank" class="mx-auto text-sm block max-w-[400px] rounded-full bg-linear-to-r from-pink-300 via-purple-300 to-cyan-300 px-3 pb-0.5 pt-0.5 text-center font-bold text-white shadow-lg">Vote</a>
    </div>

    <div class="aspect-video mt-2 rounded-xl overflow-hidden">
      <iframe class="size-full" :src="`https://www.youtube.com/embed/${data.data?.url_video}`" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />
    </div>
  </div>
</template>
