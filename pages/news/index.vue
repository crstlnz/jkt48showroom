<script lang="ts" setup>
const route = useRoute()
const router = useRouter()
const page = ref(Number(route.query.page) || 1)
const { data, pending, error } = await useLazyFetch('/api/jkt48/news', { params: { page } })
const dayjs = useDayjs()
const { locale } = useI18n()
function changePage(p: number) {
  page.value = p
  window.scrollTo({ top: 0 })
}

watch(page, (p) => {
  router.push ({
    query: { page: String(p) },
  })
})

const { greaterOrEqual } = useResponsive()
const isMd = greaterOrEqual('md')
const isXl = greaterOrEqual('xl')
const maxDots = computed(() => {
  return isXl.value ? 9 : 7
})
</script>

<template>
  <LayoutRow title="News" :mobile-side="false">
    <template #default>
      <div v-if="pending" class="flex flex-col gap-3.5">
        <div v-for="num in 10" :key="num" class="bg-container mx-3 flex h-[106px] animate-pulse flex-col gap-2 rounded-xl p-3 md:mx-4 md:p-4" />
      </div>
      <div v-else-if="error">
        <Error :message="$t('error.unknown')" :img-src="`${$cloudinaryURL}/assets/svg/web/error.svg`" />
      </div>
      <div v-else-if="data" class="flex flex-col gap-3.5">
        <div v-for="news in data.news" :key="news.id" class="bg-container mx-3 flex flex-col gap-2 rounded-xl p-3 md:mx-4 md:p-4">
          <NuxtImg
            class="h-[19px] w-[56px] rounded-[3px]"
            :src="`https://jkt48.com${news.label}`"
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
            {{ dayjs(news.date).locale(locale).format("DD MMMM YYYY") }}
          </div>
        </div>
      </div>

      <div class="float-right m-3 w-[400px] max-w-[95vw] self-end md:m-4">
        <PulsePaginationControl v-if="pending || !data" :max-dots="maxDots" />
        <PaginationControl
          v-else-if="!error"
          key="pagination"
          class="justify-center sm:!left-auto"
          :page="data.page"
          :max-dots="maxDots"
          :total="Math.ceil(data.total_count / data.perpage)"
          @page-change="(page : number) => changePage(page)"
        />
      </div>
    </template>
    <template #sidebar>
      <HomeRecents class="mt-3 md:mt-4" />
    </template>
  </LayoutRow>
</template>
