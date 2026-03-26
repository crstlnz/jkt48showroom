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
    class="rounded-lg border border-color-1 px-2 py-0.5 md:py-1 text-[10px] md:text-xs font-semibold opacity-80 transition hover:opacity-100 hover:bg-gray-500/5 duration-300"
  >
    <template v-if="$slots.default">
      <slot />
    </template>
    <template v-else>
      {{ text ?? $t("more") }}
    </template>
  </NuxtLink>
</template>
