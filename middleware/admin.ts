export default defineNuxtRouteMiddleware(() => {
  const { status, data } = useAuth()
  if (status.value === 'authenticated' && (data.value as any)?.role === 'admin') {
    return
  }
  return createError({ statusCode: 404, message: 'Page not found!' })
})
