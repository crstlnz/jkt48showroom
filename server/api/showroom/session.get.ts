import { getSession } from '~~/library/showroom/session'

export default defineEventHandler(async (event) => {
  const token = event.context.token
  const sr_id = (token as any)?.cookie_id || null
  return await getSession(sr_id ? `sr_id=${sr_id};` : null)
},
)
