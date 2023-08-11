import { getSession } from '~~/library/showroom/session'

export default defineEventHandler(async (event) => {
  const token = event.context.token
  const sr_id = (token as any)?.cookie_id || null
  console.log('USER', token?.name)
  console.log('FETCHING SESSION COOKIE ID', sr_id)
  return await getSession(sr_id ? `sr_id=${sr_id};` : null)
},
)
