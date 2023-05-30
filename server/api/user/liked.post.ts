import { getToken } from '#auth'
import Liked from '~~/library/database/schema/user/Liked'

export default defineEventHandler(async (event): Promise<any> => {
  const token = await getToken({ event })
  if (!token?.id) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated!' })
  const query = await readBody(event)
  if (query.delete) {
    await Liked.deleteOne({
      user_id: query.user_id,
      liked_id: query.liked_id,
      type: query.type,
    })
  }
  else {
    await new Liked({
      user_id: query.user_id,
      liked_id: query.liked_id,
      type: query.type,
    }).save()
  }
  return 'success'
})
