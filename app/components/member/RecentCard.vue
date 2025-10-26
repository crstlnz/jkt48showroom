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
const showDetailedDate = computed(() => {
  const oneMonthAgo = new Date()
  oneMonthAgo.setDate(0)
  return new Date(props.recent.live_info?.date?.start) > oneMonthAgo
})
const { locale } = useI18n()
const finishLoading = ref(false)
const showLoading = ref(true)
const thumbnail = ref()
const { isOutside } = useMouseInElement(thumbnail)
const isAlreadyFetch = ref(false)
const screenshots = ref<string[]>([])
const ssIndex = ref<number | null>(null)

const { start, stop } = useTimeoutFn(async () => {
  let nextIndex = (ssIndex.value ?? 0) + 1
  if (nextIndex > screenshots.value.length - 1) {
    nextIndex = 0
  }
  await preloadImage(screenshots.value[nextIndex]!)
  ssIndex.value = nextIndex
  start()
}, 1600, { immediate: false })

const scrolled = ref(false)

const isHovered = computed(() => {
  return !isOutside.value
})

const delayShowSS = ref<NodeJS.Timeout | null>(null)

watch(isHovered, (hover) => {
  showLoading.value = !isAlreadyFetch.value
  if (delayShowSS.value) clearTimeout(delayShowSS.value)
  if (hover) {
    scrolled.value = false
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
    ssIndex.value = null
    stopScreenshotSlide()
  }
})

async function startScreenshotSlide() {
  await preloadImage(screenshots.value[0]!)
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
      const data = await $apiFetch<Database.IScreenshot>(`/api/screenshots/${props.recent.data_id}`)
      screenshots.value = data.list.map((id) => {
        return `${cloudinaryURL}/${data.folder}/${id}.${data.format}`
      })
      startScreenshotSlide()
    }
    catch {
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
  <div class="bg-container rounded-xl p-3 shadow-2xs md:p-4 relative">
    <div class="flex gap-3 md:gap-4">
      <div
        ref="thumbnail"
        class="group relative flex aspect-video t border border-black/10 h-20 items-center justify-center gap-0.5 overflow-hidden rounded-xl font-bold text-white drop-shadow-xs sm:h-24 md:h-28 lg:h-32 xl:h-36"
      >
        <NuxtImg :src="recent.type === 'showroom' ? $showroomIcon : $idnLiveIcon" size="64px" :alt="recent.type === 'showroom' ? 'Showroom Logo' : 'IDN Logo'" class="h-3 md:h-4 xl:h-5 object-contain max-w-[90px] absolute z-10 left-2 bottom-1 md:bottom-1.5 xl:bottom-2 md:left-2.5 xl:left-3" />
        <div v-if="isHovered" :class="{ 'recentcardprogress': !finishLoading, 'progressfinish w-full': showLoading && finishLoading }" class="absolute left-0 top-0 z-10 h-1 bg-blue-500/70" />
        <Transition name="screenshot-slide" mode="in-out">
          <img v-if="ss" :key="ss" :src="ss" alt="Screenshot's" class="absolute z-10 w-full h-full object-cover">
        </Transition>
        <NuxtImg
          :key="recent.room_id"
          loading="lazy"
          fit="fill"
          format="webp"
          sizes="144px sm:172px md:200px lg:228px xl:256px"
          :placeholder="[32, 18, 75, 100]"
          :modifiers="{
            aspectRatio: 16 / 9,
          }"
          class="relative h-full w-full cursor-pointer bg-slate-200 object-cover text-xs transition-all duration-200 dark:bg-dark-3 md:text-sm lg:text-base"
          :alt="`${recent.member?.name}Display Picture`"
          :src="recent.member?.img ?? recent.member.img_alt ?? $errorPicture"
        />
      </div>
      <div class="flex min-w-0 flex-1 flex-col space-y-0.5 sm:space-y-1 md:space-y-2">
        <div class="truncate">
          <NuxtLink :to="`/member/${recent.member.url}`" :aria-label="`Open ${recent.member.name} profile`" class="text-base font-bold md:text-lg lg:text-xl">
            {{ (recent.member?.nickname || recent.member?.name)?.split("-")?.[0] }}
          </NuxtLink>
        </div>
        <ul class="space-y-1 text-xs md:text-sm lg:text-base [&>li]:flex [&>li]:gap-2">
          <li class="flex items-center">
            <Icon name="bx:bxs-gift" class="h-4 p-[3px] w-auto rounded-full bg-amber-500 md:p-1 text-white lg:h-6" />
            <ParserGift parse-type="gift" :rate="recent.gift_rate" :value="recent.points" class="inline-block align-baseline" />
          </li>
          <li v-if="recent.live_info?.viewers != null" class="flex items-center">
            <Icon :name="recent.live_info?.viewers?.is_excitement ? 'ic:round-star' : 'mingcute:user-2-fill'" class="h-4 p-[3px] w-auto rounded-full bg-blue-500 md:p-1 text-white lg:h-6" />
            <div class="truncate">
              {{ recent.live_info?.viewers?.num ? `${$n(recent.live_info?.viewers?.num ?? 0)} ${$t(recent.live_info?.viewers?.is_excitement ? "excitement_points" : "viewer", recent.live_info?.viewers?.num ?? 0)}` : $t('data.nodata') }}
            </div>
          </li>
          <li class="flex items-center">
            <Icon name="ph:clock-countdown-bold" class="h-4 p-[3px] w-auto rounded-full bg-red-500 md:p-1 text-white lg:h-6" />
            <Parser parse-type="duration" :value="recent.live_info.duration" :second="false" class="inline-block align-baseline" />
          </li>
        </ul>
      </div>
    </div>

    <div class="mt-2 flex justify-between gap-5 text-xs sm:text-sm md:mt-2.5 xl:text-base">
      <div class="group flex w-0 flex-1 cursor-pointer items-center gap-1.5">
        <Icon name="ph:clock-bold" />
        <div v-if="showDetailedDate">
          <div :key="recent.data_id" class="group-hover:hidden">
            {{ $dayjs(recent.live_info?.date?.end).locale(locale).fromNow() }}
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
