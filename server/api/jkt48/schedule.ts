import Schedule from '~/library/database/showroomDB/jkt48/Schedule'
import cache from '~~/library/utils/cache'

// const time = 1
const time = 10000

export default defineEventHandler(async (event): Promise<IApiSchedule> => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  return await cache
    .fetch<IApiSchedule>(`jkt48news-page-${page}`, async () => await getSchedule(page), time)
})

async function getSchedule(page = 1, perpage = 10): Promise<IApiSchedule> {
  const total = await Schedule.count({})
  const maxPage = Math.ceil(total / perpage)
  if (page < 1) page = 1
  if (page > maxPage) page = maxPage
  const schedules = await Schedule.find({}).limit(10).skip((page - 1) * perpage).sort('-date').select('-_id title date label id url').lean()
  return {
    schedules,
    page,
    perpage,
    total_count: total,
  }
}

export { getSchedule }
