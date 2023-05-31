<script lang="ts" setup>
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
const { isMobile } = useResponsive()
defineProps<{
  class?: string
}>()

</script>

<template>
  <Popover class="relative h-10 w-10" v-slot="{close, open}">
    <PopoverButton aria-label="Filter" :class="class">
      <slot :close="close"/>
    </PopoverButton>
    <Transition
    v-if="isMobile"
      enter-active-class="transition ease duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease duration-200" 
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
    <div v-if="open" @click="close" class="bg-black/50 fixed inset-0"/>
    </Transition>

    <Transition
      enter-active-class="transition ease duration-200"
      enter-from-class="opacity-0 max-sm:translate-y-[100%]"
      enter-to-class="opacity-100 max-sm:translate-y-0"
      leave-active-class="transition ease duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 max-sm:translate-y-[100%]"
    >
      <PopoverPanel class="bg-container z-aboveNav fixed overflow-hidden shadow-xl drop-shadow-xl max-sm:inset-x-0 max-sm:bottom-0 max-sm:rounded-t-2xl sm:absolute sm:right-0 sm:top-[calc(100%_+_0.45rem)] sm:rounded-2xl">
        <slot name="panel" :close="close"/>
      </PopoverPanel>
    </Transition>
  </Popover>
</template>
