<script lang="ts" setup>
const { data: next, pending: isLoading } = useFetch('/api/showroom/next_live', {
  server: false,
})

const mustLoading = ref(false)
</script>

<template>
  <div v-if="(isLoading || mustLoading)">
    <PulseNextLive v-for="n in 6" :key="n" />
  </div>
  <div v-else-if="next?.length" class="">
    <MemberNextLive v-for="live in next" :key="live.room_id" :data="live" />
  </div>
  <div v-else class="overflow-hidden bg-white dark:bg-dark-1">
    <div
      class="flex aspect-square flex-col items-center justify-center space-y-6 text-center md:space-y-8 xl:space-y-10"
    >
      <img
        src="/svg/schedule.svg"
        alt="Empty"
        class="mx-auto aspect-square w-[50%] max-w-[400px] dark:brightness-110"
      >
      <div class="text-xs">
        {{ $t("nonext") }}
      </div>
    </div>
  </div>
</template>
