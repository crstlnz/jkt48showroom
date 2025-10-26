<script lang="ts" setup>
const props = defineProps<{
  parseType: ParseType
  value: string
  customFormat?: string
}>()

const date = ref(parseDate())
const { locale } = useI18n()

function parseDate() {
  try {
    const timestamp = Number.parseInt(props.value)
    const date = new Date(Number.isNaN(timestamp) ? props.value : timestamp)
    return !Number.isNaN(date?.getTime()) ? date : null
  }
  catch {
    return null
  }
}
</script>

<template>
  <div v-if="date">
    {{ customFormat ? $dayjs(date).locale(locale).format(customFormat) : $d(date, "long") }}
  </div>
  <div v-else>
    Error parsing date!
  </div>
</template>
