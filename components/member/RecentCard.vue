<script lang="ts" setup>
const props = withDefaults(defineProps<{
  recent: IRecent
  showDuration?: boolean
}>(), {
  showDuration: false,
  detailedDate: false,
})

const doc = ref<Document>()
const { cloudinaryURL } = useAppConfig()
const dayjs = useDayjs()
const showDetailedDate = computed(() => {
  const oneMonthAgo = new Date()
  oneMonthAgo.setDate(0)
  return new Date(props.recent.live_info?.date?.start) > oneMonthAgo
})
const { locale } = useI18n()
const finishLoading = ref(false)
const showLoading = ref(true)
const thumbnail = ref()
// const isHoveredRaw = useElementHover(thumbnail)
const { isOutside } = useMouseInElement(thumbnail)
const isAlreadyFetch = ref(false)
const screenshots = ref<string[]>([])
const ssIndex = ref<number | null>(null)

const { start, stop } = useTimeoutFn(async () => {
  let nextIndex = (ssIndex.value ?? 0) + 1
  if (nextIndex > screenshots.value.length - 1) {
    nextIndex = 0
  }
  await preloadImage(screenshots.value[0])
  ssIndex.value = nextIndex
  start()
}, 1000, { immediate: false })

const scrolled = ref(false)

// function listenScroll() {
//   scrolled.value = true
//   doc.value?.removeEventListener('scroll', listenScroll)
// }

const isHovered = computed(() => {
  return !isOutside.value
})

const delayShowSS = ref<NodeJS.Timeout | null>(null)

watch(isHovered, (hover) => {
  showLoading.value = !isAlreadyFetch.value
  if (delayShowSS.value) clearTimeout(delayShowSS.value)
  if (hover) {
    scrolled.value = false
    // doc.value?.addEventListener('scroll', listenScroll)
    delayShowSS.value = setTimeout(() => {
      if (isAlreadyFetch.value) {
        startScreenshotSlide()
      }
      else {
        fetchScreenshot()
      }
    }, 300)
  }
  else {
    // doc.value?.removeEventListener('scroll', listenScroll)
    ssIndex.value = null
    stopScreenshotSlide()
  }
})

async function startScreenshotSlide() {
  await preloadImage(screenshots.value[0])
  ssIndex.value = 0
  finishLoading.value = true
  start()
}

function stopScreenshotSlide() {
  ssIndex.value = null
  stop()
}

const ss = computed(() => {
  if (!isHovered.value) return null
  if (ssIndex.value == null) return null
  if (screenshots.value.length <= 0) return null
  return screenshots.value[ssIndex.value]
})

async function fetchScreenshot() {
  if (!isAlreadyFetch.value) {
    isAlreadyFetch.value = true
    try {
      const data = await $fetch('/api/showroom/screenshots', { params: { data_id: props.recent.data_id } })
      screenshots.value = data.list.map((id) => {
        return `${cloudinaryURL}/${data.folder}/${id}.${data.format}`
      })
      startScreenshotSlide()
    }
    catch (e) {
      finishLoading.value = true
    }
  }
}

async function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    if (!src) return resolve()
    const img = new Image()
    img.onload = () => {
      resolve()
    }
    img.onerror = () => {
      resolve()
    }

    img.src = src
  })
}

onMounted(() => {
  doc.value = document
})
</script>

