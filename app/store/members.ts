import { useSettings } from './settings'

export const useMembers = defineStore('members', () => {
  const error = ref<Error | null>(null)
  const loading = ref(false)
  const settings = useSettings()
  const v = 'v32'
  const members = ref<IMember[] | null>(null)

  async function fetch() {
    members.value = await $apiFetch(`/api/member?v=${v}`, { query: { group: settings.group, _v: v } })
  }

  async function load() {
    if (loading.value) return
    try {
      loading.value = true
      await fetch()
      error.value = null
    }
    catch (e) {
      error.value = e as Error
    }
    finally {
      loading.value = false
    }
  }

  async function tryRefresh() {
    if (!members.value) await load()
  }

  onMounted(() => {
    tryRefresh()
  })

  return {
    members,
    isValid: computed(() => members.value != null),
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
