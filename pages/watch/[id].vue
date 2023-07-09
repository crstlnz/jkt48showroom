<script lang="ts" setup>
import type { WatchVideo } from '~~/.nuxt/components'
import { useNotifications } from '~~/store/notifications'

const route = useRoute()
const { data, pending, error, refresh: refreshWatchData } = await useFetch('/api/showroom/watch', { params: { room_url_key: route.params.id } })
const { data: polling, refresh } = useFetch('/api/showroom/polling', { params: { room_id: data.value?.room_id }, server: false, immediate: false })
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
  title: title.value,
})

const viewers = ref(0)
watch(polling, (poll) => {
  if (!poll) return
  if ('online_user_num' in poll) {
    viewers.value = poll.online_user_num
  }
})

const { pause, resume } = useIntervalFn(() => {
  refresh()
}, 60000, {
  immediate: true,
  immediateCallback: true,
})

if (isPremium) pause()

onMounted(() => {
})
const isLive = ref(data?.value?.is_live ?? false)
const video = ref<typeof WatchVideo>()

watch(isLive, (live) => {
  if (!live) {
    pause()
    viewers.value = 0
    video.value?.stop()
  }
})

const { addNotif } = useNotifications()
const { t } = useI18n()
function onStart() {
  refresh()
  resume()
  refreshWatchData()
  isLive.value = true

  addNotif({
    type: 'info',
    title: t('notif.live.started'),
    message: `${data.value?.name} Room`,
  })
}

function onFinish() {
  pause()
  isLive.value = false
  addNotif({
    type: 'info',
    title: t('notif.live.ended'),
    message: `${data.value?.name} Room`,
  })
}
</script>

<template>
  <div class="h-full w-full lg:mt-10 lg:px-3">
    <div v-if="isPremium">
      <Error :message="$t('premium_live')" :alt="$t('error.unknown')" img-src="/svg/video_files.svg" url="/" />
    </div>

    <div v-else-if="pending" class="h-full w-full">
      <div class="relative flex w-full flex-col gap-3 md:gap-4 lg:flex-row">
        <div class="flex-1 space-y-3 md:space-y-4 lg:w-auto">
          <div class="pulse-color aspect-video animate-pulse overflow-hidden max-lg:shadow-sm" />
        </div>
        <div class="relative min-h-[640px] w-full bg-white dark:bg-dark-1 max-lg:max-h-[70vh] max-lg:shadow-sm lg:w-[300px] lg:rounded-xl xl:w-[350px]">
          <div class="absolute inset-0 z-0 overflow-hidden rounded-xl">
            <div class="pulse-color h-full w-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="h-full w-full">
      <Error :message="$t('error.unknown')" :alt="$t('error.unknown')" img-src="/svg/error.svg" url="/" />
    </div>

    <div v-else class="h-full w-full">
      <div class="relative flex w-full flex-col gap-3 md:gap-4 lg:flex-row">
        <div class="flex-1 space-y-3 md:space-y-4 lg:w-auto">
          <div class="aspect-video overflow-hidden bg-white dark:bg-dark-1 max-lg:shadow-sm">
            <div v-if="!isLive" class="flex h-full w-full items-center justify-center">
              <div class="space-y-4 md:space-y-6 lg:space-y-10">
                <img src="/svg/video_files.svg" class="mx-auto w-[250px] max-w-[70%] dark:brightness-90" alt="">
                <div class="text-center text-xl font-semibold">
                  {{ $t('streamoffline') }}
                </div>
              </div>
            </div>

            <LazyWatchVideo v-else :poster="data?.image ?? ''" :sources="data?.streaming_url_list ?? []" />
          </div>
          <div class="flex justify-between gap-2 px-2 text-xl font-semibold max-sm:flex-wrap sm:items-center md:gap-3 lg:px-0">
            <div class="truncate max-sm:flex-[100%]" :title="data?.name">
              {{ data?.name }}
            </div>
            <div class="flex justify-start gap-1.5 max-sm:gap-2 sm:flex-1">
              <span class="shrink-0 space-x-1 rounded-lg bg-red-500 px-1.5 py-1 text-sm text-slate-50">
                <Icon name="mingcute:user-3-fill" />
                <span>{{ viewers }}</span>
              </span>
              <span v-if="isLive" class="shrink-0 space-x-1 rounded-lg bg-slate-700 px-1.5 py-1 text-sm text-slate-50 dark:bg-slate-500">
                {{ $formatSR(data?.started_at ?? 0) }}
              </span>
            </div>
            <a target="_blank" class="select-none rounded-lg bg-second-2/80 p-1 px-3 text-center text-sm font-bold text-white transition-transform hover:bg-second-2 active:scale-95 disabled:bg-second-2/40 disabled:text-gray-400 disabled:active:scale-100 disabled:dark:text-gray-500 max-sm:flex-1 lg:p-1.5 lg:px-2.5" :href="$liveURL(data?.room_url_key ?? '')">{{ $t("openshowroom") }}</a>
          </div>
        </div>
        <div class="relative min-h-[640px] w-full bg-white dark:bg-dark-1 max-lg:max-h-[70vh] max-lg:shadow-sm lg:w-[300px] lg:rounded-xl xl:w-[350px]">
          <div class="absolute inset-0 z-0 overflow-hidden rounded-xl">
            <WatchComment :data="data" class="h-full w-full" @finish="onFinish" @start="onStart" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
