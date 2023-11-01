import { dbConnect } from '~/library/database'
import Member from '~~/library/database/schema/48group/Member'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = query.id
  const value = query.value === 'true'
  if (!id) throw createError({ statusCode: 400, message: 'Bad request!' })
  await dbConnect()
  const member = await Member.findOne({ _id: id })
  if (!member) throw createError({ statusCode: 400, message: 'Bad request!' })
  member.isGraduate = value
  await member.save()
  return {
    code: 200,
    message: 'Request success!',
  }
})
