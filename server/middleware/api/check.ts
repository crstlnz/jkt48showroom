import { getToken } from '#auth'
import { connection } from '~~/library/database'

export default defineEventHandler(async (event) => {
  if (event.node.req.url?.startsWith('/api')) {
    const token = await getToken({ event })
    if (token?.cookie_id) {
      event.context.sr_id = token.cookie_id
      event.context.showroom_cookie = `sr_id=${token?.cookie_id};`
    }
    if (event.node.req.url?.startsWith('/api/admin')) {
      const token = await getToken({ event })
      if (token?.role !== 'admin' || !useAppConfig().isAdmin(String(token?.id))) {
        throw createError({ statusCode: 404, statusMessage: `Page not found: ${event.node.req.url}` })
      }
    }

    if (connection.readyState !== 1) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Service Unavailable',
      })
    }
  }
})
