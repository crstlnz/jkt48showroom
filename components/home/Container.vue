<script lang="ts" setup>
withDefaults(defineProps<{
  title?: string
  iconClass?: string
  more?: string
  moreScreenReaderOnly?: string
  moreText?: string
  moreLabel?: string
  moreExtLink?: boolean
  moreClass?: string
}>(), {
  title: 'Title',
  iconClass: '',
  moreClass: '',
})
</script>

<template>
  <div class="bg-container space-y-2 rounded-xl p-3 shadow-sm md:p-4">
    <div class="flex items-center gap-2">
      <div class="inline-block h-5 w-1 rounded-l-sm" :class="iconClass" />
      <h3 class="flex-1 font-bold text-lg xl:text-xl">
        {{ title }}
      </h3>
      <NuxtLink
        v-if="more && !moreExtLink"
        class="text-xs hover:text-second-2 lg:text-sm"
        :to="more"
        :class="moreClass"
        :aria-label="moreLabel"
      >
        {{ moreText ? moreText : "More" }} <span v-if="moreScreenReaderOnly" class="sr-only">{{ moreScreenReaderOnly }} </span>
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
