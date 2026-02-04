<script lang="ts" setup>
import type { WatchVideo } from '#components'
import { WatchComment } from '#components'
import { useNotifications } from '~/store/notifications'

const route = useRoute()
const isPremium = ref(false)
const { data, pending, error, refresh: refreshWatchData } = await useApiFetch<Watch.WatchData>(`/api/watch/${route.params.id}`, {
  onResponseError(e) {
    // @ts-expect-error error
    if (e.response._data?.status === 404) {
      // @ts-expect-error error
      isPremium.value = e.response?._data?.message === 'Live is premium!'
      if (!isPremium.value) {
        throw createError({ statusCode: 404, message: 'Page not found!' })
      }
      if (import.meta.server) {
        useNuxtApp().payload.isPremium = true
      }
    }
  },
})

if (import.meta.client) {
  if (useNuxtApp().payload.isPremium !== null) {
    isPremium.value = useNuxtApp().payload.isPremium as boolean
  }
}

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

// const giftLogStore = useSessionStorage<ShowroomAPI.GiftLogItem[]>(`giftlog-${route.params.id}`, [])
const giftLogStore = ref<ShowroomAPI.GiftLogItem[]>([])
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

const viewers = ref(0)

const user = ref({
  id: 0,
  name: '',
  rank: 0,
  avatar: '',
})

const config = useRuntimeConfig()

async function _getPolling() {
  try {
    // const poll = await $apiFetch<ShowroomAPI.Polling | ShowroomAPI.PollingLiveEnd>(`${config.public.api}/api/showroom/polling`, { params: { room_id: roomId.value } })
    // const current_user = await $apiFetch<ShowroomAPI.CurrentUser>(`${config.public.api}/api/showroom/current_user`, { params: { room_id: roomId.value } })
    const poll = await getPolling(roomId.value)
    const current_user = await getCurrentUser(roomId.value)
    user.value = {
      id: current_user.user_id,
      name: current_user.name,
      rank: current_user.live_rank,
      avatar: current_user.avatar_url,
    }
    if (!poll) return
    if ('online_user_num' in poll) {
      viewers.value = poll.online_user_num
    }
  }
  catch (e) {
    console.error(e)
  }
}

const title = computed(() => {
  return `${data?.value?.name ?? 'Showroom'} Room`
})

useSeoMeta({
  ogImage: () => data.value?.image,
  twitterImage: () => data.value?.image,
})

useHead({
  title: () => title.value,
})

const { pause, resume } = useIntervalFn(() => {
  if (roomId.value) {
    _getPolling()
  }
}, 120000, { immediate: false, immediateCallback: true })

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
}, {
  immediate: true,
})

const telops = ref<Watch.Telops[]>([])
async function fetchTelops() {
  try {
    const data = await $apiFetch<Watch.TelopApi>(`${config.public.api}/api/showroom/telop?room_id=${roomId.value}`)
    telops.value = data.telops.map(i => ({
      color: i.color,
      text: i.text,
      type: i.type,
      live_id: i.live_id,
    }))
  }
  catch (e) {
    console.error(e)
  }
}

const video = ref<typeof WatchVideo>()
watch(isLive, (live) => {
  if (!live) {
    pause()
    viewers.value = 0
    video.value?.stop()
  }
  else {
    fetchTelops()
    resume()
  }
}, { immediate: true })

const { addNotif } = useNotifications()
const { t } = useI18n()

