<template>
  <div class="flex-1 lg:w-0">
    <Transition
      enter-class="transition-all duration-500"
      leave-to-class="transition"
      enter-active-class="opacity-0 translate-y-full"
      leave-active-class="opacity-0 translate-y-full"
    >
      <div
        v-if="!isTop"
        class="fixed bottom-4 left-1/2 transition -translate-x-1/2 rounded-xl z-50 text-white font-bold overflow-hidden bg-second-2/95 px-4 py-2"
        @click="scrollToTop"
      >
        Scroll top
      </div>
    </Transition>
    <div class="flex justify-end mb-2 items-center">
      <div class="font-bold">Filter</div>
    </div>

    <div ref="content" class="relative">
      <transition name="fade-abs">
        <div v-if="state.pending && firstLoad" key="loading" class="space-y-2 md:space-y-4">
          <PulseRecentDetailCard v-for="index in Array(10).keys()" :key="index">Loading</PulseRecentDetailCard>
        </div>
        <div
          v-else-if="state.error || !dataSet || !dataSet.length"
          class="text-center flex justify-center flex-col px-10 pt-10"
        >
          <div class="space-y-5">
            <div class="mx-auto w-4/5 lg:w-[350px]">
              <img v-if="state.error" src="/img/security-error.png" alt="An Error Occured!" class="w-full mx-auto" />
              <img v-else src="/img/empty-box.png" alt="Empty!" class="w-full mx-auto" />
            </div>
            <div v-if="state.error">
              <h2 class="text-xl lg:text-3xl mb-1">An error occured</h2>
              <button class="hover:text-second-2 text-sm lg:text-base" href="/" @click="$parent.refresh">Retry</button>
            </div>
            <div v-else>
              <h2 class="text-lg lg:text-2xl mb-1">Sorry, but the requested data is not found!</h2>
            </div>
          </div>
        </div>

        <div v-else key="loaded" class="space-y-2 md:space-y-4">
          <RecentDetailCard v-for="data in dataSet" :key="data._id" :recent="data" />
        </div>
      </transition>
    </div>
    <!-- <div @click="toggleLoading">click</div> -->

    <div class="h-28 flex justify-center items-center text-center leading-[5rem]">
      <transition name="fade" mode="out-in">
        <div v-if="showLoading || (!firstLoad && state.pending)" key="spinner" class="lds-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div v-else-if="noMoreData" key="nomore">No more data :(</div>
      </transition>
    </div>
  </div>
</template>

<script>
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
  beforeDestroy() {
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
</script>

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
