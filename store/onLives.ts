import { useNotifications } from './notifications'
import { useSettings } from './settings'
import JSONSerializer from '~~/library/serializer/json'

export const useOnLives = defineStore('onLives', () => {
  const { data: lives, pending, error, refresh, tryRefresh } = useLocalStoreController<IRoomLive[] | null>('onlives', {
    fetch: getShowroomLives,
    expiredIn: 10000,
    serializer: new JSONSerializer<IRoomLive[] | null>(null),
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
  const config = useRuntimeConfig()
  async function getShowroomLives(): Promise<IRoomLive[]> {
    try {
      if (!config.public.isDev) {
        return await $apiFetch(`/api/now_live`, { query: { group: settings.group } })
      }
      else {
        const data: any = await $apiFetch(`/api/showroom/onlives`)
        const re = (data?.onlives[0]?.lives ?? []).splice(0, 4).map((i: any) => {
          return {
            name: i.main_name ?? 'Test name',
            img: i.image ?? 'https://static.showroom-live.com/image/room/cover/ee38ccf437e220f7ce8149c1c8aac94d6dca66734334bdad84c94bf41e78d3e0_square_s.png?v=1670924861',
            url: i.room_url_key ?? '',
            room_id: i.room_id ?? 0,
            is_graduate: false,
            is_group: false,
            room_exists: true,
            streaming_url_list: i.streaming_url_list ?? [],
            started_at: i.started_at * 1000,
          }
        })
        return [...await $apiFetch<IRoomLive[]>(`/api/now_live`), ...re]
      }
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
  import.meta.hot.accept(acceptHMRUpdate(useOnLives as any, import.meta.hot))
}
