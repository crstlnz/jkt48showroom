import { useSettings } from './settings'
import JSONSerializer from '~~/library/serializer/json'

export const useOnLives = defineStore('onLives', () => {
  const config = useRuntimeConfig()
  const { data: lives, pending, error, refresh, tryRefresh } = useLocalStoreController<IRoomLive[] | null>('onlives', {
    fetch: refreshLives,
    expiredIn: 10000,
    serializer: new JSONSerializer<IRoomLive[] | null>(null),
  })

  const settings = useSettings()

  const livesMap = computed(() => {
    const map = new Map()
    if (!lives.value) return map
    for (const live of (lives.value ?? [])) {
      map.set(live.room_id, live)
    }
    return map
  })

  async function refreshLives(): Promise<IRoomLive[]> {
    if (!config.public.isDev) {
      return await $fetch('/api/showroom/now_live', { query: { group: settings.group, _: new Date().getTime() } })
    }
    else {
      return await $fetch(`/api/showroom/now_live?_=${new Date().getTime()}`, { query: { group: settings.group } })
    }
  }

  function isLive(roomId: number) {
    return livesMap.value?.has(roomId)
  }

  return {
    data: lives,
    pending,
    error,
    tryRefresh,
    refresh,
    isLive,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOnLives as any, import.meta.hot))
}
