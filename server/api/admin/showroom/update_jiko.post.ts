import Member from '~~/library/database/schema/48group/Member'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const member = await Member.findOneAndUpdate(
    { _id: query._id },
    {
      $set: {
        jikosokai: query.jiko,
      },
    },
    {
      runValidators: true,
    },
  )

  if (member == null) throw createError({ statusCode: 400, message: 'Bad request!' })
  return {
    code: 200,
    message: 'Request success!',
  }
})
