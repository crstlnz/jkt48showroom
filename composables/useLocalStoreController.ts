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

  write(value: DataValue<T>): string {
    if (value === null) return ''
    return JSON.stringify({ data: this.serializer.write(value.data), created_at: value.created_at })
  }
}

/**
 * @param id The id of localstorage.
 * @param fetchData A function for fetching the data.
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
  const fetchData = opts?.fetch
  const customIsExpired = opts?.isExpired

  const data: Ref<DataValue<T> | null> = useLocalStorage<DataValue<T> | null>(`d-${id}`, null, {
    serializer: serializer ? new ExtendedSerializer<T>(serializer) : new JSONSerializer(null),
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

  function tryRefresh(...args: unknown[]) {
    if (!fetchData) throw new Error('Fetch function required!')
    if (pending.value || !isExpired()) return
    refresh(...args)
  }

  async function refresh(...args: unknown[]) {
    if (!fetchData) throw new Error('Fetch function required!')
    try {
      pending.value = true
      const res: T = await fetchData(args)
      set(res)
      pending.value = false
    }
    catch (e) {
      pending.value = false
      error.value = true
    }
  }

  function set(value: T) {
    data.value = {
      data: value,
      created_at: new Date().getTime(),
    }
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
