import { getStreamingURL } from '~~/library/api/showroom'

export default defineEventHandler(
  async (event): Promise<ShowroomAPI.StreamingUrlList> => { // query abr_available=1 <= untuk url yg auto quality
    const params = getQuery(event)
    return await getStreamingURL(params)
  }
)
