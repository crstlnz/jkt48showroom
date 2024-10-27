<script lang="ts" setup>
const props = withDefaults(defineProps<{
  parseType?: ParseType
  rate?: number
  showOriginal?: boolean
  value: string | number
}>(), {
  showOriginal: false,
})

const data = parseGift(Number(props.value), { rate: props.rate, showOriginal: props.showOriginal })
</script>

<template>
  <div>{{ data }}</div>
</template>
