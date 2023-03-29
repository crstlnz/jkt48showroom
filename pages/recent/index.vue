<script lang="ts" setup>
const { t } = useI18n()
const title = ref('')
useHead({ title: computed(() => t(title.value || 'page.title.recent')) })
</script>

<template>
  <div class="px-3 pt-4 md:pt-6 xl:pt-8">
    <LazyPaginationPage v-if="!$device.isMobile" @title="(t:any) => title = t" />
    <LazyPaginationScroll v-else @title="(t:any) => title = t" />
  </div>
</template>
