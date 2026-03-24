<script lang="ts" setup>
withDefaults(defineProps<{
  title?: string
  more?: string
  compact?: boolean
  noPadding?: boolean
  moreScreenReaderOnly?: string
  moreText?: string
  moreLabel?: string
  moreExtLink?: boolean
  moreClass?: string
  titleClass?: string
  icon?: string
  iconColor?: string
}>(), {
  title: 'Title',
  iconClass: '',
  moreClass: '',
  noPadding: false,
})
</script>

<template>
  <div class="bg-container space-y-2 rounded-2xl shadow-2xs">
    <div class="flex items-center gap-2 px-3 pt-3 md:px-4 md:pt-4" :class="{ 'pb-1': $slots.subtitle }">
      <!-- <div class="inline-block h-5 w-1 rounded-l-sm" :class="iconClass" /> -->
      <div class="flex flex-1 items-center gap-2">
        <slot name="icon">
          <HeaderIcon :icon="icon" :color-class="iconColor ?? ''" />
        </slot>
        <div class="min-w-0">
          <h2
            class="truncate text-base font-bold " :class="{
              'md:text-base': compact,
              'md:text-lg': !compact,
            }"
          >
            {{ title }}
          </h2>
          <p v-if="$slots.subtitle" class="text-[11px] opacity-60 md:text-xs">
            <slot name="subtitle" />
          </p>
        </div>
      </div>

      <div
        v-if="$slots.right"
        class="text-xs lg:text-sm"
      >
        <slot name="right" />
      </div>
      <MoreButton
        v-else-if="more && !moreExtLink"
        :to="more"
        :class="moreClass"
        :aria-label="moreLabel"
      >
        {{ moreText ? moreText : "More" }} <span v-if="moreScreenReaderOnly" class="sr-only">{{ moreScreenReaderOnly }} </span>
      </MoreButton>
      <a
        v-else-if="more"
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
