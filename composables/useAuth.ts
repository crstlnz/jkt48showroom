import type { FetchError } from 'ofetch'

export function useAuth() {
  const nuxtApp = tryUseNuxtApp()
  const payload = nuxtApp?.payload
  const data = useState<ShowroomLogin.User | null>('authUser', () => process.client ? payload?.data?.auth?.user || null : null)
  const pending = useState('authPending', () => import.meta.client ? payload?.data?.auth?.pending ?? true : false)
  const error = useState('authError', () => import.meta.client ? (payload?.data?.auth?.error ? new Error(payload?.data?.auth?.error) : null) : null)

  if (import.meta.server && payload) {
    nuxtApp.payload.data.auth = {
      user: null,
      pending: false,
      error: null,
    }
  }

  const status = computed<StatusLogin>(() => {
    if (pending.value) return 'loading'
    if (!data.value || error.value) return 'unauthenticated'
    return 'authenticated'
  })

  const authenticated = computed(() => status.value === 'authenticated')

  async function checkAuthOnServer() {
    if (!import.meta.server) return
    const event = useRequestEvent()
    const cookie = event?.headers?.get('Cookie')
    if (payload) payload.data.auth.pending = true
    pending.value = true
    try {
      if (cookie?.includes('_st=') || cookie?.includes('_rt=')) {
        data.value = await $apiFetch<ShowroomLogin.User>('/api/user')
      }
      if (payload) payload.data.auth.user = data.value
    }
    catch (e) {
      if (payload) payload.data.auth.error = e
    }
    if (payload) payload.data.auth.pending = false
    pending.value = false
  }

  async function checkAuthOnClient() {
    if (import.meta.server) return
    if (authenticated.value) return
    const cookie = document.cookie
    if (!cookie.includes('_st=') && !cookie?.includes('_rt=')) return
    pending.value = true
    error.value = null
    try {
      if (payload && payload.data.auth.user) {
        data.value = payload.data.auth.user
      }
      else {
        data.value = await $apiFetch<ShowroomLogin.User>('/api/user')
      }
    }
    catch (e: unknown) {
      if ((e as FetchError).statusCode === 401) {
        data.value = null
      }
      else {
        error.value = e as Error
      }
    }

    pending.value = false
  }

  async function checkAuth() {
    if (import.meta.server) {
      await checkAuthOnServer()
    }
    else {
      await checkAuthOnClient()
    }
  }

  async function signIn(body: URLSearchParams) {
    if (import.meta.server) throw new Error('No ssr login!')
    await $apiFetch('/api/auth/login', {
      body,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      credentials: 'include',
    })
    checkAuth()
  }

  async function signOut() {
    await $apiFetch<ShowroomLogin.User>('/api/auth/logout', {
      method: 'POST',
    })
    checkAuth()
  }
  return { signIn, signOut, user: data, status, checkAuth, authenticated }
}
