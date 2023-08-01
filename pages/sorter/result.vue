<script lang="ts" setup>
definePageMeta({
  layout: 'sorter',
})

const result = useSessionStorage<(ISortMember | ISortMember[])[]>('sorter-result', [])
watch(result, (r) => {
  if (!r.length) {
    navigateTo('/sorter')
  }
}, { immediate: true })

const { stop } = useMemberSorter()
</script>

<template>
  <div class="container mx-auto flex flex-col gap-3 md:gap-4">
    <div class="mx-auto mt-10 flex w-[768px] max-w-[95%] justify-between">
      <div class="text-2xl font-bold opacity-80">
        Rank result
      </div>
      <Button class="rounded-full bg-red-500 px-3 text-white/90" @click="stop">
        Restart
      </Button>
    </div>
    <SorterResult :result="result" />
  </div>
</template>
