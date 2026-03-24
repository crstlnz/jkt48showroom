<script lang="ts" setup>
withDefaults(defineProps<{
  title?: string
  icon?: string
  rootClass?: string
  headerClass?: string
  titleClass?: string
  iconColor?: string
  withoutPadding?: boolean
}>(), {
  title: 'Title',
  icon: '',
  rootClass: '',
  headerClass: '',
  titleClass: '',
})

defineEmits<{
  (e: 'headerClick'): void
}>()
</script>

<template>
  <div class="space-y-3 pb-5 max-sm:pb-8 max-sm:border-b border-color-1" :class="rootClass">
    <div class="flex gap-1.5 items-center px-3 md:px-4" :class="headerClass" @click="$emit('headerClick')">
      <div class="flex flex-1 items-center gap-2">
        <slot name="icon">
          <span v-if="icon" class="inline-flex size-8 items-center justify-center rounded-xl" :class="iconColor ?? `bg-gray-500/15 text-gray-500`">
            <Icon :name="icon" class="size-4.5" />
          </span>
        </slot>
        <h2 class="flex-1 text-lg font-bold leading-10 sm:text-xl" :class="titleClass">
          {{ title }}
        </h2>
      </div>
      <slot name="right" />
    </div>
    <div :class="{ 'px-3 md:px-4': !withoutPadding }">
      <slot />
    </div>
  </div>
</template>
