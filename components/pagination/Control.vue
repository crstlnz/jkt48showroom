<script>
/* eslint-disable eqeqeq */

export default {
  props: {
    page: {
      type: Number,
      default () {
        return 1
      }
    },
    total: {
      type: Number,
      default () {
        return 1
      }
    },
    maxDots: {
      type: Number,
      default () {
        return 7
      }
    },
    separator: {
      type: String,
      default () {
        return '...'
      }
    }
  },
  emits: ['pageChange'],
  computed: {
    dots () {
      const page = this.page
      const dots = []
      if (this.total < this.maxDots) {
        for (let i = 1; i <= this.total; i++) {
          dots.push(i)
        }
        return dots
      }

      const lrNum = this.maxDots / 2 - 1 // left and right number
      if (page > lrNum && page < this.total - lrNum + 1) {
        dots.push(1)
        dots.push(this.separator)
        const n = this.maxDots - 4
        const f = Math.floor(n / 2)
        for (let i = 0; i < n; i++) {
          dots.push(page - f + i)
        }
        dots.push(this.separator)
        dots.push(this.total)
      } else {
        dots.push(this.separator)
        const n = Math.floor(this.maxDots / 2)

        for (let i = 0; i < n; i++) {
          dots.unshift(n - i)
        }

        for (let i = n - 1; i >= 0; i--) {
          dots.push(this.total - i)
        }
      }
      return dots
    }
  },
  methods: {
    next () {
      if (this.page == this.total) return
      this.$emit('pageChange', this.page + 1)
    },
    prev () {
      if (this.page == 1) return
      this.$emit('pageChange', this.page - 1)
    },
    changePage (val) {
      if (isNaN(val)) return
      if (val < 1 || val > this.total) return
      this.$emit('pageChange', val)
    }
  }
}
</script>

<template>
  <div
    class="pagination flex gap-2 select-none text-xs md:text-sm xl:text-base leading-7 sm:leading-8 xl:leading-10 text"
  >
    <button
      ref="left"
      aria-label="Previous Page"
      type="button"
      class="group rounded-full bg-white dark:bg-dark-1 h-7 w-7 sm:h-8 sm:w-8 xl:h-10 xl:w-10 relative cursor-pointer shadow-sm transition duration-300 overflow-hidden active:scale-95 hover:text-white hover:bg-second-2"
      @click="prev"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="4"
        stroke="currentColor"
        class="w-4 h-4 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 absolute"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
    </button>
    <div class="flex rounded-[40px] bg-white dark:bg-dark-1 h-7 sm:h-8 xl:h-10 shadow-sm px-2 relative">
      <button
        v-for="[index, dot] in dots.entries()"
        :key="index"
        aria-label="Go to Page"
        type="button"
        :class="{ active: dot == page }"
        class="dot h-7 w-7 sm:h-8 sm:w-8 xl:h-10 xl:w-10 text-center rounded-lg hover:text-second-2 transition duration-300 cursor-pointer mx-1"
        @click="changePage(dot)"
      >
        {{ dot }}
      </button>
    </div>
    <button
      ref="right"
      aria-label="Next Page"
      type="button"
      class="group rounded-full bg-white dark:bg-dark-1 h-7 w-7 sm:h-8 sm:w-8 xl:h-10 xl:w-10 relative cursor-pointer shadow-sm transition duration-300 overflow-hidden active:scale-95 hover:text-white hover:bg-second-2"
      @click="next"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="4"
        stroke="currentColor"
        class="w-4 h-4 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 absolute"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </button>
  </div>
</template>

<style lang="scss">
.pagination {
  .dot {
    &.active {
      @apply bg-second-2 scale-110 text-white shadow-[0_0_30px_-5px_#4698eb];
    }
  }
}
</style>
