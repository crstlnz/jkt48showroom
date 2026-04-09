<script lang="ts" setup>
defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()

const userAgent = import.meta.client
  ? navigator.userAgent
  : useRequestHeaders(['user-agent'])['user-agent']

const headless = userAgent?.toLowerCase()?.includes('headless')

const boundAttrs = computed(() => {
  if (headless) {
    const { placeholder, ...rest } = attrs
    return rest
  }
  return attrs
})
</script>

<template>
  <NuxtImg v-bind="{ ...boundAttrs, provider: 'crstlnz' }" />
</template>
