import JSONSerializer from '~~/library/serializer/json'

export const useSettings = defineStore('settings', () => {
  const session = useSessionStorage<{ csrf_token: string; cookie: string } | null>('showroom_session', null, {
    serializer: new JSONSerializer(null),
  })

  const subDomain = ref('')
  const { data: firstDateString } = useFetch('/api/showroom/first_data')
  const firstDate = computed(() => firstDateString.value ? new Date(firstDateString.value) : undefined)
  const group = computed(() => {
    switch (subDomain.value) {
      case '46' :{
        return 'hinatazaka46'
      }
      default : {
        return 'jkt48'
      }
    }
  })

  function setDomain(domain: string) {
    subDomain.value = getSubdomain(domain) ?? ''
  }

  function getSubdomain(domain: string): string {
    const parts = domain.split('.')
    if (parts.length > 2) {
      parts.splice(parts.length - 2)
      return parts.join('.')
    }
    else {
      return ''
    }
  }

  return { setDomain, group, firstDate, session: skipHydrate(session) }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettings as any, import.meta.hot))
}
