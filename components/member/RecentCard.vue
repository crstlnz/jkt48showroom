<script lang="ts" setup>
const props = withDefaults(defineProps<{
  recent: IRecent;
  showDuration? : boolean
}>(), {
  showDuration: false
})
const { $fromNow, $duration } = useNuxtApp()
const date = $fromNow(props.recent.live_info?.date?.end)
const duration = $duration(props.recent.live_info.duration, true)
</script>

<template>
  <div class="rounded-xl bg-white p-3 shadow-sm dark:bg-dark-1 md:p-4">
    <div class="flex gap-3 md:gap-4">
      <NuxtLink
        aria-label="View profile"
        class="group relative flex aspect-video h-20 items-center justify-center gap-0.5 overflow-hidden rounded-xl font-bold text-white drop-shadow-sm sm:h-24 md:h-28 lg:h-32 xl:h-36"
        to="/"
      >
        <img
          lazy="false"
          class="relative h-full w-full cursor-pointer bg-slate-200 object-cover text-xs brightness-[98%] transition-all duration-200 group-hover:brightness-50 dark:bg-dark-3 md:text-sm lg:text-base"
          :alt="recent.member?.name + 'Display Picture'"
          :src="recent.member?.img ?? ''"
        >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="invisible absolute top-1/2 left-1/2 inline-block h-8 w-8 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:visible group-hover:opacity-100"
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
      <div class="flex w-0 flex-1 flex-col justify-between space-y-2">
        <a :href="`/recent/${recent.data_id}`" aria-label="Detailed log data">
          <h2 class="truncate text-base font-bold md:text-lg lg:text-xl">
            {{ recent.member?.name }}
          </h2>
        </a>
        <ul class="space-y-1 text-xs md:text-sm lg:text-base [&>li]:flex [&>li]:gap-2">
          <li class="flex items-center">
            <Icon name="bx:bxs-gift" class="h-5 w-auto rounded-full bg-yellow-500 p-1 text-white lg:h-6" />
            <div class="inline-block align-baseline">
              {{ $currency(recent.points) }}
            </div>
          </li>
          <li v-if="!(!showDuration && recent.live_info?.viewers == null)" class="flex items-center">
            <Icon :name="showDuration ? 'ph:clock-countdown-bold':'mingcute:user-2-fill'" class="h-5 w-auto rounded-full  p-1 text-white lg:h-6" :class="showDuration? 'bg-red-400':'bg-sky-500'" />
            <div v-if="!showDuration">
              {{ recent.live_info?.viewers ? $n(recent.live_info?.viewers ?? 0) + " " + $t("viewer", recent.live_info?.viewers ?? 0) : $t('data.nodata') }}
            </div>
            <div v-else>
              {{ duration }}
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div class="mt-2 flex justify-between text-sm sm:text-base md:mt-2.5 md:text-lg">
      <div class="group flex cursor-pointer items-center gap-1.5">
        <Icon name="ph:clock-bold" />
        <div class="group-hover:hidden">
          {{ date }}
        </div>
        <div class="hidden group-hover:block">
          {{ $d(new Date(props.recent.live_info?.date?.start),'long') }}
        </div>
      </div>
      <NuxtLink :to="`/recent/${recent.data_id}`" aria-label="Detailed log data" class="font-bold">
        Details
      </NuxtLink>
    </div>
  </div>
</template>
