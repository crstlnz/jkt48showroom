<script setup>
const { locale, locales, setLocale } = useI18n()
const otherLocale = computed(() => {
  return locales.value.find(i => i.code !== locale.value)
})
const currentLocale = computed(() => {
  return locales.value.find(i => i.code === locale.value)
})
</script>
<template>
  <button
    :key="locale.code"
    :title="$t('changelang')"
    type="button"
    href="#"
    class="flex items-center gap-1 rounded-xl p-2 border-2 justify-center hover:bg-slate-500/5 dark:border-dark-3 w-16"
    @click.prevent.stop="setLocale(otherLocale.code)"
  >
    <Icon name="ph:translate-bold" />{{ currentLocale.name }}
  </button>
</template>
