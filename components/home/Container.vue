<template>
  <div class="space-y-2 bg-white dark:bg-dark-1 shadow-sm p-3 md:p-4 rounded-xl">
    <div class="flex items-center gap-1.5">
      <div class="w-1 h-5 inline-block rounded-l-sm" :class="iconClass" />
      <h2 class="text-xl font-bold flex-1">{{ title }}</h2>
      <NuxtLink v-if="more && !moreExtLink" class="hover:text-second-2" :to="more" :class="moreClass">{{
        moreText ? moreText : "More"
      }}</NuxtLink>
      <a v-else-if="more" class="hover:text-second-2" :href="more" target="_blank" :class="moreClass">{{
        moreText ? moreText : "More"
      }}</a>
    </div>
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: false,
      default: "Title",
    },
    iconClass: {
      type: String,
      required: false,
      default: "",
    },
    more: {
      type: String,
      required: false,
      default: null,
    },
    moreText: {
      type: String,
      required: false,
      default: null,
    },
    moreExtLink: {
      type: Boolean,
      required: false,
      default: null,
    },
    moreClass: { type: String, required: false, default: "" },
  },
};
</script>
