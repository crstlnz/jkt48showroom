<script lang="ts" setup>
const { t } = useI18n()
useHead({ title: computed(() => t('page.title.recent')) })
</script>

<template>
  <div class="pt-4 md:pt-6 xl:pt-8">
    <LazyPaginationPage v-if="!$device.isMobile" />
    <LazyPaginationScroll v-else />
  </div>
</template>
