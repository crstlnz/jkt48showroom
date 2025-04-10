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
  <div class="space-y-3 px-3 md:px-4">
    <div class="flex gap-1 items-center">
      <Icon name="ic:round-history" class="self-center text-xl sm:text-2xl" />
      <h2 class="flex-1 text-xl font-bold leading-10 sm:text-2xl">
        {{ $t("page.title.recent") }}
      </h2>
      <NuxtLink to="/recent">
        {{ $t("more") }}
      </NuxtLink>
    </div>
    <div v-if="(pending && !data)" key="loading" class="grid grid-cols-1 grid-rows-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 animate-pulse">
      <div v-for="key in 6" :key="key" class="bg-container flex gap-3 rounded-xl p-3 md:p-4 max-sm:nth-[n+4]:hidden max-xl:nth-[n+5]:hidden">
        <div class="aspect-96/135 w-24 2xl:w-28" />
      </div>
    </div>
    <div
      v-else-if="data?.recents"
      key="hasdata"
      class="grid grid-cols-1 grid-rows-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      <div v-for="recent in data.recents.slice(0, 6)" :key="recent.data_id" class="bg-container flex gap-3 rounded-xl p-3 md:p-4 max-sm:nth-[n+4]:hidden max-xl:nth-[n+5]:hidden">
        <NuxtLink :to="`/member/${recent.member.url}`" class="aspect-96/135 relative group overflow-hidden rounded-xl w-24 2xl:w-28">
          <NuxtImg v-if="recent.type === 'idn'" alt="IDN Logo" :src="$idnLiveIcon" size="64px" class="absolute z-10 left-2 top-2 mt-[4px] h-4 md:h-4 object-contain max-w-[90px]" />
          <NuxtImg
            provider="cloudinary"
            :src="recent.member.img_alt ?? recent.member.img ?? $errorPicture"
            :alt="`${recent.member.name} profile picture`"
            sizes="96px 2xl:112px"
            fit="fill"
            format="webp"
            class="size-full -z-10 object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </NuxtLink>
        <div class="flex flex-1 flex-col">
          <div class="flex-1">
            <NuxtLink :to="`/member/${recent.member.url}`" class="text-lg line-clamp-2 leading-6">
              {{ (recent.member.nickname ?? recent.member.name).split("-")?.[0] }}
            </NuxtLink>
            <ul class="mt-1 space-y-1 text-xs md:text-sm [&>li]:flex [&>li]:gap-1">
              <li v-if="recent.live_info.viewers?.num">
                <Icon :name="recent.live_info.viewers?.is_excitement ? 'ic:round-star' : 'ph:users-bold'" class="self-center text-sm md:text-base" />
                {{ $n(recent.live_info.viewers?.num) }}
              </li>
              <li>
                <Icon name="bx:bxs-gift" class="self-center text-sm md:text-base" />
                <div>
                  {{ parseGift(recent.points, { rate: recent.gift_rate }) }}
                </div>
              </li>
              <li>
                <Icon name="ph:clock-bold" class="self-center text-sm md:text-base" />
                <div>
                  {{ $dayjs(recent.live_info?.date?.end ? recent.live_info.date.end : recent.created_at).locale(locale).fromNow() }}
                </div>
              </li>
            </ul>
          </div>
          <NuxtLink no-prefetch :to="`/recent/${recent.data_id}`" class="text-right">
            Details
          </NuxtLink>
        </div>
      </div>
    </div>
    <div v-else key="nodata" class="bg-container rounded-xl p-3 md:p-4 w-full">
      <div class="space-y-4 overflow-hidden py-4 text-center dark:bg-dark-1">
        <NuxtImg
          :src="`${$cloudinaryURL}/assets/svg/web/no_data.svg`"
          alt="Empty"
          class="mx-auto aspect-square w-[200px] max-w-[80%] dark:brightness-110"
        />
        <div class="text-base">
          Sorry, but there is no recents right now :(
        </div>
      </div>
    </div>
  </div>
</template>
