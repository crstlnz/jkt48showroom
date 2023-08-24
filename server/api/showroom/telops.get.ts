import { getTelops } from '~~/library/api/showroom'
import cache from '~~/library/utils/cache'

const time = 60000

export default defineEventHandler(
  async (event): Promise< Watch.TelopApi> => {
    const params = getQuery(event)
    return await cache
      .fetch< Watch.TelopApi>(`member-profile-${params.room_url_key}`, () => fetchData(params.room_id as string), time)
  },
)

async function fetchData(roomId: string): Promise<Watch.TelopApi> {
  const data = await getTelops(Number(roomId))
  if (!data) throw createError({ statusMessage: 'Data not found!', statusCode: 404 })
  return data
}
