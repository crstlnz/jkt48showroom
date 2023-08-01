import { getSummaryRanking } from '~~/library/api/showroom'
import cache from '~~/library/utils/cache'

const time = 86400000 // 1 day
export default defineEventHandler(
  async (event): Promise<ShowroomAPI.SummaryRanking> => {
    const params = getQuery(event)
    return await cache
      .fetch<ShowroomAPI.SummaryRanking>(`summary-ranking-${params.room_id}`, () => getSummaryRanking(params.room_id as number), time)
  },
)
