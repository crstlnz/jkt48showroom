import { getSession } from '~~/library/showroom/session'
import { getToken } from '#auth'

export default defineEventHandler(
  async (event) => {
    const token = await getToken({ event })
    const sr_id = (token as any)?.cookie_id || null
    return await getSession(sr_id ? `sr_id=${sr_id};` : null)
  },
)
