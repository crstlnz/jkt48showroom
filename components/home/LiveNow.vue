<template>
  <ClientOnly>
    <div
      v-if="lives.pending && lives.data === null"
      class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4 xl:gap-5 p-3 md:p-4 xl:p-5 bg-white dark:bg-dark-1 rounded-xl"
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
      />
    </div>
    <div
      v-else
      class="flex flex-col justify-center items-center bg-white dark:bg-dark-1 w-full rounded-xl md:min-h-[404px]"
    >
      <div class="aspect-square gap-2 md:gap-3 text-xs md:text-sm pb-6 text-center flex flex-col justify-center">
        <img class="mx-auto w-72 max-w-[80%] aspect-square" alt="No member onlive" src="/svg/space.svg" /> No member
        onlive 😭
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
import { useOnLives } from "~/store/onLives";
const onLives = useOnLives();
const { lives, liveInfo } = storeToRefs(onLives);
</script>
