import Member from '~~/library/database/schema/48group/Member'
import cache from '~~/library/utils/cache'

export default defineEventHandler(async (event): Promise<I48Member[]> => {
  const query = getQuery(event)
  const group = (query.group == null) ? 'jkt48' : ['jkt48', 'hinatazaka46'].includes(String(query.group)) ? String(query.group) : null
  return await getStage48Members(group)
})
// const group =
const time = 1000 // 1 hour
async function getStage48Members(group: string | null = null): Promise<I48Member[]> {
  return await cache.fetch<I48Member[]>(group ? `${group}-stage48-raw` : 'stage48-raw', () => fetchData(group), time).catch(() => [])
}

async function fetchData(group: string | null = null): Promise<I48Member[]> {
  try {
    const members: I48Member[] = await Member.find(group ? { group } : {})
      .lean()
    return members
      .sort((a, b) => a.name.localeCompare(b.name))
  }
  catch (e) {
    console.log(e)
    return []
  }
}
