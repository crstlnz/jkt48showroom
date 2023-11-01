import Showroom from '~~/library/database/schema/showroom/Showroom'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const data = {
    name: query.name,
    room_id: query.room_id,
    img: query.img,
    description: query.description,
    generation: query.generation,
    group: query.group,
    url: query.url,
  }

  const member = await Showroom.findOneAndUpdate(
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
