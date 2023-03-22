<template>
  <div class="space-y-4 overflow-hidden rounded-xl bg-white p-4 shadow-sm dark:bg-dark-1 md:p-5">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold">
        {{ $t("topfans") }}
      </h2>
      <button class="hover:text-second-2" href="#" type="button">
        {{ $t("more") }}
      </button>
    </div>
    <div class="fade-right space-x-2 whitespace-nowrap md:space-x-3 lg:space-x-4">
      <div v-for="key in 13" :key="key" class="inline-block w-16 animate-pulse sm:w-20 md:w-24 lg:w-28">
        <div class="pulse-color mx-auto aspect-square rounded-xl p-2 lg:rounded-2xl lg:p-4" />
        <div class="pulse-color mt-2 h-4 w-full rounded-md" />
      </div>
    </div>
  </div>
</template>
