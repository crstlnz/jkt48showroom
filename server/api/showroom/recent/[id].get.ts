import { calculateFansPoints } from '../stats.get'
import ShowroomLog from '~/library/database/schema/showroom/ShowroomLog'
export default defineEventHandler(async (event: any) => {
  const dataId = event.context.params?.id
  const data = await ShowroomLog.getDetails(dataId)
  if (!data) { throw createError({ statusMessage: 'Data not found!', statusCode: 404 }) }
  const fansRank = calculateFansPoints(data.users, data.live_info?.stage_list ?? [])
  return { ...data, fans: fansRank }
})
