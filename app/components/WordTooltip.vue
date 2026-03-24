<script lang="ts" setup>
withDefaults(defineProps<{
  tooltip: string
  markerClass?: string
}>(), {
  markerClass: '',
})
</script>

<template>
  <span
    v-tooltip="tooltip"
    class="inline cursor-help border-b border-dotted border-current/45 transition-colors hover:border-current/70"
    :class="markerClass"
  >
    <slot />
  </span>
</template>
