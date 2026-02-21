export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const { status, user, checkAuth } = useAuth()
  if (status.value !== 'authenticated') {
    await checkAuth()
  }

  if (status.value === 'authenticated' && user.value?.is_admin) {
    return
  }

  return navigateTo('/')
})
