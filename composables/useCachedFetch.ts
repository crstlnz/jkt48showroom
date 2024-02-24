import { get } from '@vueuse/core'
import type { Ref } from 'vue'
import JSONSerializer from '~/library/serializer/json'

interface CachedFetchOptions {
  params?: MaybeRef<object>
  expireIn?: number
}

interface DataJSON<T> {
  data: T
  timestamp: number
}

export default function useCachedFetch<DataT>(url: string, options?: CachedFetchOptions) {
  const expireIn = ref(options?.expireIn ?? 3600000)
  const pending = ref(true)
  const error = ref<Error | null>(null)
  const isFirstFetch = ref(true)
  const data = ref<DataT | null>(null) as Ref<DataT | null>
  const date = ref<number | null>(null)
  const config = useRuntimeConfig()
  const cache = useLocalStorage<DataJSON<DataT> | null>(url, null, { serializer: new JSONSerializer<DataJSON<DataT> | null>(null) })

  function isValid(): boolean {
    if (cache.value) {
      if (new Date().getTime() - cache.value.timestamp < expireIn.value) {
        return true
      }
    }
    return false
  }

  async function fetch(force: boolean = false) {
    isFirstFetch.value = false
    pending.value = true
    error.value = null
    try {
      if (isValid() && !force) {
        pending.value = false
        data.value = cache.value!.data
        date.value = cache.value!.timestamp
        return
      }
      const time = new Date().getTime()
      const res = await $apiFetch<DataT>(`${config.public.api}${url}`, { params: get(options?.params) })
      data.value = res
      date.value = time
      cache.value = {
        data: res,
        timestamp: time,
      }
      pending.value = false
    }
    catch (e: any) {
      error.value = e as Error
      pending.value = false
    }
  }

  onMounted(() => {
    fetch()
  })

  function refresh() {
    if (pending.value) return
    fetch(true)
  }

  function tryRefresh() {
    if (pending.value) return
    fetch(false)
  }

  return { data, pending, error, refresh, date, tryRefresh }
}
