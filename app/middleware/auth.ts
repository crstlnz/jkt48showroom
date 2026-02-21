export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const { status, checkAuth } = useAuth()
  if (status.value !== 'authenticated') {
    await checkAuth()
  }

  if (status.value === 'authenticated') {
    return
  }

  return navigateTo(`/login?r=${encodeURI(btoa(to.fullPath))}`, {})
})
