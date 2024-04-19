<script lang="ts" setup>
const { data, pending, error } = useApiFetch<any>('/api/leaderboard', { server: false })
</script>

<template>
  <div class="flex flex-col bg-container rounded-xl p-4 md:p-5 min-h-[300px]">
    <h4 class="text-2xl font-semibold text-center">
      Leaderboard
    </h4>
    <div v-if="pending" class="flex-1 w-full flex justify-center items-center">
      <Spinner class="size-10" />
    </div>
    <div
      v-else-if="error"
      class="flex-1 w-full flex justify-center items-center"
    >
      Error!
    </div>
    <div
      v-else-if="!data?.data?.length"
      class="flex-1 w-full flex justify-center items-center"
    >
      {{ $t('data.nodata') }}
    </div>
    <div v-else class="flex-1 w-full space-y-3 pt-8">
      <div
        v-for="[i, donator] in data?.data?.entries() ?? []"
        :key="`${donator.donator}-${Math.random() * 10000}`"
        class="flex justify-between items-center"
      >
        <span class="size-6 flex items-center justify-center">
          {{ i + 1 }}.
        </span>
        <span>
          {{ donator.donator }}
        </span>
      </div>
    </div>
  </div>
</template>
