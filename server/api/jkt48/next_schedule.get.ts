import dayjs from 'dayjs'
import Schedule from '~/library/database/showroomDB/jkt48/Schedule'
import cache from '~~/library/utils/cache'

const time = 1
// const time = 60000 * 5

export default defineEventHandler(async (): Promise<JKT48.Schedule[]> => {
  return await cache
    .fetch<JKT48.Schedule[]>('jkt48schedule', async () => await getSchedule(), time)
})

async function getSchedule(): Promise<JKT48.Schedule[]> {
  const nextSchedule = await Schedule.find({
    date: { $gte: dayjs().startOf('day') },
  }).sort('date').select('-_id -__v').limit(10).lean()
  return nextSchedule
}

export { getSchedule }
