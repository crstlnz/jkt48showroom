<script lang="ts" setup>
const props = withDefaults(defineProps<{
  category: string
  variant?: 'solid' | 'soft'
}>(), {
  variant: 'solid',
})

const categoryTone = computed<'theater' | 'event' | 'other'>(() => {
  const category = props.category.trim().toLowerCase()
  if (category.includes('theater')) return 'theater'
  if (category.includes('event')) return 'event'
  return 'other'
})

const toneClass = computed(() => {
  if (props.variant === 'soft') {
    if (categoryTone.value === 'theater') return 'bg-red-400/10 text-red-500'
    if (categoryTone.value === 'event') return 'bg-blue-400/10 text-blue-500'
    return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
  }

  if (categoryTone.value === 'theater') return 'bg-red-600 text-white'
  if (categoryTone.value === 'event') return 'bg-blue-600 text-white'
  return 'bg-yellow-500 text-black'
})
</script>

<template>
  <span
    class="rounded-md px-1.5 py-0.5 text-xs"
    :class="toneClass"
  >
    {{ category }}
  </span>
</template>
