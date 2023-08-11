<script lang="ts" setup>
const props = withDefaults(defineProps<{
  recent: IRecent
  showDuration?: boolean
}>(), {
  showDuration: false,
  detailedDate: false,
})

const dayjs = useDayjs()
const showDetailedDate = computed(() => {
  const oneMonthAgo = new Date()
  oneMonthAgo.setDate(0)
  return new Date(props.recent.live_info?.date?.start) > oneMonthAgo
})
const { locale } = useI18n()
</script>

<template>
  <div class="bg-container rounded-xl p-3 shadow-sm md:p-4">
    <div class="flex gap-3 md:gap-4">
      <NuxtLink
        :aria-label="`${recent.member?.name} Live detail`"
        class="group relative flex aspect-video h-20 items-center justify-center gap-0.5 overflow-hidden rounded-xl font-bold text-white drop-shadow-sm sm:h-24 md:h-28 lg:h-32 xl:h-36"
        :to="`/recent/${recent.data_id}`"
      >
        <img
          :key="recent.room_id"
          lazy="false"
          class="relative h-full w-full cursor-pointer bg-slate-200 object-cover text-xs transition-all duration-200 group-hover:brightness-50 dark:bg-dark-3 md:text-sm lg:text-base"
          :alt="`${recent.member?.name}Display Picture`"
          :src="recent.member?.img ?? ''"
        >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="invisible absolute left-1/2 top-1/2 inline-block h-8 w-8 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:visible group-hover:opacity-100"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </NuxtLink>
      <div class="flex min-w-0 flex-1 flex-col space-y-2">
        <div class="truncate">
          <NuxtLink :to="`/member/${recent.member.url}`" :aria-label="`Open ${recent.member.name} profile`" class="text-base font-bold md:text-lg lg:text-xl">
            {{ recent.member?.nickname || recent.member?.name }}
          </NuxtLink>
        </div>
        <ul class="space-y-1 text-xs md:text-sm lg:text-base [&>li]:flex [&>li]:gap-2">
          <li class="flex items-center">
            <Icon name="bx:bxs-gift" class="h-5 w-auto rounded-full bg-amber-500 p-1 text-white lg:h-6" />
            <div class="inline-block align-baseline">
              {{ $currency(recent.points) }}
            </div>
          </li>
          <li v-if="recent.live_info?.viewers != null" class="flex items-center">
            <Icon name="mingcute:user-2-fill" class="h-5 w-auto rounded-full bg-blue-500 p-1 text-white lg:h-6" />
            <div>
              {{ recent.live_info?.viewers ? `${$n(recent.live_info?.viewers ?? 0)} ${$t("viewer", recent.live_info?.viewers ?? 0)}` : $t('data.nodata') }}
            </div>
          </li>
          <li class="flex items-center">
            <Icon name="ph:clock-countdown-bold" class="h-5 w-auto rounded-full bg-red-500 p-1 text-white lg:h-6" />
            <Parser parse-type="duration" :value="recent.live_info.duration" class="inline-block align-baseline" />
          </li>
        </ul>
      </div>
    </div>

    <div class="mt-2 flex justify-between text-sm sm:text-base md:mt-2.5 md:text-lg">
      <div class="group flex cursor-pointer items-center gap-1.5">
        <Icon name="ph:clock-bold" />
        <div v-if="showDetailedDate">
          <div :key="recent.data_id" class="group-hover:hidden">
            {{ dayjs(recent.live_info?.date?.end).locale(locale).fromNow() }}
          </div>
          <div class="hidden group-hover:block">
            {{ $d(new Date(props.recent.live_info?.date?.start), 'long') }}
          </div>
        </div>
        <div v-else>
          {{ $d(new Date(props.recent.live_info?.date?.start), 'long') }}
        </div>
      </div>
      <NuxtLink :to="`/recent/${recent.data_id}`" aria-label="Detailed log data" class="font-bold">
        Details
      </NuxtLink>
    </div>
  </div>
</template>
