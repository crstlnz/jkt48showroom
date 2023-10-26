<script lang="ts" setup>
// import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { onClickOutside, useScroll } from '@vueuse/core'

defineEmits<{ (e: 'title', title: string): void }>()
const fetch = useRecentFetch({ changeRoute: false, mode: 'infinite' })
const title = ref('')
const { data: res, query, pending, error } = fetch.data
const { changePage, refresh, setFilter, onQueryChange } = fetch
const filterOpen = ref(false)
const isEnded = ref(false)
const showDuration = ref(false)
const listener = ref<any>(undefined)
const filterContainer = ref(null)
const isLoadDelayed = ref(false) // if next page must be loaded but the filter div is open;
const el = ref<Window | null>(null)
const { y, arrivedState } = useScroll(el, { behavior: 'smooth' })
const isTop = computed(() => arrivedState.top)
const dataset = ref(res.value?.recents ?? [])

const { checkTrigger } = useInfiniteScroll(
  () => {
    if (isEnded.value) return
    if (filterOpen.value) return (isLoadDelayed.value = true)
    if (!pending.value) changePage((res.value?.page ?? 1) + 1)
  },
  { distance: 120 },
)

function toggleFilter() {
  if (filterOpen.value) {
    closeFilter()
  }
  else {
    openFilter()
  }
}

function openFilter() {
  filterOpen.value = true
}

function closeFilter() {
  filterOpen.value = false
}

function applyFilter(filter: any) {
  setFilter(filter)
  isEnded.value = false
  filterOpen.value = false
}

watch(filterOpen, (isOpen) => {
  if (isOpen) {
    listener.value = onClickOutside(filterContainer, () => (filterOpen.value = false))
  }
  else {
    if (isLoadDelayed.value) {
      isLoadDelayed.value = false
      checkTrigger()
    }
    listener?.value()
  }
})

function scrollToTop() {
  y.value = 0
}

onQueryChange(() => {
  dataset.value = []
  scrollToTop()
})

onMounted(() => {
  el.value = window
  // console.log(pending.value)
  dataset.value?.push(...(res.value?.recents ?? []))
})

watch(res, (val) => {
  if ((val?.recents.length ?? 0) === 0) return (isEnded.value = true)
  dataset.value?.push(...(val?.recents ?? []))
})
</script>

<template>
  <LayoutSingleRow :title="$t(title)">
    <Transition name="fade">
      <div v-if="filterOpen" class="fixed inset-0 z-40 bg-black/30 dark:bg-black/50" />
    </Transition>
    <div
      ref="filterContainer"
      class="shadow-full fixed inset-x-0 bottom-0 z-belowNav transition-transform duration-300 ease-in-out"
      :class="{ 'translate-y-full': !filterOpen }"
    >
      <PaginationFilter
        key="filterDiv"
        class="relative z-[90] rounded-t-xl bg-white p-4 dark:bg-dark-1"
        :query="query"
        @show-duration="(show : boolean) => showDuration = show"
        @title="(t:string) => {
          title = t
          $emit('title', t)
        }"
        @apply="(filter) => applyFilter(filter)"
      />
      <Transition
        enter-to-class="transition-all duration-500"
        leave-to-class="transition"
        enter-active-class="opacity-0 translate-y-full"
        leave-active-class="opacity-0 translate-y-full"
      >
        <div
          v-if="!isTop"
          class="absolute bottom-[100%] left-1/2 z-[50] mb-2.5 flex w-[220px] max-w-[80%] -translate-x-1/2 overflow-hidden rounded-xl bg-second-2/95 font-bold text-white transition"
        >
          <button
            type="button"
            class="flex-1 border-r border-second-2 px-2 py-2.5 text-center active:bg-blue-500"
            @click="scrollToTop"
          >
            {{ $t("scrolltop") }} <Icon name="ph:arrow-up-bold" class="self-center text-base" />
          </button>
          <button
            type="button"
            class="flex-1 border-l border-second-2 px-2 py-2.5 text-center active:bg-blue-500"
            @click="toggleFilter"
          >
            {{ $t("filter") }} <Icon name="mdi:filter" class="self-center text-base" />
          </button>
        </div>
      </Transition>
    </div>
    <div class="mb-2 flex items-end justify-between">
      <button type="button" class="font-bold" @click="toggleFilter">
        Filter
      </button>
    </div>

    <div class="relative z-10">
      <Transition name="fade-abs">
        <div v-if="pending && (dataset?.length ?? 0) === 0" key="loading" class="space-y-2 md:space-y-4">
          <PulseRecentDetailCard v-for="index in Array(10).keys()" :key="index" />
        </div>
        <div
          v-else-if="error || !dataset || !dataset.length"
          class="flex flex-col justify-center px-10 pt-10 text-center"
        >
          <div class="space-y-5">
            <div class="mx-auto w-4/5 lg:w-[350px]">
              <img v-if="error" :src="`${$cloudinaryURL}/assets/img/web/security-error.png`" alt="An Error Occured!" class="mx-auto w-full">
              <img v-else :src="`${$cloudinaryURL}/assets/img/web/empty-box.png`" alt="Empty!" class="mx-auto w-full">
            </div>
            <div v-if="error">
              <h2 class="mb-1 text-xl lg:text-3xl">
                {{ $t("data.error") }}
              </h2>
              <button type="button" class="text-sm hover:text-second-2 lg:text-base" href="/" @click="() => refresh()">
                {{ $t("data.retry") }}
              </button>
            </div>
            <div v-else>
              <h2 class="mb-1 text-lg lg:text-2xl">
                {{ }}
                {{ $t("data.notfound") }}
              </h2>
            </div>
          </div>
        </div>

        <DynamicScroller
          v-else
          key="loaded"
          :prerender="10"
          :min-item-size="152"
          :items="dataset"
          key-field="data_id"
          page-mode
        >
          <template #default="{ item, index, active }">
            <DynamicScrollerItem :item="item" :active="active" :data-index="index">
              <div class="pb-2.5 sm:pb-3 md:pb-4">
                <MemberRecentCard :key="item.data_id" :show-duration="showDuration" :recent="item" />
              </div>
            </DynamicScrollerItem>
          </template>
        </DynamicScroller>
      </Transition>
    </div>

    <div
      class="-z-10 flex h-0 items-center justify-center text-center leading-[5rem] transition-[height] duration-300"
      :class="{ '!h-24': pending, '!h-16': isEnded }"
    >
      <Transition name="fade" mode="out-in">
        <div v-if="pending" key="spinner" class="lds-ring">
          <div />
          <div />
          <div />
          <div />
        </div>
        <div v-else-if="isEnded" key="nomore">
          {{ $t("data.nomore") }}
        </div>
      </Transition>
    </div>
  </LayoutSingleRow>
</template>
