<script lang="ts" setup>
withDefaults(defineProps<{
  to: string
  title: string
  subtitle?: string
  icon?: string
  variant?: 'offline' | 'online'
  external?: boolean
  target?: '_blank' | '_self' | '_parent' | '_top'
}>(), {
  subtitle: '',
  icon: 'ep:ticket',
  variant: 'offline',
  external: true,
  target: '_blank',
})
</script>

<template>
  <NuxtLink
    :to="to"
    :external="external"
    :target="target"
    class="group relative isolate flex aspect-[12/2.2] md:aspect-12/3 overflow-hidden rounded-xl  text-white transition-all duration-200"
  >
    <div
      class="absolute inset-0"
      :class="variant === 'online'
        ? 'bg-[#e14646]'
        : 'bg-[#2f6ee5]'"
    />
    <div class="absolute inset-x-0 top-0 h-px bg-white/30" />
    <div class="absolute inset-x-0 bottom-0 h-px bg-black/10" />

    <div class="relative z-20 flex flex-1 items-center justify-between gap-3 px-4">
      <div class="min-w-0">
        <div class="flex items-center gap-1.5 text-base font-semibold sm:text-lg lg:text-xl">
          <Icon v-if="icon" :name="icon" class="text-lg sm:text-xl lg:text-2xl" />
          <span class="truncate">{{ title }}</span>
        </div>
        <div v-if="subtitle" class="mt-0.5 text-xs leading-4 opacity-90 md:text-sm">
          {{ subtitle }}
        </div>
      </div>
      <div class="relative h-full shrink-0 pl-4 flex items-center">
        <div class="absolute inset-y-3.5 left-0 border-l-2 -translate-x-1/2 border-dashed border-white/35" />
        <div class="absolute top-0 left-0 z-30 size-4 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white dark:bg-dark-2" />
        <div class="absolute bottom-0 left-0 z-30 size-4 translate-y-1/2 -translate-x-1/2 rounded-full bg-white dark:bg-dark-2" />
        <div class="rounded-lg border border-white/35 bg-black/10 px-2 py-1 text-[10px] font-semibold tracking-[0.16em]">
          JKT48
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
