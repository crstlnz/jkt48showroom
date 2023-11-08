<script lang="ts" setup>
import { useSettings } from '~~/store/settings'
import { LazyImage } from '#components'

const { getBanner } = useAppConfig()
const settings = useSettings()
const banner = getBanner(settings.group)
</script>

<template>
  <div :title="banner.title" class="aspect-[3/1] overflow-hidden shadow-sm lg:aspect-[4.5/1]">
    <a
      aria-label="JKT48 Flying High MV"
      :href="banner.url"
      target="_blank"
      class="inline-block h-full w-full transition-all duration-300 hover:brightness-75 focus-visible:brightness-75"
    >
      <NuxtImg
        sizes="500px md:800px xl:1000px"
        :modifiers="{
          aspectRatio: 4.5 / 1,

        }"
        placeholder
        fit="fill"
        format="webp"
        :alt="banner.title"
        class="h-full w-full object-cover"
        :src="banner.img"
      /></a>
  </div>
</template>
