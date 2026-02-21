export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const { status, checkAuth } = useAuth()
  if (status.value !== 'authenticated') {
    await checkAuth()
  }

  if (status.value === 'authenticated') {
    return navigateTo('/')
  }
})
