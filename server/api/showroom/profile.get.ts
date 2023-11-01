import Showroom from '~~/library/database/schema/showroom/Showroom'
import cache from '~~/library/utils/cache'

const time = 60000

export default defineEventHandler(
  async (event): Promise<Database.IMemberProfile> => {
    const params = getQuery(event)
    return await cache
      .fetch<Database.IMemberProfile>(`member-profile-${params.room_url_key}`, () => fetchData(params.room_url_key as string), time)
  },
)

async function fetchData(key: string) {
  const data = await Showroom.getProfile(key)
  if (!data) throw createError({ statusMessage: 'Data not found!', statusCode: 404 })
  return data
}
