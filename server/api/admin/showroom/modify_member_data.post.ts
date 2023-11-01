import Member from '~~/library/database/schema/48group/Member'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const data = {
    name: query.name,
    img: query.img,
    stage48: query.stage48,
    banner: query.banner,
    jikosokai: query.jikosokai,
    group: query.group,
    generation: query.generation,
    jkt48id: query.jkt48id,
  }

  await dbConnect()
  const member = await Member.findOneAndUpdate(
    { _id: query._id },
    {
      $set: data,
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
function dbConnect() {
  throw new Error('Function not implemented.')
}
