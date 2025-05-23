<script lang="ts" setup>
definePageMeta({
  middleware: 'auth',
})
const title = ref('')

// useHead({ title: computed(() => t(title.value || 'page.title.recent')) })
useHead({ title: 'History Watch' })
const { user } = useAuth()
const { locale } = useI18n()
const fetch = await useRecentFetch({ changeRoute: false, mode: 'infinite', initPage: 1, userHistory: user.value?.id != null })
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
const dataset = useSessionStorage<{ page: number, data: IRecent[] }>('history-datasetssss', { page: 0, data: [] }, { deep: true })

const { checkTrigger } = useInfiniteScroll(
  () => {
    if (isEnded.value) return
    if (filterOpen.value) return (isLoadDelayed.value = true)
    if (!pending.value) changePage((dataset.value.page ?? 1) + 1)
  },
  { distance: 120 },
)

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

function titleChange(t: string) {
  title.value = t
}

function scrollToTop() {
  y.value = 0
}

onQueryChange(() => {
  dataset.value = {
    page: 0,
    data: [],
  }
  scrollToTop()
})

onMounted(() => {
  el.value = window
})

watch(res, (val) => {
  if ((val?.recents.length ?? 0) === 0) return (isEnded.value = true)
  if ((val?.page || 0) > dataset.value.page) {
    dataset.value = {
      page: val?.page ?? 0,
      data: [...dataset.value.data, ...(val?.recents || [])],
    }
  }
  else if (val?.recents && (val?.page || 0) <= dataset.value.page) {
    const newData = val.recents
    const oldData = dataset.value.data.slice(0, newData.length)
    if (!deepEqual(newData as [], oldData as [])) {
      dataset.value = {
        page: val?.page ?? 0,
        data: [...newData],
      }
    }
  }
})

const SortList = useAppConfig().sortList
function getTitle(query: any) {
  const sort = SortList.find(i => (query?.sort ?? 'date') === i.id) ?? SortList[0]
  return ((query?.order ?? 0) < 0 ? sort.title.asc : sort.title.desc) ?? ''
}

title.value = getTitle(query.value)
const search = useState('filter-search', () => query.value.search)
watch(query, (val) => {
  title.value = getTitle(val)
})
const $device = useDevice()
const searchinput = ref()
const { focused } = useFocus(searchinput)

function applySearch() {
  if ($device.isMobile) focused.value = false
  const q = { ...query.value, search: search.value }
  applyFilter(q)
}

function clearSearch() {
  search.value = ''
  applySearch()
}

const { greaterOrEqual, isMobile } = useResponsive()
const isXL = greaterOrEqual('xl')
const isLarge = greaterOrEqual('lg')
const isMedium = greaterOrEqual('md')
const isSmall = greaterOrEqual('sm')

const recentHeight = computed(() => {
  if (isXL.value) return 205.5
  if (isLarge.value) return 192
  if (isMedium.value) return 192
  if (isSmall.value) return 160
  return 160
})
</script>

