<script>
export default {
  props: {
    title: {
      type: String,
      required: false,
      default: 'Title'
    },
    iconClass: {
      type: String,
      required: false,
      default: ''
    },
    more: {
      type: String,
      required: false,
      default: null
    },
    moreText: {
      type: String,
      required: false,
      default: null
    },
    moreLabel: {
      type: String,
      required: false,
      default: null
    },
    moreExtLink: {
      type: Boolean,
      required: false,
      default: null
    },
    moreClass: { type: String, required: false, default: '' }
  }
}
</script>

<template>
  <div class="space-y-2 rounded-xl bg-white p-4 shadow-sm dark:bg-dark-1 md:p-5">
    <div class="flex items-center gap-1.5">
      <div class="inline-block h-5 w-1 rounded-l-sm" :class="iconClass" />
      <h2 class="flex-1 text-lg font-bold lg:text-xl">
        {{ title }}
      </h2>
      <NuxtLink
        v-if="more && !moreExtLink"
        class="text-xs hover:text-second-2 lg:text-sm"
        :to="more"
        :class="moreClass"
        :aria-label="moreLabel"
      >
        {{ moreText ? moreText : "More" }}
      </NuxtLink>
      <a
        v-else-if="more"
        class="text-xs hover:text-second-2 lg:text-sm"
        :href="more"
        target="_blank"
        :class="moreClass"
      >{{ moreText ? moreText : "More" }}</a>
    </div>
    <slot />
  </div>
</template>
