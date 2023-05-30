export const useUser = defineStore('user', () => {
  const { data, status, signOut, signIn } = useAuth()

  const isAdmin = computed(() => {
    return (data.value as any)?.role === 'admin'
  })

  const id = computed<string | null>(() => {
    return (data.value as any)?.id ?? null
  })

  const authenticated = computed(() => {
    return status.value === 'authenticated'
  })

  return {
    authenticated,
    user: {
      isAdmin,
      id,
      img: data.value?.user?.image,
      discriminator: (data.value as any)?.discriminator,
      name: data.value?.user?.name,
    },
    status,
    signOut,
    signIn,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUser as any, import.meta.hot))
}
