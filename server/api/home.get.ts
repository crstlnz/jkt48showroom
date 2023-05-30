import { getStats } from './showroom/stats.get'
import { getRecents } from './showroom/recent/index.get'
import cache from '~~/library/utils/cache'

const time = 60000

export default defineEventHandler(async (): Promise<IHomeData> => {
  const data = await getHomeData()
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Data Not Found' })
  return data
})

async function getHomeData(): Promise<IHomeData | null> {
  return await cache
    .fetch<IHomeData>('homedata', fetchData, time)
    .catch(() => null)
}

async function fetchData(): Promise<IHomeData> {
  const data = await Promise.all([
    getRecents().catch(() => ({ recents: [] })),
    getStats(),
  ])
  return {
    recents: data[0].recents,
    data: data[1],
  }
}

export { getHomeData }
