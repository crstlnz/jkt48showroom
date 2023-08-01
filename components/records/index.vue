<script lang="ts" setup>
import { useSettings } from '~~/store/settings'

const { group } = useSettings()
const { data, pending, error } = useFetch('/api/showroom/records', { params: { group } })
</script>

<template>
  <div class="bg-container space-y-2 rounded-xl p-3 md:p-4">
    <div class="flex items-center gap-2 text-2xl font-bold">
      <Icon name="ph:medal-duotone" size="1.5rem" class="text-yellow-500" />
      <span>{{ $t('mostrecords') }}</span>
    </div>
    <div v-if="error" class="flex aspect-[6/5] flex-col items-center justify-center gap-5">
      <img class="mx-auto w-72 max-w-[65%]" src="/svg/error.svg">
      <span class="mt-5">{{ $t("data.failed") }}</span>
    </div>
    <div v-else-if="pending" class="mr-2 flex flex-col gap-10 px-1 py-3 sm:p-3">
      <div v-for="num in 3" :key="num" class="relative flex items-center justify-between gap-3 sm:gap-5">
        <div class="pulse-color h-16 w-16 shrink-0 animate-pulse overflow-hidden rounded-full md:h-20 md:w-20" />
        <div class="w-full sm:space-y-2">
          <div class="pulse-color h-5 w-[30%] animate-pulse rounded-xl sm:h-6" />
          <div class="flex items-center justify-between gap-3">
            <div class="pulse-color h-6 w-[45%] animate-pulse rounded-xl font-bold max-sm:mt-1 sm:h-7" />
            <div class="pulse-color h-4 w-[30%] animate-pulse rounded-xl text-right sm:h-6" />
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="!data?.length" class="flex aspect-[6/5] flex-col items-center justify-center gap-2">
      <img class="mx-auto w-72 max-w-[80%]" src="/svg/empty-box.svg">
      <span>{{ $t("data.nodata") }}</span>
    </div>
    <div v-else class="mr-2 flex flex-col gap-10 px-1 py-3 sm:p-3">
      <RecordsItem v-for="rekor in data" :key="rekor.key" :rekor="rekor" />
    </div>
  </div>
</template>
