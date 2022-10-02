<template>
  <div class="pagination flex gap-2 select-none">
    <div
      ref="left"
      class="animate-pulse group rounded-full bg-white dark:bg-dark-1 h-7 w-7 sm:h-8 sm:w-8 xl:h-10 xl:w-10 relative cursor-pointer shadow-sm transition duration-300 overflow-hidden active:scale-95 hover:text-white hover:!bg-second-2"
    />
    <div
      class="animate-pulse flex rounded-[40px] w-[270px] md:w-[375px] xl:w-[448px] bg-white dark:bg-dark-1 h-7 sm:h-8 xl:h-10 shadow-sm px-2 relative"
    />
    <div
      ref="right"
      class="animate-pulse rounded-full bg-white dark:bg-dark-1 h-7 w-7 sm:h-8 sm:w-8 xl:h-10 xl:w-10 relative cursor-pointer shadow-sm transition duration-300 overflow-hidden active:scale-95 hover:text-white hover:!bg-second-2"
    />
  </div>
</template>
