export default defineEventHandler(async (): Promise<API.Status> => {
  return {
    code: 200,
    message: 'Success!',
  }
})
