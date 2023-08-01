import { sendComment } from '~~/library/api/showroom'

export default defineEventHandler(async (event): Promise<Watch.CommentResponse> => {
  const body = await readBody(event)
  console.log(body)
  if (!event.context.showroom_cookie) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated!' })
  if (!body.csrf_token || !body.comment || !body.live_id) throw createError({ statusCode: 400, statusMessage: 'Bad request!' })
  const params = new URLSearchParams()
  params.append('csrf_token', body.csrf_token || '')
  params.append('comment', body.comment)
  params.append('live_id', body.live_id)
  params.append('is_delay', body.is_delay)
  return await sendComment({
    headers: {
      'Cookie': event.context.showroom_cookie || '',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })
})
