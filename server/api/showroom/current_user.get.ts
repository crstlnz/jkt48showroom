import { getCurrentUser } from '~~/library/api/showroom'

export default defineEventHandler(
  async (event): Promise<ShowroomAPI.CurrentUser> => {
    const params = getQuery(event)
    return await getCurrentUser({
      headers: {
        cookie: event.context.showroom_cookie || '',
      },
      params: {
        room_id: params.room_id,
      },
    })
  },
)
