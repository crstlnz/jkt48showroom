<script lang="ts" setup>
import c from '~~/app.config'
import { useNotifications } from '~/store/notifications'
import { useSettings } from '~~/store/settings'

const route = useRoute()
const settings = useSettings()
const { getTitle } = useAppConfig()
const { data, error, pending } = await useApiFetch<API.IRecentDetail>(`/api/recent/${route.params.id}`)
const { data: likeData } = await useApiFetch<Database.IsLike>('/api/user/like', { query: { data_id: route.params.id } })
const liked = ref(false)

watch(likeData, (val) => {
  liked.value = val?.is_liked || false
}, { immediate: true })

const users = computed<Map<number, IFansCompact>>(() => {
  const users = new Map<number, IFansCompact>()
  if (!data?.value?.users) return users
  const u = data?.value?.users
  for (const user of u) {
    users.set(user.id, user)
  }
  return users
})

const gifts = computed<Map<number, IGiftImg>>(() => {
  const gifts = new Map<number, IGiftImg>()
  if (!data?.value?.live_info?.gift) return gifts
  const g = data?.value?.live_info.gift.list
  for (const gift of g) {
    gifts.set(gift.id, {
      id: gift.id,
      free: gift.free,
      point: gift.point,
      img: c.giftUrl(gift?.id ?? 0),
    })
  }
  return gifts
})

const calculatedGift = computed<IFansGift[]>(() => {
  try {
    if (!data?.value?.live_info?.gift?.log) return []
    const log = data?.value.live_info.gift.log
    const mapped = log.map<IFansGift>((i) => {
      const user = users.value.get(i.user_id)
      const giftMap = new Map<number, IGifts>()
      for (const gift of i.gifts) {
        if (giftMap.has(gift.id)) {
          const g = giftMap.get(gift.id)
          if (g) g.num += gift.num
        }
        else {
          const g = gifts.value.get(gift.id)
          if (!g) continue
          giftMap.set(gift.id, {
            num: gift.num,
            id: g.id,
            free: g.free,
            point: g.point,
            img: g.img,
            date: gift.date,
          })
        }
      }
      return {
        name: user?.name ?? 'User not Found!',
        id: user?.id ?? i.user_id ?? (Math.floor(Math.random() * 500) + Math.floor(Math.random() * 10) + 1),
        avatar: c.avatarURL(user?.avatar_id ?? 1),
        avatar_id: user?.avatar_id ?? 1,
        total: i.total,
        gifts: Array.from(giftMap.values()).sort((a, b) => b.point - a.point),
      }
    })
    return mapped
  }
  catch (e) {
    return []
  }
})

const { status, user } = useAuth()
const { addNotif } = useNotifications()
function setLike() {
  if (status.value === 'unauthenticated') {
    navigateTo('/login')
  }
  else {
    if (!data.value) return
    $apiFetch('/api/user/like', {
      method: liked.value ? 'DELETE' : 'PUT',
      query: {
        user_id: user.value?.id,
        type: 2,
        liked_id: data.value.data_id,
      },
    }).then(() => {
      liked.value = !liked.value
    }).catch(() => {
      addNotif({ message: 'Like failed!', type: 'danger' })
    })
  }
}

const dayjs = useDayjs()
const { locale, t } = useI18n()

const dateStart = computed(() => {
  return data.value?.live_info?.date?.start || data.value?.created_at || '0'
})

const dateEnd = computed(() => {
  return data.value?.live_info?.date?.end || data.value?.created_at || '0'
})

const date = computed(() => {
  return dayjs(dateStart.value).locale(locale.value).format('DD MMMM YYYY')
})

const title = computed(() => {
  const t = (!pending.value && (data.value || !error.value)) ? `${data.value?.room_info?.fullname ?? data.value?.room_info?.nickname ?? data.value?.room_info?.name}` : getTitle(settings.group)
  return t.split('-')[0]
})

const { $fixCloudinary } = useNuxtApp()
const description = computed(() => {
  return t('recent_detail_description', { name: data.value?.room_info.nickname || data.value?.room_info.fullname || data.value?.room_info?.name, date: date.value })
})

const titleSeo = computed(() => `Live ${title.value} - ${dayjs(data.value?.live_info?.date?.start || data.value?.created_at).format('DD MMM YYYY')}`)
useSeoMeta({
  title: () => titleSeo.value,
  ogTitle: () => titleSeo.value,
  description,
  ogImage: () => data.value?.room_info?.img || '',
  ogDescription: description,
  twitterDescription: description,
  twitterTitle: () => titleSeo.value,
  twitterImage: () => $fixCloudinary(data.value?.room_info?.img_alt || data.value?.room_info?.img || ''),
  twitterCard: 'summary',
})
useHead({
  title: () => titleSeo.value,
})

const { greaterOrEqual } = useResponsive()
const isXL = greaterOrEqual('xl')
</script>

