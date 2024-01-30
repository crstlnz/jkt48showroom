import { skipHydrate } from 'pinia'
import ExpiredSerializer from '~~/library/serializer/expired'

export const useSettings = defineStore('settings', () => {
  // const { status } = useAuth()
  const status = ref(null)
  const domain = ref('')
  const csrfToken = ref('')
  const authenticated = computed(() => {
    return status.value === 'authenticated'
  })

  const session = useSessionStorage<{ csrf_token: string, cookie: string } | null>('showroom_session', null, {
    serializer: new ExpiredSerializer(null, authenticated.value ? 1000 * 60 * 15 : 1000 * 60 * 5),
  })

  const subDomain = ref('')

  // const firstDate = computed(() => firstDateString.value ? new Date(firstDateString.value) : undefined)
  const firstDate = ref()

  async function fetchFirstDate() {
    try {
      firstDate.value = (await $apiFetch<{ date: string }>(`/api/first_data`)).date
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

  function setDomain(d: string) {
    domain.value = d
    subDomain.value = getSubdomain(d) ?? ''
  }

  const host = ref('')
  const path = ref('')
  function getSubdomain(domain: string): string {
    host.value = domain
    const parts = domain.split('.')
    return parts?.[0] || ''
  }

  const { getTitle } = useAppConfig()

  function getWebTitle() {
    return getTitle(group.value)
  }

  const currentURL = computed(() => `https://${host.value}${path.value}`)

  const route = useRoute()

  watch(() => route.fullPath, (p) => {
    path.value = p
  })
  return { domain, setDomain, currentURL, getWebTitle, group, csrfToken, firstDate, session: skipHydrate(session), fetchFirstDate }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettings, import.meta.hot))
}
