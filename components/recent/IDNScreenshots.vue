<script setup lang="ts">
import BlazeSlider from 'blaze-slider'
import 'blaze-slider/dist/blaze.css'

const props = defineProps<{
  screenshots: Live.Screenshots
}>()

const slider = ref()
const blaze = ref<BlazeSlider>()
const { cloudinaryURL } = useAppConfig()
const screenshots = computed(() => {
  return props.screenshots.list.map((i) => {
    return `${cloudinaryURL}/${props.screenshots.folder}/${i}.${props.screenshots.format}`
  })
})

onMounted(() => {
  if (screenshots.value.length <= 3) return
  blaze.value = new BlazeSlider(slider.value, {
    'all': {
      slidesToShow: 3,
      enableAutoplay: true,
      slideGap: '16px',
      stopAutoplayOnInteraction: true,
      autoplayInterval: 3000,
      autoplayDirection: 'to left',
      enablePagination: false,
    },
    '(max-width: 768px)': {
      slideGap: '10px',
    },
    '(max-width: 240px)': {
      slidesToShow: 2,
    },
  })
})

onBeforeUnmount(() => {
  blaze.value?.destroy()
})
</script>

<template>
  <div ref="slider" class="blaze-slider relative">
    <div v-if="screenshots.length > 3" class="blaze-container">
      <div class="blaze-track-container rounded-md overflow-hidden">
        <div class="blaze-track">
          <img v-for="ss in screenshots" :key="ss" :src="ss" class="md:h-80 bg-container rounded-md object-cover aspect-[5/6.5]">
        </div>
      </div>

      <!-- navigation buttons -->
      <button class="blaze-prev absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/60 dark:bg-black/60 rounded-full dark:text-white/80 text-black/80">
        <Icon name="material-symbols:arrow-left" class="w-full h-full" />
      </button>
      <button class="blaze-next absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/60 dark:bg-black/60 rounded-full dark:text-white/80 text-black/80">
        <Icon name="material-symbols:arrow-right" class="w-full h-full" />
      </button>
    </div>
    <div v-else class="md:h-80 grid max-[240px]:grid-cols-2 min-[240px]:grid-cols-3 gap-2.5 md:gap-4">
      <img v-for="ss in screenshots" :key="ss" :src="ss" class="md:h-80 bg-container rounded-md object-cover aspect-[5/6.5]">
    </div>
  </div>
</template>

<style lang="scss">
.blaze-slider {
  --slide-gap : 16px;
  --slides-to-show: 3;
}

@media (max-width: 768px) {
  .blaze-slider {
    --slide-gap : 10px;
  }
}

@media (max-width: 240px) {
  .blaze-slider {
    --slides-to-show: 2;
  }
}
</style>
