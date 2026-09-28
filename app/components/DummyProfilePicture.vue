<script setup lang="ts">
const props = defineProps<{
  name: string
}>()

const backgroundColors = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-green-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-fuchsia-500',
  'bg-pink-500',
]

const initial = computed(() => Array.from(props.name.trim())[0]?.toUpperCase() || '?')
const backgroundColor = computed(() => {
  let hash = 0

  for (const character of props.name) {
    hash = (hash * 31 + character.charCodeAt(0)) | 0
  }

  return backgroundColors[Math.abs(hash) % backgroundColors.length]
})
</script>

<template>
  <div class="flex items-center justify-center text-lg font-semibold text-white" :class="backgroundColor">
    {{ initial }}
  </div>
</template>
