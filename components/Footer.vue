<script setup lang="ts">
const { createEvent } = useGtagCustom()
function click(eventName: string) {
  createEvent(eventName)
}
</script>

<template>
  <div class="inline-flex gap-2">
    <NuxtLink to="https://linktr.ee/crstlnz" aria-label="Linktree" target="_blank" :external="true" class="rounded-md transition-colors duration-300 w-8 h-8 hover:bg-black/5 hover:dark:bg-white/5 flex items-center" @click="() => click(`linktree_click`)">
      <Icon name="simple-icons:linktree" class="w-full h-full p-1.5" />
    </NuxtLink>
    <NuxtLink to="https://twitter.com/crstlnz" aria-label="@Crstlnz" target="_blank" :external="true" class="rounded-md transition-colors duration-300 w-8 h-8 hover:bg-black/5 hover:dark:bg-white/5 flex items-center" @click="() => click(`twitter_click`)">
      <Icon name="ri:twitter-x-line" class="w-full h-full p-1.5" />
    </NuxtLink>
    <NuxtLink to="https://github.com/crstlnz/jkt48showroom" aria-label="Github Repository" target="_blank" :external="true" class="rounded-md transition-colors duration-300 w-8 h-8 hover:bg-black/5 hover:dark:bg-white/5 flex items-center" @click="() => click(`github_click`)">
      <Icon name="ri:github-fill" class="w-full h-full p-1" />
    </NuxtLink>
  </div>
</template>
