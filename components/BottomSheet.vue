<template>
  <div class="absolute">
    <transition name="sheet">
      <div v-if="isOpen" ref="swipe">
        <div
          ref="background"
          class="visible md:invisible transform-[visibility] md:opacity-0 bg-black/30 dark:bg-black/60 fixed top-0 left-0 right-0 bottom-0 z-[100] !m-0 background"
          @click="close"
        ></div>

        <div
          :class="{ 'transition-transform duration-[600]': !isDrag }"
          ref="sheet"
          class="sheet-content !fixed w-full left-0 md:left-auto md:w-[450px] md:right-10 lg:right-20 bottom-0 max-h-[90vh] overflow-hidden rounded-t-3xl md:rounded-t-2xl ease-in-out z-[100] md:shadow-rounded touch-none"
        >
          <RecycleScroller
            ref="scroller"
            class="overflow-y-auto roundedscrollbar h-[80vh] bg-white dark:bg-dark-1 overscroll-contain"
            :class="{ 'no-scrollbar': $device.isMobile }"
            :items="items"
            :item-size="120"
            key-field="id"
          >
            <template #before>
              <div
                class="h-16 flex justify-between shadow-sm bg-white/80 dark:bg-dark-1/80 w-full backdrop-blur-md relative"
              >
                <div
                  v-if="$device.isMobile"
                  class="absolute top-1.5 left-1/2 -translate-x-1/2 h-[3px] w-14 bg-slate-400/40 dark:bg-dark-3/90 rounded-sm"
                ></div>
                <h2 ref="sheetNav" class="px-5 text-xl font-bold leading-[4rem] select-none flex-1">
                  {{ title }}
                </h2>
                <button
                  v-if="!$device.isMobile"
                  ref="closeBtn"
                  class="group px-5 disable-highlight scale-100 active:bg-slate-100 dark:active:bg-dark-2 transition-transform"
                  @click="close"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    class="w-6 h-6 group-active:scale-90"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </template>

            <template #default="{ item, index }">
              <slot :item="item" :index="index" />
            </template>
          </RecycleScroller>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { RecycleScroller } from "vue-virtual-scroller";

export default {
  components: { RecycleScroller },

  props: {
    id: {
      type: String,
      default() {
        return "bottomSheet";
      },
    },
    title: {
      type: String,
      default() {
        return "";
      },
    },
    items: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      isOpen: false,
      isDrag: false,
      dragListener: null,
      dragListener2: null,
    };
  },
  watch: {
    isOpen(open) {
      this.$nextTick(() => {
        if (open) {
          if (this.$device.isMobile) {
            const query = {};
            query[this.id] = null;
            this.$router.push({
              path: this.$route.path,
              query,
            });
          }
          return this.startListener();
        } else if (this.$device.isMobile && this.$route.query[this.id] === null) {
          this.$router.back();
        }
        return this.stopListener();
      });
    },
    $route(to, from) {
      if (this.$device.isMobile) {
        const tQ = to.query[this.id];
        const fQ = from.query[this.id];
        if (tQ === undefined && fQ === null) {
          this.close();
        }
      }
    },
  },

  methods: {
    open() {
      this.isOpen = true;
    },
    close() {
      this.isOpen = false;
    },
    toggle() {
      this.isOpen = !this.isOpen;
    },
    startListener() {
      const bg = this.$refs.background;
      if (bg) bg.addEventListener("touchmove", (e) => e.preventDefault());
      this.listenDrag();
      const scroller = this.$refs.scroller.$el;
      const sheet = this.$refs.sheet;
      let percent = 0;
      let swipeDetector;
      if (scroller && sheet) {
        this.dragListener = this.$createDragListener(scroller);
        let isScrolling = false;
        let isDragging = false;
        this.dragListener.on("move", ({ x, y, e }) => {
          const isTop = scroller.scrollTop === 0;
          if (isTop && !isScrolling) {
            if (!this.isDrag) {
              if (e.cancelable) e.preventDefault();
              this.isDrag = true;
              swipeDetector = this.$createSwipeDetector(x, y);
            } else if (y <= 0 || x <= 0 || x >= window.innerWidth || y >= window.innerHeight) {
              this.finishDrag(x, y, percent, swipeDetector);
            } else {
              const deltaY = swipeDetector ? swipeDetector.getDistanceY(y) : 0;
              percent = (deltaY / sheet.clientHeight) * 100;
              if (percent >= 0) {
                isDragging = true;
                if (e.cancelable) e.preventDefault();
                sheet.style.transform = `translateY(${percent}%)`;
              } else if (isDragging) {
                if (e.cancelable) e.preventDefault();
              } else {
                isScrolling = true;
                this.isDrag = false;
              }
            }
          }
        });
        this.dragListener.on("end", ({ x, y }) => {
          isScrolling = false;
          isDragging = false;
          this.finishDrag(x, y, percent, swipeDetector);
        });
      }
    },
    stopListener() {
      if (this.dragListener) this.dragListener.destroy();
      if (this.dragListener2) this.dragListener2.destroy();
    },
    finishDrag(x, y, percent, swipeDetector) {
      this.isDrag = false;
      const isSwipe = swipeDetector ? swipeDetector.finish(x, y) : false;
      if (percent > 40 || isSwipe) {
        return this.close();
      }
      this.$refs.sheet.style.transform = null;
    },
    listenDrag() {
      const navbar = this.$refs.sheetNav;
      const sheet = this.$refs.sheet;
      if (navbar && sheet) {
        let swipeDetector;
        let percent = 0;
        this.dragListener2 = this.$createDragListener(navbar);
        this.dragListener2.on("start", ({ x, y, e }) => {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
          this.isDrag = true;
          swipeDetector = this.$createSwipeDetector(x, y);
        });
        this.dragListener2.on("move", ({ x, y }) => {
          if (y <= 0 || x <= 0 || x >= window.innerWidth || y >= window.innerHeight) {
            this.finishDrag(x, y, percent, swipeDetector);
          } else {
            const deltaY = swipeDetector ? swipeDetector.getDistanceY(y) : 0;
            percent = (deltaY / sheet.clientHeight) * 100;
            percent = percent < 0 ? 0 : percent;
            sheet.style.transform = `translateY(${percent}%)`;
          }
        });
        this.dragListener2.on("end", ({ x, y }) => {
          this.finishDrag(x, y, percent, swipeDetector);
        });
      }
    },
  },
};
</script>
