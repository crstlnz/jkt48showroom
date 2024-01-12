<script lang="ts" setup>
defineProps<{ icon: string, activeIcon: string, title: string, url: string, activeClass?: string, active: boolean, localeId: string }>()
</script>

<template>
  <NuxtLink :to="url" class="group w-full select-none" :active-class="activeClass ?? ''" :aria-label="title">
    <div class="inline-flex items-center overflow-hidden rounded-full p-3 transition-[background-color] group-hover:bg-hover">
      <div class="h-7 w-7">
        <SwitchIcon :is-switch="active" :icon="icon" :switch-icon="activeIcon" size="28px" class="h-full w-full" />
      </div>
      <div class="ml-5 mr-4 text-xl leading-7 max-2xl:hidden" :class="{ 'font-black': active }">
        {{ $t(localeId) }}
      </div>
    </div>
  </NuxtLink>
</template>
