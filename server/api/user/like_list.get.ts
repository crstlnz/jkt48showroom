import { getToken } from '#auth'
import { dbConnect } from '~/library/database'
import Liked from '~~/library/database/schema/user/Liked'

export default defineEventHandler(async (event): Promise<Database.LikeDetail> => {
  const token = await getToken({ event })
  if (!token?.id) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated!' })
  await dbConnect()
  const liked = await Liked.getDetails(token.id as number)
  return liked
})
