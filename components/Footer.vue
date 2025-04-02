<script setup lang="ts">
import { useSettings } from '~/store/settings'

const { version } = useSettings()
</script>

<template>
  <div class="flex flex-col items-center">
    <div class="inline-flex gap-2">
      <NuxtLink
        v-social-click="'linktree'"
        to="https://linktr.ee/crstlnz"
        aria-label="Linktree"
        target="_blank"
        :external="true"
        class="rounded-md transition-colors duration-300 w-8 h-8 hover:bg-black/5 dark:hover:bg-white/5 flex items-center"
      >
        <Icon name="simple-icons:linktree" class="w-full h-full p-1.5" />
      </NuxtLink>
      <NuxtLink
        v-social-click="'twitter'"
        to="https://twitter.com/crstlnz"
        aria-label="@Crstlnz"
        target="_blank"
        :external="true"
        class="rounded-md transition-colors duration-300 w-8 h-8 hover:bg-black/5 dark:hover:bg-white/5 flex items-center"
      >
        <Icon name="ri:twitter-x-line" class="w-full h-full p-1.5" />
      </NuxtLink>
      <NuxtLink
        v-social-click="'github'"
        to="https://github.com/crstlnz/jkt48showroom"
        aria-label="Github Repository"
        target="_blank"
        :external="true"
        class="rounded-md transition-colors duration-300 w-8 h-8 hover:bg-black/5 dark:hover:bg-white/5 flex items-center"
      >
        <Icon name="ri:github-fill" class="w-full h-full p-1" />
      </NuxtLink>
    </div>
    <div class="text-[10px] px-2 font-bold mt-1">
      Version : {{ version }}
    </div>
  </div>
</template>
