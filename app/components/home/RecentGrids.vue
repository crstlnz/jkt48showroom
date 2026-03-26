<script lang="ts" setup>
import { useSettings } from '~/store/settings'

const settings = useSettings()
const { data, pending, tryRefresh } = useCachedFetch<IApiRecents>('/api/recent', {
  params: {
    group: settings.group,
    type: 'all',
  },
  expireIn: 600000,
})

const { onFocus } = useUserFocus({
  time: 30000,
  idleTime: 30000,
})

onFocus(() => {
  tryRefresh()
})
const { locale } = useI18n()
</script>

<template>
  <HomeSectionContainer
    :title="$t('page.title.recent')"
    icon="ic:round-history"
    icon-color="bg-gray-500/15 text-gray-500"
  >
    <template #right>
      <MoreButton to="/recent" />
    </template>

    <div v-if="(pending && !data)" key="loading" class="grid grid-cols-1 grid-rows-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 animate-pulse">
      <div v-for="key in 6" :key="key" class="bg-container flex gap-3 rounded-xl p-4 max-sm:nth-[n+4]:hidden max-xl:nth-[n+5]:hidden">
        <div class="aspect-96/135 w-24 2xl:w-28" />
      </div>
    </div>
    <div
      v-else-if="data?.recents"
      key="hasdata"
      class="grid grid-cols-1 grid-rows-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      <div v-for="recent in data.recents.slice(0, 6)" :key="recent.data_id" class="bg-container flex gap-2.5 rounded-xl p-3.5 max-sm:nth-[n+4]:hidden max-xl:nth-[n+5]:hidden">
        <NuxtLink :to="`/member/${recent.member.url}`" class="aspect-96/135 relative group overflow-hidden rounded-xl w-24 2xl:w-28">
          <Image v-if="recent.type === 'idn'" alt="IDN Logo" :src="$idnLiveIcon" size="64px" class="absolute z-10 left-2 top-2 mt-1 h-4 md:h-4 w-12.75 object-contain" />
          <Image
            provider="cloudinary"
            :src="recent.member.img_alt ?? recent.member.img ?? $errorPicture"
            :alt="`${recent.member.name} profile picture`"
            sizes="96px 2xl:112px"
            fit="fill"
            format="webp"
            class="size-full -z-10 object-cover scale-[1.005] group-hover:scale-105 transition-transform duration-500"
          />
        </NuxtLink>
        <div class="flex flex-1 flex-col">
          <div class="min-w-0 flex-1">
            <NuxtLink :to="`/member/${recent.member.url}`" class="block line-clamp-2 text-base leading-5 font-semibold text-black/90 transition-colors hover:text-black dark:text-white/90 dark:hover:text-white md:text-lg md:leading-6">
              {{ (recent.member.nickname ?? recent.member.name).split("-")?.[0] }}
            </NuxtLink>
            <ul class="mt-2 space-y-1.5 text-xs text-black/62 dark:text-white/62 md:text-sm">
              <li v-if="recent.live_info.viewers?.num" class="flex min-w-0 items-center gap-2">
                <span class="flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-500/12 dark:bg-sky-400/14">
                  <Icon :name="recent.live_info.viewers?.is_excitement ? 'ic:round-star' : 'ph:users-bold'" class="text-xs text-sky-600 dark:text-sky-300" />
                </span>
                <span class="truncate">{{ $n(recent.live_info.viewers?.num) }}</span>
              </li>
              <li class="flex min-w-0 items-center gap-2">
                <span class="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500/12 dark:bg-amber-400/14">
                  <Icon name="bx:bxs-gift" class="text-xs text-amber-600 dark:text-amber-300" />
                </span>
                <div class="truncate">
                  {{ parseGift(recent.points, { rate: recent.gift_rate }) }}
                </div>
              </li>
              <li class="flex min-w-0 items-center gap-2">
                <span class="flex size-5 shrink-0 items-center justify-center rounded-full bg-rose-500/12 dark:bg-rose-400/14">
                  <Icon name="ph:clock-bold" class="text-xs text-rose-600 dark:text-rose-300" />
                </span>
                <div class="truncate">
                  {{ $dayjs(recent.live_info?.date?.end ? recent.live_info.date.end : recent.created_at).locale(locale).fromNow() }}
                </div>
              </li>
            </ul>
          </div>
          <MoreButton text="Details" :to="`/recent/${recent.data_id}`" class="self-end inline-flex items-center gap-1">
            <span class="text-sm!">Details</span>
            <Icon name="lucide:arrow-up-right" class="text-[11px]" />
          </MoreButton>
        </div>
      </div>
    </div>
    <div v-else key="nodata" class="bg-container rounded-xl p-4 w-full">
      <div class="space-y-4 overflow-hidden py-4 text-center dark:bg-dark-1">
        <Image
          :src="`${$imgCDN}/assets/svg/web/no_data.svg`"
          alt="Empty"
          class="mx-auto aspect-square w-50 max-w-[80%] dark:brightness-110"
        />
        <div class="text-base">
          Sorry, but there is no recents right now :(
        </div>
      </div>
    </div>
  </HomeSectionContainer>
</template>
