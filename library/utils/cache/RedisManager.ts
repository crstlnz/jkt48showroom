import type { RedisCommandArgument } from '@redis/client/dist/lib/commands'
import redis from '~/library/redis'

interface WithExpire<T> {
  expireIn: number
  data: T
}

class RedisManager {
  maxRetry: number
  delay: number // retry delay
  constructor() {
    this.maxRetry = 2
    this.delay = 1000
  }

  sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  parse(value: any) {
    try {
      return JSON.parse(value)
    }
    catch (e) {
      return value
    }
  }

  async delete(key: string | number) {
    return await redis.del(String(key))
  }

  async get<T>(key: RedisCommandArgument | string | number, withExpire?: true, retry?: number): Promise<WithExpire<T> | null>
  async get<T>(key: RedisCommandArgument | string | number, withExpire?: false, retry?: number): Promise<T | null>
  async get<T>(key: RedisCommandArgument | string | number, withExpire?: boolean, retry?: number): Promise<WithExpire<T> | T | null>
  async get<T>(
    key: RedisCommandArgument | string | number,
    withExpire = false,
    retry = 0,
  ): Promise<T | WithExpire<T> | null> {
    if (retry > 0) await this.sleep(this.delay)
    try {
      const expireIn = await redis.pTTL(key as RedisCommandArgument)
      if (expireIn <= 0) return null
      const d = await redis.get(key as RedisCommandArgument)
      if (!d) return null
      const data = this.parse(d) as T
      if (!withExpire) return data
      return {
        expireIn,
        data,
      } as WithExpire<T>
    }
    catch (e) {
      if (retry < this.maxRetry) {
        return await this.get(key, withExpire, retry + 1)
      }
      else {
        throw e
      }
    }
  }

  async set(
    key: string | number,
    value: string | object,
    ms = 3600000,
    retry = 0,
  ): Promise<void> {
    if (retry > 0) await this.sleep(this.delay)
    try {
      await redis.set(String(key), JSON.stringify(value), { PX: ms })
    }
    catch (e) {
      if (retry < this.maxRetry) {
        await this.set(key, value, ms, retry + 1)
      }
      else {
        throw e
      }
    }
  }

  async clear() {
    await redis.flushAll()
  }
}

export default RedisManager
