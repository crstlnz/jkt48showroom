<script lang="ts" setup>
defineProps<{
  to: string
  text?: string
  target?: string
}>()
</script>

<template>
  <NuxtLink
    :to="to"
    :target="target"
    class="rounded-lg border border-color-2 px-2.5 py-1 text-xs font-semibold opacity-80 transition hover:opacity-100"
  >
    {{ text ?? $t("more") }}
  </NuxtLink>
</template>
