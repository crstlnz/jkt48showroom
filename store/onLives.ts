import { useNotifications } from './notifications'
import { useSettings } from './settings'
import JSONSerializer from '~~/library/serializer/json'

export const useOnLives = defineStore('onLives', () => {
  const { data: lives, pending, error, refresh, tryRefresh } = useLocalStoreController<INowLive[] | null>('onlives', {
    fetch: getShowroomLives,
    expiredIn: 12000,
    serializer: new JSONSerializer<INowLive[] | null>(null),
  })

  const settings = useSettings()

  const hasLives = computed(() => {
    return (lives.value?.length || 0) > 0
  })

  const liveCount = computed(() => (lives.value?.length ?? 0))

  const livesMap = computed(() => {
    const map = new Map()
    if (!lives.value) return map
    for (const live of (lives.value ?? [])) {
      map.set(live.room_id, live)
    }
    return map
  })

  const { addNotif } = useNotifications()
  async function getShowroomLives(): Promise<INowLive[]> {
    try {
      return await $apiFetch<INowLive[]>(`/api/now_live`, { query: { group: settings.group, debug: useRuntimeConfig().public.isDev } }).catch(() => [])
    }
    catch (e) {
      addNotif({
        type: 'danger',
        message: 'Failed to get Showroom Lives Data!',
      })
      return []
    }
  }

  function isLive(roomId: number) {
    return livesMap.value?.has(roomId)
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
  import.meta.hot.accept(acceptHMRUpdate(useOnLives, import.meta.hot))
}
