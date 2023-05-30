export const useMembers = defineStore('members', () => {
  const error = ref(false)
  const loading = ref(false)
  const members = ref<IMember[]>([])
  async function load() {
    try {
      loading.value = true
      const data = await $fetch('/api/showroom/members')
      error.value = false
      loading.value = false
      members.value = data
    }
    catch (e) {
      loading.value = false
      error.value = true
    }
  }

  return {
    members,
    pending: computed(() => {
      return loading.value || !members.value?.length
    }),
    error,
    load,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMembers as any, import.meta.hot))
}
