import ShowroomUser from '~~/library/database/schema/showroom/ShowroomUser'

export default defineEventHandler(async (event): Promise<Database.IShowroomFans[]> => {
  let page = 1
  const query = getQuery(event)
  const maxPerpage = 30
  if (query.page) page = Number(query.page) ?? 1
  if (page < 1) page = 1
  const perpage = Math.min(Number.parseInt(query.perpage as string) || 10, maxPerpage)
  const fans = await ShowroomUser.find({}).sort({ point: -1 }).skip((page - 1) * perpage).limit(10).lean()
  return fans.map<Database.IShowroomFans>((fans) => {
    return {
      avatar_url: fans.avatar_url,
      point: fans.point,
      user_id: fans.user_id,
      name: fans.name,
      last_seen: fans.last_seen,
      image: fans.image,
      avatar_id: fans.avatar_id,
    }
  })
})
