<script lang="ts" setup>
const props = defineProps<{
  roomId: number
}>()
const fetch = await useRecentFetch({ changeRoute: false, mode: 'infinite' }, {
  sort: 'date',
  page: 1,
  filter: 'all',
  order: -1,
  room_id: props.roomId,
})
const { data: res, pending, error } = fetch.data
const { changePage } = fetch
const isEnded = ref(false)
const dataset = ref<IRecent[]>([])
useInfiniteScroll(
  async () => {
    if (isEnded.value) return
    if (!pending.value) changePage((res.value?.page ?? 1) + 1)
  },
  { distance: 120 },
)

onMounted(() => {
  dataset.value?.push(...(res.value?.recents ?? []))
})

watch(res, (val) => {
  if ((val?.recents.length ?? 0) === 0) return (isEnded.value = true)
  dataset.value?.push(...(val?.recents ?? []))
})

const infiniteScroll = ref<any>()
const el = ref()
const { y } = useScroll(el, { behavior: 'smooth' })
// const { y } = useWindowScroll()
const isTop = ref(true)

watch(y, () => {
  requestAnimationFrame(() => {
    if (infiniteScroll.value == null) return
    isTop.value = infiniteScroll.value.getBoundingClientRect().top > 0
  })
})

function scrollToTop() {
  y.value = 0
}
onMounted(() => {
  el.value = window
})

const { greaterOrEqual } = useResponsive()
const isXL = greaterOrEqual('xl')
const isLarge = greaterOrEqual('lg')
const isMedium = greaterOrEqual('md')
const isSmall = greaterOrEqual('sm')

const recentHeight = computed(() => {
  if (isXL.value) return 226
  if (isLarge.value) return 206
  if (isMedium.value) return 190
  if (isSmall.value) return 160
  return 142
})

watch(recentHeight, () => {
  // console.log(val)
}, { immediate: true })

// const bufferSize = computed(() => {
//   return height.value
// })
</script>

<template>
  <div ref="infiniteScroll" class="flex flex-col gap-3 px-3 md:px-4">
    <div class="flex gap-1 leading-10">
      <Icon name="iconamoon:history-duotone" class="self-center text-xl text-rose-500 sm:text-2xl" />
      <h2 class="text-xl font-bold leading-10 sm:text-2xl">
        {{ $t(`page.title.recent`) }}
      </h2>
    </div>

    <div v-if="error" class="bg-container flex aspect-video w-full flex-col items-center justify-center gap-10 rounded-xl">
      <NuxtImg class="mx-auto w-80 max-w-[80%]" :src="`${$cloudinaryURL}/assets/svg/web/error.svg`" sizes="320px" fit="fill" />
      <span class="text-lg">{{ $t("data.failed") }}</span>
    </div>

    <div v-else-if="pending && (dataset?.length ?? 0) === 0" class="flex flex-col gap-3 md:gap-4">
      <PulseRecentDetailCard v-for="index in Array(10).keys()" :key="index" />
    </div>

    <div v-else-if="!dataset || !dataset.length" class="bg-container flex aspect-video w-full flex-col items-center justify-center rounded-xl pb-8">
      <NuxtImg class="mx-auto w-96 max-w-[80%]" :src="`${$cloudinaryURL}/assets/svg/web/empty-box.svg`" />
      <span class="text-lg">{{ $t("data.nodata") }}</span>
    </div>

    <div v-else>
      <DynamicScroller
        key="loaded"
        :prerender="10"
        :min-item-size="recentHeight"
        :items="dataset"
        key-field="data_id"
        page-mode
      >
        <template #default="{ item, index, active }">
          <DynamicScrollerItem :item="item" :active="active" :data-index="index">
            <div class="pb-3 md:pb-4">
              <MemberRecentCard :key="item.room_id" :recent="item" />
            </div>
          </DynamicScrollerItem>
        </template>
        <template #after>
          <div class="mb-4 flex w-full items-center justify-center py-16">
            <Icon v-if="!isEnded" name="svg-spinners:ring-resize" size="3rem" />
            <div v-else class="flex h-[3rem] items-center justify-center text-lg">
              {{ $t("data.nomore") }}
            </div>
          </div>
        </template>
      </DynamicScroller>
    </div>
  </div>
  <Transition
    enter-to-class="transition-all duration-500"
    leave-to-class="transition"
    enter-active-class="opacity-0 translate-y-full"
    leave-active-class="opacity-0 translate-y-full"
  >
    <div
      v-if="!isTop"
      class="fixed bottom-[80px] left-1/2 z-aboveNav flex w-[180px] max-w-[80%] -translate-x-1/2 overflow-hidden rounded-xl bg-second-2/95 font-bold text-white transition sm:bottom-10"
    >
      <button
        type="button"
        class="flex-1 border-r border-second-2 px-2 py-2.5 text-center active:bg-blue-500"
        @click="scrollToTop"
      >
        {{ $t("scrolltop") }} <Icon name="ph:arrow-up-bold" class="self-center text-base" />
      </button>
    </div>
  </Transition>
</template>
