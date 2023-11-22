<script lang="ts" setup>
import { useSettings } from '~~/store/settings'

const settings = useSettings()
const { getIcon } = useAppConfig()
// const { isHydrating } = useNuxtApp()
</script>

<template>
  <ClientOnly>
    <template #fallback>
      <div class="bg-background fixed inset-0 z-notification flex h-[100vh] w-[100vw] items-center justify-center">
        <img class="h-20 w-20" :src="getIcon(settings.group)" alt="Logo">
      </div>
    </template>
    <slot />
  </ClientOnly>
  <!-- <div v-if="!isHydrating" class="bg-background fixed inset-0 z-notification flex h-[100vh] w-[100vw] items-center justify-center">
    <img class="h-20 w-20" :src="getIcon(settings.group)" alt="Logo">
  </div> -->
  <!-- <slot /> -->
</template>