<template>
  <LayoutRow title="History Watch" :mobile-side="false">
    <template #sidebar>
      <ClientOnly>
        <template #fallback>
          <div class="bg-container w-full aspect-4/5 rounded-xl animate-pulse xl:mt-4" />
          <div class="bg-container w-full aspect-4/12 rounded-xl animate-pulse" />
        </template>
        <div class="flex flex-col gap-4">
          <div v-if="isXL" class="bg-background sticky top-0 z-nav -mb-3 pb-3 pt-4">
            <div class="group bg-container flex items-center gap-4 rounded-full px-4 ring-blue-500 focus-within:ring-2">
              <Icon name="uil:search" class="ml-1 h-5 w-5 shrink-0" />
              <input
                id="search_shortcut"
                ref="searchinput"
                v-model="search"
                :aria-label="$t('search')"
                :placeholder="`${$t('search')}...`"
                type="text"
                class="w-full bg-transparent py-3 outline-hidden"
                @keyup.enter="applySearch"
              >
              <button v-if="search != null && search !== ''" type="button" aria-label="Clear" class="hidden h-6 w-6 shrink-0 rounded-full bg-blue-500 text-white group-focus-within:block group-hover:block" @click="clearSearch">
                <Icon name="ic:round-close" class="h-full w-full p-1" />
              </button>
            </div>
          </div>
          <PaginationFilter
            v-if="isXL"
            key="filterDiv"
            class="bg-container relative z-belowNav rounded-2xl p-4"
            :search="search"
            :query="query"
            @show-duration="(show : boolean) => showDuration = show"
            @title="(t:string) => titleChange(t)"
            @apply="(filter: any) => {
              applyFilter(filter)
            }"
          />
          <div v-if="isXL" :class="{ 'pt-5': !isXL }">
            <HomeLiveNowSide />
          </div>
        </div>
      </ClientOnly>
    </template>
    <template #actionSection>
      <ClientOnly>
        <LayoutPopupButton v-if="!isXL" class="bg-container flex aspect-square h-10 w-10 items-center justify-center rounded-2xl transition-colors sm:hover:bg-blue-500 sm:hover:text-slate-100">
          <Icon name="ph:magnifying-glass-bold" />
          <template #panel="{ close }">
            <div class="flex flex-col items-stretch py-3 text-lg max-sm:py-5" :class="{ 'min-w-[350px]': !isMobile }">
              <PaginationFilter
                key="filterDiv"
                :must-calculate-height="true"
                :show-search="true"
                class="relative z-aboveNav rounded-t-xl p-4"
                :query="query"
                @show-duration="(show : boolean) => showDuration = show"
                @apply="(filter: any) => {
                  applyFilter(filter)
                  close()
                }"
              />
            </div>
          </template>
        </LayoutPopupButton>
      </ClientOnly>
    </template>

    <Transition
      enter-to-class="transition-all duration-500"
      leave-to-class="transition"
      enter-active-class="opacity-0 translate-y-full"
      leave-active-class="opacity-0 translate-y-full"
    >
      <div
        v-if="!isTop"
        class="fixed bottom-[80px] left-1/2 z-belowNav flex w-[180px] max-w-[80%] -translate-x-1/2 overflow-hidden rounded-xl bg-second-2/95 font-bold text-white transition sm:bottom-10"
      >
        <button
          type="button"
          class="flex-1 border-r border-second-2 px-2 py-2.5 text-center active:bg-blue-500 justify-center flex gap-1 items-center"
          @click="scrollToTop"
        >
          {{ $t("scrolltop") }} <Icon name="ph:arrow-up-bold" class="self-center text-base" />
        </button>
      </div>
    </Transition>

    <div class="relative z-10">
      <ClientOnly>
        <template #fallback>
          <div key="loading" class="space-y-2 px-4 md:space-y-4">
            <PulseRecentDetailCard v-for="index in Array(10).keys()" :key="index" />
          </div>
        </template>
        <Transition name="fade-abs">
          <div v-if="pending && (dataset?.data?.length ?? 0) === 0" key="loading" class="space-y-2 px-4 md:space-y-4">
            <PulseRecentDetailCard v-for="index in Array(10).keys()" :key="index" />
          </div>
          <div
            v-else-if="error || !dataset || !dataset?.data?.length"
            class="flex flex-col justify-center px-10 pt-10 text-center"
          >
            <div class="space-y-5">
              <div class="mx-auto aspect-video w-4/5 lg:w-[350px]">
                <NuxtImg v-if="error" :src="`${$cloudinaryURL}/assets/img/web/security-error.png`" alt="An Error Occured!" class="mx-auto w-full" />
                <NuxtImg v-else :src="`${$cloudinaryURL}/assets/img/web/empty-box.png`" alt="Empty!" class="mx-auto w-full" />
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
                  {{ $t("data.notfound") }}
                </h2>
              </div>
            </div>
          </div>

          <div v-else>
            <RecycleScroller
              key="loaded"
              :prerender="10"
              :item-size="recentHeight"
              :items="dataset.data"
              key-field="data_id"
              class="px-3 md:px-4"
              page-mode
            >
              <template #default="{ item }">
                <div class="pb-3 md:pb-4 px-1 relative">
                  <NuxtLink :to="`/recent/${item.data_id}`" class="flex gap-3 md:gap-4 bg-container rounded-xl p-3 md:p-4">
                    <div v-if="item.user" class="flex flex-col justify-center items-center gap-2 max-w-[80px] md:max-w-[100px] xl:max-w-[200px]">
                      <div v-if="item.type === 'top100'" class="bg-orange-600 px-1.5 text-sm md:text-base md:px-2 rounded-md">
                        Top 100
                      </div>
                      <div v-else-if="item.type === 'top50'" class="bg-gray-400 px-1.5 text-sm md:text-base md:px-2 rounded-md">
                        Top 50
                      </div>
                      <div v-else-if="item.type === 'top13'" class="bg-yellow-500 px-1.5 text-sm md:text-base md:px-2 rounded-md">
                        Podium 13
                      </div>
                      <div v-else class="bg-green-500 px-1.5 text-sm md:text-base md:px-2 rounded-md">
                        Gifter
                      </div>
                      <img :src="$avatarURL(item.user?.avatar_id)" alt="" class="w-16 md:w-20 aspect-square">
                      <div class="truncate w-full text-center text-sm md:text-base">
                        {{ item.user.name }}
                      </div>
                    </div>
                    <div class="flex-1 flex justify-end gap-3 md:gap-4 shrink-0">
                      <div class="flex-1 flex flex-col gap-1 md:gap-2">
                        <div class="flex flex-col">
                          <div class="flex">
                            <div class="text-base md:text-lg font-bold truncate w-0 flex-1">
                              {{ item.member.name }}
                            </div>
                          </div>
                          <div class="text-sm md:text-base">
                            Gift spent :  {{ item.user?.giftSpent ?? 0 }}
                          </div>
                        </div>
                        <div class="font-light text-xs md:text-sm">
                          {{ $dayjs(item.live_info?.date?.end).locale(locale).fromNow() }}
                        </div>
                      </div>
                      <NuxtImg
                        provider="cloudinary"
                        :src="item.member.img_alt ?? item.member.img"
                        :alt="`${item.member.name} profile picture`"
                        sizes="80px md:96px 2xl:112px"
                        fit="fill"
                        format="webp"
                        class="aspect-96/135 w-20 md:w-24 rounded-xl object-cover 2xl:w-28 self-start"
                      />
                    </div>
                  </NuxtLink>
                </div>
              </template>
              <template #after>
                <div class="mb-4 flex w-full items-center justify-center py-16">
                  <Icon v-if="!isEnded" name="svg-spinners:ring-resize" size="3rem" />
                  <div v-else class="flex h-[3rem] items-center justify-center text-lg">
                    {{ $t("data.nomore") }}
                  </div>
                </div>
              </template>
            </RecycleScroller>
          </div>
        </Transition>
      </ClientOnly>
    </div>
  </LayoutRow>
</template>
