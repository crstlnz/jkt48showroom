import { useNotifications } from './notifications'
import JSONSerializer from '~~/library/serializer/json'

export const useIDNLives = defineStore('useIDNLives', () => {
  const { data: lives, pending, error, refresh, tryRefresh } = useLocalStoreController<IDNLives[] | null>('idnLivess', {
    fetch: getIDNLives,
    expiredIn: 10000,
    serializer: new JSONSerializer<IDNLives[] | null>(null),
  })

  const hasLives = computed(() => {
    return (lives.value?.length || 0) > 0
  })

  const liveCount = computed(() => lives.value?.length || 0)

  const livesMap = computed(() => {
    const map = new Map()
    if (!lives.value) return map
    for (const live of (lives.value ?? [])) {
      map.set(live.user.username, live)
    }
    return map
  })

  const { addNotif } = useNotifications()

  async function getIDNLives(): Promise<IDNLives[]> {
    return await $apiFetch<IDNLives[]>(`/api/idn_lives`).catch((_) => {
      addNotif({
        type: 'danger',
        message: 'Failed to get IDN Lives Data!',
      })
      return []
    })
  }

  function isLive(username: string) {
    return livesMap.value?.has(username)
  }

  return {
    data: lives,
    hasLives,
    liveCount,
    pending,
    error,
    tryRefresh,
    refresh,
    isLive,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useIDNLives as any, import.meta.hot))
}
