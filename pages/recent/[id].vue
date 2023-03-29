<script lang="ts" setup>
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import c from '~~/app.config'
import { LazyImage } from '#components'
const { $duration, $long } = useNuxtApp()
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

const dateStart = $long(data.value?.live_info?.date.start)
const dateEnd = $long(data.value?.live_info?.date.end)

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
        id: user?.id ?? i.user_id ?? (Math.floor(Math.random() * 500) + Math.floor(Math.random() * 10) + 1),
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

useHead({
  title: `${data.value?.room_info?.name} Log`
})
</script>

<template>
  <div class="px-3 pt-4 md:pt-6 xl:pt-8">
    <Error v-if="error" message="Something Error!" img-src="/svg/error.svg" />
    <div v-else class="flex flex-col justify-end gap-3 md:gap-4 md:p-0">
      <div
        class="relative flex flex-col gap-3 rounded-xl p-4 max-lg:bg-white max-lg:dark:bg-dark-1 lg:flex-row lg:items-end lg:p-0"
      >
        <LazyImage
          class="box-border aspect-video w-full rounded-xl border-2 border-gray-50 dark:border-none lg:h-48 lg:w-auto"
          :src="data?.room_info.img ?? ''"
          :alt="data?.room_info.name + ' Display Picture'"
        />

        <div class="flex flex-1 flex-row gap-2 md:gap-2.5 lg:flex-row-reverse lg:gap-3">
          <div
            class="bottom-0 right-2 h-fit w-fit overflow-hidden rounded-xl text-xs font-bold text-white shadow-sm md:text-sm lg:text-base [&>div]:px-3 [&>div]:py-1.5"
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
          <h2 class="flex-1 truncate text-lg font-bold md:text-xl lg:text-2xl">
            {{ data?.room_info.name }}
          </h2>
        </div>
      </div>
      <div class="space-y-3 rounded-xl bg-white p-4 dark:bg-dark-1 md:space-y-4">
        <div
          class="flex-1 justify-between space-y-3 rounded-xl border-4 border-slate-200/60 bg-slate-50 p-3 dark:border-dark-3/40 dark:bg-dark-2/30 md:space-y-4 lg:flex lg:space-y-0 lg:overflow-hidden lg:border-none lg:!bg-transparent lg:p-0"
        >
          <div
            class="flex flex-1 items-center gap-2 rounded-xl text-center lg:flex-row lg:gap-0 lg:rounded-none lg:text-left"
          >
            <div
              class="min-w-[75px] truncate text-left text-sm lg:w-[110px] lg:p-4 lg:text-center lg:text-base lg:font-semibold"
            >
              {{ $t("date.start") }}
            </div>
            <div
              class="flex-1 rounded-md text-left text-sm font-semibold md:text-base lg:rounded-r-none lg:rounded-l-md lg:bg-slate-100/80 lg:py-2.5 lg:px-4 lg:font-normal lg:dark:bg-dark-2/80"
            >
              {{ dateStart ?? $t('data.nodata') }}
            </div>
          </div>
          <div
            class="flex flex-1 items-center gap-2 rounded-xl text-center lg:flex-row-reverse lg:gap-0 lg:rounded-none"
          >
            <div
              class="min-w-[75px] truncate text-left text-sm lg:w-[110px] lg:p-4 lg:text-center lg:text-base lg:font-semibold"
            >
              {{ $t("date.end") }}
            </div>
            <div
              class="flex-1 rounded-md text-left text-sm font-semibold md:text-base lg:rounded-l-none lg:rounded-r-md lg:bg-slate-100/80 lg:py-2.5 lg:px-4 lg:text-right lg:font-normal lg:dark:bg-dark-2/80"
            >
              {{ dateEnd ?? $t('data.nodata') }}
            </div>
          </div>
        </div>
        <div
          class="grid grid-cols-1 gap-3 text-base md:gap-4 md:text-lg lg:auto-cols-fr lg:grid-flow-col lg:text-xl [&>div]:flex-1 [&>div]:rounded-xl [&>div]:border-4 [&>div]:border-slate-200/60 [&>div]:bg-slate-50 [&>div]:p-3 [&>div]:text-center dark:[&>div]:border-dark-3/40 dark:[&>div]:bg-dark-2/30 md:[&>div]:p-3.5 lg:[&>div]:p-4"
        >
          <div class="shadow-sm">
            <div class="mb-1.5 font-semibold">
              {{ duration }}
            </div>
            <div class="flex items-center justify-center gap-1">
              <Icon name="ph:timer-fill" />{{ $t("duration") }}
            </div>
          </div>
          <div v-if="data?.live_info?.viewer?.peak" class="shadow-sm">
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
          <div v-if="data?.live_info?.comments" class="shadow-sm">
            <div class="mb-1.5 font-semibold" :title="`${data.live_info.comments.num} ${$t('totalcomments')}`">
              {{ data?.live_info?.comments.num }}
              (<div class="inline-flex items-center justify-center gap-0.5" :title="`${data.live_info.comments.users} ${$t('user',data.live_info.comments.users )}`">
                {{ data.live_info.comments.users }}
                <Icon title="Users" name="carbon:user-avatar-filled" class="h-6" />)
              </div>
            </div>
            <div class="flex items-center justify-center gap-1">
              <Icon name="ph:chat-circle-dots-fill" />{{ $t("totalcomments") }}
            </div>
          </div>
        </div>
      </div>

      <HomeFans v-if="data?.fans?.length" :data="data?.fans" />

      <!-- <div class="rounded-xl bg-white p-4 shadow-sm dark:bg-dark-1 md:p-5">
        <div class="text-lg font-bold">
          {{ $t('giftlist') }}
        </div>
        <div />
      </div> -->

      <div class="relative flex w-full flex-col gap-3 md:flex-row md:gap-4">
        <div
          class="pulse-color aspect-[16/13] flex-1 overflow-hidden rounded-xl shadow-sm lg:w-auto xl:aspect-[16/10.5]"
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
              <div class="pulse-color h-full w-full animate-pulse overflow-hidden" />
            </template>
          </ClientOnly>
          <div v-else class="flex h-full w-full items-center justify-center bg-zinc-600 text-3xl font-bold text-white">
            No data
          </div>
        </div>
        <div class="relative min-h-[350px] w-full rounded-xl bg-white shadow-sm dark:bg-dark-1 md:h-auto md:w-[300px] lg:w-[380px]">
          <div class="z-0 overflow-hidden rounded-xl md:absolute md:inset-0">
            <ClientOnly>
              <template #fallback>
                <div
                  class="-z-10 border-b-2 border-slate-100/60 bg-white/90 p-4 text-xl font-bold backdrop-blur-sm dark:border-dark-2/60 dark:bg-dark-1/90 md:p-5"
                >
                  {{ $t("fansgift") }}
                </div>
                <div class="mt-8 flex w-full items-center justify-center md:mt-9 lg:mt-10">
                  <Spinner class="h-8 w-8 md:h-9 md:w-9" />
                </div>
              </template>
              <GiftScroll :gifts="calculatedGift" :page-mode="isMobileSize" />
            </ClientOnly>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
