<template>
  <div class="text-center py-2 md:py-3 flex gap-3 animate-pulse">
    <NuxtLink
      aria-label="View profile"
      class="h-[4.5rem] md:h-20 aspect-square relative cursor-pointer drop-shadow-sm rounded-full overflow-hidden"
      to="/"
    >
      <div
        class="w-full h-full pulse-color"
      />
    </NuxtLink>

    <div class="info text-left flex flex-col flex-1 w-0">
      <div class="name flex flex-1 gap-2">
        <span
          class="font-bold text-ellipsis whitespace-nowrap overflow-hidden h-5 md:h-6 pulse-color w-3/4 rounded-xl"
        />
      </div>
      <div class="mt-1 space-y-1 flex flex-col text-xs md:text-sm [&>span]:pulse-color">
        <span class="h-4 md:h-5 w-1/3 inline-block rounded-xl" />
        <span class="h-4 md:h-5 w-1/2 inline-block rounded-xl" />
      </div>
      <div class="mt-2 pt-2 border-t-2 border-t-gray-50 dark:border-t-dark-2 flex justify-end">
        <div class="h-5 md:h-6 w-14 pulse-color rounded-xl" />
      </div>
    </div>
  </div>
</template>
