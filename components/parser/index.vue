<script lang="ts" setup>
defineProps<{
  parseType?: ParseType
  value: string | number
}>()
</script>

<template>
  <ParserDate v-if="parseType === 'date'" :parse-type="parseType" :value="String(value)" />
  <ParserNumber v-else-if="parseType === 'number'" :parse-type="parseType" :value="String(value)" />
  <ParserDuration v-else-if="parseType === 'duration'" :parse-type="parseType" :value="String(value)" />
  <ParserGift v-else-if="parseType === 'gift'" :parse-type="parseType" :value="String(value)" />
  <ParserViewer v-else-if="parseType === 'viewer'" :parse-type="parseType" :value="String(value)" />
  <div v-else>
    {{ value }}
  </div>
</template>
