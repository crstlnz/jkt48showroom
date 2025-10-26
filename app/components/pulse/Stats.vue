<template>
  <div class="space-y-3">
    <div class="flex flex-wrap gap-1 max-sm:bg-container max-sm:flex-col max-sm:rounded-xl max-sm:p-3 sm:gap-4">
      <div
        v-for="key in 4"
        :key="key"
        class="flex items-center gap-3 rounded-xl px-5 py-3 sm:bg-container max-sm:p-3 sm:flex-[calc(50%_-_1rem)]"
      >
        <div class="min-w-0 flex-1 animate-pulse space-y-2">
          <div class="pulse-color h-6 w-[35%] rounded-xl" />
          <div class="pulse-color h-7 w-[75%] rounded-xl" />
        </div>
        <div
          class="pulse-color h-16 w-16 animate-pulse rounded-full md:h-20 md:w-20"
        />
      </div>
    </div>
    <PulseHomeFans key="loading" class="rounded-xl" />
  </div>
</template>
