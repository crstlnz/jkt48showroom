import { useSettings } from './settings'

export const useMembers = defineStore('members', () => {
  const error = ref<Error | null>(null)
  const loading = ref(false)
  const settings = useSettings()
  const { data: members, trySet, isValid } = useExpiredLocalStorage<IMember[]>(`membersv20-${settings.group}`, 86400000)
  async function fetch() {
    await trySet(async () => await $apiFetch('/api/member?v=v20', { query: { group: settings.group, _v: 'v20' } }))
  }

  async function load() {
    try {
      loading.value = true
      await fetch()
      error.value = null
      loading.value = false
    }
    catch (e) {
      loading.value = false
      error.value = e as Error
    }
  }

  async function tryRefresh() {
    if (!members.value && !isValid.value) {
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
