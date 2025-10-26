<script lang="ts" setup>
definePageMeta({
  layout: 'sorter',
})

const result = useSessionStorage<(ISortMember | ISortMember[])[]>('sorter-result', [])
const filterList = useSessionStorage<string[]>('sorter-filterlist', [])
watch(result, (r) => {
  if (!r.length) {
    navigateTo('/sorter')
  }
}, { immediate: true })

const { stop, undo: u } = useMemberSorter()
function undo() {
  u()
  navigateTo('/sorter')
}
</script>

<template>
  <div class="container mx-auto flex flex-col gap-2 md:gap-3">
    <div class="mx-auto mt-3 flex w-[768px] max-w-[95%] justify-between md:mt-6">
      <div class="text-2xl font-bold opacity-80">
        Rank result
      </div>
      <div class="flex gap-3">
        <Button class="rounded-full bg-blue-500 px-3 text-white/90" @click="undo">
          Undo
        </Button>
        <Button class="rounded-full bg-red-500 px-3 text-white/90" @click="stop">
          Restart
        </Button>
      </div>
    </div>
    <div class="mx-auto w-[768px] max-w-[95%]">
      <div class="flex flex-wrap gap-2 md:gap-3">
        <div v-for="filter in filterList" :key="filter" class="rounded-full bg-blue-400/25 px-3 py-1 text-sm dark:bg-blue-400/10 md:text-base">
          {{ filter }}
        </div>
      </div>
    </div>
    <SorterResult class="mx-auto mt-2 w-[1024px] max-w-[95%] md:mt-5" :result="result" />
  </div>
</template>
