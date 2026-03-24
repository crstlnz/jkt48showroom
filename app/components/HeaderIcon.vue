<script lang="ts" setup>
withDefaults(defineProps<{
  icon?: string
  colorClass?: string
}>(), {
  icon: '',
  colorClass: '',
})
</script>

<template>
  <span
    v-if="icon"
    class="inline-flex size-8 items-center justify-center rounded-xl"
    :class="colorClass || 'bg-gray-500/15 text-gray-500'"
  >
    <Icon :name="icon" class="size-4.5" />
  </span>
</template>
