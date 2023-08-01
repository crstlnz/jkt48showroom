<script lang="ts" setup>
const props = defineProps<{
  parseType: ParseType
  value: string
}>()

const date = ref(parseDate())

function parseDate() {
  try {
    const timestamp = Number.parseInt(props.value)
    const date = new Date(Number.isNaN(timestamp) ? props.value : timestamp)
    return !Number.isNaN(date?.getTime()) ? date : null
  }
  catch (e) {
    return null
  }
}
</script>

<template>
  <div v-if="date">
    {{ $d(date, "long") }}
  </div>
  <div v-else>
    Error parsing date!
  </div>
</template>
