<script setup lang="ts">
import { Icon } from '#components'

defineProps<{
  isSwitch: boolean
  icon: string
  switchIcon: string
  size?: string
}>()
</script>

<template>
  <div class="relative">
    <Icon :class="{ 'opacity-0 invisible': isSwitch }" :name="icon" :size="size" class="absolute w-full h-full" />
    <Icon :class="{ 'opacity-0 invisible': !isSwitch }" :name="switchIcon" :size="size" class="absolute w-full h-full" />
  </div>
</template>
