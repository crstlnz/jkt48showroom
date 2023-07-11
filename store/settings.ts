export const useSettings = defineStore('settings', () => {
  // const currency = ref('')
  // const { greaterOrEqual, smallerOrEqual } = useBreakpoints(breakpointsTailwind)
  // const isLarge = greaterOrEqual('2xl')
  // const isMobile = smallerOrEqual('sm')
  const subDomain = ref('')
  const group = computed(() => {
    switch (subDomain.value) {
      case '46' :{
        return 'hinatazaka46'
      }
      default : {
        return 'hinatazaka46'
      }
    }
  })

  function setDomain(domain: string) {
    subDomain.value = getSubdomain(domain) ?? ''
  }

  function getSubdomain(domain: string): string {
    const parts = domain.split('.')

    if (parts.length > 2) {
      // Remove the top-level domain and the root domain
      parts.splice(parts.length - 2)

      // Return the remaining subdomain
      return parts.join('.')
    }
    else {
      // No subdomain found
      return ''
    }
  }

  return { setDomain, group }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettings as any, import.meta.hot))
}
