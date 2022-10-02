<template>
  <div
    class="lazyContainer"
    :class="{
      loading: !isLoaded,
      'bg-slate-200 dark:bg-dark-3/50': !props.transparent,
    }"
  >
    <img
      ref="lazyImage"
      class="lazyImage w-full h-full object-cover object-center"
      :class="props.imgClass"
      :alt="props.alt"
      :src="props.src"
      loading="lazy"
    />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  imgClass: {
    type: String,
    default: "",
  },
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
const isLoaded = ref(false);
const lazyImage = ref(null);
onMounted(() => {
  const el = lazyImage?.value;
  if (el!.complete) {
    isLoaded.value = true;
  } else {
    el.onload = function () {
      isLoaded.value = true;
    };
    el.onerror = function () {
      isLoaded.value = false;
      el.src = "/img/img-error.jpg";
    };
  }
});
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
