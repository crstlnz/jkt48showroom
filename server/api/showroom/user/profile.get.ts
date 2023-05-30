import { getUserProfile } from '~~/library/api/showroom'

export default defineEventHandler(
  async (event): Promise<ShowroomAPI.UserProfile> => {
    const params = getQuery(event)
    if (!params.user_id) throw createError({ statusCode: 400 })
    return await getUserProfile(parseInt(params.user_id as string))
  },
)
