<script lang="ts" setup>
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { useSettings } from '~~/store/settings'

const { modelValue } = defineProps<{
  modelValue: Date | string | number
}>()

const emit = defineEmits(['update:modelValue'])
const colorMode = useColorMode()
const { locale } = useI18n()
const isDark = computed(() => colorMode.value === 'dark')
const { isMobile } = useDevice()

const date = ref(modelValue ? new Date(modelValue) : undefined)
watch(date, (d) => {
  emit('update:modelValue', d
    ? d.toISOString()
    : undefined)
})

const datePicker = ref()
const isOpen = ref(false)
const win = ref()
onMounted(() => {
  win.value = window
})

useEventListener(win, 'scroll', () => {
  if (isOpen.value) {
    datePicker.value?.closeMenu()
  }
})
</script>

<template>
  <VueDatePicker
    ref="datePicker"
    v-model="date"
    :locale="locale"
    :dark="isDark"
    class="fixed"
    prevent-min-max-navigation
    :teleport-center="isMobile"
    :placeholder="$t('selectdate')"
    format="dd MMM yyyy"
    time-picker-inline
    @open="isOpen = true"
    @closed="isOpen = false"
  />
</template>

<style lang="scss">
:root {
  --dp-font-family: Signika, "Noto Serif JP", sans-serif;
  --dp-animation-duration: 0.25s; /*Transition duration*/
  --dp-menu-appear-transition-timing: ease;
  --dp-menu-padding: 10px 12px;
  --dp-border-radius: 0.75rem;
  --dp-cell-border-radius: 6px;
  --dp-input-padding: 8px 30px 8px 12px;
  --dp-input-icon-padding: 45px;
  --dp-button-icon-height: 22px;
  --dp-menu-min-width: 350px;

  @media screen and (max-width: 400px) {
    --dp-menu-min-width: 95%;
    --dp-input-padding: 10px 30px 10px 12px;
  }
}

.dp__theme_dark {
  --dp-background-color: #1e2124;
  --dp-text-color: #ffffff;
  --dp-hover-color: rgba(18, 141, 241, 0.164);
  --dp-hover-text-color: #ffffff;
  --dp-hover-icon-color: #959595;
  --dp-primary-color: #4698eb;
  --dp-primary-text-color: #ffffff;
  --dp-secondary-color: #a9a9a9;
  --dp-border-color: transparent;
  --dp-menu-border-color: #2d2d2d;
  --dp-border-color-hover: #aaaeb7;
  --dp-disabled-color: #737373;
  --dp-scroll-bar-background: #212121;
  --dp-scroll-bar-color: #484848;
  --dp-success-color: #00701a;
  --dp-success-color-disabled: #428f59;
  --dp-icon-color: #959595;
  --dp-danger-color: #e53935;
  --dp-highlight-color: rgba(0, 92, 178, 0.2);
}
.dp__theme_light {
   --dp-background-color: #ebeff4;
   --dp-text-color: #212121;
   --dp-hover-color: #105ec531;
   --dp-hover-text-color: #212121;
   --dp-hover-icon-color: #959595;
   --dp-primary-color: #1976d2;
   --dp-primary-text-color: #f8f5f5;
   --dp-secondary-color: #c0c4cc;
   --dp-border-color: transparent;
   --dp-menu-border-color: #ddd;
   --dp-border-color-hover: #aaaeb7;
   --dp-disabled-color: #f6f6f6;
   --dp-scroll-bar-background: #f3f3f3;
   --dp-scroll-bar-color: #959595;
   --dp-success-color: #76d275;
   --dp-success-color-disabled: #a3d9b1;
   --dp-icon-color: #959595;
   --dp-danger-color: #ff6f60;
   --dp-highlight-color: rgba(25, 118, 210, 0.1);
}
</style>
