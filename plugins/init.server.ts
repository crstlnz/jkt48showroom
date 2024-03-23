export default defineNuxtPlugin(async () => {
  const { checkAuth } = useAuth()
  await checkAuth()
})
