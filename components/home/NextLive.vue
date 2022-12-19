<template>
  <div v-if="isLoading">
    <PulseNextLive v-for="n in 6" :key="n" />
  </div>
  <div v-else-if="next?.length" class="">
    <MemberNextLive v-for="live in next" :key="live.room_id" :data="live" />
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
      <div class="text-xs">{{ $t("nonext") }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const config = useRuntimeConfig();
const { data: next, pending: isLoading } = useFetch("/api/showroom/next_live", {
  baseURL: config.public.baseURL,
});
</script>
