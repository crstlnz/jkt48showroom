<script lang="ts" setup>
const props = defineProps<{
  parseType: ParseType
  value: string
}>()

const num = ref<number>(parseInt())

function parseInt() {
  try {
    return Number.parseInt(props.value)
  }
  catch (e) {
    return 0
  }
}
</script>

<template>
  <div>{{ $n(num) }}</div>
</template>
