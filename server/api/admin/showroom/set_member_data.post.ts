import { dbConnect } from '~/library/database'
import Showroom from '~~/library/database/schema/showroom/Showroom'

// import Member from '~~/library/database/schema/48group/Member'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const room_id = query.room_id
  const memberDataId = query.memberDataId
  if (!room_id || !memberDataId) throw createError({ statusCode: 400, message: 'Bad request!' })
  await dbConnect()
  const member = await Showroom.findOne({ room_id })
  if (!member) {
    throw createError({ statusCode: 400, message: 'Bad request!' })
  }
  (member as any).member_data = memberDataId
  await member.save()
  return {
    code: 200,
    message: 'Request success!',
  }
})
