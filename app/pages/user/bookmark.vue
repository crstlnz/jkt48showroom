<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const route = useRoute()
const router = useRouter()
const page = ref(Number(route.query.page) || 1)
const { data, pending, error } = await useApiFetch<IBookmarks>('/api/user/likes', { params: { page } })
const { greaterOrEqual } = useResponsive()
const isXl = greaterOrEqual('xl')

watch(page, (p) => {
  router.push ({
    query: { page: String(p) },
  })
})

function changePage(p: number) {
  page.value = p
  window.scrollTo({ top: 0 })
}

const maxDots = computed(() => {
  return isXl.value ? 9 : 7
})
</script>

<template>
  <LayoutRow :title="$t('bookmark')" :mobile-side="false">
    <template #default>
      <div v-if="pending" class="flex flex-col gap-3.5 mx-3 md:mx-4">
        <PulseRecentDetailCard v-for="num in 10" :key="num" />
      </div>
      <div v-else-if="error">
        <Error :message="$t('error.unknown')" :img-src="`${$cloudinaryURL}/assets/svg/web/error.svg`" />
      </div>
      <div v-else-if="data" class="flex flex-col gap-3.5 mx-3 md:mx-4">
        <MemberRecentCard v-for="bookmark in data.bookmarks" :key="bookmark.data_id" :recent="bookmark" />
        <!-- <div v-for="news in data.bookmarks" :key="news.data_id" class="bg-container mx-3 flex flex-col gap-2 rounded-xl p-3 md:mx-4 md:p-4">
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
        </div> -->
      </div>

      <ClientOnly>
        <div v-if="!error" class="float-right m-3 min-w-[100px] max-w-[95vw] self-end md:m-4">
          <PulsePaginationControl v-if="pending || !data" :max-dots="maxDots" />
          <PaginationControl
            v-else-if="data.total_count / data.perpage > 1"
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
      <HomeRecents class="xl:mt-4" />
    </template>
  </LayoutRow>
</template>
