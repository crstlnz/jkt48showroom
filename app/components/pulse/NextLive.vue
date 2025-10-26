<template>
  <div class="flex gap-3 py-2 text-center md:py-3">
    <div
      class="pulse-color aspect-square h-20 animate-pulse overflow-hidden rounded-full drop-shadow-xs"
    />
    <div class="info flex min-w-0 flex-1 flex-col text-left">
      <div class="name flex flex-1 gap-2">
        <div
          class="pulse-color h-6 w-[60%] animate-pulse overflow-hidden text-ellipsis whitespace-nowrap rounded-xl font-bold"
        />
      </div>
      <ul class="mt-1 space-y-1 text-sm [&>li]:flex [&>li]:gap-1">
        <li>
          <div class="pulse-color h-5 w-5 animate-pulse rounded-full" />
          <div class="pulse-color h-5 w-14 animate-pulse rounded-xl" />
        </li>
      </ul>
      <div
        class="mt-2 flex justify-end border-t-2 border-t-gray-50 pt-2 dark:border-t-zinc-700/50"
      >
        <ul>
          <li>
            <div class="pulse-color h-6 w-16 animate-pulse rounded-xl" />
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
