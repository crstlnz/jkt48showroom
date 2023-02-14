<template>
  <div class="bg-white dark:bg-dark-1 rounded-xl p-4 md:p-5 space-y-4 shadow-sm overflow-hidden">
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-bold">
        {{ $t("topfans") }}
      </h2>
      <button class="hover:text-second-2" href="#" type="button">
        {{ $t("more") }}
      </button>
    </div>
    <div class="whitespace-nowrap space-x-2 md:space-x-3 lg:space-x-4 fade-right">
      <div v-for="key in 13" :key="key" class="w-16 sm:w-20 md:w-24 lg:w-28 inline-block animate-pulse">
        <div class="aspect-square pulse-color mx-auto rounded-xl lg:rounded-2xl p-2 lg:p-4" />
        <div class="pulse-color h-4 w-full mt-2 rounded-md" />
      </div>
    </div>
  </div>
</template>
