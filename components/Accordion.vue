<script lang="ts" setup>
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'

defineProps<{
  title: string
}>()
</script>

<template>
  <div>
    <Disclosure v-slot="{ open }">
      <DisclosureButton
        class="flex w-full justify-between transition rounded-lg bg-blue-500/90 dark:bg-blue-500/50 px-4 py-2.5 text-left text-base items-center font-medium text-blue-50 dark:text-blue-100 hover:bg-blue-600 dark:hover:bg-blue-400 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-purple-500/75"
      >
        <span>{{ title }}</span>
        <Icon
          name="heroicons:chevron-up-16-solid"
          :class="open ? 'rotate-180 transform' : ''"
          class="h-5 w-5 text-blue-100 shrink-0"
        />
      </DisclosureButton>
      <DisclosurePanel>
        <div class="px-3 text-justify md:px-4 py-3 text-base text-gray-900 dark:text-gray-300">
          <slot />
        </div>
      </DisclosurePanel>
    </Disclosure>
  </div>
</template>
