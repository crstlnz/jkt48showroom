<template>
  <div v-if="isLoading" class="pulse-color animate-pulse inline-block"></div>
  <img
    v-else
    ref="lazyImage"
    class="lazyImage object-cover object-center"
    :alt="!error ? alt : 'Image Error'"
    :src="!error ? src : '/img/img-error.jpg'"
    loading="lazy"
  />
</template>

<script lang="ts" setup>
import { useImage } from "@vueuse/core";
const props = defineProps({
  src: {
    type: String,
    default: "",
  },
  alt: {
    type: String,
    default: "",
  },
  transparent: {
    type: Boolean,
    required: false,
    default: false,
  },
});
const lazyImage = ref(null);
const { isLoading, error } = useImage({ src: props.src });

// onMounted(() => {
//   const el = lazyImage?.value;
//   if (el!.complete) {
//     isLoaded.value = true;
//   } else {
//     el.onload = function () {
//       isLoaded.value = true;
//     };
//     el.onerror = function () {
//       isLoaded.value = false;
//       el.src = "/img/img-error.jpg";
//     };
//   }
// });
</script>

<style lang="scss">
.lazyContainer {
  // &.loading {
  //   @apply animate-pulse;
  //   img {
  //     opacity: 0;
  //   }
  // }

  // img {
  //   transition: 400ms;
  // }
}
</style>