<template>
  <div>
    <div v-if="pending" class="relative min-h-[100vh] w-full">
      <Icon name="eos-icons:loading" size="3rem" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 " />
    </div>
    <Error v-else-if="error || !data" :message="error ? (error.statusCode === 404 ? $t('error.pagenotfound') : $t('error.unknown')) : $t('error.pagenotfound')" :img-src="!data || error?.statusCode === 404 ? '/svg/404.svg' : '/svg/error.svg'" />
    <LayoutRow v-else :title="title" :sub-title="`Showroom Live - ${dayjs(data.live_info.date.start).format('DD MMMM YYYY')}`">
      <template #default>
        <div class="flex flex-col gap-3 md:gap-4">
          <MemberProfileBanner :room-id="data.room_id" :member="data.room_info" />
          <div class="mx-3 md:mx-4 flex gap-3 md:gap-4 items-stretch [&>div]:flex-1 max-xl:flex-col">
            <div class="flex flex-col md:flex-row xl:flex-col gap-3 md:gap-4 flex-wrap">
              <InfoCard class="flex-1" icon-class="bg-red-500/20 text-red-500 dark:bg-red-300/20 dark:text-red-300" icon="material-symbols:calendar-today">
                <template #default>
                  {{ dayjs(dateStart).locale(locale).format('dddd, DD MMMM YYYY') }}
                </template>
                <template #title>
                  {{ `${dayjs(dateStart).locale(locale).format('hh:mm A')} - ${dayjs(dateEnd).locale(locale).format('hh:mm A')}` }}
                </template>
              </InfoCard>
              <InfoCard class="flex-1" icon-class="bg-yellow-500/20 text-yellow-500 dark:bg-yellow-300/20 dark:text-yellow-300" icon="material-symbols:auto-timer" :title="$t('duration')" :value="formatDuration(data.live_info?.duration ?? 0)" />
            </div>
            <div class="bg-container rounded-xl p-3 md:p-4">
              <div class="font-bold text-lg xl:text-xl mb-1">
                Detail
              </div>
              <table class="table-auto [&_td]:py-1 [&_td]:xl:py-1.5 text-sm xl:text-base [&_td:first-child]:min-w-[150px] [&_td:first-child]:xl:min-w-[200px] [&_td:first-child]:opacity-80 font-semibold dark:[&_td:first-child]:opacity-60">
                <tr>
                  <td>
                    Gift
                  </td>
                  <td>
                    {{ $currency(data.total_point ?? 0) }}
                  </td>
                </tr>
                <tr>
                  <td>
                    {{ data.live_info.viewers?.is_excitement ? 'Excitement Point' : 'Viewer' }}
                  </td>
                  <td v-if="data.live_info?.viewers?.num">
                    {{ $n(data.live_info?.viewers?.num ?? 0) }}
                  </td>
                  <td v-else>
                    {{ $t('data.nodata') }}
                  </td>
                </tr>
                <tr v-if="data.live_info?.viewers?.active">
                  <td>
                    {{ data.live_info.viewers?.is_excitement ? 'Viewer' : 'Active Viewer' }}
                  </td>
                  <td>
                    {{ $n(data.live_info?.viewers?.active ?? 0) }}
                  </td>
                </tr>
                <tr>
                  <td>
                    Comments
                  </td>
                  <td v-if="data?.live_info?.comments?.num">
                    {{ $n(data?.live_info?.comments?.num || 0) }}  <span v-if="data?.live_info?.comments?.users" class="text-sm opacity-80 dark:opacity-60">by {{ $n(data?.live_info?.comments?.users || 0) }} users</span>
                  </td>
                  <td v-else>
                    {{ $t('data.nodata') }}
                  </td>
                </tr>
              </table>
            </div>
          </div>
          <GiftInfo :gifts="data.live_info.gift.list" />
          <ShowroomGiftList :gifts="data.live_info.gift.list" class="mx-3 md:mx-4" />
          <HomeFans v-if="data.fans?.length" :data="data.fans" class="rounded-xl mx-3 md:mx-4" />

          <div
            class="pulse-color col-span-2 aspect-[16/13] flex-1 overflow-hidden shadow-sm sm:mx-3 md:mx-4 sm:rounded-xl md:aspect-[16/10] lg:w-auto 2xl:aspect-[16/9]"
          >
            <ClientOnly v-if="data.live_info?.stage_list?.length">
              <template #fallback>
                <div class="w-full h-full bg-container animate-pulse" />
              </template>
              <Suspense>
                <template #fallback>
                  <div class="w-full h-full bg-container animate-pulse" />
                </template>
                <LazyShowroomView
                  :data-id="data.data_id"
                  :member-image="data.room_info?.img"
                  :date="data.live_info?.date"
                  :background="
                    data.live_info?.background_image
                      ?? 'https://image.showroom-cdn.com/showroom-prod/assets/img/room/background/default.png'
                  "
                  :screenshot="data.live_info?.screenshot"
                  :live-info="data.live_info"
                  :stage-list="data.live_info.stage_list"
                  :users="data?.users || []"
                  :gift-data="data.live_info.gift"
                />
              </Suspense>
            </ClientOnly>
            <div v-else class="flex h-full w-full items-center justify-center bg-zinc-600 text-3xl font-bold text-white">
              No data
            </div>
          </div>
          <div class="mx-3 md:mx-4 overflow-hidden rounded-xl bg-white shadow-sm dark:bg-dark-1">
            <ShowroomGiftScroll :gifts="calculatedGift" :page-mode="true" :data-id="data.data_id" :gift-list="data?.live_info?.gift?.list ?? []" />
          </div>
        </div>
      </template>

      <template #sidebar>
        <ClientOnly>
          <template #fallback>
            <div class="bg-container w-full aspect-[4/5] rounded-xl animate-pulse xl:mt-4" />
            <div class="bg-container w-full aspect-[4/12] rounded-xl animate-pulse" />
          </template>
          <div v-if="isXL" class="flex flex-col gap-3 md:gap-4">
            <HomeLiveNowSide class="xl:mt-4" />
            <HomeRecents />
          </div>
        </ClientOnly>
      </template>

      <template #actionSection>
        <button v-ripple type="button" aria-label="Like" class="h-10 w-10 rounded-full" @click="setLike">
          <Icon :name="liked ? 'heroicons:bookmark-20-solid' : 'heroicons:bookmark'" class="rounded-full hover:bg-hover w-full h-full p-2" :class="liked ? 'text-blue-500 dark:text-blue-400' : 'text-slate-500 bg:text-slate-400'" />
        </button>
      </template>
    </LayoutRow>
  </div>
</template>
