<script lang="ts" setup>
withDefaults(defineProps<{
  src: string
  alt: string
  isLive?: boolean
}>(), {
  isLive: false,
})
</script>

<template>
  <div class="relative shrink-0">
    <Image
      :src="src"
      :alt="alt"
      class="rounded-full bg-black/5 object-cover ring-2 transition-colors size-12 md:size-14 "
      :class="[isLive ? 'ring-red-500/70' : 'ring-black/10 dark:ring-white/10']"
      loading="lazy"
      fit="cover"
      format="webp"
      :modifiers="{
        aspectRatio: 1,
        gravity: 'faceCenter',
      }"
      sizes="48 md:56"
    />
    <span
      v-if="isLive"
      class="absolute right-0 bottom-0 z-10 inline-flex size-3 items-center justify-center rounded-full bg-red-500"
    >
      <span class="size-full bg-red-500 rounded-full animate-ping" />
    </span>
  </div>
</template>
