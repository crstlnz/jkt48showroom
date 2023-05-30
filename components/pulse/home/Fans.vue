<script lang="ts" setup>
const { greaterOrEqual } = useResponsive()
const medium = greaterOrEqual('md')
const large = greaterOrEqual('lg')
const xl = greaterOrEqual('extra')
const showCount = computed(() => {
  if (xl.value) {
    return 16
  }
  else if (large.value) {
    return 12
  }
  else if (medium.value) {
    return 8
  }
  else {
    return 5
  }
})
</script>

<template>
  <div class="bg-container space-y-2.5 p-4 shadow-sm md:space-y-3.5 md:p-5">
    <div class="flex animate-pulse items-center justify-between">
      <div class="pulse-color h-7 w-24 rounded-xl lg:h-8 lg:text-2xl" />
    </div>
    <ul class="animate-pulse columns-1 md:columns-2 lg:columns-3 min-[1700px]:columns-4">
      <li v-for="n in showCount" :key="n">
        <div class="pulse-color mb-3 flex h-[84px] w-full items-center gap-4 rounded-3xl p-2 sm:p-3" />
      </li>
    </ul>
  </div>
</template>
