<template>
  <div class="text-center py-2 md:py-3 flex gap-3">
    <NuxtLink class="h-20 aspect-square relative cursor-pointer drop-shadow-sm rounded-full overflow-hidden" to="/">
      <LazyImage lazy="false" class="w-full h-full" :src="$fixCloudinary(recent.member?.img)" />
    </NuxtLink>

    <div class="info text-left flex flex-col flex-1 w-0">
      <div class="name flex flex-1 gap-2">
        <h3 class="font-bold text-ellipsis whitespace-nowrap overflow-hidden flex-1" :title="recent.member?.name">
          {{ recent.member?.name }}
        </h3>
        <div
          v-if="recent.member?.is_graduate"
          class="graduated w-6 h-6 p-[3px] text-white bg-red-500 rounded-full"
          title="Graduated"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-full w-full"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path
              d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
            />
          </svg>
        </div>
      </div>
      <ul class="mt-1 space-y-1 [&>li]:flex [&>li]:gap-1.5 text-sm">
        <li v-if="recent.live_info?.viewers">
          <i class="i ph:users-bold"></i>
          {{ $util.numberFormat(recent.live_info.viewers) }}
        </li>
        <li>
          <i class="i ph:clock-bold"></i>
          {{
            $time.fromNow(
              recent.live_info && recent.live_info?.date?.end ? recent.live_info.date.end : recent.created_at
            )
          }}
        </li>
      </ul>
      <div class="mt-2 pt-2 border-t-2 border-t-gray-50 dark:border-t-dark-2 flex justify-end">
        <ul>
          <li><a :href="`/recent/${recent.data_id}`" target="_blank">Detail</a></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { LazyImage } from "#components";
defineProps<{
  recent: IRecent;
}>();
</script>
