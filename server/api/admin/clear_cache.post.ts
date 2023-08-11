import cache from '~~/library/utils/cache'

export default defineEventHandler(async (): Promise<API.Status> => {
  await cache.clear()
  return {
    code: 200,
    message: 'Success!',
  }
})
