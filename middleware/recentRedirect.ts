export default defineNuxtRouteMiddleware((to) => {
  return navigateTo(to.params.id ? `/recent/${to.params.id}` : '/member')
})
