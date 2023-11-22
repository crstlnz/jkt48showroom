<template>
  <div class="bg-container space-y-2.5 p-4 shadow-sm md:space-y-3.5 md:p-5">
    <div class="flex animate-pulse items-center justify-between">
      <div class="pulse-color h-7 w-24 rounded-xl lg:h-8 lg:text-2xl" />
    </div>
    <ul class="animate-pulse columns-1 md:columns-2 lg:columns-3 min-[1700px]:columns-4">
      <li v-for="n in 16" :key="n" class="max-md:[&:nth-child(n+6)]:hidden max-lg:[&:nth-child(n+9)]:hidden max-[1700px]:[&:nth-child(n+13)]:hidden">
        <div class="pulse-color mb-3 flex h-[84px] w-full items-center gap-4 rounded-3xl p-2 sm:p-3" />
      </li>
    </ul>
  </div>
</template>
