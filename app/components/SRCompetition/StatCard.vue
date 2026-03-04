<script lang="ts" setup>
import {
  // Directives
  vTooltip,
} from 'floating-vue'

withDefaults(defineProps<{
  label: string
  value?: string | number | null
  dense?: boolean
  variant?: 'soft' | 'bordered'
  tooltip?: string
  tooltipDisabled?: boolean
  valueClass?: string
}>(), {
  value: '-',
  dense: false,
  variant: 'soft',
  tooltip: '',
  tooltipDisabled: true,
  valueClass: '',
})
</script>

<template>
  <div
    v-tooltip="{
      content: tooltip,
      disabled: tooltipDisabled || !tooltip,
    }"
    class="rounded-md px-2"
    :class="[
      dense ? 'py-1' : 'py-1.5',
      variant === 'bordered'
        ? 'border border-black/10 dark:border-white/10'
        : 'bg-black/[0.03] dark:bg-white/[0.04]',
    ]"
  >
    <p class="opacity-65">
      {{ label }}
    </p>
    <p class="mt-0.5 inline-flex items-center font-semibold" :class="valueClass">
      <slot name="value">
        {{ value }}
      </slot>
    </p>
  </div>
</template>
