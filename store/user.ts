export const useUser = defineStore('user', () => {
  const { data, status, signOut, signIn } = useAuth()

  const isAdmin = computed(() => {
    return (data.value as any)?.role === 'admin'
  })

  watch(data, async (val) => {
    if (val != null && (val as any)?.error === true) {
      await signOut()
    }
  }, { immediate: true })

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
      account_id: (data.value as any)?.account_id,
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
