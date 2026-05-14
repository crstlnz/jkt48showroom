import type { SecretPacket } from '~/utils/secret'
import { acceptHMRUpdate, defineStore, skipHydrate } from 'pinia'
import ExpiredSerializer from '~/library/serializer/expired'
import { API_KEY_SECRET, setSecret, setSecretPacket, SIGNATURE_SECRET } from '~/utils/secret'

export const useSettings = defineStore('settings', () => {
  // const { status } = useAuth()
  const version = ref('')
  const accessToken = ref<string | null>(null)
  const sK = shallowRef<SecretPacket | null>(null)
  const sg = shallowRef<SecretPacket | null> (null)

  function applyAccessToken(token: string | null) {
    accessToken.value = token
  }

  function setVersion(ver: string) {
    version.value = ver
  }

  function setRawApiKey(key: string) {
    sK.value = setSecret(API_KEY_SECRET, key)
  }

  function hydrateApiKey() {
    setSecretPacket(API_KEY_SECRET, sK.value)
    sK.value = null
  }

  function setSignatureSecret(key: string) {
    sg.value = setSecret(SIGNATURE_SECRET, key)
  }

  function hydrateSignatureSecret() {
    setSecretPacket(SIGNATURE_SECRET, sg.value)
    sg.value = null
  }

  const status = ref(null)
  const domain = ref('')
  const csrfToken = ref('')
  const authenticated = computed(() => {
    return status.value === 'authenticated'
  })

  const session = useSessionStorage<{ csrf_token: string, cookie: string } | null>('showroom_session', null, {
    serializer: new ExpiredSerializer<{ csrf_token: string, cookie: string } | null>(null, authenticated.value ? 1000 * 60 * 15 : 1000 * 60 * 5),
  })

  const subDomain = ref('')

  const firstDate = ref('2020-11-01T09:59:57.810Z')

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

  return { setSignatureSecret, hydrateSignatureSecret, accessToken, applyAccessToken, setRawApiKey, hydrateApiKey, sK, sg, domain, version, setVersion, setDomain, currentURL, getWebTitle, group, csrfToken, firstDate, session: skipHydrate(session) }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettings, import.meta.hot))
}
