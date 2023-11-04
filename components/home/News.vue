<script lang="ts" setup>
const { data, pending, error } = useLazyFetch('/api/jkt48/news', { key: 'news', lazy: true, deep: false })
const newsFilter = computed(() => data.value?.news.slice(0, 5) ?? [])
const dayjs = useDayjs()
const { locale } = useI18n()
</script>

<template>
  <div class="pt-1">
    <div v-if="error" class="flex flex-col items-center pb-4">
      <img :src="`${$cloudinaryURL}/assets/svg/web/error.svg`" alt="" class="p-5">
      {{ $t("error.unknown") }}
    </div>
    <div v-else-if="pending" class="flex flex-col gap-3.5">
      <div v-for="num in 5" :key="num" class="flex animate-pulse flex-col pb-3" :class="{ 'border-b-2 border-dashed border-black/20 dark:border-white/20': num !== 5 }">
        <div class="mb-1 flex items-center gap-2 text-sm font-light">
          <div class="pulse-color h-[18px] w-[58px] rounded-[3px]" />
          <div class="pulse-color h-4 w-24 rounded-[3px] text-sm" />
        </div>
        <div class="inline-block h-full leading-5">
          <div class="pulse-color h-6 w-full rounded-sm" />
        </div>
      </div>
    </div>
    <div v-else-if="data" class="flex flex-col gap-3.5">
      <div v-for="[index, news] in newsFilter.entries()" :key="news.id" class="pb-3" :class="{ 'border-b-2 border-dashed border-black/20 dark:border-white/20': index !== newsFilter.length - 1 }">
        <div class="mb-1 flex items-center gap-2 text-sm font-light">
          <img :src="`https://jkt48.com${news.label}`" alt="Label" class="h-[18px] w-[58px] rounded-[3px]"> <span>{{ dayjs(news.date).locale(locale).format("DD MMMM YYYY") }}</span>
        </div>
        <NuxtLink :to="`/news/${news.id}`" class="inline-block leading-5">
          {{ news.title }}
        </NuxtLink>
      </div>
    </div>
    <div v-else class="flex flex-col items-center pb-4">
      <img :src="`${$cloudinaryURL}/assets/svg/web/empty-box.svg`" alt="">
      {{ $t("data.nodata") }}
    </div>
  </div>
</template>
