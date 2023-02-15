interface Value {
  value: unknown;
  expireIn: number;
  date: number;
}
const setValue = (value: string | object | number, ms: number): Value => ({
  value,
  expireIn: ms,
  date: new Date().getTime()
})

class LocalCacheManager {
  map: Map<unknown, Value>
  constructor () {
    this.map = new Map()
  }

  set (key: string | number, value: any, ms = 3600000) {
    if (!key) { throw new Error('No Key') }
    this.map.set(key, setValue(value, ms))
  }

  get (key: string | number) {
    return this.map.get(key)?.value
  }

  delete (key : string | number) {
    return this.map.delete(key)
  }

  clear () {
    this.map.clear()
  }

  has (key: string | number) {
    return this.map.has(key)
  }

  valid (key: string | number) {
    if (!this.map.has(key)) { return false }
    const d = this.map.get(key)
    if (
      new Date().getTime() - new Date(d?.date ?? 0).getTime() <
      (d?.expireIn ?? 0)
    ) { return true }
    return false
  }
}

export default LocalCacheManager
export { Value }
