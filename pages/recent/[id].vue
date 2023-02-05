<script lang="ts" setup>
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import c from '~~/app.config'
import { LazyImage } from '#components'
const { $duration } = useNuxtApp()
const config = useRuntimeConfig()
const route = useRoute()
const { data, error } = await useFetch(`/api/showroom/recent/${route.params.id}`, {
  baseURL: config.public.baseURL
})

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobileSize = breakpoints.smallerOrEqual('md')

const duration = $duration(
  new Date(data.value?.live_info.date.end ?? 0),
  new Date(data.value?.live_info.date.start ?? 0)
)

if (!data?.value) { throw createError({ statusCode: 404, statusMessage: 'Data not found!' }) }

const users = computed<Map<number, IFansCompact>>(() => {
  const users = new Map<number, IFansCompact>()
  if (!data?.value?.users) { return users }
  const u = data?.value?.users
  for (const user of u) {
    users.set(user.id, user)
  }
  return users
})

const gifts = computed<Map<number, IGiftImg>>(() => {
  const gifts = new Map<number, IGiftImg>()
  if (!data?.value?.live_info?.gift) { return gifts }
  const g = data?.value?.live_info.gift.list
  for (const gift of g) {
    gifts.set(gift.id, {
      id: gift.id,
      free: gift.free,
      point: gift.point,
      img: c.giftUrl(gift?.id ?? 0)
    })
  }
  return gifts
})

const calculatedGift = computed<IFansGift[]>(() => {
  try {
    if (!data?.value?.live_info?.gift?.log) { return [] }
    const log = data?.value.live_info.gift.log
    const mapped = log.map<IFansGift>((i) => {
      const user = users.value.get(i.user_id)
      const giftMap = new Map<number, IGifts>()
      for (const gift of i.gifts) {
        if (giftMap.has(gift.id)) {
          const g = giftMap.get(gift.id)
          if (g) { g.num += gift.num }
        } else {
          const g = gifts.value.get(gift.id)
          if (!g) { continue }
          giftMap.set(gift.id, {
            num: gift.num,
            id: g.id,
            free: g.free,
            point: g.point,
            img: g.img,
            date: gift.date
          })
        }
      }
      return {
        name: user?.name ?? 'User not Found!',
        id: user?.id ?? 0,
        avatar: c.avatarURL(user?.avatar_id ?? 1),
        avatar_id: user?.avatar_id ?? 1,
        total: i.total,
        gifts: Array.from(giftMap.values()).sort((a, b) => b.point - a.point)
      }
    })
    return mapped
  } catch (e) {
    return []
  }
})
</script>

