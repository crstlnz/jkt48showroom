import { useSettings } from './settings'

interface MembersCache {
  version: string
  members: IMember[]
}

export const useMembers = defineStore('members', () => {
  const error = ref<Error | null>(null)
  const loading = ref(false)
  const settings = useSettings()
  const v = 'v29'
  const { data: cache, trySet, isValid } = useExpiredLocalStorage<MembersCache>(`members-${settings.group}`, 86400000)
  const isCacheValid = computed(() => isValid.value && cache.value?.version === v)
  const members = computed(() => cache.value?.version === v ? cache.value.members : null)

  async function fetch() {
    await trySet(async () => ({
      version: v,
      members: await $apiFetch(`/api/member?v=${v}`, { query: { group: settings.group, _v: v } }),
    }))
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
    if (!members.value && !isCacheValid.value) {
      await fetch()
    }
  }

  onMounted(() => {
    tryRefresh()
  })

  return {
    members,
    isValid: isCacheValid,
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
