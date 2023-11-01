import { dbConnect } from '~/library/database'
import Member from '~~/library/database/schema/48group/Member'
import cache from '~~/library/utils/cache'

const time = 60000 * 60 * 24

interface BirthdayData {
  data: API.IMemberBirthDay[]
  date: Date
}

export default defineEventHandler(
  async (event): Promise<API.IMemberBirthDay[]> => {
    const { group } = getQuery(event)
    const cacheKey = group ? `${group}-birthday` : 'birthday'
    const data = await cache
      .fetch<BirthdayData>(cacheKey, () => fetchData(group as string), time)
    if (new Date(data.date).getMonth() === new Date().getMonth()) {
      return data.data
    }
    else {
      const newData = await fetchData(group as string)
      cache.set(cacheKey, newData)
      return newData.data
    }
  },
)

async function fetchData(group: string | null = null): Promise<BirthdayData> {
  const currentMonth = new Date().getMonth() + 1
  const options: { group?: string; isGraduate?: boolean } = {
    isGraduate: false,
  }
  if (group) options.group = group
  await dbConnect()
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
  return {
    data: data.map((i) => {
      return {
        name: i.nicknames?.length ? i.nicknames[0] : i.name,
        birthdate: i.birthdate,
        img: i.img,
        room_id: i.showroom_id,
        url_key: i.showroom.url,
      }
    }),
    date: new Date(),
  }
}
