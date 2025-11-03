import { useSocket } from './socket'

export const useOnLives = defineStore('onLives', () => {
  const lives = ref<ExtINowLive[] | null>(null)
  const socket = useSocket()
  const { onLives, init } = socket
  const { error, pending } = storeToRefs(socket)

  onLives((data) => {
    lives.value = data
  })

  const hasLives = computed(() => {
    return (lives.value?.length || 0) > 0
  })

  const liveCount = computed(() => (lives.value?.length ?? 0))

  const livesMap = computed(() => {
    const map = new Map<number, ExtINowLive>()
    if (!lives.value) return map
    for (const live of (lives.value ?? [])) {
      if (live.type !== 'youtube') {
        map.set(live.room_id, live)
      }
    }
    return map
  })

  function isLive(roomId: number) {
    return livesMap.value?.has(roomId)
  }

  function getLive(roomId: number) {
    return livesMap.value?.get(roomId)
  }

  return {
    data: lives,
    hasLives,
    liveCount,
    pending,
    error,
    init,
    // tryRefresh,
    // refresh,
    isLive,
    getLive,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOnLives, import.meta.hot))
}
