<template>
  <div>
    <Transition name="fade">
      <div v-if="filterOpen" class="fixed bottom-0 top-0 left-0 right-0 bg-black/30 dark:bg-black/50 z-40"></div>
    </Transition>
    <div
      ref="filterContainer"
      class="fixed z-[100] bottom-0 left-0 right-0 transition-transform duration-300 ease-in-out shadow-full"
      :class="{ 'translate-y-full': !filterOpen }"
    >
      <PaginationFilter
        key="filterDiv"
        class="relative z-[90] bg-white dark:bg-dark-1 px-4 py-4 rounded-t-xl"
        :query="query"
        @apply="(filter) => applyFilter(filter)"
      />
      <Transition
        enter-class="transition-all duration-500"
        leave-to-class="transition"
        enter-active-class="opacity-0 translate-y-full"
        leave-active-class="opacity-0 translate-y-full"
      >
        <div
          v-if="!isTop"
          class="flex absolute z-[50] mb-2.5 bottom-[100%] left-1/2 transition -translate-x-1/2 rounded-xl text-white font-bold overflow-hidden bg-second-2/95 w-[220px] max-w-[80%]"
        >
          <button
            type="button"
            class="py-2.5 px-2 active:bg-blue-500 text-center flex-1 border-r border-second-2"
            @click="scrollToTop"
          >
            {{ $t("scrolltop") }} <Icon name="ph:arrow-up-bold" class="text-base self-center" />
          </button>
          <button
            type="button"
            class="py-2.5 px-2 active:bg-blue-500 text-center flex-1 border-l border-second-2"
            @click="toggleFilter"
          >
            {{ $t("filter") }} <Icon name="mdi:filter" class="text-base self-center" />
          </button>
        </div>
      </Transition>
    </div>
    <div class="flex mb-2 items-end justify-between">
      <div class="font-bold text-xl">{{ $t("recentlive") }}</div>
      <button type="button" class="font-bold" @click="toggleFilter">Filter</button>
    </div>

    <div ref="content" class="relative z-10">
      <transition name="fade-abs">
        <div v-if="pending && (dataset?.length ?? 0) == 0" key="loading" class="space-y-2 md:space-y-4">
          <PulseRecentDetailCard v-for="index in Array(10).keys()" :key="index">Loading</PulseRecentDetailCard>
        </div>
        <div
          v-else-if="error || !dataset || !dataset.length"
          class="text-center flex justify-center flex-col px-10 pt-10"
        >
          <div class="space-y-5">
            <div class="mx-auto w-4/5 lg:w-[350px]">
              <img v-if="error" src="/img/security-error.png" alt="An Error Occured!" class="w-full mx-auto" />
              <img v-else src="/img/empty-box.png" alt="Empty!" class="w-full mx-auto" />
            </div>
            <div v-if="error">
              <h2 class="text-xl lg:text-3xl mb-1">{{ $t("data.error") }}</h2>
              <button type="button" class="hover:text-second-2 text-sm lg:text-base" href="/" @click="() => refresh()">
                {{ $t("data.retry") }}
              </button>
            </div>
            <div v-else>
              <h2 class="text-lg lg:text-2xl mb-1">{{ $t("data.notfound") }}</h2>
            </div>
          </div>
        </div>

        <div v-else key="loaded" class="space-y-2 md:space-y-4">
          <DynamicScroller :prerender="10" :min-item-size="136" :items="dataset" key-field="data_id" page-mode>
            <template #default="{ item, index, active }">
              <DynamicScrollerItem :item="item" :active="active" :data-index="index">
                <div class="pb-2.5 sm:pb-3 md:pb-4">
                  <MemberRecentCard :key="item.data_id" :recent="item" />
                </div>
              </DynamicScrollerItem>
            </template>
          </DynamicScroller>
          <!-- <MemberRecentCard v-for="d in dataset" :key="d.data_id" :recent="d" /> -->
        </div>
      </transition>
    </div>

    <div
      class="h-0 transition-[height] duration-300 flex justify-center items-center text-center leading-[5rem] -z-10"
      :class="{ '!h-24': pending, '!h-16': isEnded }"
    >
      <transition name="fade" mode="out-in">
        <div v-if="pending" key="spinner" class="lds-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div v-else-if="isEnded" key="nomore">{{ $t("data.nomore") }}</div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
// import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { useScroll, onClickOutside } from "@vueuse/core";
const fetch = await useRecentFetch({ changeRoute: false, mode: "infinite" });
const { data: res, query, pending, error } = fetch.data;
const { changePage, refresh, setFilter, onQueryChange } = fetch;
const filterOpen = ref(false);
function toggleFilter() {
  if (filterOpen.value) {
    closeFilter();
  } else {
    openFilter();
  }
}

