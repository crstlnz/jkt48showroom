<script lang="ts" setup>
import sleep from '~~/library/utils/sleep'

const props = defineProps<{
  result: (ISortMember | ISortMember[])[]
}>()

defineEmits<{ (e: 'restart'): void }>()
const computedResult = computed(() => {
  const res: { rank: number; flip: boolean; member: ISortMember }[] = []
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

const result = ref<{ rank: number; flip: boolean; member: ISortMember }[]>([])
watch(computedResult, async (val) => {
  result.value = val
  if (val) {
    await sleep(500)
    for (const [index, res] of result.value.entries()) {
      const card = result.value[index]
      if (card) card.flip = false
      await sleep(50)
    }
  }
}, { immediate: true })
</script>

<template>
  <div class="mx-auto grid w-[1024px] max-w-[95%] grid-cols-[repeat(auto-fill,minmax(90px,1fr))] justify-evenly gap-2 md:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] md:gap-4">
    <SorterCard v-for="member in result" :key="member.member.id" :flip="member.flip" :member="member.member" class="" :rank="member.rank" @click="member.flip = !member.flip" />
    <!-- <div v-for="member in result" :key="member.member.id || member.rank">
      <LazyImage :src="member.member.img" :alt="member.member.name" class="aspect-[3/4] w-32" />
      <div>
        {{ member.rank + member.member.name }}
      </div>
    </div> -->
  </div>
</template>
