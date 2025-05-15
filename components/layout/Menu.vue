<script lang="ts" setup>
defineProps<{ icon: string, activeIcon: string, title: string, url: string, activeClass?: string, active: boolean, localeId: string }>()
</script>

<template>
  <NuxtLink :to="url" class="group w-full select-none" :active-class="activeClass ?? ''" :aria-label="title">
    <div v-ripple class="inline-flex items-center overflow-hidden rounded-full p-3 transition-[background-color] group-hover:bg-hover" :class="{ 'font-black': active, 'font-extralight': !active }">
      <div class="h-7 w-7">
        <SwitchIcon :is-switch="active" :icon="icon" :switch-icon="activeIcon" size="28px" class="h-full w-full" />
      </div>
      <div class="ml-5 mr-4 text-xl leading-7 max-2xl:hidden">
        {{ $t(localeId) }}
      </div>
    </div>
  </NuxtLink>
</template>
