<template>
  <div class="flex flex-col lg:flex-row gap-5 md:gap-6 xl:gap-8">
    <PaginationFilter
      class="lg:max-h-[calc(100vh_-_96px_-_20px)] lg:top-[96px] overflow-y-auto lg:w-[260px] xl:w-[320px] lg:sticky h-fit rounded-xl bg-white dark:bg-dark-1 p-4"
      :query="query"
      @apply="(filter) => $emit('filter', filter)"
    />
    <div class="flex-1 lg:w-0">
      <div class="flex flex-col sm:flex-row justify-between items-center mt-3 mb-4 lg:mb-6">
        <h1 class="text-2xl sm:text-xl md:text-2xl xl:text-3xl font-bold mb-3 sm:mb-0 !leading-[40px]">
          Recents Showroom
        </h1>
        <div>
          <div class="relative h-10">
            <Transition name="fade-abs" class="fade-abs">
              <PulsePagination v-if="!data?.length && pending" key="pulse" class="justify-center sm:!left-auto" />
              <PaginationControl
                v-else-if="!error && data?.length"
                key="pagination"
                class="justify-center sm:!left-auto"
                :page="query.page"
                :max-dots="dots"
                :total="totalPage"
                @page-change="(page) => $emit('pageChange', page)"
              />
            </Transition>
          </div>
        </div>
      </div>

      <div class="relative">
        <Transition name="fade-abs" class="fade-abs">
          <div v-if="pending" :key="Math.random()" class="space-y-4">
            <PulseRecentDetailCard v-for="index in Array(10).keys()" :key="index">Loading</PulseRecentDetailCard>
            <div class="mt-4 md:mt-6 xl:mt-8 sm:float-right">
              <div class="relative flex justify-center h-10">
                <PulsePagination key="pulse" class="justify-center sm:!left-auto" />
              </div>
            </div>
          </div>
          <div v-else-if="error || !data?.length" :key="Math.random() * 2">
            <div class="text-center flex justify-center flex-col pt-4">
              <div class="space-y-5">
                <div class="mx-auto w-4/5 lg:w-[350px]">
                  <img v-if="error" src="/img/security-error.png" alt="An Error Occured!" class="w-full mx-auto" />
                  <img v-else src="/img/empty-box.png" alt="Empty!" class="w-full mx-auto" />
                </div>
                <div>
                  <h2 v-if="error" class="text-xl lg:text-3xl mb-1">An error occured</h2>
                  <h2 v-else class="text-lg lg:text-2xl mb-1">Sorry, but the requested data is not found!</h2>
                  <button
                    aria-label="Retry"
                    type="button"
                    v-if="error"
                    class="hover:text-second-2 text-sm lg:text-base"
                    href="/"
                    @click="$emit('refresh')"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else :key="Math.random() * 3" class="space-y-4">
            <MemberRecentCard v-for="d in data" :key="d.data_id" :recent="d" />
            <!-- pagination -->
            <div class="mt-4 md:mt-6 xl:mt-8 sm:float-right">
              <div class="relative flex justify-center h-10">
                <PaginationControl
                  key="pagination"
                  class="justify-center sm:!left-auto"
                  :page="query.page"
                  :max-dots="dots"
                  :total="totalPage"
                  @page-change="(page) => $emit('pageChange', page)"
                />
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

defineProps({
  query: {
    type: Object,
    required: true,
  },
  data: {
    type: Array<IRecent>,
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
  pending: {
    type: Boolean,
    default() {
      return true;
    },
  },
  error: {
    type: Boolean,
    default() {
      return false;
    },
  },
});

const isMedium = useBreakpoints(breakpointsTailwind).smaller("md");
const dots = computed(() => {
  if (isMedium.value) return 7;
  return 9;
});
</script>

<!-- <script>
  export default {
    data() {
      return {
        dots: 9,
        resize: null,
      };
    },
    mounted() {
      if (window) {
        this.changeDots();
        this.resize = new this.$listener(window).add("resize", this.changeDots.bind(this));
      }
    },
    beforeDestroy() {
      if (this.resize) this.resize.remove("resize");
    },
    methods: {
      changeDots() {
        let dots = 9;
        if (window.innerWidth < 640) dots = 7;
        if (this.dots !== dots) this.dots = dots;
      },
    },
  };
  </script> -->
