<template>
  <div class="flex animate-pulse gap-3 py-2 text-center md:py-3">
    <div
      class="relative aspect-square h-[4.5rem] cursor-pointer overflow-hidden rounded-full drop-shadow-xs md:h-[70px]"
    >
      <div
        class="pulse-color h-full w-full"
      />
    </div>

    <div class="info flex min-w-0 flex-1 flex-col text-left">
      <div class="name flex flex-1 gap-2">
        <span
          class="pulse-color h-5 w-3/4 truncate rounded-xl font-bold md:h-6"
        />
      </div>
      <div class="mt-1 flex flex-col space-y-1 text-xs [&>span]:pulse-color md:text-sm">
        <span class="inline-block h-4 w-1/3 rounded-xl md:h-5" />
        <span class="inline-block h-4 w-1/2 rounded-xl md:h-5" />
      </div>
      <div class="mt-2 flex justify-end border-t-2 border-t-gray-50 pt-2 dark:border-t-zinc-700/50">
        <div class="pulse-color h-5 w-14 rounded-xl md:h-6" />
      </div>
    </div>
  </div>
</template>
