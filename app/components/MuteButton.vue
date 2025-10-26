<script lang="ts" setup>
const props = defineProps<{
  isMuted: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <button
    type="button" aria-label="Mute/Unmute Button"
    class="absolute bottom-0 right-0 z-25 m-2 flex aspect-square w-5 cursor-pointer select-none items-center justify-center rounded-full bg-slate-500/30 text-white hover:bg-slate-500/40 md:m-3 md:w-6 xl:m-4"
    @click="() => $emit('click')"
  >
    <Icon v-if="props.isMuted" name="ph:speaker-simple-slash-fill" />
    <Icon v-else name="ph:speaker-simple-high-fill" />
  </button>
</template>
