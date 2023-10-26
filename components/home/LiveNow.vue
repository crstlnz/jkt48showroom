<script lang="ts" setup>
import { useOnLives } from '~/store/onLives'

const onLives = useOnLives()
const { data, pending, error } = storeToRefs(onLives)
</script>

<template>
  <div class="mt-3 flex items-center justify-between px-3 md:px-4">
    <div class="flex gap-1">
      <div class="relative aspect-square w-6">
        <div
          v-if="!data?.length"
          class="absolute left-1/2 top-1/2 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-500"
        >
          <div class="aspect-square w-full rounded-full" />
        </div>
        <div v-else class="absolute left-1/2 top-1/2 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500">
          <div class="aspect-square w-full rounded-full" />
          <div class="absolute top-0 aspect-square w-full animate-ping rounded-full bg-red-500" />
        </div>
      </div>
      <h2 class="relative text-xl font-bold leading-10 sm:text-2xl">
        Live
      </h2>
    </div>
    <div v-if="pending && data == null" key="loading">
      <div class="pulse-color h-4 w-20 animate-pulse rounded-xl md:h-5" />
    </div>
    <div v-else key="data" class="text-xs opacity-60 md:text-sm">
      {{ data?.length ?? 0 }}
      {{ $t("member", data?.length ?? 0) }}
    </div>
  </div>
  <div class="px-3 md:px-4">
    <div
      v-if="error"
      class="bg-container flex w-full flex-col items-center justify-center gap-2 rounded-xl pb-5 text-xs shadow-sm md:gap-3 md:text-sm xl:gap-5 xl:pb-8 xl:pt-2"
    >
      <img class="aspect-square w-72 max-w-[70%]" :src="`${$cloudinaryURL}/assets/svg/web/error.svg`">
      {{ $t("data.failed") }}
    </div>
    <div
      v-else-if="pending && data == null"
      class="bg-container grid-live-now gap-4 rounded-xl p-4"
    >
      <PulseLiveCard />
    </div>
    <div
      v-else-if="data?.length"
      class="bg-container grid-live-now gap-4 rounded-xl p-4"
    >
      <MemberLiveCard
        v-for="live in data.values()"
        :key="live.room_id"
        class="bg-background"
        :live="live"
      />
    </div>
    <div
      v-else
      class="bg-container flex w-full flex-col items-center justify-center rounded-xl px-4 shadow-sm"
    >
      <div class="flex h-[245.5px] flex-col items-center justify-center gap-2 text-center text-xs max-sm:aspect-square sm:h-[230.88px] md:h-[250px] md:gap-3 md:text-sm lg:h-[270.55px] xl:h-[349.2px] 2xl:h-[318px]">
        <img class="mx-auto w-72 max-w-[80%] aspect-[5/4]" alt="No member onlive" :src="`${$cloudinaryURL}/assets/svg/web/space.svg`">
        <span class="mt-5">{{ $t("nolive") }}</span>
      </div>
    </div>
  </div>
</template>
