<script lang="ts" setup>
defineProps<{ icon: string; activeIcon: string; title: string; url: string; activeClass?: string; active: boolean; compact?: boolean }>()
</script>

<template>
  <NuxtLink :to="url" class="group w-full select-none" :active-class="activeClass ?? ''">
    <div class="inline-flex items-center overflow-hidden rounded-full p-3 font-thin transition-[background-color] group-hover:bg-hover">
      <div class="h-7 w-7">
        <Icon :name="!active ? icon : activeIcon" size="28px" class="h-full w-full" />
      </div>
      <div v-if="!compact" class="ml-5 mr-4 text-xl leading-7" :class="{ 'font-bold': active }">
        {{ title }}
      </div>
    </div>
  </NuxtLink>
</template>
