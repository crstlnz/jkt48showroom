<script lang="ts" setup>
import { Popover, PopoverButton, PopoverOverlay, PopoverPanel } from '@headlessui/vue'

const { class: customClass } = defineProps<{
  class?: string
}>()
const { isMobile, smallerOrEqual } = useResponsive()
const isSmall = smallerOrEqual('sm')
</script>

<template>
  <Popover v-slot="{ close, open }" class="relative h-10 w-10">
    <PopoverButton aria-label="Filter" :class="customClass">
      <slot :close="close" />
    </PopoverButton>
    <Teleport to="body" :disabled="!isMobile">
      <Transition
        enter-active-class="transition ease duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <PopoverOverlay v-if="open && (isSmall || isMobile)" class="fixed z-aboveNav inset-0 bg-black/50" />
      </Transition>

      <Transition
        enter-active-class="transition duration-300 sm:duration-200"
        enter-from-class="sm:opacity-0 max-sm:translate-y-[100%]"
        enter-to-class="opacity-100 max-sm:translate-y-0"
        leave-active-class="transition duration-300 sm:duration-200"
        leave-from-class="opacity-100"
        leave-to-class="sm:opacity-0 max-sm:translate-y-[100%]"
      >
        <PopoverPanel class="bg-container z-aboveNav max-h-[100vh] cursor-default overflow-y-auto roundedscrollbar fixed shadow-xl drop-shadow-xl max-sm:inset-x-0 max-sm:bottom-0 max-sm:rounded-t-2xl sm:absolute sm:right-0 sm:top-[calc(100%_+_0.45rem)] sm:rounded-2xl">
          <slot name="panel" :close="close" />
        </PopoverPanel>
      </Transition>
    </Teleport>
  </Popover>
</template>
