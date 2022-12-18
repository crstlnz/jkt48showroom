<template>
  <div class="flex flex-col gap-5 pt-4 md:pt-6 xl:pt-8">
    <div
      class="animate-pulse rounded-xl overflow-hidden shadow-sm aspect-[38/9] lg:aspect-[95/9] pulse-color"
    />
    <div class="flex justify-between items-center mt-2 xl:mt-3 gap-4">
      <div class="animate-pulse h-7 sm:h-8 w-52 pulse-color rounded-xl" />
      <div class="h-4 md:h-5 w-32 rounded-xl animate-pulse pulse-color" />
    </div>
    <div class="pulse-color animate-pulse w-full h-80 rounded-xl"></div>
    <div class="flex justify-between items-center xl:mt-2 gap-4">
      <div class="animate-pulse h-7 sm:h-8 w-52 pulse-color rounded-xl" />
      <div class="h-4 md:h-5 w-32 rounded-xl animate-pulse pulse-color" />
    </div>
    <div>
      <div class="flex md:flex-row flex-col gap-3 xl:gap-4">
        <div
          v-for="stat in 4"
          :key="stat"
          class="h-[88px] lg:h-[104px] pulse-color animate-pulse rounded-lg items-center gap-2 lg:gap-3 md:flex-1 flex w-full md:w-0 first:hidden md:first:block shadow-sm"
        ></div>
      </div>
    </div>
    <div
      class="pulse-color animate-pulse h-40 rounded-xl p-3 md:p-4 space-y-1 shadow-sm"
    ></div>
    <div class="flex justify-between items-center xl:mt-2 gap-4">
      <div class="animate-pulse h-7 sm:h-8 w-52 pulse-color rounded-xl" />
      <div class="h-4 md:h-5 w-32 rounded-xl animate-pulse pulse-color" />
    </div>
    <div
      class="space-y-4 xl:space-y-0 xl:grid xl:grid-cols-4 xl:gap-4 xl:grid-rows-1"
    >
      <div class="animate-pulse pulse-color rounded-xl h-[400px] col-span-2" />
      <div class="animate-pulse pulse-color rounded-xl" />
      <div class="animate-pulse pulse-color rounded-xl" />
    </div>
  </div>
</template>
