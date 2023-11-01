import { getToken } from '#auth'
import { dbConnect } from '~/library/database'
import Liked from '~~/library/database/schema/user/Liked'

export default defineEventHandler(async (event): Promise<{ is_liked: boolean; like_id: string }> => {
  const token = await getToken({ event })
  if (!token?.id) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated!' })
  const query = getQuery(event)
  if (query.id == null) throw createError({ statusCode: 400, statusMessage: 'Bad request!' })
  await dbConnect()
  const liked = await Liked.isLiveLiked(token.id as number, query.id as string)
  return {
    is_liked: liked,
    like_id: query.id as string,
  }
})
