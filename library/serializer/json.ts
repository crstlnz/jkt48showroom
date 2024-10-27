import type { Serializer } from '@vueuse/core'

export default class JSONSerializer<T> implements Serializer<T> {
  default: T
  constructor(def: T) {
    this.default = def
  }

  read(raw: string): T {
    try {
      return JSON.parse(raw)
    }
    catch (e) {
      console.error(e)
      return this.default
    }
  }

  write(value: T): string {
    return JSON.stringify(value)
  }
}
