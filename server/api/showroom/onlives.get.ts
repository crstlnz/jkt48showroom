import { getOnlives } from '~~/library/api/showroom'

export default defineEventHandler(
  async (event): Promise<ShowroomAPI.Onlives> => {
    const params = getQuery(event)
    return await getOnlives(params)
  },
)
