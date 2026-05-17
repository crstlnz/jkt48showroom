<script lang="ts" setup>
defineProps<{
  title: string
  icon: string
  iconClass?: string
}>()
</script>

<template>
  <div class="bg-container flex flex-col rounded-xl p-1.5 md:p-2">
    <div class="flex items-center gap-2 pb-2.5 text-base font-semibold px-1 pt-1.5">
      <Icon :name="icon" :class="iconClass" size="1.5rem" />
      <span>{{ title }}</span>
    </div>
    <slot />
  </div>
</template>
