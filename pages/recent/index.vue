<template>
  <div class="pt-4 md:pt-6 xl:pt-8">
    <PaginationPage v-if="!$device.isMobile" />
    <PaginationScroll v-else />
  </div>
</template>
