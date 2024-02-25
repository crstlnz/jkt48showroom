<script lang="ts" setup>
const isOnline = useOnline()
watch(isOnline, (online) => {
  if (online) navigateTo('/')
}, {
  immediate: true,
})
</script>

<template>
  <OfflinePage />
</template>
