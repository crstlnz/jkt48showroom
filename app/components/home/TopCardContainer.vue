<script lang="ts" setup>
withDefaults(defineProps<{
  cardClass?: string
  backgroundImage?: string
  backgroundAlt?: string
  imageClass?: string | Record<string, boolean>
  overlayClass?: string
  imageSizes?: string
  imageFormat?: string
  imageModifiers?: Record<string, any>
}>(), {
  cardClass: 'border-color-2',
  backgroundImage: '',
  backgroundAlt: '',
  imageClass: 'opacity-25 blur-[2px] scale-115 object-cover saturate-120 transition-all duration-500',
  overlayClass: 'bg-linear-to-b from-black/0 via-black/18 to-black/45 dark:via-black/20 dark:to-black/55',
  imageSizes: '640',
  imageFormat: 'webp',
  imageModifiers: () => ({}),
})
</script>

<template>
  <div
    class="relative overflow-hidden rounded-xl border-2 bg-linear-to-b p-2.5 md:p-3 group"
    :class="cardClass"
  >
    <div class="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-xl">
      <Image
        v-if="backgroundImage"
        :src="backgroundImage"
        :alt="backgroundAlt"
        loading="lazy"
        fit="cover"
        class="h-full w-full"
        :class="imageClass"
        :modifiers="imageModifiers"
        :sizes="imageSizes"
        :format="imageFormat"
      />
      <slot v-else name="background" />
      <div class="absolute inset-0" :class="overlayClass" />
    </div>
    <slot name="before-content" />
    <div v-if="$slots.more" class="absolute right-2 top-2 z-40">
      <slot name="more" />
    </div>
    <slot />
  </div>
</template>
