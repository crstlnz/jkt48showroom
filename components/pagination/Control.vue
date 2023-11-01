<script lang="ts" setup>
interface ControlProps {
  page: number
  total: number
  maxDots: number
  separator?: string
}

const props = withDefaults(defineProps<ControlProps>(), {
  page: 1,
  total: 1,
  maxDots: 9,
  separator: '...',
})

const emit = defineEmits(['pageChange'])

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
  }
  else {
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

function next() {
  if (props.page === props.total) return
  emit('pageChange', props.page + 1)
}

function prev() {
  if (props.page === 1) return
  emit('pageChange', props.page - 1)
}

function changePage(val: number) {
  if (isNaN(val)) return
  if (val < 1 || val > props.total) return
  emit('pageChange', val)
}
</script>

<template>
  <div class="flex w-full justify-between">
    <button
      aria-label="Previous Page"
      type="button"
      :disabled="page === 1"
      :class="{ 'hover:bg-second-2 hover:border-second-2 hover:text-white active:scale-90': page !== 1, 'cursor-not-allowed bg-zinc-400/25': page === 1 }"
      class="relative h-7 w-7 rounded-xl border-2 text-center leading-7 transition-[background-color,border-color,transform] duration-300 dark:border-zinc-400/25 sm:h-8 sm:w-8 sm:leading-8"
      @click="prev"
    >
      <Icon name="material-symbols:arrow-left-rounded" size="1.5rem" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
    </button>
    <Component
      :is="typeof dot === 'number' ? 'button' : 'span'"
      v-for="[index, dot] in dots.entries()"
      :key="index"
      aria-label="Go to Page"
      type="button"
      :data-page="page"
      :data-dot="dot"
      :data-active="dot === page"
      :class="{
        'bg-second-2 border-second-2 text-white': (dot === page),
        'hover:text-second-2': (dot !== page) && typeof dot === 'number',
        'border-2 dark:border-zinc-400/25': typeof dot === 'number',
      }"
      class="h-7 w-7 rounded-xl text-center text-xs leading-7 transition-[background-color,border-color] duration-300 sm:h-8 sm:w-8 sm:leading-8"
      @click="() => {
        if (typeof dot === 'number') changePage(dot)
      }"
    >
      {{ dot }}
    </Component>
    <button
      aria-label="Next Page"
      type="button"
      :disabled="page === total"
      :class="{ 'hover:bg-second-2 hover:border-second-2 hover:text-white active:scale-90': page !== total, 'cursor-not-allowed bg-zinc-400/25 dark:bg-zinc-400/50': page === total }"
      class="relative h-7 w-7 rounded-xl border-2 text-center leading-7 transition-[background-color,border-color,transform] duration-300 dark:border-zinc-400/25 sm:h-8 sm:w-8 sm:leading-8"
      @click="next"
    >
      <Icon name="material-symbols:arrow-right-rounded" size="1.5rem" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
    </button>
  </div>
</template>
