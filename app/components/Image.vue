<script lang="ts" setup>
defineOptions({
  inheritAttrs: false,
})

const userAgent = import.meta.client
  ? navigator.userAgent
  : useRequestHeaders(['user-agent'])['user-agent']

const headless = userAgent?.toLocaleLowerCase()?.includes('headless')
</script>

<template>
  <NuxtImg v-if="!headless" v-bind="{ ...$attrs, provider: 'crstlnz' }" />
  <img v-else v-bind="{ ...$attrs }">
</template>
