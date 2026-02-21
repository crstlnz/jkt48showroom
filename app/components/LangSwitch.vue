<script lang="ts" setup>
withDefaults(defineProps<{
  compact?: boolean
  fullTitle?: boolean
}>(), {
  compact: false,
})

const { locale, locales, setLocale } = useI18n()
const otherLocale = computed(() => {
  return (locales.value as any[]).find((i: any) => i.code !== locale.value)
})

const currentLocale = computed(() => {
  return (locales.value as any[]).find(i => i.code === locale.value)
})

const { isMobile } = useResponsive()
</script>

<template>
  <button
    v-ripple
    :title="$t('changelang')"
    type="button"
    :class="{
      'size-12 relative': compact,
    }"
    href="#"
    @click.prevent.stop="setLocale(otherLocale.code)"
  >
    <Icon v-if="!compact" name="ph:translate-bold" class="h-5 w-5" />
    <span class="text-lg font-semibold leading-5" :class="{ 'max-2xl:hidden': !isMobile, 'absolute left-1/2 top-1/2 -translate-1/2': compact }">
      {{ fullTitle ? (currentLocale.name === "ID" ? 'Indonesia' : 'English') : currentLocale.name }}
    </span>
  </button>
</template>
