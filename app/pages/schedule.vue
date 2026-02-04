<script lang="ts" setup>
const route = useRoute()
const router = useRouter()
const page = ref(Number(route.query.page) || 1)
const { data, pending, error } = await useApiFetch<IApiNews>('/api/news', { params: { page }, key: 'jkt48news', cache: 'only-if-cached' })
const { locale } = useI18n()
function changePage(p: number) {
  page.value = p
  window.scrollTo({ top: 0 })
}

watch(page, (p) => {
  if (p > 1) {
    router.push ({
      query: { page: String(p) },
    })
  }
})
</script>

<template>
  <LayoutRow :title="$t('schedule')" :mobile-side="false">
    <template #default>
      <div v-if="pending" class="flex flex-col gap-3.5">
        <div v-for="num in 10" :key="num" class="bg-container mx-3 flex h-[106px] animate-pulse flex-col gap-2 rounded-xl p-3 md:mx-4 md:p-4" />
      </div>
      <div v-else-if="error">
        <Error :message="$t('error.unknown')" :img-src="`${$imgCDN}/assets/svg/web/error.svg`" />
      </div>
      <div v-else-if="data" class="flex flex-col gap-3.5">
        <div v-for="news in data.news" :key="news.id" class="bg-container mx-3 flex flex-col gap-2 rounded-xl p-3 md:mx-4 md:p-4">
          <Image
            class="aspect-56/19 w-[56px] rounded-[3px]"
            :src="`${$imgCDN}/assets/jkt48${news.label}`"
            alt="Label"
            loading="lazy"
            fit="fill"
            width="56px"
            format="webp"
          />
          <NuxtLink :to="`/news/${news.id}`" class="inline-block leading-5">
            {{ news.title }}
          </NuxtLink>
          <div class="text-sm font-light">
            {{ $dayjs(news.date).locale(locale).format("DD MMMM YYYY") }}
          </div>
        </div>
      </div>

      <div class="float-right m-3 w-[400px] self-end md:m-4">
        <PulsePaginationControl v-if="pending || !data" :max-dots="7" />
        <PaginationControl
          v-else-if="!error"
          key="pagination"
          class="justify-center sm:left-auto!"
          :page="data.page"
          :max-dots="7"
          :total="Math.ceil(data.total_count / data.perpage)"
          @page-change="(page : number) => changePage(page)"
        />
      </div>
    </template>
    <template #sidebar>
      <HomeRecents />
    </template>
  </LayoutRow>
</template>
