<script lang="ts" setup>
import { useOnLives } from '~/store/onLives'
const onLives = useOnLives()
const { data, pending, error } = storeToRefs(onLives)
</script>

<template>
  <div class="flex justify-between items-center mt-2 xl:mt-3">
    <div class="flex gap-1">
      <div class="w-6 relative aspect-square">
        <ClientOnly>
          <div
            v-if="!data?.length"
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full w-4 bg-gray-500"
          >
            <div class="w-full aspect-square rounded-full" />
          </div>
          <div v-else class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full w-3 bg-red-500">
            <div class="w-full aspect-square rounded-full" />
            <div class="absolute top-0 w-full aspect-square rounded-full bg-red-500 animate-ping" />
          </div>
          <template #fallback>
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full w-4 bg-gray-500">
              <div class="w-full aspect-square rounded-full" />
            </div>
          </template>
        </ClientOnly>
      </div>
      <h2 class="text-xl sm:text-2xl font-bold relative">
        Live
      </h2>
    </div>
    <ClientOnly>
      <div v-if="pending && data == null" key="loading">
        <div class="h-4 md:h-5 w-20 rounded-xl animate-pulse pulse-color" />
      </div>
      <div v-else key="data" class="text-xs md:text-sm opacity-60">
        {{ data?.length ?? 0 }}
        {{ $t("member", data?.length ?? 0) }}
      </div>
      <template #fallback>
        <div key="server" class="h-4 md:h-5 w-20 rounded-xl animate-pulse pulse-color" />
      </template>
    </ClientOnly>
  </div>
  <ClientOnly>
    <div
      v-if="pending && data == null"
      class="grid-live-now gap-3 md:gap-4 xl:gap-6  p-3 md:p-4 xl:p-5 bg-white dark:bg-dark-1 rounded-xl shadow-sm"
    >
      <PulseLiveCard />
    </div>
    <div
      v-else-if="error"
      class="flex flex-col justify-center items-center bg-white dark:bg-dark-1 w-full rounded-xl gap-2 md:gap-3 xl:gap-5 pb-5 xl:pb-8 xl:pt-2 text-xs md:text-sm shadow-sm"
    >
      <img class="w-72 max-w-[70%] aspect-square" src="/svg/error.svg">
      {{ $t("data.failed") }}
    </div>
    <div
      v-else-if="data?.length"
      class="grid-live-now gap-3 md:gap-4 xl:gap-6  p-3 md:p-4 xl:p-5 bg-white dark:bg-dark-1 rounded-xl shadow-sm"
    >
      <MemberLiveCard
        v-for="live in data.values()"
        :key="live.room_id"
        :live="live"
      />
    </div>
    <div
      v-else
      class="flex flex-col justify-center items-center bg-white dark:bg-dark-1 w-full rounded-xl md:min-h-[404px] shadow-sm"
    >
      <div class="aspect-square gap-2 md:gap-3 text-xs md:text-sm pb-6 text-center flex flex-col justify-center">
        <img class="mx-auto w-72 max-w-[80%] aspect-square" alt="No member onlive" src="/svg/space.svg">
        {{ $t("nolive") }}
      </div>
    </div>
    <template #fallback>
      <div
        class="grid-live-now gap-3 md:gap-4 xl:gap-6  p-3 md:p-4 xl:p-5 bg-white dark:bg-dark-1 rounded-xl"
      >
        <PulseLiveCard />
      </div>
    </template>
  </ClientOnly>
</template>
