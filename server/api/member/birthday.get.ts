import Member from '~~/library/database/schema/48group/Member'
import cache from '~~/library/utils/cache'

const time = 60000 * 60

export default defineEventHandler(
  async (event): Promise<API.IMemberBirthDay[]> => {
    const { group } = getQuery(event)
    const cacheKey = group ? `${group}-birthday` : 'birthday'
    return await cache
      .fetch<API.IMemberBirthDay[]>(cacheKey, () => fetchData(group as string), time)
  },
)

async function fetchData(group: string | null = null): Promise<API.IMemberBirthDay[]> {
  const currentMonth = new Date().getMonth() + 1
  const options: { group?: string; isGraduate?: boolean } = {
    isGraduate: false,
  }
  if (group) options.group = group
  const data = await Member.aggregate([
    {
      $match: {
        ...options,
        $expr: {
          $eq: [{ $month: '$birthdate' }, currentMonth],
        },
      },
    },
    {
      $lookup: {
        from: 'showrooms',
        localField: 'showroom_id',
        foreignField: 'room_id',
        as: 'showroom',
      },

    },
    {
      $unwind: '$showroom',
    },
  ]).exec()
  if (!data) throw createError({ statusMessage: 'Data not found!', statusCode: 404 })
  return data.map((i) => {
    return {
      name: i.name,
      birthdate: i.birthdate,
      img: i.img,
      room_id: i.showroom_id,
      url_key: i.showroom.url,
    }
  })
}
