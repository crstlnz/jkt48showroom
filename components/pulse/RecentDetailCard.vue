<template>
  <div class="rounded-xl bg-white dark:bg-dark-1 p-3 md:p-4 shadow-sm">
    <div class="flex gap-3 md:gap-4">
      <div
        class="h-20 sm:h-24 md:h-28 lg:h-32 xl:h-36 aspect-video bg-slate-200 dark:bg-dark-3/50 animate-pulse overflow-hidden rounded-xl"
      />
      <div class="flex-1 w-0 space-y-2 flex flex-col justify-between">
        <div
          class="font-bold text-xl bg-slate-200 dark:bg-dark-3/50 w-[450px] max-w-[80%] lg:max-w-[60%] h-6 md:h-7 animate-pulse overflow-hidden rounded-xl"
        />
        <ul class="space-y-1 [&>li]:flex [&>li]:alig [&>li]:gap-2 text-sm md:text-base">
          <li class="flex items-center">
            <div
              class="aspect-square h-5 lg:h-6 bg-slate-200 dark:bg-dark-3/50 animate-pulse overflow-hidden rounded-full"
            />
            <div
              class="bg-slate-200 dark:bg-dark-3/50 w-28 h-4 md:h-5 animate-pulse overflow-hidden rounded-xl max-w-[60%]"
            />
          </li>
          <li class="flex items-center">
            <div
              class="aspect-square h-5 lg:h-6 bg-slate-200 dark:bg-dark-3/50 animate-pulse overflow-hidden rounded-full"
            />
            <div
              class="bg-slate-200 dark:bg-dark-3/50 animate-pulse overflow-hidden w-28 h-4 md:h-5 rounded-xl max-w-[60%]"
            />
          </li>
        </ul>
      </div>
    </div>

    <div class="flex justify-between mt-2 md:mt-2.5">
      <div
        class="w-28 md:w-32 lg:w-36 h-5 sm:h-6 md:h-7 bg-slate-200 dark:bg-dark-3/50 animate-pulse overflow-hidden rounded-xl max-w-[60%]"
      />
      <div
        class="w-12 md:w-14 lg:w-16 h-5 sm:h-6 md:h-7 bg-slate-200 dark:bg-dark-3/50 animate-pulse overflow-hidden rounded-xl max-w-[40%]"
      />
    </div>
  </div>
</template>
