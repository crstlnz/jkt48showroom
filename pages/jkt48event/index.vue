<script lang="ts" setup>
const route = useRoute()
const router = useRouter()
const page = ref(Number(route.query.page) || 1)
const { data, pending, error } = await useApiFetch<IApiJKT48Event>('/api/jkt48event', { params: { page } })
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
  <LayoutRow title="Theater" :mobile-side="false">
    <template #default>
      <div v-if="pending" class="flex flex-col gap-3.5">
        <div v-for="num in 10" :key="num" class="bg-container mx-3 flex h-[194.66px] animate-pulse flex-col gap-2 rounded-xl p-3 md:mx-4 md:p-4" />
      </div>
      <div v-else-if="error">
        <Error :message="$t('error.unknown')" :img-src="`${$cloudinaryURL}/assets/svg/web/error.svg`" />
      </div>
      <div v-else-if="data" class="flex flex-col gap-3.5">
        <div v-for="event in data.events" :key="event.id" class="bg-container mx-3 flex gap-3 rounded-xl p-3 md:mx-4 md:p-4">
          <NuxtImg
            class="aspect-[4/5.5] w-32 rounded-md bg-black/10 object-cover"
            :src="event.poster ?? $errorPicture"
            alt="Label"
            loading="lazy"
            fit="fill"
            :modifiers="{
              aspectRatio: '0.727',
              gravity: 'center',
            }"
            width="140px"
            format="webp"
          />
          <div class="flex-1 flex flex-col">
            <NuxtLink :to="`/jkt48event/${event.url}`" class="inline-block leading-5 text-lg">
              {{ event.title }}
            </NuxtLink>
            <div class="flex-1 font-light py-2 gap-1 flex-col flex">
              <div class="flex items-center gap-2">
                <Icon class="text-lg text-yellow-500" name="material-symbols:calendar-month-sharp" />
                <div>
                  {{ $dayjs(event.date).locale(locale).format("DD MMMM YYYY") }}
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Icon class="text-lg text-green-500" name="mingcute:group-fill" />
                <div>
                  {{ $t('member_count', { count: event.member_count }) }}
                </div>
              </div>

              <!-- {{ $dayjs(news.date).locale(locale).format("DD MMMM YYYY") }} -->
            </div>
            <NuxtLink :to="`/jkt48event/${event.url}`" class="self-end">
              Detail
            </NuxtLink>
          </div>
        </div>
      </div>

      <ClientOnly>
        <div v-if="!error" class="float-right m-3 min-w-[100px max-w-[95vw] self-end md:m-4">
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
      </ClientOnly>
    </template>
    <template #sidebar>
      <HomeRecents class="mt-3 md:mt-4" />
    </template>
  </LayoutRow>
</template>
