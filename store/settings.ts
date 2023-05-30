export const useSettings = defineStore('settings', () => {
  const currency = ref('')
  // const { greaterOrEqual, smallerOrEqual } = useBreakpoints(breakpointsTailwind)
  // const isLarge = greaterOrEqual('2xl')
  // const isMobile = smallerOrEqual('sm')

  // return { isLarge, isMobile, greaterOrEqual, smallerOrEqual }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettings as any, import.meta.hot))
}
