import Member from '~/library/database/showroomDB/jkt48/Member'
import cache from '~~/library/utils/cache'

export default defineEventHandler(
  async (event): Promise<JKT48.Member[]> => {
    return await getMembers()
  },
)
// const group =
const time = 1000
async function getMembers(): Promise<JKT48.Member[]> {
  return await cache
    .fetch<JKT48.Member[]>(
      'jkt48members',
      () => fetchData(),
      time,
    )
    .catch(() => [])
}

async function fetchData(): Promise<JKT48.Member[]> {
  try {
    const members = await Member.find({})
      .lean()

    return (members as unknown as JKT48.Member[])
      .map((i) => {
        return {
          id: i.id,
          name: i.name,
          url: i.url,
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }
  catch (e) {
    console.log(e)
    return []
  }
}
