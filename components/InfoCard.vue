<script lang="ts" setup>
defineProps<{
  title: string | number
  value: string | number
  iconClass?: string
  icon: string
}>()
</script>

<template>
  <div class="p-4 md:p-5 rounded-xl flex bg-container items-center">
    <div :class="iconClass" class="rounded-full p-1 w-11 h-11 xl:w-14 xl:h-14 flex justify-center items-center  text-lg xl:text-xl">
      <Icon :name="icon" />
    </div>
    <div class="flex-1">
      <div class="text-center">
        <div class="font-semibold text-sm xl:text-base">
          {{ value }}
        </div>
        <div class="flex gap-1.5 justify-center text-xs xl:text-sm opacity-80">
          {{ title }}
        </div>
      </div>
    </div>
  </div>
</template>
