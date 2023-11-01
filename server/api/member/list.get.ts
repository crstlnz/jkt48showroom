import { dbConnect } from '~/library/database'
import Member from '~~/library/database/schema/48group/Member'
import cache from '~~/library/utils/cache'

const time = 60000 * 60

export default defineEventHandler(
  async (event): Promise<ISortMember[]> => {
    const { group } = getQuery(event)
    const cacheKey = group ? `${group}-stage48` : 'stage48'
    return await cache
      .fetch<ISortMember[]>(cacheKey, () => fetchData(group as string), time)
  },
)

async function fetchData(group: string | null = null): Promise<ISortMember[]> {
  const options = group ? { group } : {}
  await dbConnect()
  const data = await Member.find(options)
  if (!data) throw createError({ statusMessage: 'Data not found!', statusCode: 404 })
  return data.map((i) => {
    return {
      id: i._id.toString(),
      name: i.name,
      generation: i.generation,
      is_graduate: i.isGraduate,
      img: i.img,
    }
  },
  )
}
