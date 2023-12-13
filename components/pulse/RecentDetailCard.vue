<template>
  <div class="rounded-xl bg-white p-3 shadow-sm dark:bg-dark-1 md:p-4">
    <div class="flex gap-3 md:gap-4">
      <div
        class="aspect-video h-20 animate-pulse overflow-hidden rounded-xl bg-slate-200 dark:bg-dark-3/50 sm:h-24 md:h-28 lg:h-32 xl:h-36"
      />
      <div class="flex min-w-0 flex-1 flex-col space-y-2">
        <div
          class="h-6 w-[450px] max-w-[80%] animate-pulse overflow-hidden rounded-xl bg-slate-200 text-xl font-bold dark:bg-dark-3/50 md:h-7 lg:max-w-[60%]"
        />
        <ul class="[&>li]:alig space-y-1 text-sm md:text-base [&>li]:flex [&>li]:gap-2">
          <li class="flex items-center">
            <div
              class="aspect-square h-5 animate-pulse overflow-hidden rounded-full bg-slate-200 dark:bg-dark-3/50 lg:h-6"
            />
            <div
              class="h-4 w-28 max-w-[60%] animate-pulse overflow-hidden rounded-xl bg-slate-200 dark:bg-dark-3/50 md:h-5"
            />
          </li>
          <li class="flex items-center">
            <div
              class="aspect-square h-5 animate-pulse overflow-hidden rounded-full bg-slate-200 dark:bg-dark-3/50 lg:h-6"
            />
            <div
              class="h-4 w-28 max-w-[60%] animate-pulse overflow-hidden rounded-xl bg-slate-200 dark:bg-dark-3/50 md:h-5"
            />
          </li>
          <li class="flex items-center">
            <div
              class="aspect-square h-5 animate-pulse overflow-hidden rounded-full bg-slate-200 dark:bg-dark-3/50 lg:h-6"
            />
            <div
              class="h-4 w-28 max-w-[60%] animate-pulse overflow-hidden rounded-xl bg-slate-200 dark:bg-dark-3/50 md:h-5"
            />
          </li>
        </ul>
      </div>
    </div>

    <div class="mt-2 flex justify-between md:mt-2.5">
      <div
        class="max-w-[60%] animate-pulse overflow-hidden rounded-xl bg-slate-200 dark:bg-dark-3/50 h-4 sm:h-5 xl:h-6 w-[35%]"
      />
      <div
        class="w-14 max-w-[40%] animate-pulse overflow-hidden rounded-xl bg-slate-200 dark:bg-dark-3/50 h-4 sm:h-5 xl:h-6 md:w-16 lg:w-20"
      />
    </div>
  </div>
</template>
