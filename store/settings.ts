import { skipHydrate } from 'pinia'
import ExpiredSerializer from '~~/library/serializer/expired'

export const useSettings = defineStore('settings', () => {
  const { status } = useAuth()
  const authenticated = computed(() => {
    return status.value === 'authenticated'
  })

  const session = useSessionStorage<{ csrf_token: string; cookie: string } | null>('showroom_session', null, {
    serializer: new ExpiredSerializer(null, authenticated.value ? 1000 * 60 * 15 : 1000 * 60 * 5),
  })

  const subDomain = ref('')
  // const { data: firstDateString } = await useLazyFetch('/api/showroom/first_data')

  // const firstDate = computed(() => firstDateString.value ? new Date(firstDateString.value) : undefined)
  const firstDate = ref()

  async function fetchFirstDate() {
    try {
      firstDate.value = await $fetch('/api/showroom/first_data')
    }
    catch (e) {
      console.log(e)
    }
  }

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

  return { setDomain, group, firstDate, session: skipHydrate(session), fetchFirstDate }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettings as any, import.meta.hot))
}
