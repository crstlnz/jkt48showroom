<script lang="ts" setup>
import { WatchComment } from '#components'
import type { WatchVideo } from '#components'
import { convertToMilliseconds } from '~~/library/utils'
import { useNotifications } from '~~/store/notifications'

definePageMeta({ middleware: 'showroom-session' })
const dayjs = useDayjs()
const route = useRoute()
const { data, pending, error, refresh: refreshWatchData } = useFetch('/api/showroom/watch', { params: { room_url_key: route.params.id, _: new Date().getTime() } })

const roomId = computed(() => {
  return data.value?.room_id || 0
})

const giftList = computed(() => {
  const map = new Map<number, ShowroomAPI.Gift>()
  for (const gift of (data.value?.gift_list ?? [])) {
    map.set(gift.gift_id, gift)
  }
  return map
})

const giftLogStore = useSessionStorage<ShowroomAPI.GiftLogItem[]>(`giftlog-${route.params.id}`, [])
const giftLog = ref<Map<number, Watch.Gift>>(new Map())

function storeGift(gift: ShowroomAPI.GiftLogItem) {
  const giftData = giftList.value.get(gift.gift_id)
  if (giftData && !giftData.free) {
    if (!giftLogStore.value.some(i => i.num === gift.num && i.user_id === gift.user_id && i.created_at === gift.created_at)) {
      giftLogStore.value.push({ ...gift })
    }
  }
}

function calculateGift(gift: ShowroomAPI.GiftLogItem) {
  const giftData = giftList.value.get(gift.gift_id)
  const g = giftLog.value.get(gift.gift_id)
  if (!g) {
    giftLog.value.set(gift.gift_id, {
      num: gift.num,
      name: gift.name,
      image: gift.image,
      id: gift.gift_id,
      user_count: 1,
      free: giftData?.free ?? true,
      point: giftData?.point ?? 0,
    })
  }
  else {
    giftLog.value.set(gift.gift_id, {
      ...g,
      user_count: g.user_count + 1,
      num: g.num + 1,
    })
  }
}

function addGift(gift: ShowroomAPI.GiftLogItem) {
  calculateGift(gift)
  storeGift(gift)
}

const sortedGift = computed(() => {
  return Array.from(giftLog.value.values()).sort((a, b) => {
    if (a.free !== b.free) {
      return a.free ? 1 : -1
    }
    else
    if (a.point === b.point) {
      return b.num - a.num
    }
    return b.point - a.point
  })
})
// const sortedGift = ref<Watch.Gift[]>([])

// function sortGifts(): Watch.Gift[] {
//   return
// }

const totalPoint = computed(() => {
  return Array.from(giftLog.value.values()).reduce((a, b) => {
    if (!b.free) return a + b.point
    return a
  }, 0)
})

function onGift(gift: ShowroomAPI.GiftLogItem) {
  addGift(gift)
  // giftLogRaw.value.push(gift)
}

const viewers = ref(0)

async function getPolling() {
  try {
    const poll = await $fetch('/api/showroom/polling', { params: { _: new Date().getTime(), room_id: roomId.value } })
    if (!poll) return
    if ('online_user_num' in poll) {
      viewers.value = poll.online_user_num
    }
  }
  catch (e) {
    console.log(e)
  }
}

if (error.value?.statusCode === 404) {
  const e = error.value?.data?.data?.errors
  const premium = e && e[0]?.redirect_url
  if (!premium) {
    throw createError({ statusCode: 404, message: 'Page not found!' })
  }
}

const isPremium = computed(() => {
  const e = error.value?.data?.data?.errors
  return !(!e || !e[0]?.redirect_url)
})

const title = computed(() => {
  return `${data?.value?.name ?? 'Showroom'} Room`
})

useHead({
  title: () => title.value,
})

const { pause, resume } = useIntervalFn(() => {
  if (roomId) {
    getPolling()
  }
}, 60000, { immediate: false, immediateCallback: true })

watch(isPremium, (premium) => {
  if (premium) {
    pause()
  }
}, { immediate: true })

const isLive = ref(data?.value?.is_live ?? false)

