import { greeting } from '~~/library/api/showroom'

export default defineEventHandler(
  async (event): Promise<{ ok: 0 | 1 }> => {
    const params = getQuery(event)
    return await greeting({
      headers: {
        cookie: event.context.showroom_cookie || '',
      },
      params: {
        room_id: params.room_id,
      },
    })
  },
)
