<script lang="ts" setup>
const route = useRoute()
const router = useRouter()
const page = ref(Number(route.query.page) || 1)
const { data, pending, error } = await useApiFetch<IApiNews>('/api/news', { params: { page } })
const { locale } = useI18n()

watch(pending, (p) => {
  if (p) window.scrollTo({ top: 0 })
})

function changePage(p: number) {
  router.push ({
    query: { page: String(p) },
  })
}

watch(() => route.query, (q, old) => {
  if (old.page !== q.page) {
    page.value = !Number.isNaN(q.page) ? Number(q.page) : 1
  }
})

const { greaterOrEqual } = useResponsive()
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
            :src="`${$cloudinaryURL}/assets/jkt48${news.label}`"
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

      <ClientOnly>
        <div v-if="!error" class="float-right m-3 min-w-[100px max-w-[95vw] self-end md:m-4">
          <PulsePaginationControl v-if="pending || !data" :max-dots="maxDots" />
          <PaginationControl
            v-else-if="!error"
            key="pagination"
            class="justify-center sm:left-auto!"
            :page="data.page"
            :max-dots="maxDots"
            :total="Math.ceil(data.total_count / data.perpage)"
            @page-change="(page : number) => changePage(page)"
          />
        </div>
      </ClientOnly>
    </template>
    <template #sidebar>
      <HomeRecents class="mt-3 md:mt-4" />
    </template>
  </LayoutRow>
</template>
