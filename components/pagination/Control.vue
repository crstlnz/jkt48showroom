<!-- <script>
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
</script> -->

<script lang="ts" setup>
interface ControlProps {
 page : number,
 total : number,
 maxDots : number,
 separator? : string
}

const props = withDefaults(defineProps<ControlProps>(), {
  page: 1,
  total: 1,
  maxDots: 9,
  separator: '...'
})

const dots = computed(() => {
  const page = props.page
  const dots = []
  const maxDots = props.maxDots
  if (props.total < maxDots) {
    for (let i = 1; i <= props.total; i++) {
      dots.push(i)
    }
    return dots
  }

  const lrNum = maxDots / 2 - 1 // left and right number
  if (page > lrNum && page < props.total - lrNum + 1) {
    dots.push(1)
    dots.push(props.separator)
    const n = maxDots - 4
    const f = Math.floor(n / 2)
    for (let i = 0; i < n; i++) {
      dots.push(page - f + i)
    }
    dots.push(props.separator)
    dots.push(props.total)
  } else {
    dots.push(props.separator)
    const n = Math.floor(maxDots / 2)

    for (let i = 0; i < n; i++) {
      dots.unshift(n - i)
    }

    for (let i = n - 1; i >= 0; i--) {
      dots.push(props.total - i)
    }
  }
  return dots
})

const emit = defineEmits(['pageChange'])

function next () {
  if (props.page === props.total) return
  emit('pageChange', props.page + 1)
}

function prev () {
  if (props.page === 1) return
  emit('pageChange', props.page - 1)
}

function changePage (val : number) {
  if (isNaN(val)) return
  if (val < 1 || val > props.total) return
  emit('pageChange', val)
}
</script>

<template>
  <div>
    <ClientOnly>
      <template #fallback>
        <PulsePaginationControl />
      </template>
      <div
        class="pagination text flex select-none gap-2 text-xs leading-7 sm:leading-8 md:text-sm xl:text-base xl:leading-10"
      >
        <button
          ref="left"
          aria-label="Previous Page"
          type="button"
          class="group relative h-7 w-7 cursor-pointer overflow-hidden rounded-full bg-white shadow-sm transition duration-300 hover:bg-second-2 hover:text-white active:scale-95 dark:bg-dark-1 sm:h-8 sm:w-8 xl:h-10 xl:w-10"
          @click="prev"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="4"
            stroke="currentColor"
            class="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div class="relative flex h-7 rounded-[40px] bg-white px-2 shadow-sm dark:bg-dark-1 sm:h-8 xl:h-10">
          <button
            v-for="[index, dot] in dots.entries()"
            :key="index"
            aria-label="Go to Page"
            type="button"
            :data-page="page"
            :data-dot="dot"
            :data-active="(dot == page)"
            :class="{ active: (dot == page )}"
            class="dot mx-1 h-7 w-7 cursor-pointer rounded-lg text-center transition duration-300 hover:text-second-2 sm:h-8 sm:w-8 xl:h-10 xl:w-10"
            @click="()=> {
              if(typeof dot === 'number') changePage(dot)
            }"
          >
            {{ dot }}
          </button>
        </div>
        <button
          ref="right"
          aria-label="Next Page"
          type="button"
          class="group relative h-7 w-7 cursor-pointer overflow-hidden rounded-full bg-white shadow-sm transition duration-300 hover:bg-second-2 hover:text-white active:scale-95 dark:bg-dark-1 sm:h-8 sm:w-8 xl:h-10 xl:w-10"
          @click="next"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="4"
            stroke="currentColor"
            class="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </ClientOnly>
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
