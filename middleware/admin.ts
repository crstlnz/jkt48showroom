export default defineNuxtRouteMiddleware(() => {
  const { status, user } = useAuth()
  if (status.value === 'authenticated' && (user.value as any)?.is_admin) {
    return
  }
  return createError({ statusCode: 404, message: 'Page not found!' })
})
