<template>
  <div class="inline-flex gap-2">
    <NuxtLink
      v-social-click="'linktree'"
      to="https://linktr.ee/crstlnz"
      aria-label="Linktree"
      target="_blank"
      :external="true"
      class="rounded-md transition-colors duration-300 w-8 h-8 hover:bg-black/5 hover:dark:bg-white/5 flex items-center"
    >
      <Icon name="simple-icons:linktree" class="w-full h-full p-1.5" />
    </NuxtLink>
    <NuxtLink
      v-social-click="'twitter'"
      to="https://twitter.com/crstlnz"
      aria-label="@Crstlnz"
      target="_blank"
      :external="true"
      class="rounded-md transition-colors duration-300 w-8 h-8 hover:bg-black/5 hover:dark:bg-white/5 flex items-center"
    >
      <Icon name="ri:twitter-x-line" class="w-full h-full p-1.5" />
    </NuxtLink>
    <NuxtLink
      v-social-click="'github'"
      to="https://github.com/crstlnz/jkt48showroom"
      aria-label="Github Repository"
      target="_blank"
      :external="true"
      class="rounded-md transition-colors duration-300 w-8 h-8 hover:bg-black/5 hover:dark:bg-white/5 flex items-center"
    >
      <Icon name="ri:github-fill" class="w-full h-full p-1" />
    </NuxtLink>
  </div>
</template>
