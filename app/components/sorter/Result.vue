<script lang="ts" setup>
const props = defineProps<{
  result: (ISortMember | ISortMember[])[]
}>()

defineEmits<{ (e: 'restart'): void }>()
const revealAllOnFinish = useLocalStorage('sorter-reveal-all-finish', true)
const computedResult = computed(() => {
  const res: { rank: number, flip: boolean, member: ISortMember }[] = []
  for (const [index, member] of props.result.entries()) {
    if (Array.isArray(member)) {
      for (const m of member) {
        res.push({
          rank: index + 1,
          flip: true,
          member: m,
        })
      }
    }
    else {
      res.push({
        rank: index + 1,
        flip: true,
        member,
      })
    }
  }
  return res
})

const result = ref<{ rank: number, flip: boolean, member: ISortMember }[]>([])
watch([computedResult, revealAllOnFinish], async ([val, reveal]) => {
  if (!reveal) {
    result.value = val.map(item => ({ ...item, flip: true }))
    return
  }

  result.value = val.map(item => ({ ...item, flip: true }))
  if (val.length) {
    await sleep(500)
    for (const [index] of result.value.entries()) {
      const card = result.value[index]
      if (card) card.flip = false
      await sleep(170)
    }
  }
}, { immediate: true })
</script>

<template>
  <div class="mx-auto grid w-full max-w-5xl grid-cols-[repeat(auto-fill,minmax(105px,1fr))] justify-evenly gap-2.5 md:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] md:gap-4">
    <SorterCard
      v-for="member in result"
      :key="member.member.id"
      :flip="member.flip"
      :member="member.member"
      class=""
      :rank="member.rank"
      @click="() => {
        member.flip = !member.flip
      }"
    />
  </div>
</template>
