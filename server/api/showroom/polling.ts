import cache from '~~/library/utils/cache'
import { getPolling } from '~~/library/api/showroom'

export default defineEventHandler(
  async (event): Promise<ShowroomAPI.Polling | ShowroomAPI.PollingLiveEnd> => {
    const params = getQuery(event)
    return await cache.fetch<ShowroomAPI.Polling | ShowroomAPI.PollingLiveEnd>(`polling-${params.room_id}`, () => getPolling(params.room_id as number, event.context.showroom_cookie), 40000)
  },
)
