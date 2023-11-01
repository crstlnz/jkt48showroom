import { dbConnect } from '~/library/database'
import ShowroomLog from '~/library/database/schema/showroom/ShowroomLog'
import cache from '~~/library/utils/cache'

const time = 3600000
export default defineEventHandler(
  async (event): Promise<Database.IScreenshot> => {
    const params = getQuery(event)
    return await cache
      .fetch<Database.IScreenshot>(`screenshots-${params.data_id}`, () => fetchData(params.data_id as string), time)
  },
)

async function fetchData(data_id: string): Promise<Database.IScreenshot> {
  await dbConnect()
  const data = await ShowroomLog.findOne({ data_id }).select({ 'live_info.screenshot': 1 })
  if (!data?.live_info?.screenshot) {
    throw createError({ statusCode: 404, message: 'Not found!' })
  }
  return data?.live_info?.screenshot
}