<template>
  <div class="pt-4 md:pt-6 xl:pt-8">
    <Error v-if="error" message="Something Error!" img-src="/svg/error.svg" />
    <div v-else class="flex flex-col gap-3 md:gap-4 p-1 md:p-0 justify-end">
      <div
        class="flex flex-col lg:flex-row rounded-xl gap-3 relative p-4 lg:p-0 max-lg:bg-white max-lg:dark:bg-dark-1 lg:items-end"
      >
        <LazyImage
          class="rounded-xl w-full lg:w-auto lg:h-48 aspect-video border-gray-50 box-border border-2 dark:border-none"
          :src="data?.room_info.img ?? ''"
          :alt="data?.room_info.name + ' Display Picture'"
        />

        <div class="flex gap-2 md:gap-2.5 lg:gap-3 flex-row flex-1 lg:flex-row-reverse">
          <div
            class="bottom-0 right-2 shadow-sm rounded-xl w-fit h-fit text-white font-bold [&>div]:px-3 [&>div]:py-1.5 overflow-hidden text-xs md:text-sm lg:text-base"
          >
            <div v-if="data?.room_info.is_group" class="bg-sky-400">
              Official
            </div>
            <div v-else-if="data?.room_info.is_graduate" class="bg-red-500">
              Graduated
            </div>
            <div v-else class="bg-green-500">
              Active
            </div>
          </div>
          <h2 class="font-bold text-lg md:text-xl lg:text-2xl flex-1 truncate">
            {{ data?.room_info.name }}
          </h2>
        </div>
      </div>
      <div class="p-4 bg-white dark:bg-dark-1 rounded-xl space-y-3 md:space-y-4">
        <div
          class="p-3 lg:p-0 lg:overflow-hidden justify-between lg:flex space-y-3 md:space-y-4 lg:space-y-0 bg-slate-50 dark:bg-dark-2/30 lg:!bg-transparent flex-1 rounded-xl border-4 border-slate-200/60 dark:border-dark-3/40 lg:border-none"
        >
          <div
            class="flex lg:flex-row items-center flex-1 rounded-xl lg:rounded-none text-center lg:text-left gap-2 lg:gap-0"
          >
            <div
              class="truncate lg:p-4 lg:font-semibold min-w-[75px] lg:w-[110px] text-left lg:text-center text-sm lg:text-base"
            >
              {{ $t("date.start") }}
            </div>
            <div
              class="lg:bg-slate-100/80 lg:dark:bg-dark-2/80 flex-1 lg:py-2.5 lg:px-4 rounded-md lg:rounded-r-none lg:rounded-l-md text-sm md:text-base font-semibold lg:font-normal text-left"
            >
              {{ data?.live_info.date ? $d(new Date(data?.live_info.date.start), "long") : $t("data.nodata") }}
            </div>
          </div>
          <div
            class="flex lg:flex-row-reverse text-center items-center flex-1 rounded-xl lg:rounded-none gap-2 lg:gap-0"
          >
            <div
              class="truncate lg:p-4 lg:font-semibold min-w-[75px] lg:w-[110px] text-left lg:text-center text-sm lg:text-base"
            >
              {{ $t("date.end") }}
            </div>
            <div
              class="lg:bg-slate-100/80 lg:dark:bg-dark-2/80 flex-1 lg:py-2.5 lg:px-4 rounded-md lg:rounded-l-none lg:rounded-r-md lg:text-right text-sm md:text-base font-semibold lg:font-normal text-left"
            >
              {{ data?.live_info.date ? $d(new Date(data?.live_info.date.end), "long") : $t("data.nodata") }}
            </div>
          </div>
        </div>
        <div
          class="text-base md:text-lg lg:text-xl grid grid-cols-1 lg:grid-flow-col lg:auto-cols-fr gap-3 md:gap-4 [&>div]:border-4 [&>div]:border-slate-200/60 dark:[&>div]:border-dark-3/40 [&>div]:flex-1 [&>div]:bg-slate-50 dark:[&>div]:bg-dark-2/30 [&>div]:rounded-xl [&>div]:p-3 md:[&>div]:p-3.5 lg:[&>div]:p-4 [&>div]:text-center"
        >
          <div class="shadow-sm">
            <div class="mb-1.5 font-semibold">
              {{ duration }}
            </div>
            <div class="flex items-center justify-center gap-1">
              <Icon name="ph:timer-fill" />{{ $t("duration") }}
            </div>
          </div>
          <div v-if="data?.live_info?.viewer" class="shadow-sm">
            <div class="mb-1.5 font-semibold">
              {{ $n(data?.live_info?.viewer?.peak) }}
            </div>
            <div class="flex items-center justify-center gap-1">
              <Icon name="ph:users-fill" /> {{ $t("viewer") }}
            </div>
          </div>
          <div class="shadow-sm">
            <div class="mb-1.5 font-semibold">
              {{ $currency(data?.total_point ?? 0) }}
            </div>
            <div class="flex items-center justify-center gap-1">
              <Icon name="bx:bxs-gift" />{{ $t("totalgift") }}
            </div>
          </div>
        </div>
      </div>

      <HomeFans v-if="data?.fans?.length" :data="data?.fans" />
      <div class="w-full relative flex gap-3 md:gap-4 flex-col md:flex-row">
        <div
          class="flex-1 lg:w-auto overflow-hidden aspect-[16/13] xl:aspect-[16/10.5] pulse-color rounded-xl shadow-sm"
        >
          <ClientOnly v-if="data?.live_info?.stage_list?.length">
            <ShowroomView
              :member-image="data?.room_info?.img"
              :date="data?.live_info?.date"
              :background="
                data?.live_info?.background_image ??
                  'https://image.showroom-cdn.com/showroom-prod/assets/img/room/background/default.png'
              "
              :screenshot="data?.live_info?.screenshot"
              :live-info="data?.live_info"
              :stage-list="data?.live_info.stage_list"
              :users="users"
              :gift-data="data?.live_info.gift"
            />
            <template #fallback>
              <div class="h-full w-full overflow-hidden pulse-color animate-pulse" />
            </template>
          </ClientOnly>
          <div v-else class="text-3xl font-bold w-full h-full flex items-center justify-center bg-zinc-600 text-white">
            No data
          </div>
        </div>
        <div class="relative w-full min-h-[350px] md:h-auto md:w-[300px] lg:w-[380px] rounded-xl bg-white dark:bg-dark-1 shadow-sm">
          <div class="md:absolute md:top-0 md:left-0 md:right-0 md:bottom-0 rounded-xl overflow-hidden z-0">
            <ClientOnly>
              <GiftScroll :gifts="calculatedGift" :page-mode="isMobileSize" />
            </ClientOnly>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
