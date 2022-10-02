<template>
  <div v-if="pending">loading</div>
  <div v-else-if="data?.length" class="">
    <MemberNextLive v-for="live in data" :key="live.room_id" :data="live" />
  </div>
  <div v-else class="bg-white dark:bg-dark-1 overflow-hidden">
    <div
      class="text-center space-y-6 md:space-y-8 xl:space-y-10 aspect-square flex flex-col items-center justify-center"
    >
      <img
        src="/svg/schedule.svg"
        alt="Empty"
        class="max-w-[400px] w-[50%] aspect-square mx-auto dark:brightness-110"
      />
      <div class="text-xs">No members live right now :(</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const config = useRuntimeConfig();
const { data, pending } = useFetch("/api/showroom/next_live", {
  baseURL: config.public.baseURL,
  initialCache: false,
  server: false,
});
</script>
