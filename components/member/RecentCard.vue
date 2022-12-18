<template>
  <div class="rounded-xl bg-white dark:bg-dark-1 p-3 md:p-4 shadow-sm">
    <div class="flex gap-3 md:gap-4">
      <NuxtLink
        aria-label="View profile"
        class="h-20 sm:h-24 md:h-28 lg:h-32 xl:h-36 relative group aspect-video text-white drop-shadow-sm font-bold flex justify-center items-center gap-0.5 overflow-hidden rounded-xl"
        to="/"
      >
        <img
          lazy="false"
          class="group-hover:brightness-50 brightness-[98%] relative cursor-pointer transition-all duration-200 w-full h-full bg-slate-200 dark:bg-dark-3 text-xs md:text-sm lg:text-base"
          :alt="recent.member?.name + 'Display Picture'"
          :src="$fixCloudinary(recent.member?.img_alt ?? '')"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8 inline-block top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 invisible opacity-0 absolute group-hover:opacity-100 group-hover:visible"
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
      <div class="flex-1 w-0 space-y-2 flex flex-col justify-between">
        <h2 class="font-bold text-base md:text-lg lg:text-xl truncate">
          {{ recent.member?.name }}
        </h2>
        <ul class="space-y-1 [&>li]:flex [&>li]:gap-2 text-xs md:text-sm lg:text-base">
          <li class="flex items-center">
            <Icon name="bx:bxs-gift" class="bg-yellow-500 text-white rounded-full w-auto h-5 lg:h-6 p-1" />
            <div class="inline-block align-baseline">{{ $currency(recent.points) }}</div>
          </li>
          <li v-if="recent.live_info?.viewers != null" class="flex items-center">
            <Icon name="mingcute:user-2-fill" class="bg-sky-500 text-white rounded-full w-auto h-5 lg:h-6 p-1" />
            <div>{{ $n(recent.live_info?.viewers) + " " + $t("viewer", recent.live_info?.viewers) }}</div>
          </li>
        </ul>
      </div>
    </div>

    <div class="flex justify-between mt-2 md:mt-2.5 text-sm sm:text-base md:text-lg">
      <div>
        {{ date }}
      </div>
      <a :href="`/recent/${recent.data_id}`" target="_blank" class="font-bold">Details</a>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  recent: IRecent;
}>();
const { $fromNow } = useNuxtApp();
const date = $fromNow(props.recent.live_info?.date?.end);
</script>