function onStart() {
  if (roomId.value) {
    _getPolling()
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

// const giftOpen = ref(false)

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
const userOpen = ref(false)
const { authenticated } = useAuth()
const startTime = computed(() => {
  return new Date(convertToMilliseconds((data.value?.started_at ?? 0)))
})
const timeAgo = useTimeAgo(startTime)

const rawView = useLocalStorage<Watch.TabView>('watch-tab-view', 'comment')
const tabView = computed(() => {
  // if (isLarge.value && rawView.value === 'comment') {
  //   return 'gift-list'
  // }
  // else {
  //   return rawView.value
  // }
  return rawView.value
})

function setView(tab: Watch.TabView) {
  rawView.value = tab
}

// const { onComment, onLiveState, onGift, onTelops } = useShowroomWatcher(`wss://${data.value?.socket_host}` ?? '', data.value?.socket_key ?? '')
const { onComment, onLiveState, onGift, onTelops } = useShowroomWatcher(data)
onLiveState((isLive: boolean) => {
  if (isLive) {
    onStart()
  }
  else {
    onFinish()
  }
})

onTelops((t: any) => {
  telops.value = t as Watch.Telops[]
})

const { comments, delayedComments, appendComment, createComment, appendDelayedComments, setAutoAppend } = useShowroomComments(data)

onGift((gift: ShowroomAPI.GiftLogItem) => {
  addGift(gift)
})

onComment((comment) => {
  if (user.value?.id === comment.user_id) return
  appendComment(comment)
})

const telop = ref<Watch.Telops | null>(null)
const telopIndex = ref(0)
const { resume: resumeTelop, pause: pauseTelop } = useIntervalFn(() => {
  telopIndex.value += 1
  const data = telops.value?.[telopIndex.value % telops.value.length]
  if (data) {
    telop.value = data
  }
}, 10000, {
  immediate: false,
  immediateCallback: false,
})

watch(telops, (v) => {
  telopIndex.value = 0
  const data = v?.[telopIndex.value]
  if (data) {
    telop.value = data
  }
  if (v.length > 1) {
    resumeTelop()
  }
  else {
    pauseTelop()
  }
})
</script>

<template>
  <div class="h-full w-full lg:px-3 lg:pb-20 lg:pt-4">
    <div v-if="isPremium">
      <Error :message="$t('premium_live')" :alt="$t('premium_live')" :img-src="`${$imgCDN}/assets/svg/web/video_files.svg`" :redirect-msg="`${$t('watch_on')} Showroom`" :external="true" :url="$liveURL(String(route.params.id))" />
    </div>
    <div v-else-if="pending" class="h-full w-full">
      <div class="relative flex w-full flex-col gap-3 md:gap-4 lg:flex-row h-full">
        <div class="lg:flex-1 space-y-3 md:space-y-4 lg:w-auto">
          <div class="pulse-color aspect-video animate-pulse overflow-hidden max-lg:shadow-2xs lg:rounded-xl" />
        </div>
        <div class="relative min-h-[640px] w-full bg-container max-lg:flex-1 max-lg:shadow-2xs lg:w-[300px] lg:rounded-xl xl:w-[350px]">
          <div class="absolute inset-0 z-0 overflow-hidden">
            <div class="pulse-color h-full w-full animate-pulse lg:rounded-xl" />
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="error" class="h-full w-full">
      <Error :message="$t('error.unknown')" :alt="$t('error.unknown')" :img-src="`${$imgCDN}/assets/svg/web/error.svg`" url="/" />
    </div>

    <div v-else class="h-full w-full">
      <div class="relative flex min-h-full w-full flex-col gap-3 md:gap-4 lg:flex-row">
        <div class="flex lg:flex-1 flex-col lg:w-auto">
          <div class="relative aspect-video overflow-hidden bg-white outline-hidden dark:bg-dark-1 max-lg:shadow-2xs lg:rounded-xl">
            <ClientOnly>
              <div
                v-if="telop && isLive" class="absolute inset-x-0 top-0 z-10 bg-black/50 p-1.5 text-center text-base md:text-lg lg:text-xl"
              >
                <div class="relative inset-0">
                  <Transition name="telop">
                    <div
                      :key="telop.text"
                      :style="{
                        color: `rgb(${telop.color.r}, ${telop.color.g}, ${telop.color.b})`,
                      }"
                    >
                      {{ telop.text }}
                    </div>
                  </Transition>
                </div>
              </div>
              <div v-if="!isLive" class="flex h-full w-full items-center justify-center">
                <div class="space-y-4 md:space-y-6 lg:space-y-10">
                  <Image :src="`${$imgCDN}/assets/svg/web/video_files.svg`" class="mx-auto w-[250px] max-w-[70%] dark:brightness-90" alt="" />
                  <div class="text-center text-xl font-semibold">
                    {{ $t('streamoffline') }}
                  </div>
                </div>
              </div>

              <Suspense v-else>
                <LazyVideoPlayer :poster="data?.image ?? ''" :sources="(data?.streaming_url_list ?? []).filter(i => i.type === 'hls')" />
                <!-- <LazyWatchVideo
                  ref="video"
                  :poster="data?.image ?? ''"
                  :sources="data?.streaming_url_list ?? []"
                  rotate-fill="height"
                  @fullsceen="(isFullscreen) => {
                    if (isFullscreen && comment) stopAutoAppend()
                  }"
                /> -->
              </Suspense>
            </ClientOnly>
          </div>
          <div class="mt-3 flex flex-wrap justify-between gap-2 px-2 text-xl font-semibold max-sm:flex-wrap sm:items-center md:gap-3 lg:px-0">
            <div class="h-8 w-14 overflow-hidden rounded-md max-sm:hidden md:h-14 md:w-24 md:rounded-xl">
              <img :src="data?.image" :alt="data?.name" class="h-full w-full object-cover">
            </div>
            <div class="flex items-center min-w-0 flex-1 gap-2 max-sm:flex-[100%]">
              <div v-if="true" class="flex flex-col items-start truncate max-lg:flex-1" :title="data?.name">
                <div>{{ data?.name }}</div>
              </div>
              <div v-else class="truncate max-lg:flex-1" :title="data?.name">
                {{ data?.name }}
              </div>
              <span class="shrink-0 flex items-center space-x-1 rounded-lg bg-red-500 px-1.5 py-1 text-sm text-slate-50">
                <Icon name="mingcute:user-3-fill" />
                <span>{{ $n(viewers) }}</span>
              </span>
              <span
                v-if="isLive" v-tooltip="`${timeAgo}`" class="flex shrink-0 space-x-1 rounded-lg bg-slate-700 px-1.5 py-1 text-sm items-center justify-center text-slate-50 dark:bg-slate-500"
              >
                {{ $dayjs(convertToMilliseconds(data?.started_at ?? 0)).format('h:mm A') }}
              </span>
            </div>

            <a
              target="_blank"
              class="flex select-none items-center justify-center rounded-lg bg-blue-500/80 p-1 px-3 text-center text-sm font-bold text-white transition-transform hover:bg-blue-500 active:scale-95 disabled:bg-blue-500/40 disabled:text-gray-400 disabled:active:scale-100 dark:disabled:text-gray-500 max-sm:flex-1 lg:p-1.5 lg:px-2.5"
              :href="$liveURL(data?.room_url_key ?? '')"
            >
              Showroom
            </a>

            <ClientOnly>
              <WatchTabButtons v-if="!isLarge" :tab-view="tabView" @set-view="setView" />
              <button
                v-if="!isLarge && authenticated"
                type="button"
                class="flex select-none items-center justify-center rounded-lg bg-blue-500/80 p-1 px-1.5 text-center text-sm font-bold text-white transition-transform hover:bg-blue-500 active:scale-95 disabled:bg-blue-500/40 disabled:text-gray-400 disabled:active:scale-100 dark:disabled:text-gray-500 lg:p-1.5 lg:px-2.5"
                @click="userOpen = !userOpen"
              >
                <Icon name="ic:baseline-person" size="1.2rem" />
              </button>
            </ClientOnly>
            <ClientOnly>
              <Transition name="fade">
                <div v-if="!isLarge && userOpen" class="fixed inset-0 z-notification bg-black/50" @click="userOpen = false" />
              </Transition>
            </ClientOnly>
            <ClientOnly>
              <div
                v-if="authenticated && user"
                class="flex items-center gap-2 text-base transition-[visibility,opacity] duration-300 ease-in-out lg:gap-2 lg:text-sm"
                :class="{
                  'bg-container-2 fixed left-1/2 top-1/2 z-notification -translate-x-1/2 -translate-y-1/2 rounded-xl p-8': !isLarge,
                  'visible opacity-100': !isLarge && userOpen,
                  'invisible opacity-0': !isLarge && !userOpen,
                }"
              >
                <div class="h-20 w-20 lg:h-10 lg:w-10">
                  <img v-if="user.avatar" :src="user.avatar" alt="User Avatar" class="h-full w-full object-cover">
                  <div v-else class="bg-container h-full w-full rounded-full object-cover" />
                </div>
                <div class="flex flex-col">
                  <div>{{ user.name ? user.name : "Loading" }}</div>
                  <div class="whitespace-nowrap">
                    Rank : {{ user.rank > 0 ? user.rank : "Out" }}
                  </div>
                </div>
              </div>
            </ClientOnly>
          </div>

          <ClientOnly><WatchLiveNow v-if="isLarge" :room-key="String(route.params.id)" /></ClientOnly>
        </div>
        <ClientOnly>
          <template #fallback>
            <div class="animate-pulse relative max-lg:flex-1 h-full min-h-[640px] w-full bg-container max-lg:shadow-2xs lg:max-h-[85vh] lg:w-[300px] lg:rounded-xl xl:w-[350px]" />
          </template>
          <div class="space-y-3 max-lg:flex-1 flex flex-col">
            <WatchTabButtons v-if="isLarge" :tab-view="tabView" @set-view="setView" />
            <div class="relative h-full min-h-[640px] flex-1 overflow-hidden w-full bg-container max-lg:shadow-2xs lg:max-h-[85vh] lg:w-[300px] lg:rounded-xl xl:w-[350px]">
              <div class="absolute inset-0 z-0">
                <WatchComment
                  v-if="tabView === 'comment'" ref="comment" :is-live="isLive" :data="data" :comments="comments" :delayed-comments="delayedComments" class="h-full w-full" @set-auto-append="(val) => setAutoAppend(val)" @create-comment="createComment" @append-delayed-comments="appendDelayedComments"
                />
                <WatchRanks v-else-if="tabView === 'ranks'" :room-id="roomId" />
                <WatchGiftList v-else-if="tabView === 'gift-list'" :sorted-gift="sortedGift" />
                <WatchGiftLog v-else-if="tabView === 'gift-log'" :gift-log="giftLogStore" />
              </div>
            </div>
          </div>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>
