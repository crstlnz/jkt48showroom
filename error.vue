<template>
  <NuxtLayout>
    <Error :message="errorMessage.message" :alt="errorMessage.alt" :img-src="errorMessage.img" :url="url" />
    <!-- <Error
      v-if="error.statusCode == 404"
      message="Page not found"
      alt="404 Not Found!"
      img-src="/svg/404.svg"
      :url="url"
    />
    <Error v-else message="An error occurred" alt="An error occurred!" img-src="/svg/error.svg" :url="url" /> -->
  </NuxtLayout>
</template>

<script setup lang="ts">
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

interface ErrorMessage {
  message: string;
  img: string;
  alt: string;
}
function getError(code: number): ErrorMessage {
  const msg = {
    message: "An error occurred!",
    alt: "An error occurred!",
    img: "/svg/error.svg",
  };

  switch (code) {
    case 404:
      msg.message = "Page not found!";
      msg.alt = "404 Not Found!";
      msg.img = "/svg/404.svg";
    case 503:
      msg.message = "Service temporarily unavailable, Try again later!";
      msg.alt = "503 Service Unavailable!";
  }

  return msg;
}

const errorMessage = computed<ErrorMessage>(() => {
  return getError(props.error.code);
});

// eslint-disable-next-line eqeqeq
// const handleError = () => clearError({ redirect: props.error.statusCode == 404 ? "/" : props.error.url });
</script>
