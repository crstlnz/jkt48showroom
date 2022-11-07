<template>
  <div class="flex justify-between items-center mt-2 xl:mt-3">
    <div class="flex gap-1">
      <div class="w-6 relative aspect-square">
        <ClientOnly>
          <div
            v-if="!lives.data?.length"
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
      <h2 class="text-xl sm:text-2xl font-bold relative">Live Now</h2>
    </div>
    <ClientOnly>
      <div v-if="lives.pending && lives.data == null" key="loading">
        <div class="h-4 md:h-5 w-20 rounded-xl animate-pulse pulse-color" />
      </div>
      <div v-else key="data" class="text-xs md:text-sm opacity-60">{{ lives.data?.length }} Members</div>
      <template #fallback key="server">
        <div class="h-4 md:h-5 w-20 rounded-xl animate-pulse pulse-color" />
      </template>
    </ClientOnly>
  </div>
  <ClientOnly>
    <div
      v-if="lives.pending && lives.data === null"
      class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3 md:gap-4 xl:gap-5 p-3 md:p-4 xl:p-5 bg-white dark:bg-dark-1 rounded-xl"
    >
      <PulseLiveCard></PulseLiveCard>
    </div>
    <div
      v-else-if="lives.error"
      class="flex flex-col justify-center items-center bg-white dark:bg-dark-1 w-full rounded-xl gap-2 md:gap-3 xl:gap-4 pb-5 xl:pb-8 xl:pt-2 text-xs md:text-sm"
    >
      <img class="w-72 max-w-[70%] aspect-square" src="/svg/error.svg" />
      Data fetching failed! 😥
    </div>
    <div
      v-else-if="lives.data?.length"
      class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4 xl:gap-5 p-3 md:p-4 xl:p-5 bg-white dark:bg-dark-1 rounded-xl"
    >
      <MemberLiveCard
        v-for="live in lives.data.values()"
        :key="live.room_id"
        :live="live"
        :pending="liveInfo.pending"
        :start-date="onLives.getStartDate(live.room_id)"
        @refreshliveinfo="refreshLiveInfo"
      />
    </div>
    <div
      v-else
      class="flex flex-col justify-center items-center bg-white dark:bg-dark-1 w-full rounded-xl md:min-h-[404px]"
    >
      <div class="aspect-square gap-2 md:gap-3 text-xs md:text-sm pb-6 text-center flex flex-col justify-center">
        <img class="mx-auto w-72 max-w-[80%] aspect-square" alt="No member onlive" src="/svg/space.svg" />
        No Live
      </div>
    </div>
    <template #fallback>
      <div
        class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4 xl:gap-5 p-3 md:p-4 xl:p-5 bg-white dark:bg-dark-1 rounded-xl"
      >
        <PulseLiveCard></PulseLiveCard>
      </div>
    </template>
  </ClientOnly>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { useOnLives } from "~/store/onLives";
const onLives = useOnLives();
const { lives, liveInfo } = storeToRefs(onLives);

function refreshLiveInfo() {
  onLives.refreshLiveInfo();
}
</script>
