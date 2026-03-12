<script lang="ts" setup>
withDefaults(defineProps<{
  title?: string
  iconClass?: string
  more?: string
  noPadding?: boolean
  moreScreenReaderOnly?: string
  moreText?: string
  moreLabel?: string
  moreExtLink?: boolean
  moreClass?: string
  titleClass?: string
}>(), {
  title: 'Title',
  iconClass: '',
  moreClass: '',
  noPadding: false,
})
</script>

<template>
  <div class="bg-container space-y-2 rounded-2xl shadow-2xs">
    <div class="flex items-center gap-2 px-3 pt-3 md:px-4 md:pt-4">
      <!-- <div class="inline-block h-5 w-1 rounded-l-sm" :class="iconClass" /> -->
      <div class="flex-1 flex items-center gap-2">
        <slot name="icon" />
        <h3 class="font-bold text-lg xl:text-xl" :class="titleClass">
          {{ title }}
        </h3>
      </div>
      <div
        v-if="$slots.right"
        class="text-xs lg:text-sm"
      >
        <slot name="right" />
      </div>
      <NuxtLink
        v-else-if="more && !moreExtLink"
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

    <div :class="{ 'px-3 md:px-4 pb-3 md:pb-4': !noPadding }">
      <slot />
    </div>
  </div>
</template>
