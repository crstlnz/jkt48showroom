import { getPolling } from '~~/library/api/showroom'

export default defineEventHandler(
  async (event): Promise<ShowroomAPI.Polling | ShowroomAPI.PollingLiveEnd> => {
    const params = getQuery(event)
    return await getPolling(params.room_id as number)
  },
)
