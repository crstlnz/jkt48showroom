<script lang="ts" setup>
import { useScroll } from '@vueuse/core'

defineEmits<{ (e: 'title', title: string): void }>()
const title = ref('')
const fetch = useRecentFetch()
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

const showDuration = ref(false)
</script>

<template>
  <LayoutRow :title="$t(title)">
    <template #sidebar>
      <LayoutSticky>
        <div>
          <PulsePaginationControl v-if="pending && !res" :max-dots="7" />
          <PaginationControl
            v-else
            key="pagination"
            class="justify-center sm:!left-auto"
            :page="query.page"
            :max-dots="7"
            :total="totalPage"
            @page-change="(page : number) => changePage(page)"
          />
          <PaginationFilter
            class="bg-container mt-4 h-fit overflow-y-auto rounded-xl p-4 shadow-sm lg:max-h-[calc(100vh_-_96px_-_20px)]"
            :query="query"
            @apply="(filter) => setFilter(filter)"
            @show-duration="(show : boolean) => showDuration = show"
            @title="(t : string) => {
              title = t
              $emit('title', t)
            }"
          />
        </div>
      </LayoutSticky>
    </template>
    <template #default>
      <div class="flex flex-col-reverse gap-5 px-5 md:gap-6 lg:flex-row xl:gap-8">
        <div class="flex-1 lg:w-0">
          <div class="relative">
            <div v-if="pending" :key="Math.random()" class="space-y-4">
              <PulseRecentDetailCard v-for="index in Array(10).keys()" :key="index" />
            </div>
            <div v-else-if="error || !data?.length" :key="Math.random() * 2">
              <div class="flex flex-col justify-center pt-4 text-center">
                <div class="space-y-5">
                  <div class="mx-auto w-4/5 lg:w-[350px]">
                    <img v-if="error" :src="`${$cloudinaryURL}/assets/img/web/security-error.png`" alt="An Error Occured!" class="mx-auto w-full">
                    <img v-else :src="`${$cloudinaryURL}/assets/img/web/empty-box.png`" alt="Empty!" class="mx-auto w-full">
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
            </div>
          </div>
        </div>
      </div>
    </template>
  </LayoutRow>
</template>
