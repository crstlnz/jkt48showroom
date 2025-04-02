<template>
  <div class="flex animate-pulse flex-col gap-5 pt-4 md:pt-6 xl:pt-8">
    <div
      class="pulse-color aspect-38/9 overflow-hidden rounded-xl shadow-2xs lg:aspect-95/9"
    />
    <div class="mt-2 flex items-center justify-between gap-4 xl:mt-3">
      <div class="pulse-color h-7 w-52 rounded-xl  sm:h-8" />
      <div class="pulse-color h-4 w-32 rounded-xl md:h-5" />
    </div>
    <div class="pulse-color h-80 w-full rounded-xl" />
    <div class="flex items-center justify-between gap-4 xl:mt-2">
      <div class="pulse-color h-7 w-52 rounded-xl sm:h-8" />
      <div class="pulse-color h-4 w-32 rounded-xl md:h-5" />
    </div>
    <div>
      <div class="flex flex-col gap-3 md:flex-row xl:gap-4">
        <div
          v-for="stat in 4"
          :key="stat"
          class="pulse-color flex h-[88px] w-full items-center gap-2 rounded-lg shadow-2xs first:hidden md:w-0 md:flex-1 md:first:block lg:h-[104px] lg:gap-3"
        />
      </div>
    </div>
    <div
      class="pulse-color h-40 space-y-1 rounded-xl p-3 shadow-2xs md:p-4"
    />
    <div class="flex items-center justify-between gap-4 xl:mt-2">
      <div class="pulse-color h-7 w-52 rounded-xl sm:h-8" />
      <div class="pulse-color h-4 w-32 rounded-xl md:h-5" />
    </div>
    <div
      class="space-y-4 xl:grid xl:grid-cols-4 xl:grid-rows-1 xl:gap-4 xl:space-y-0"
    >
      <div class="pulse-color col-span-2 h-[400px] rounded-xl" />
      <div class="pulse-color rounded-xl" />
      <div class="pulse-color rounded-xl" />
    </div>
  </div>
</template>
