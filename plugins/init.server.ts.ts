export default defineNuxtPlugin(async () => {
  const { checkAuth } = useAuth()
  if (process.server) {
    await checkAuth()
  }
})
