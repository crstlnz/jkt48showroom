<script lang="ts" setup>
withDefaults(defineProps<{
  containerClass?: string
}>(), {
  containerClass: '',
})
</script>

<template>
  <div class="better-scrollbar overflow-y-auto" :class="containerClass">
    <slot />
  </div>
</template>

<style scoped>
.better-scrollbar {
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.better-scrollbar:hover {
  scrollbar-color: rgb(120 120 128 / 0.45) transparent;
}

.better-scrollbar::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.better-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.better-scrollbar::-webkit-scrollbar-thumb {
  background: rgb(120 120 128 / 0.45);
  border-radius: 999px;
  border: 2px solid transparent;
  background-clip: padding-box;
  opacity: 0;
  transition:
    opacity 220ms ease,
    background-color 220ms ease;
}

.better-scrollbar:hover::-webkit-scrollbar-thumb {
  opacity: 1;
}

:global(.dark) .better-scrollbar:hover {
  scrollbar-color: rgb(255 255 255 / 0.3) transparent;
}

:global(.dark) .better-scrollbar::-webkit-scrollbar-thumb {
  background: rgb(255 255 255 / 0.3);
}

:global(.dark) .better-scrollbar:hover::-webkit-scrollbar-thumb {
  opacity: 1;
}
</style>
