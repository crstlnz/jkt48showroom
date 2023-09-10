import { getStageUserList } from '~~/library/api/showroom'
import cache from '~~/library/utils/cache'

const time = 30000
export default defineEventHandler(
  async (event): Promise<Watch.StageList> => {
    const params = getQuery(event)
    return await cache
      .fetch<Watch.StageList>(`user-ranks-${params.room_id}`, () => getStageUserList(params.room_id as number, event.context.showroom_cookie), time)
  },
)
