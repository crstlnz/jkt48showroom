<script lang="ts" setup>
import { useOnLives } from '~/store/onLives'
const onLives = useOnLives()
const { data, pending, error } = storeToRefs(onLives)
</script>

<template>
  <div class="mt-2 flex items-center justify-between xl:mt-3">
    <div class="flex gap-1">
      <div class="relative aspect-square w-6">
        <ClientOnly>
          <div
            v-if="!data?.length"
            class="absolute top-1/2 left-1/2 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-500"
          >
            <div class="aspect-square w-full rounded-full" />
          </div>
          <div v-else class="absolute top-1/2 left-1/2 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500">
            <div class="aspect-square w-full rounded-full" />
            <div class="absolute top-0 aspect-square w-full animate-ping rounded-full bg-red-500" />
          </div>
          <template #fallback>
            <div class="absolute top-1/2 left-1/2 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-500">
              <div class="aspect-square w-full rounded-full" />
            </div>
          </template>
        </ClientOnly>
      </div>
      <h2 class="relative text-xl font-bold sm:text-2xl">
        Live
      </h2>
    </div>
    <ClientOnly>
      <div v-if="pending && data == null" key="loading">
        <div class="pulse-color h-4 w-20 animate-pulse rounded-xl md:h-5" />
      </div>
      <div v-else key="data" class="text-xs opacity-60 md:text-sm">
        {{ data?.length ?? 0 }}
        {{ $t("member", data?.length ?? 0) }}
      </div>
      <template #fallback>
        <div key="server" class="pulse-color h-4 w-20 animate-pulse rounded-xl md:h-5" />
      </template>
    </ClientOnly>
  </div>
  <ClientOnly>
    <div
      v-if="pending && data == null"
      class="grid-live-now gap-3 rounded-xl bg-white  p-3 shadow-sm dark:bg-dark-1 md:gap-4 md:p-4 xl:gap-6 xl:p-5"
    >
      <PulseLiveCard />
    </div>
    <div
      v-else-if="error"
      class="flex w-full flex-col items-center justify-center gap-2 rounded-xl bg-white pb-5 text-xs shadow-sm dark:bg-dark-1 md:gap-3 md:text-sm xl:gap-5 xl:pb-8 xl:pt-2"
    >
      <img class="aspect-square w-72 max-w-[70%]" src="/svg/error.svg">
      {{ $t("data.failed") }}
    </div>
    <div
      v-else-if="data?.length"
      class="grid-live-now gap-3 rounded-xl bg-white  p-3 shadow-sm dark:bg-dark-1 md:gap-4 md:p-4 xl:gap-6 xl:p-5"
    >
      <MemberLiveCard
        v-for="live in data.values()"
        :key="live.room_id"
        :live="live"
      />
    </div>
    <div
      v-else
      class="flex w-full flex-col items-center justify-center rounded-xl bg-white shadow-sm  dark:bg-dark-1"
    >
      <div class="flex flex-col justify-center gap-2 pb-6 text-center text-xs max-sm:aspect-square sm:h-[307.98px] md:h-[371.98px] md:gap-3 md:text-sm lg:h-[285.11px] xl:h-[353.59px] 2xl:h-[355.45px]">
        <img class="mx-auto aspect-square w-72 max-w-[80%]" alt="No member onlive" src="/svg/space.svg">
        {{ $t("nolive") }}
      </div>
    </div>
    <template #fallback>
      <div
        class="grid-live-now gap-3 rounded-xl bg-white  p-3 dark:bg-dark-1 md:gap-4 md:p-4 xl:gap-6 xl:p-5"
      >
        <PulseLiveCard />
      </div>
    </template>
  </ClientOnly>
</template>
