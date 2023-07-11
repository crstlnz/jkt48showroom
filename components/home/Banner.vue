<script lang="ts" setup>
import { useSettings } from '~~/store/settings'

const { getBanner } = useAppConfig()
const settings = useSettings()
const banner = getBanner(settings.group)
</script>

<template>
  <div title="New JKT48 Original Single">
    <a
      aria-label="JKT48 Flying High MV"
      :href="banner.url"
      target="_blank"
      class="inline-block h-full w-full transition-all duration-300 hover:brightness-75 focus-visible:brightness-75"
    >
      <img
        alt="JKT48 Flying High"
        class="h-full w-full object-cover"
        :src="banner.img"
      >
    </a>
  </div>
</template>
