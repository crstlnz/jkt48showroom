import { getRoomStatus } from '~~/library/api/showroom'

export default defineEventHandler(
  async (event): Promise<ShowroomAPI.RoomStatus> => {
    const params = getQuery(event)
    return await getRoomStatus(params, event.context.showroom_cookie)
  },
)
