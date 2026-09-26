import type { Ref } from 'vue'
import { get } from '@vueuse/core'

interface CachedFetchOptions {
  params?: MaybeRef<object>
  expireIn?: number
}

interface CachedResponse<T> {
  data: T
  timestamp: number
  expiresAt: number
}

const sessionCachePrefix = 'cached-fetch:'

function serializeCacheValue(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(serializeCacheValue).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${serializeCacheValue(item)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

function getSessionCache<T>(key: string, now: number): CachedResponse<T> | null {
  try {
    const raw = sessionStorage.getItem(`${sessionCachePrefix}${key}`)
    if (!raw) return null
    const cached = JSON.parse(raw) as CachedResponse<T>
    if (cached.expiresAt > now) return cached
    sessionStorage.removeItem(`${sessionCachePrefix}${key}`)
  }
  catch {
    return null
  }
  return null
}

function setSessionCache<T>(key: string, entry: CachedResponse<T>) {
  try {
    sessionStorage.setItem(`${sessionCachePrefix}${key}`, JSON.stringify(entry))
  }
  catch {
  }
}

export default function useCachedFetch<DataT>(url: string, options?: CachedFetchOptions) {
  const expireIn = options?.expireIn ?? 3600000
  const pending = ref(true)
  const error = ref<Error | null>(null)
  const data = ref<DataT | null>(null) as Ref<DataT | null>
  const date = ref<number | null>(null)
  const config = useRuntimeConfig()

  function getCacheKey(params: object | undefined) {
    return `${url}?${serializeCacheValue(params ?? {})}`
  }

  async function fetch(force: boolean = false) {
    pending.value = true
    error.value = null
    const params = get(options?.params)
    const key = getCacheKey(params)
    try {
      const now = Date.now()
      const cached = getSessionCache<DataT>(key, now)
      if (cached && !force) {
        data.value = cached.data
        date.value = cached.timestamp
        return
      }

      const res = await $apiFetch<DataT>(`${config.public.api}${url}`, { params, useSignature: true })
      const time = Date.now()
      data.value = res
      date.value = time
      setSessionCache(key, {
        data: res,
        timestamp: time,
        expiresAt: time + expireIn,
      })
    }
    catch (e: unknown) {
      error.value = e as Error
    }
    finally {
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
