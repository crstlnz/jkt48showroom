<script setup lang="ts">
import { useSettings } from '~/store/settings'

withDefaults(defineProps<{
  showSocials?: boolean
}>(), {
  showSocials: true,
})
const { version } = useSettings()
const config = useRuntimeConfig()
</script>

<template>
  <div class="flex flex-col items-center text-slate-100/50">
    <div v-if="showSocials" class="inline-flex gap-2">
      <NuxtLink
        v-social-click="'linktree'"
        to="https://linktr.ee/crstlnz"
        aria-label="Linktree"
        target="_blank"
        :external="true"
        class="rounded-md transition-colors duration-300 size-7 hover:bg-black/5 dark:hover:bg-white/5 flex items-center"
      >
        <Icon name="simple-icons:linktree" class="w-full h-full p-1.5" />
      </NuxtLink>
      <NuxtLink
        v-social-click="'twitter'"
        to="https://twitter.com/crstlnz"
        aria-label="@Crstlnz"
        target="_blank"
        :external="true"
        class="rounded-md transition-colors duration-300 size-7 hover:bg-black/5 dark:hover:bg-white/5 flex items-center"
      >
        <Icon name="ri:twitter-x-line" class="w-full h-full p-1.5" />
      </NuxtLink>
      <NuxtLink
        v-social-click="'github'"
        to="https://github.com/crstlnz/jkt48showroom"
        aria-label="Github Repository"
        target="_blank"
        :external="true"
        class="rounded-md transition-colors duration-300 size-7 hover:bg-black/5 dark:hover:bg-white/5 flex items-center"
      >
        <Icon name="ri:github-fill" class="w-full h-full p-1" />
      </NuxtLink>
    </div>
    <div class="text-[10px] md:text-[11px] px-2 font-bold mt-1 flex items-center gap-2">
      <span>v{{ version }}{{ config.public.isDev ? '-dev' : '' }}</span>
      <span class="bg-slate-100/50 size-1 rounded-full" />
      <NuxtLink to="https://twitter.com/crstlnz" target="_blank" class="">
        @crstlnz
      </NuxtLink>
    </div>
  </div>
</template>
