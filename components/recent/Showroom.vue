<script lang="ts" setup>
const props = defineProps<{
  data: LogDetail.Showroom
}>()

const { locale } = useI18n()
const users = computed<Map<number, LogDetail.ShowroomUser>>(() => {
  const users = new Map<number, LogDetail.ShowroomUser>()
  if (!props.data?.users) return users
  const u = props.data?.users
  for (const user of u) {
    users.set(user.id, user)
  }
  return users
})

const gifts = computed<Map<string, LogDetail.BaseGift>>(() => {
  const gifts = new Map<string, LogDetail.BaseGift>()
  if (!props.data?.live_info?.gift) return gifts
  const g = props.data?.live_info.gift.list
  for (const gift of g) {
    gifts.set(String(gift.id), {
      id: gift.id,
      name: gift.name,
      point: gift.point,
      img: gift.img,
      free: gift.free,
    })
  }
  return gifts
})

const { avatarURL } = useAppConfig()

const calculatedGift = computed<RecentUserGifts[]>(() => {
  try {
    if (!props.data?.live_info?.gift?.log) return []
    const log = props.data?.live_info.gift.log
    const mapped = log.map<RecentUserGifts>((i) => {
      const user = users.value.get(i.user_id)
      const giftMap = new Map<string, RecentGift>()
      for (const gift of i.gifts) {
        if (giftMap.has(String(gift.id))) {
          const g = giftMap.get(String(gift.id))
          if (g) g.num += gift.num
        }
        else {
          const g = gifts.value.get(String(gift.id))
          if (!g) continue
          giftMap.set(String(gift.id), {
            num: gift.num,
            name: g.name,
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
        avatar: avatarURL(user?.avatar_id ?? 1),
        total: i.total,
        gifts: Array.from(giftMap.values()).sort((a, b) => b.point - a.point),
      }
    })
    return mapped
  }
  catch {
    return []
  }
})
</script>

<template>
  <div class="flex flex-col gap-3 md:gap-4">
    <MemberProfileBanner :sousenkyo="data.sousenkyo" :room-id="data.room_id" :member="data.room_info" />
    <div class="mx-3 md:mx-4 flex gap-3 md:gap-4 items-stretch [&>div]:flex-1 max-xl:flex-col">
      <div class="flex flex-col md:flex-row xl:flex-col gap-3 md:gap-4 flex-wrap">
        <InfoCard class="flex-1" icon-class="bg-red-500/20 text-red-500 dark:bg-red-300/20 dark:text-red-300" icon="material-symbols:calendar-today">
          <template #default>
            {{ $dayjs(data?.live_info?.date?.start).locale(locale).format('dddd, DD MMMM YYYY') }}
          </template>
          <template #title>
            {{ `${$dayjs(data?.live_info?.date?.start).locale(locale).format('hh:mm A')} - ${$dayjs(data?.live_info?.date?.end).locale(locale).format('hh:mm A')}` }}
          </template>
        </InfoCard>
        <InfoCard class="flex-1" icon-class="bg-yellow-500/20 text-yellow-500 dark:bg-yellow-300/20 dark:text-yellow-300" icon="material-symbols:auto-timer" :title="$t('duration')" :value="formatDuration(data.live_info?.duration ?? 0)" />
      </div>
      <div class="bg-container rounded-xl p-3 md:p-4">
        <div class="font-bold text-lg xl:text-xl mb-1">
          Detail
        </div>
        <table class="table-auto [&_td]:py-1 [&_td]:xl:py-1.5 text-sm xl:text-base [&_td:first-child]:min-w-[150px] [&_td:first-child]:xl:min-w-[200px] [&_td:first-child]:opacity-80 font-semibold dark:[&_td:first-child]:opacity-60">
          <tbody>
            <tr>
              <td>
                Gift
              </td>
              <td>
                <ParserGift :value="data.total_gifts ?? 0" :rate="data.gift_rate" :show-original="true" />
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
          </tbody>
        </table>
      </div>
    </div>

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
          <LazyLiveShowroomView
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
    <GiftInfo :gifts="data.live_info.gift.list" />
    <LiveGiftList :gifts="data.live_info.gift.list" class="mx-3 md:mx-4" type="showroom" />
    <HomeFans v-if="data.fans?.length" :data="data.fans" class="rounded-xl mx-3 md:mx-4" />

    <div class="mx-3 md:mx-4 overflow-hidden rounded-xl bg-white shadow-sm dark:bg-dark-1">
      <LiveGiftScroll :gift-rate="data.gift_rate || 107.1" type="showroom" :gifts="calculatedGift" :page-mode="true" :data-id="data.data_id" :has-next-page="data.live_info?.gift?.next_page" :gift-list="data?.live_info?.gift?.list ?? []" />
    </div>
  </div>
</template>