watch(data, (val) => {
  for (const gift of data.value?.gift_log ?? []) {
    storeGift(gift)
  }

  for (const gift of giftLogStore.value ?? []) {
    calculateGift(gift)
  }

  // sortedGift.value = sortGifts()

  isLive.value = val?.is_live ?? false
})

const video = ref<typeof WatchVideo>()
watch(isLive, (live) => {
  if (!live) {
    pause()
    viewers.value = 0
    video.value?.stop()
  }
  else {
    resume()
  }
}, { immediate: true })

const { addNotif } = useNotifications()
const { t } = useI18n()

function onStart() {
  if (roomId) {
    getPolling()
  }
  resume()
  refreshWatchData()
  isLive.value = true

  addNotif({
    type: 'info',
    title: t('notif.live.started'),
    message: `${data.value?.name} Room`,
  })
}

const giftOpen = ref(false)

function onFinish() {
  pause()
  isLive.value = false
  addNotif({
    type: 'info',
    title: t('notif.live.ended'),
    message: `${data.value?.name} Room`,
  })
}

const comment = ref<typeof WatchComment | null>()
const { greaterOrEqual } = useResponsive()
const isLarge = greaterOrEqual('lg')
</script>

<template>
  <div class="h-full w-full pb-5 sm:pb-14 lg:px-3 lg:pb-20 lg:pt-4">
    <div v-if="isPremium">
      <Error :message="$t('premium_live')" :alt="$t('error.unknown')" img-src="/svg/video_files.svg" url="/" />
    </div>
    <div v-else-if="pending" class="h-full w-full">
      <div class="relative flex w-full flex-col gap-3 md:gap-4 lg:flex-row">
        <div class="flex-1 space-y-3 md:space-y-4 lg:w-auto">
          <div class="pulse-color aspect-video animate-pulse overflow-hidden max-lg:shadow-sm lg:rounded-xl" />
        </div>
        <div class="relative min-h-[640px] w-full bg-white dark:bg-dark-1 max-lg:max-h-[70vh] max-lg:shadow-sm lg:w-[300px] lg:rounded-xl xl:w-[350px]">
          <div class="absolute inset-0 z-0 overflow-hidden">
            <div class="pulse-color h-full w-full animate-pulse lg:rounded-xl" />
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="error" class="h-full w-full">
      <Error :message="$t('error.unknown')" :alt="$t('error.unknown')" img-src="/svg/error.svg" url="/" />
    </div>

    <div v-else class="h-full w-full">
      <div class="relative flex min-h-full w-full flex-col gap-3 md:gap-4 lg:flex-row">
        <div class="flex flex-1 flex-col lg:w-auto">
          <div class="aspect-video overflow-hidden bg-white outline-none dark:bg-dark-1 max-lg:shadow-sm lg:rounded-xl">
            <div v-if="!isLive" class="flex h-full w-full items-center justify-center">
              <div class="space-y-4 md:space-y-6 lg:space-y-10">
                <img src="/svg/video_files.svg" class="mx-auto w-[250px] max-w-[70%] dark:brightness-90" alt="">
                <div class="text-center text-xl font-semibold">
                  {{ $t('streamoffline') }}
                </div>
              </div>
            </div>
            <LazyWatchVideo
              v-else
              ref="video" :poster="data?.image ?? ''" :sources="data?.streaming_url_list ?? []" @fullsceen="(isFullscreen) => {
                if (isFullscreen && comment) comment.stopAutoAppend()
              }"
            />
          </div>
          <div class="mt-3 flex flex-wrap justify-between gap-2 px-2 text-xl font-semibold max-sm:flex-wrap sm:items-center md:gap-3 lg:px-0">
            <div class="h-8 w-14 overflow-hidden rounded-md max-sm:hidden md:h-14 md:w-24 md:rounded-xl">
              <img :src="data?.image" :alt="data?.name" class="h-full w-full object-cover">
            </div>
            <div class="flex min-w-0 flex-1 gap-2 max-sm:flex-[100%]">
              <div class="truncate max-lg:flex-1" :title="data?.name">
                {{ data?.name }}
              </div>
              <span class="shrink-0 space-x-1 rounded-lg bg-red-500 px-1.5 py-1 text-sm text-slate-50">
                <Icon name="mingcute:user-3-fill" />
                <span>{{ $n(viewers) }}</span>
              </span>
              <span v-if="isLive" class="shrink-0 space-x-1 rounded-lg bg-slate-700 px-1.5 py-1 text-sm text-slate-50 dark:bg-slate-500">
                {{ dayjs(convertToMilliseconds(data?.started_at ?? 0)).format('h:mm A') }}
              </span>
            </div>
            <a
              target="_blank"
              class="select-none rounded-lg bg-second-2/80 p-1 px-3 text-center text-sm font-bold text-white transition-transform hover:bg-second-2 active:scale-95 disabled:bg-second-2/40 disabled:text-gray-400 disabled:active:scale-100 disabled:dark:text-gray-500 max-sm:flex-1 lg:p-1.5 lg:px-2.5"
              :href="$liveURL(data?.room_url_key ?? '')"
            >
              {{ $t("openshowroom") }}
            </a>
            <button
              v-if="!isLarge"
              type="button"
              class="select-none rounded-lg bg-yellow-500/80 p-1 px-3 text-center text-sm font-bold text-white transition-transform hover:bg-yellow-500 active:scale-95 disabled:bg-second-2/40 disabled:text-gray-400 disabled:active:scale-100 disabled:dark:text-gray-500 max-sm:flex-1 lg:p-1.5 lg:px-2.5"
              :href="$liveURL(data?.room_url_key ?? '')"
              @click="giftOpen = !giftOpen"
            >
              {{ giftOpen ? $t("hide_gifts") : $t("show_gifts") }}
            </button>
          </div>

          <Transition name="height">
            <div v-if="giftOpen || isLarge" class="duration-300 max-lg:h-72">
              <div class="h-full pt-3">
                <div class="bg-container flex h-full flex-col gap-3 overflow-hidden px-3 pt-3 lg:rounded-xl lg:p-4 lg:pb-5">
                  <div class="flex items-center gap-2 text-xl font-bold">
                    <Icon name="fluent-emoji-flat:wrapped-gift" />
                    <span class="pt-1">Gifts</span>
                    <div class="flex flex-1 items-center justify-end gap-1.5 pt-1" :title="$t('totalpaidgift')">
                      <Icon name="twemoji:coin" />
                      <span>{{ $n(totalPoint) }}G</span>
                    </div>
                  </div>
                  <div v-if="data?.gift_log?.length" class="roundedscrollbar h-0 flex-1 max-lg:overflow-y-scroll">
                    <div class="grid grid-cols-[repeat(auto-fill,minmax(50px,1fr))] gap-3 lg:grid-cols-[repeat(auto-fill,minmax(60px,1fr))]">
                      <div v-for="gift in sortedGift" :key="gift.id" class="relative max-h-[40px] max-w-[40px] lg:max-h-[50px] lg:max-w-[50px]" :title="$currency(gift.point)">
                        <img :src="gift.image" alt="Gift" class="aspect-square">
                        <div
                          v-if="gift.num > 1"
                          :class="$getNumColor(gift.num)"
                          class="text-stroke absolute bottom-[-7px] right-[-4px] rounded-full text-sm font-extrabold leading-6 lg:text-base"
                        >
                          x{{ gift.num >= 1000 ? `${(gift.num / 1000).toFixed(0)}k` : gift.num }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="h-0 flex-1 overflow-y-auto">
                    <div class="flex flex-col items-center justify-center">
                      <img class="h-32" src="/svg/empty-box.svg">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
        <div class="relative min-h-[640px] w-full bg-white dark:bg-dark-1 max-lg:max-h-[70vh] max-lg:shadow-sm lg:max-h-[85vh] lg:w-[300px] lg:rounded-xl xl:w-[350px]">
          <div class="absolute inset-0 z-0 overflow-hidden rounded-xl">
            <WatchComment ref="comment" :is-live="isLive" :data="data" class="h-full w-full" @finish="onFinish" @start="onStart" @gift="onGift" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
