<script lang="ts" setup>
import { useSettings } from '~~/store/settings'

const { getBanner } = useAppConfig()
const settings = useSettings()
const banner = getBanner(settings.group)
const index = ref(Math.floor(Math.random() * banner.length))

const { isPending, start, stop } = useTimeoutFn(() => {
  if (index.value + 1 >= banner.length) {
    index.value = 0
  }
  else {
    index.value++
  }
  start()
}, 6000)
</script>

<template>
  <div class="relative aspect-[3/1] overflow-hidden shadow-sm lg:aspect-[4.5/1] bg-container">
    <Transition
      mode="in-out"
      enter-active-class="transition-opacity duration-1000"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="absolute inset-0 transition-opacity duration-1000"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="banner[index]" :key="index" :title="banner[index].title" class="aspect-[3/1] overflow-hidden shadow-sm lg:aspect-[4.5/1] bg-container">
        <a
          aria-label="JKT48 Flying High MV"
          :href="banner[index].url"
          target="_blank"
          class="inline-block h-full w-full transition-all duration-300 hover:brightness-75 focus-visible:brightness-75"
        >
          <NuxtImg
            sizes="500px sm:600px md:900px lg:1000px"
            :modifiers="{
              aspectRatio: 4.5 / 1,
            }"
            :placeholder="[45, 10, 75, 50]"
            densities="x1"
            fit="fill"
            preload
            format="webp"
            :alt="banner[index].title"
            class="w-full h-full object-cover"
            :src="banner[index].img"
          />
        </a>
      </div>
    </Transition>
  </div>
</template>
