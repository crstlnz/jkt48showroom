import FloatingVue from 'floating-vue'

export default defineNuxtPlugin(() => {
  const { isMobile, greaterOrEqual } = useResponsive()
  const small = greaterOrEqual('sm')
  FloatingVue.options.themes.tooltip.placement = isMobile || !small.value ? 'bottom' : 'top'
  FloatingVue.options.themes.tooltip.delay.show = 150
  FloatingVue.options.themes.tooltip.triggers = ['hover', 'focus', 'touch', 'click']
  FloatingVue.options.themes.tooltip.hideTriggers = (events: any) => [...events, 'scroll', 'click']
})
