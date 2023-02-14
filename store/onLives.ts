import JSONSerializer from '~~/library/serializer/json'

export const useOnLives = defineStore('onLives', () => {
  const { data: lives, pending, error, refresh, tryRefresh } = useLocalStoreController<IRoomLive[] | null>('onlives', {
    fetch: refreshLives,
    expiredIn: 10000,
    serializer: new JSONSerializer<IRoomLive[] | null>(null)
  })

  const livesMap = computed(() => {
    const map = new Map()
    if (!lives.value) return map
    for (const live of (lives.value ?? [])) {
      map.set(live.room_id, live)
    }
    return map
  })

  async function refreshLives (): Promise<IRoomLive[]> {
    return await $fetch('/api/showroom/now_live')
  }

  function isLive (roomId: number) {
    return livesMap.value?.has(roomId)
  }

  return {
    data: lives,
    pending,
    error,
    tryRefresh,
    refresh,
    isLive
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOnLives, import.meta.hot))
}
