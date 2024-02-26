<script lang="ts" setup>
import { useSettings } from '~~/store/settings'

const { getBanner } = useAppConfig()
const settings = useSettings()
const banner = getBanner(settings.group)
const blurUrl = `${useRuntimeConfig().public.cloudinary}f_webp,q_75,ar_4.5,w_18,h_4,c_fill,e_blur:50/${banner.img}`
const realImg = ref()

function generateIMGUrl(width: number) {
  return `${useRuntimeConfig().public.cloudinary}f_webp,q_80,ar_4.5,w_${width},c_fill/https://res.cloudinary.com/haymzm4wp/image/upload/v1697142302/assets/img/jqs2lvaesnnqi86wyzcg.jpg`
}

function loadBanner() {
  const img = new Image()
  const windowWidth = window.innerWidth
  const width = windowWidth > 1024 ? 1000 : (windowWidth > 768 ? 900 : (windowWidth > 640 ? 768 : 500))
  const imgSrc = generateIMGUrl(width)
  if (realImg.value !== imgSrc) {
    img.onload = () => {
      realImg.value = imgSrc
    }
    img.src = imgSrc
  }
}

onMounted(() => {
  setTimeout(() => {
    loadBanner()
    useEventListener(window, 'resize', () => {
      loadBanner()
    })
  }, 150)
})
</script>

<template>
  <div :title="banner.title" class="aspect-[3/1] overflow-hidden shadow-sm lg:aspect-[4.5/1]">
    <a
      :aria-label="banner.title"
      :href="banner.url"
      target="_blank"
      class="inline-block relative h-full w-full transition-all duration-300 hover:brightness-75 focus-visible:brightness-75"
    >
      <Transition name="fade-abs" mode="in-out">
        <img
          v-if="!realImg"
          key="blur"
          :alt="banner.title"
          class="size-full absolute inset-0 object-cover"
          loading="lazy"
          :src="blurUrl"
        >
        <img
          v-else
          key="banner"
          :alt="banner.title"
          class="size-full absolute inset-0 object-cover"
          loading="lazy"
          :src="realImg"
        >
      </Transition>
    </a>
  </div>
</template>
