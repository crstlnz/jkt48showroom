<script setup lang="ts">
import BlazeSlider from 'blaze-slider'
import 'blaze-slider/dist/blaze.css'
// import PhotoSwipeLightbox from 'photoswipe/lightbox';
// import 'photoswipe/style.css';

const props = defineProps<{
  screenshots: Live.Screenshots
}>()

// const lightBox = ref<PhotoSwipeLightbox | null>(null)
// onMounted(() => {
//   if (!lightBox.value) {
//     lightBox.value = new PhotoSwipeLightbox({
//       gallery: '#screenshots',
//       children: 'a',
//       pswpModule: () => import('photoswipe'),
//     });
//     lightBox.value.init();
//   }
// })

// onUnmounted(() => {
//   if (lightBox.value) {
//     lightBox.value.destroy();
//     lightBox.value = null;
//   }
// })

const slider = ref()
const slideImgs = ref<HTMLElement[]>([])
const blaze = ref<BlazeSlider>()
const { cloudinaryURL } = useAppConfig()
const screenshotList = ref<{ id: number, width?: number, height?: number }[]>(props.screenshots.list.map(i => ({ id: i })))
const screenshots = computed(() => {
  return screenshotList.value.map((i) => {
    return {
      url: `${cloudinaryURL}/${props.screenshots.folder}/${i.id}.${props.screenshots.format}`,
      width: i.width ?? 400,
      height: i.height ?? 800,
    }
  })
})

function loadImage(img: HTMLImageElement) {
  if (img && !img.src && img.getAttribute('data-lazy') !== 'installed') {
    img.setAttribute('data-lazy', 'installed')
    img.classList.add('isLoading')
    const _src = img.getAttribute('data-src')
    const _img = new Image()
    _img.onload = () => {
      // const idx =  screenshots.value.findIndex((i)=>  i.url === _src)
      // const ss = [...screenshotList.value]
      // ss[idx] = {...ss[idx], height : _img.height, width : _img.width }
      // screenshotList.value = [...ss]
      img.src = _src || ''
      img.classList.add('isLoaded')
      img.classList.remove('isLoading')
    }
    _img.src = _src || ''
  }
}

let unsubscribe: () => boolean | null
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

  const imgs = slideImgs.value?.map(i => i.querySelector('img')) as HTMLImageElement[]
  for (let i = 0; i < blaze.value.config.slidesToShow; i++) {
    const imgEl = imgs?.[i]
    if (imgEl) loadImage(imgEl)
  }

  unsubscribe = blaze.value.onSlide(
    (_, firstVisibleSlideIndex, lastVisibleSlideIndex) => {
      const imgs = slideImgs.value?.map(i => i.querySelector('img')) as HTMLImageElement[]
      for (let i = firstVisibleSlideIndex; i <= lastVisibleSlideIndex; i++) {
        const img = imgs?.[i]
        if (img) {
          loadImage(img)
        }
      }
    },
  )
})

onBeforeUnmount(() => {
  blaze.value?.destroy()
  if (unsubscribe) unsubscribe()
})
</script>

<template>
  <div ref="slider" class="blaze-slider relative">
    <div v-if="screenshots.length > 3" class="blaze-container">
      <div class="blaze-track-container rounded-xl overflow-hidden">
        <div id="screenshots" class="blaze-track">
          <!-- <a v-for="ss in screenshots" ref="slideImgs" :key="ss.url" :href="ss.url" target="_blank"
            class="relative bg-container rounded-xl overflow-hidden md:h-80 aspect-[5/6.5]" :data-pswp-width="ss.width"
            :data-pswp-height="ss.height">
            <img :data-src="ss.url" class="lazyLoad object-cover size-full absolute inset-0 outline-hidden! ring-0!">
          </a> -->
          <div
            v-for="ss in screenshots" ref="slideImgs" :key="ss.url"
            class="relative bg-container rounded-xl overflow-hidden md:h-80 aspect-[5/6.5]" :data-pswp-width="ss.width"
            :data-pswp-height="ss.height"
          >
            <img :data-src="ss.url" class="lazyLoad object-cover size-full absolute inset-0 outline-hidden! ring-0!">
          </div>
        </div>
      </div>

      <!-- navigation buttons -->
      <button
        class="blaze-prev absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-500/40 rounded-full dark:text-white/80 text-black/80"
      >
        <Icon name="material-symbols:arrow-left" class="w-full h-full" />
      </button>
      <button
        class="blaze-next absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-500/40 rounded-full dark:text-white/80 text-black/80"
      >
        <Icon name="material-symbols:arrow-right" class="w-full h-full" />
      </button>
    </div>
    <div v-else id="screenshots" class="md:h-80 grid max-[240px]:grid-cols-2 min-[240px]:grid-cols-3 gap-2.5 md:gap-4">
      <!-- <a v-for="ss in screenshots" :key="ss.url" :href="ss.url" target="_blank" :data-pswp-width="ss.width"
      :data-pswp-height="ss.height">
        <img :src="ss.url" class="md:h-80 bg-container rounded-xl object-cover aspect-[5/6.5]">
      </a> -->
      <img v-for="ss in screenshots" :key="ss.url" :src="ss.url" class="md:h-80 bg-container rounded-xl object-cover aspect-[5/6.5]">
    </div>
  </div>
</template>

<style lang="scss">
.blaze-slider {
  --slide-gap: 16px;
  --slides-to-show: 3;
}

@media (max-width: 768px) {
  .blaze-slider {
    --slide-gap: 10px;
  }
}

@media (max-width: 240px) {
  .blaze-slider {
    --slides-to-show: 2;
  }
}
</style>
