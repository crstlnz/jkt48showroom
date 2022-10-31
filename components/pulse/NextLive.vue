<template>
  <div class="text-center py-2 md:py-3 flex gap-3">
    <div class="h-20 aspect-square drop-shadow-sm pulse-color animate-pulse rounded-full overflow-hidden" />
    <div class="info text-left flex flex-col flex-1 w-0">
      <div class="name flex flex-1 gap-2">
        <div
          class="font-bold text-ellipsis whitespace-nowrap overflow-hidden w-[60%] h-6 pulse-color animate-pulse rounded-xl"
        />
      </div>
      <ul class="mt-1 space-y-1 [&>li]:flex [&>li]:gap-1 text-sm">
        <li>
          <div class="pulse-color h-5 w-5 animate-pulse rounded-full" />
          <div class="pulse-color h-5 w-14 animate-pulse rounded-xl" />
        </li>
      </ul>
      <div class="mt-2 pt-2 border-t-2 border-t-gray-50 dark:border-t-dark-2 flex justify-end">
        <ul>
          <li><div class="h-6 w-16 pulse-color animate-pulse rounded-xl"></div></li>
        </ul>
      </div>
    </div>
  </div>
</template>
