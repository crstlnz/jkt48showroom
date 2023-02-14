<template>
  <div class="pt-4 md:pt-6 xl:pt-8">
    <LazyPaginationPage v-if="!$device.isMobile" />
    <LazyPaginationScroll v-else />
  </div>
</template>
