<template>
  <NuxtLayout>
    <Error
      v-if="error.statusCode == 404"
      message="Page not found"
      alt="404 Not Found!"
      img-src="/svg/404.svg"
      :url="url"
    />
    <Error v-else message="An error occurred" alt="An error occurred!" img-src="/svg/error.svg" :url="url" />
  </NuxtLayout>
</template>

<script setup>
import { Error } from "#components";
const props = defineProps({
  error: {
    type: Object,
    default() {
      return {};
    },
  },
});

const url = computed(() => {
  // eslint-disable-next-line eqeqeq
  return props.error.statusCode == 404 ? "/" : props.error.url;
});

// eslint-disable-next-line eqeqeq
// const handleError = () => clearError({ redirect: props.error.statusCode == 404 ? "/" : props.error.url });
</script>
