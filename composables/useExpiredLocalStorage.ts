import JSONSerializer from '~/library/serializer/json'

export default function<T> (key: string, expiredIn: number) {
  const data = useLocalStorage<{
    data: T
    timestamp: number
  } | null>(key, null, { serializer: new JSONSerializer(null) })

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
