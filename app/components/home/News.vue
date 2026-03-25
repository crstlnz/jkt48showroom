<script lang="ts" setup>
const { data, pending, error, refresh, date } = useCachedFetch<JKT48.IApiNews>('/api/news', { expireIn: 600000 })
const newsFilter = computed(() => data.value?.news.slice(0, 5) ?? [])
const { locale } = useI18n()
</script>

<template>
  <HomeContainer :title="$t('news')" icon-class="bg-blue-500" more="/news" more-screen-reader-only="News" class="relative" :more-text="$t('more')">
    <div class="pt-1 pb-1.5 relative">
      <div v-if="error" class="flex flex-col items-center pb-4">
        <Image :src="`${$imgCDN}/assets/svg/web/error.svg`" sizes="320px" fit="fill" alt="" class="p-5" />
        {{ $t("error.unknown") }}
      </div>
      <div v-else-if="pending" class="flex flex-col gap-3.5">
        <div v-for="num in 5" :key="num" class="flex animate-pulse flex-col pb-3" :class="{ 'border-b border-dashed border-color-2': num !== 5 }">
          <div class="mb-1 flex items-center gap-2 text-sm font-light">
            <div class="pulse-color h-4.5 w-14.5 rounded-[3px]" />
            <div class="pulse-color h-4 w-24 rounded-[3px] text-sm" />
          </div>
          <div class="inline-block h-full leading-5">
            <div class="pulse-color h-6 w-full rounded-xs" />
          </div>
        </div>
      </div>
      <div v-else-if="data" class="flex flex-col gap-3.5">
        <div v-for="[index, news] in newsFilter.entries()" :key="news.id" class="pb-3" :class="{ 'border-b border-dashed border-color-2': index !== newsFilter.length - 1 }">
          <div class="mb-1 flex items-center gap-2 text-sm font-light">
            <Image
              v-if="news.label"
              class="h-4.75 w-14 rounded-[3px]"
              :src="`${$imgCDN}/assets/jkt48${news.label}`"
              alt="Label"
              loading="lazy"
              fit="fill"
              width="56px"
              format="webp"
            />
            <NewsCategoryBadge v-else-if="news.category" :category="news.category" variant="soft" />
            <span class="text-sm font-thin opacity-85">{{ $dayjs(news.date).locale(locale).format("DD MMMM YYYY") }}</span>
          </div>
          <NuxtLink :to="`/news/${news.id}`" class="inline-block leading-5">
            {{ news.title }}
          </NuxtLink>
        </div>
      </div>
      <div v-else class="flex flex-col items-center pb-4">
        <img :src="`${$imgCDN}/assets/svg/web/empty-box.svg`" alt="">
        {{ $t("data.nodata") }}
      </div>
    </div>
    <button v-if="date && !pending" type="button" class="flex gap-1 items-center absolute right-0 bottom-0 text-xs font-light float-right px-3 pt-3 pb-3 truncate opacity-75" @click="refresh">
      {{ $dayjs(date).locale(locale).fromNow() }}
      <Icon name="ic:outline-refresh" />
    </button>
  </HomeContainer>
</template>
