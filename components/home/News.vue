<script lang="ts" setup>
const { data, pending, error, refresh, date } = useCachedFetch<IApiNews>('/api/news', { expireIn: 600000 })
const newsFilter = computed(() => data.value?.news.slice(0, 5) ?? [])
const { locale } = useI18n()
</script>

<template>
  <HomeContainer :title="$t('news')" icon-class="bg-blue-500" more="/news" more-screen-reader-only="News" class="relative" :more-text="$t('more')">
    <div class="pt-1 pb-1.5 relative">
      <div v-if="error" class="flex flex-col items-center pb-4">
        <NuxtImg :src="`${$cloudinaryURL}/assets/svg/web/error.svg`" alt="" class="p-5" />
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
            <NuxtImg
              class="h-[19px] w-[56px] rounded-[3px]"
              :src="`${$cloudinaryURL}/assets/jkt48${news.label}`"
              alt="Label"
              loading="lazy"
              fit="fill"
              width="56px"
              format="webp"
            />
            <span>{{ $dayjs(news.date).locale(locale).format("DD MMMM YYYY") }}</span>
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
    <button v-if="date && !pending" type="button" class="absolute right-0 bottom-0 text-xs font-light float-right px-3 pb-3 truncate" @click="refresh">
      {{ $dayjs(date).locale(locale).fromNow() }}
      <Icon name="ic:outline-refresh" />
    </button>
  </HomeContainer>
</template>
