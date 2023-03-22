<script lang="ts" setup>
import { breakpointsTailwind, useBreakpoints, useScroll } from '@vueuse/core'
const title = ref('')
const fetch = await useRecentFetch()
const { data: res, query, totalPage, pending, error } = fetch.data
const { changePage, refresh, setFilter, onQueryChange } = fetch
const data = computed(() => {
  return res.value?.recents ?? []
})

const windowEl = ref<Window | null>(null)
const { y } = useScroll(windowEl, { behavior: 'smooth' })
onMounted(() => {
  windowEl.value = window
})

onQueryChange(() => {
  y.value = 0
})

const isMedium = useBreakpoints(breakpointsTailwind).smaller('md')
const dots = computed(() => {
  if (isMedium.value) return 7
  return 9
})

const showDuration = ref(false)
defineEmits<{(e:'title', title: string):void}>()
</script>

<template>
  <div class="flex flex-col gap-5 md:gap-6 lg:flex-row xl:gap-8">
    <PaginationFilter
      class="h-fit overflow-y-auto rounded-xl bg-white p-4 shadow-sm dark:bg-dark-1 lg:sticky lg:top-[96px] lg:max-h-[calc(100vh_-_96px_-_20px)] lg:w-[260px] xl:w-[320px]"
      :query="query"
      @apply="(filter) => setFilter(filter)"
      @show-duration="(show : boolean)=>showDuration=show"
      @title="(t : string) => {
        title=t
        $emit('title', t)}"
    />
    <div class="flex-1 lg:w-0">
      <div class="mt-3 mb-4 flex flex-col items-center justify-between sm:flex-row lg:mb-6">
        <h2 class="mb-3 text-2xl font-bold !leading-[40px] sm:mb-0 sm:text-xl md:text-2xl xl:text-3xl">
          {{ $t(title || "page.title.recent") }}
        </h2>
        <div>
          <div class="relative h-10">
            <Transition name="fade-abs" class="fade-abs">
              <PulsePaginationControl v-if="!data?.length && pending" key="pulse" class="justify-center sm:!left-auto" />
              <PaginationControl
                v-else-if="!error && data?.length"
                key="pagination"
                class="justify-center sm:!left-auto"
                :page="query.page"
                :max-dots="dots"
                :total="totalPage"
                @page-change="(page : number) => changePage(page)"
              />
            </Transition>
          </div>
        </div>
      </div>

      <div class="relative">
        <div v-if="pending" :key="Math.random()" class="space-y-4">
          <PulseRecentDetailCard v-for="index in Array(10).keys()" :key="index" />
          <div class="mt-4 sm:float-right md:mt-6 xl:mt-8">
            <div class="relative flex h-10 justify-center">
              <PulsePaginationControl key="pulse" class="justify-center sm:!left-auto" />
            </div>
          </div>
        </div>
        <div v-else-if="error || !data?.length" :key="Math.random() * 2">
          <div class="flex flex-col justify-center pt-4 text-center">
            <div class="space-y-5">
              <div class="mx-auto w-4/5 lg:w-[350px]">
                <img v-if="error" src="/img/security-error.png" alt="An Error Occured!" class="mx-auto w-full">
                <img v-else src="/img/empty-box.png" alt="Empty!" class="mx-auto w-full">
              </div>
              <div>
                <h2 v-if="error" class="mb-1 text-xl lg:text-3xl">
                  {{ $t("data.error") }}
                </h2>
                <h2 v-else class="mb-1 text-lg lg:text-2xl">
                  {{ $t("data.notfound") }}
                </h2>
                <button
                  v-if="error"
                  aria-label="Retry"
                  type="button"
                  class="text-sm hover:text-second-2 lg:text-base"
                  href="/"
                  @click="refresh()"
                >
                  {{ $t("data.retry") }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else :key="Math.random() * 3" class="space-y-4">
          <MemberRecentCard v-for="d in data" :key="d.data_id" :show-duration="showDuration" :recent="d" />
          <div class="mt-4 sm:float-right md:mt-6 xl:mt-8">
            <div class="relative flex h-10 justify-center">
              <PaginationControl
                key="pagination"
                class="justify-center sm:!left-auto"
                :page="query.page"
                :max-dots="dots"
                :total="totalPage"
                @page-change="(page : number) => changePage(page)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
