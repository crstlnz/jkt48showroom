import { useSettings } from './settings'

export const useMembers = defineStore('members', () => {
  const error = ref(false)
  const loading = ref(false)
  // const members = ref<IMember[]>([])
  const settings = useSettings()
  const { data: members, trySet, isValid } = useExpiredLocalStorage<IMember[]>('JKT48Memberss', 86400000)

  async function fetch() {
    await trySet(async () => await $apiFetch('/api/member', { query: { group: settings.group } }))
  }

  async function load() {
    try {
      loading.value = true
      await fetch()
      error.value = false
      loading.value = false
    }
    catch (e) {
      loading.value = false
      error.value = true
    }
  }

  async function tryRefresh() {
    if (!members.value && !isValid) {
      await fetch()
    }
  }

  return {
    members,
    isValid,
    tryRefresh,
    pending: computed(() => {
      return loading.value || !members.value?.length
    }),
    error,
    load,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMembers, import.meta.hot))
}
