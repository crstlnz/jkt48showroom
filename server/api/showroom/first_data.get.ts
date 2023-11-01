import { getMembers } from './members.get'
import ShowroomLog from '~~/library/database/schema/showroom/ShowroomLog'
import config from '~~/app.config'
import cache from '~~/library/utils/cache'

export default defineEventHandler(async (event): Promise<string> => {
  const query = getQuery(event)
  const group = config.getGroup(query.group as string)
  return await getData(group)
})

const time = 3600000 * 24 // 1 hour
async function getData(group: string | null = null): Promise<string> {
  const cacheKey = group ? `${group}-first-data` : 'first-data'
  return await cache.fetch<string>(cacheKey, () => fetchData(group), time).catch(() => '')
}

async function fetchData(group: string | null = null): Promise<string> {
  const members = await getMembers(group)
  const data = await ShowroomLog.findOne({ room_id: members.map(i => i.room_id) }).sort({ _id: 1 })
  return data?.live_info.start_date.toISOString() || ''
}
