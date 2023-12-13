export default defineNuxtRouteMiddleware((to) => {
  const { status } = useAuth()
  if (status.value === 'authenticated') {
    return
  }
  return navigateTo(`/login?r=${encodeURI(btoa(to.fullPath))}`, {})
})
