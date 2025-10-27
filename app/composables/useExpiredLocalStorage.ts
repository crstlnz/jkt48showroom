import JSONSerializer from '~/library/serializer/json'

interface DataJSON<T> {
  data: T
  timestamp: number
}

export default function<T> (key: string, expiredIn: number) {
  const data = useLocalStorage<DataJSON<T> | null>(key, null, { serializer: new JSONSerializer<DataJSON<T> | null>(null) })

  const isValid = computed(() => {
    if (data.value) {
      if (new Date().getTime() - data.value.timestamp < expiredIn) {
        return true
      }
    }
    return false
  })

  function set(d: T) {
    data.value = {
      data: d,
      timestamp: expiredIn,
    }
  }

  async function trySet(fun: () => Promise<T>) {
    try {
      data.value = {
        data: await fun(),
        timestamp: expiredIn,
      }
    }
    catch (e) {
      console.error(e)
    }
  }

  const value = computed(() => {
    return data.value?.data
  })

  return { isValid, set, trySet, data: value }
}
