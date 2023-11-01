import { dbConnect } from '~/library/database'
import Member from '~~/library/database/schema/48group/Member'
import cache from '~~/library/utils/cache'

export default defineEventHandler(async (event): Promise<Admin.I48Member[]> => {
  const query = getQuery(event)
  const group = (query.group == null) ? 'jkt48' : ['jkt48', 'hinatazaka46'].includes(String(query.group)) ? String(query.group) : null
  return await getStage48Members(group)
})

const time = 1000
async function getStage48Members(group: string | null = null): Promise<Admin.I48Member[]> {
  return await cache.fetch<Admin.I48Member[]>(group ? `${group}-stage48-raw` : 'stage48-raw', () => fetchData(group), time).catch(() => [])
}

async function fetchData(group: string | null = null): Promise<Admin.I48Member[]> {
  try {
    await dbConnect()
    const members: Admin.I48Member[] = await Member.find(group ? { group } : {})
      .lean()
    return members
      .sort((a, b) => a.name.localeCompare(b.name))
  }
  catch (e) {
    console.log(e)
    return []
  }
}
