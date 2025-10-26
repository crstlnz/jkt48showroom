import type { Serializer } from '@vueuse/core'

export default class JSONSerializer<T> implements Serializer<T> {
  default: T
  expiredIn: number
  constructor(def: T, expiredIn: number) {
    this.default = def
    this.expiredIn = expiredIn
  }

  read(raw: string): T {
    try {
      const data = JSON.parse(raw)
      if (!data.time) return this.default
      if (new Date().getTime() - data.time >= this.expiredIn) {
        return this.default
      }
      else {
        return data.value
      }
    }
    catch (e) {
      console.error(e)
      return this.default
    }
  }

  write(value: T): string {
    return JSON.stringify({
      time: new Date().getTime(),
      value,
    })
  }
}
