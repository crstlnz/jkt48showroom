import type { Ref } from 'vue'
import type { Serializer } from '@vueuse/core'
import { useLocalStorage } from '@vueuse/core'
import JSONSerializer from '~~/library/serializer/json'

interface DataValue<T> {
  data: T
  created_at: number
}
interface LocalStoreControllerOptions<T> {
  expiredIn?: number
  serializer?: Serializer<T>
  allowExpiredData?: boolean
  isExpired?: (data: DataValue<T> | null, expiredIn: number) => boolean
  fetch?: (...args: any[]) => Promise<T>
}

class ExtendedSerializer<T> implements Serializer<DataValue<T> | null> {
  serializer: Serializer<T>
  constructor(serializer: Serializer<T>) {
    this.serializer = serializer
  }

  read(raw: string): DataValue<T> | null {
    try {
      const parsed = JSON.parse(raw)
      if ('data' in parsed && 'created_at' in parsed) {
        return {
          data: this.serializer.read(parsed.data),
          created_at: parsed.created_at,
        }
      }
      return null
    }
    catch (e) {
      return null
    }
  }

  write(value: { data: T, created_at: any } | null): string {
    if (value === null) return ''
    return JSON.stringify({ data: this.serializer.write(value.data), created_at: value.created_at })
  }
}

/**
 * @param id The id of localstorage.
 * @param opts Custom options of the controller.
 * @param opts.expiredIn Data expired in milliseconds. Set to 0 for no expire.
 * @param opts.fetch A promise or function to get the data for refresh fn
 * @param opts.isValid Custom valid check
 * @param opts.serializer Custom serializer to serialize data
 */
export default function<T> (
  id: string,
  opts?: LocalStoreControllerOptions<T>,
) {
  // const willExpire = opts?.expire ?? true
  const expiredIn = opts?.expiredIn ?? 3600000
  const serializer = opts?.serializer
  const allowExpiredData = opts?.allowExpiredData ?? false
  const pending = ref(true)
  const error = ref(false)
  const isFirstFetch = ref(true)
  const fetchData = opts?.fetch
  const customIsExpired = opts?.isExpired

  const data: Ref<DataValue<T> | null> = useLocalStorage<DataValue<T> | null>(`d-${id}`, null, {
    serializer: serializer ? new ExtendedSerializer<T>(serializer) : new JSONSerializer<DataValue<T> | null>(null),
  })

  const dataValue = computed(() => data.value?.data)

  if (data.value && isExpired() && !allowExpiredData) {
    data.value = null
  }

  function isExpired() {
    if (customIsExpired) return customIsExpired(data.value, expiredIn)
    if (expiredIn === 0) return false
    return new Date().getTime() - (data.value?.created_at ?? 0) > expiredIn
  }

  const isOnline = useOnline()
  const promise = ref<Promise<T> | null>(null)

  async function tryRefresh(...args: unknown[]): Promise<DataValue<T> | null> {
    if (!fetchData) throw new Error('Fetch function required!')
    if (!isExpired()) return data.value
    if (!isOnline.value) return data.value
    // if (!isFirstFetch.value) return

    // console.log('REFRESH')
    return await refresh(...args)
  }

  async function refresh(...args: unknown[]): Promise<DataValue<T> | null> {
    // isFirstFetch.value = false
    if (!fetchData) throw new Error('Fetch function required!')
    const fetch: Promise<T> = promise.value ? promise.value : fetchData(args)
    if (!promise.value) promise.value = fetch
    try {
      pending.value = true
      const res = await fetch
      pending.value = false
      promise.value = null
      set(res)
      return get(res)
    }
    catch (e) {
      console.error(e)
      promise.value = null
      pending.value = false
      error.value = true
      return null
    }
  }

  function get(value: T) {
    return {
      data: value,
      created_at: new Date().getTime(),
    }
  }

  function set(value: T) {
    data.value = get(value)
  }

  function clear() {
    data.value = null
  }

  return {
    data: dataValue,
    pending,
    error,
    refresh,
    tryRefresh,
    set,
    clear,
  }
}