<template>
  <div class="bg-container rounded-xl p-3 shadow-sm md:p-4">
    <div class="flex gap-3 md:gap-4">
      <div
        ref="thumbnail"
        class="group relative flex aspect-video h-20 items-center justify-center gap-0.5 overflow-hidden rounded-xl font-bold text-white drop-shadow-sm sm:h-24 md:h-28 lg:h-32 xl:h-36"
      >
        <div v-if="isHovered" :class="{ 'recentcardprogress': !finishLoading, 'progressfinish w-[100%]': showLoading && finishLoading }" class="absolute left-0 top-0 z-10 h-1 bg-blue-500/70" />
        <img v-if="ss" :src="ss" alt="Screenshot's">
        <NuxtImg
          v-else
          :key="recent.room_id"
          loading="lazy"
          fit="fill"
          format="webp"
          sizes="144px sm:172px md:200px lg:228px xl:256px"
          :placeholder="[32, 18, 75, 100]"
          class="relative h-full w-full cursor-pointer bg-slate-200 object-cover text-xs transition-all duration-200 dark:bg-dark-3 md:text-sm lg:text-base"
          :alt="`${recent.member?.name}Display Picture`"
          :src="recent.member?.img ?? recent.member.img_alt"
        />
      </div>
      <div class="flex min-w-0 flex-1 flex-col space-y-0.5 sm:space-y-1 md:space-y-2">
        <div class="truncate">
          <NuxtLink :to="`/member/${recent.member.url}`" :aria-label="`Open ${recent.member.name} profile`" class="text-base font-bold md:text-lg lg:text-xl">
            {{ recent.member?.nickname || recent.member?.name }}
          </NuxtLink>
        </div>
        <ul class="space-y-1 text-xs md:text-sm lg:text-base [&>li]:flex [&>li]:gap-2">
          <li class="flex items-center">
            <Icon name="bx:bxs-gift" class="h-4 p-[3px] w-auto rounded-full bg-amber-500 md:p-1 text-white lg:h-6" />
            <div class="inline-block align-baseline">
              {{ $currency(recent.points) }}
            </div>
          </li>
          <li v-if="recent.live_info?.viewers != null" class="flex items-center">
            <Icon :name="recent.live_info?.viewers?.is_excitement ? 'ic:round-star' : 'mingcute:user-2-fill'" class="h-4 p-[3px] w-auto rounded-full bg-blue-500 md:p-1 text-white lg:h-6" />
            <div class="truncate">
              {{ recent.live_info?.viewers?.num ? `${$n(recent.live_info?.viewers?.num ?? 0)} ${$t(recent.live_info?.viewers?.is_excitement ? "excitement_points" : "viewer", recent.live_info?.viewers?.num ?? 0)}` : $t('data.nodata') }}
            </div>
          </li>
          <li class="flex items-center">
            <Icon name="ph:clock-countdown-bold" class="h-4 p-[3px] w-auto rounded-full bg-red-500 md:p-1 text-white lg:h-6" />
            <Parser parse-type="duration" :value="recent.live_info.duration" class="inline-block align-baseline" />
          </li>
        </ul>
      </div>
    </div>

    <div class="mt-2 flex justify-between gap-5 text-sm sm:text-base md:mt-2.5 md:text-lg">
      <div class="group flex w-0 flex-1 cursor-pointer items-center gap-1.5">
        <Icon name="ph:clock-bold" />
        <div v-if="showDetailedDate">
          <div :key="recent.data_id" class="group-hover:hidden">
            {{ dayjs(recent.live_info?.date?.end).locale(locale).fromNow() }}
          </div>
          <div class="hidden truncate group-hover:block">
            {{ $d(new Date(props.recent.live_info?.date?.start), 'long') }}
          </div>
        </div>
        <div v-else class="truncate">
          {{ $d(new Date(props.recent.live_info?.date?.start), 'long') }}
        </div>
      </div>
      <NuxtLink :to="`/recent/${recent.data_id}`" class="shrink-0 font-bold">
        Details
      </NuxtLink>
    </div>
  </div>
</template>

<style lang="scss">
.recentcardprogress {
  animation: 3s progress;
}

.progressfinish {
  animation: 0.1s finish forwards;
  animation-delay: 0.3s;
}

@keyframes progress {
  from {width: 0;}
  to {width: 100%;}
}

@keyframes finish {
  from { opacity: 1; }
  to { opacity: 0; }
}
</style>