function openFilter() {
  filterOpen.value = true;
}

function closeFilter() {
  filterOpen.value = false;
}

function applyFilter(filter: any) {
  setFilter(filter);
  filterOpen.value = false;
}

const listener = ref<any>(undefined);
const filterContainer = ref(null);
const isLoadDelayed = ref(false); // if next page must be loaded but the filter div is open;

watch(filterOpen, (isOpen) => {
  if (isOpen) {
    listener.value = onClickOutside(filterContainer, () => (filterOpen.value = false));
  } else {
    if (isLoadDelayed.value) {
      isLoadDelayed.value = false;
      checkTrigger();
    }
    listener?.value();
  }
});

function scrollToTop() {
  y.value = 0;
}

onQueryChange(() => {
  dataset.value = [];
  scrollToTop();
});
const el = ref<Window | null>(null);
onMounted(() => {
  el.value = window;
});

const { y, arrivedState } = useScroll(el, { behavior: "smooth" });
const isTop = computed(() => arrivedState.top);
const dataset = ref(res.value?.recents);
watch(res, (val) => {
  if ((val?.recents.length ?? 0) === 0) return (isEnded.value = true);
  dataset.value?.push(...(val?.recents ?? []));
});

const isEnded = ref(false);
const { checkTrigger } = useInfiniteScroll(
  () => {
    if (isEnded.value) return;
    if (filterOpen.value) return (isLoadDelayed.value = true);
    if (!pending.value) changePage((res.value?.page ?? 1) + 1);
  },
  { distance: 120 }
);

// onMounted(() => {
//   useInfiniteScroll(
//     window,
//     () => {
//       if (noMoreData.value) return;
//       page.value += 1;
//       const newData = getPage(page.value);
//       if (newData?.length) {
//         data.value.push(...getPage(page.value));
//       } else {
//         page.value -= 1;
//         noMoreData.value = true;
//       }
//     },
//     { distance: 10 }
//   );
// });
</script>

<!-- <script>
export default {
  props: {
    state: {
      type: Object,
      required: true,
    },
    firstLoad: {
      type: Boolean,
      required: true,
    },
    query: {
      type: Object,
      required: true,
    },
    // page: {
    //   type: Number,
    //   default() {
    //     return 1
    //   },
    // },
    dataSet: {
      type: Array,
      default() {
        return [];
      },
    },
    totalPage: {
      type: Number,
      default() {
        return 1;
      },
    },
    onPageChange: {
      type: Function,
      default() {
        return () => {};
      },
    },
    onFilter: {
      type: Function,
      default() {
        return () => {};
      },
    },
    noMoreData: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  data() {
    return {
      infiniteScroll: null,
      showLoading: false,
      isTop: true,
    };
  },
  watch: {
    dataSet(value, old) {
      if (!this.infiniteScroll) return;
      if (!value.length) {
        this.infiniteScroll.destroy();
      }
      this.infiniteScroll.finishLoading();
    },
    noMoreData(value) {
      if (value) this.infiniteScroll.destroy();
    },
  },
  mounted() {
    const success = this.startInfiniteScroll();
    if (!success) this.$nextTick(() => this.startInfiniteScroll());
  },
  beforeUnmount() {
    if (this.infiniteScroll) this.infiniteScroll.destroy();
  },
  methods: {
    scrollToTop() {
      if (window) window.scrollTo({ top: 0 });
    },
    toggleLoading() {
      this.showLoading = !this.showLoading;
    },
    startInfiniteScroll() {
      if (window) {
        this.infiniteScroll = new this.$infiniteScroll(window);
        this.infiniteScroll.on("load", () => {
          if (!this.firstLoad) {
            this.$nextTick(() => {
              this.onPageChange(this.query.page + 1);
              // console.log('LOADING PAGE', this.query.page + 1)
            });
          }
        });

        const content = this.$refs.content;

        this.infiniteScroll.on("scroll", ({ x, y, e }) => {
          if (content) {
            const isTop = y < content.offsetTop;
            if (this.isTop !== isTop) this.isTop = isTop;
          }
        });
        return true;
      }
      return false;
    },
  },
};
</script> -->

<style lang="scss">
.lds-ring {
  display: inline-block;
  position: relative;
  width: 50px;
  height: 50px;
}
.lds-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 38px;
  height: 38px;
  margin: 6px;
  border: 6px solid rgb(90, 90, 90);
  border-radius: 50%;
  animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: rgb(90, 90, 90) transparent transparent transparent;
}
.lds-ring div:nth-child(1) {
  animation-delay: -0.45s;
}
.lds-ring div:nth-child(2) {
  animation-delay: -0.3s;
}
.lds-ring div:nth-child(3) {
  animation-delay: -0.15s;
}
@keyframes lds-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
