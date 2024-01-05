<script lang="ts" setup>
const props = withDefaults(defineProps<{
  parseType?: ParseType
  rate?: number
  showOriginal?: boolean
  value: string | number
}>(), {
  showOriginal: false,
})

const data = computed<string>(() => {
  let number = 0
  try {
    number = Number(props.value)
  }
  catch (e) {
    console.error(e)
  }

  return parseGift(number, { rate: props.rate, showOriginal: props.showOriginal })
})
</script>

<template>
  <div>{{ data }}</div>
</template>
