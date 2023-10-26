<script lang="ts" setup>
import { useSettings } from '~/store/settings'

const settings = useSettings()
const { data, pending, refresh } = useFetch('/api/showroom/recent', {
  query: {
    group: settings.group,
  },
  server: false,
})

const { onFocus } = useUserFocus({
  time: 30000,
  idleTime: 30000,
})

onFocus(() => {
  refresh()
})

// const { $fromNow } = useNuxtApp()
// const date = $fromNow(
//   data.value.recent.live_info?.date?.end
//     ? props.recent.live_info.date.end
//     : props.recent.created_at,
// )
const { locale } = useI18n()
const dayjs = useDayjs()
</script>

<template>
  <div class="space-y-3 px-3 md:px-4">
    <div class="flex gap-1">
      <Icon name="ic:round-history" class="self-center text-xl sm:text-2xl" />
      <h2 class="flex-1 text-xl font-bold leading-10 sm:text-2xl">
        {{ $t("page.title.recent") }}
      </h2>
      <NuxtLink to="/recent">
        {{ $t("more") }}
      </NuxtLink>
    </div>
    <div v-if="(pending && !data)" class="bg-container rounded-xl p-3 md:p-4">
      <PulseRecentCard v-for="key in 8" :key="key" />
    </div>
    <div v-else>
      <div
        v-if="data?.recents"
        class="grid grid-cols-1 grid-rows-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <div v-for="recent in data.recents.slice(0, 6)" :key="recent.data_id" class="bg-container flex gap-3 rounded-xl p-3 md:p-4">
          <div>
            <img :src="$fixCloudinary(recent.member.img_alt ?? recent.member.img, 's--w61MLFXK--/t_180_fill')" alt="" class="aspect-[96/135] w-24 rounded-xl object-cover 2xl:w-28">
          </div>
          <div class="flex flex-1 flex-col">
            <div class="flex-1">
              <div class="text-lg">
                {{ recent.member.nickname ?? recent.member.name }}
              </div>
              <ul class="mt-1 space-y-1 text-xs md:text-sm [&>li]:flex [&>li]:gap-1">
                <li v-if="recent.live_info.viewers?.num">
                  <Icon :name="recent.live_info.viewers?.is_excitement ? 'ic:round-star' : 'ph:users-bold'" class="self-center text-sm md:text-base" />
                  {{ $n(recent.live_info.viewers?.num) }}
                </li>
                <li>
                  <Icon name="bx:bxs-gift" class="self-center text-sm md:text-base" />
                  <div>
                    {{ $n(recent.points) }}
                  </div>
                </li>
                <li>
                  <Icon name="ph:clock-bold" class="self-center text-sm md:text-base" />
                  <div>
                    {{ dayjs(recent.live_info?.date?.end ? recent.live_info.date.end : recent.created_at).locale(locale).fromNow() }}
                  </div>
                </li>
              </ul>
            </div>
            <NuxtLink :to="`recent/${recent.data_id}`" class="text-right">
              Details
            </NuxtLink>
          </div>
        </div>
      </div>
      <div v-else class="bg-container rounded-xl p-3 md:p-4">
        <div class="space-y-4 overflow-hidden py-4 text-center dark:bg-dark-1">
          <img
            :src="`${$cloudinaryURL}/assets/svg/web/no_data.svg`"
            alt="Empty"
            class="mx-auto aspect-square w-[200px] max-w-[80%] dark:brightness-110"
          >
          <div class="text-base">
            Sorry, but there is no recents right now :(
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
