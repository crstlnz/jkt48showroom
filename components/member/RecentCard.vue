<template>
  <div class="rounded-xl bg-white dark:bg-dark-1 p-3 md:p-4 shadow-sm">
    <div class="flex gap-3 md:gap-4">
      <NuxtLink
        class="h-20 sm:h-24 md:h-28 lg:h-32 xl:h-36 relative group aspect-video text-white drop-shadow-sm font-bold flex justify-center items-center gap-0.5 overflow-hidden rounded-xl"
        to="/"
      >
        <LazyImage
          lazy="false"
          class="group-hover:brightness-50 brightness-[98%] relative cursor-pointer transition-all duration-200 w-full h-full"
          :alt="recent.member?.name + 'Display Picture'"
          :src="$fixCloudinary(recent.member?.img_alt)"
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
        <h3 class="font-bold text-lg md:text-xl truncate">
          {{ recent.member?.name }}
        </h3>
        <ul class="space-y-1 [&>li]:flex [&>li]:alig [&>li]:gap-2 text-sm md:text-base">
          <li>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-4 h-4 md:w-5 md:h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
            {{ $currency(recent.points) }}
            <!-- {{ $util.numberFormat(recent.points) + (recent.points > 1 ? " Points" : " Point") }} -->
          </li>
          <li v-if="recent.live_info?.viewers != null">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-4 h-4 md:w-5 md:h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
            {{
              $util.numberFormat(recent.live_info?.viewers) + (recent.live_info?.viewers > 1 ? " Viewers" : " Viewer")
            }}
          </li>
        </ul>
      </div>
    </div>

    <div class="flex justify-between mt-2 text-sm sm:text-base md:text-lg leading-none">
      <div>
        {{ $time.fromNow(recent.live_info?.date?.end) }}
      </div>
      <a :href="`/recent/${recent.data_id}`" target="_blank" class="font-bold">Details</a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { LazyImage } from "#components";
defineProps<{
  recent: IRecent;
}>();
</script>
