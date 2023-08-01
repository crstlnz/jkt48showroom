import { getToken } from '#auth'
import Liked from '~~/library/database/schema/user/Liked'

export default defineEventHandler(async (event): Promise<Database.LikeDetail> => {
  const token = await getToken({ event })
  if (!token?.id) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated!' })
  const liked = await Liked.getDetails(token.id as number)
  return liked
})
