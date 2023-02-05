import { RedisCommandArgument } from '@redis/client/dist/lib/commands'
import redis from '~/library/redis'

interface WithExpire<T> {
  expireIn: number;
  data: T;
}

class RedisManager {
  maxRetry: number
  delay: number // retry delay
  constructor () {
    this.maxRetry = 2
    this.delay = 1000
  }

  sleep (ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  parse (value: any) {
    try {
      return JSON.parse(value)
    } catch (e) {
      return value
    }
  }

  async get<T> (
    key: RedisCommandArgument | string | number,
    withExpire = false,
    retry = 0
  ): Promise<T | WithExpire<T> | null> {
    if (retry > 0) { await this.sleep(this.delay) }
    try {
      const d = await redis.get(key as RedisCommandArgument)
      if (!d) { return null }
      const data = this.parse(d)
      if (!withExpire) { return data as T }
      const expireIn = await redis.pTTL(key as RedisCommandArgument)
      return {
        expireIn,
        data
      }
    } catch (e) {
      if (retry < this.maxRetry) {
        return await this.get(key, withExpire, retry + 1)
      } else {
        throw e
      }
    }
  }

  async set (
    key: string,
    value: string | object,
    ms = 3600000,
    retry = 0
  ): Promise<void> {
    if (retry > 0) { await this.sleep(this.delay) }
    try {
      await redis.set(key, JSON.stringify(value), { PX: ms })
    } catch (e) {
      if (retry < this.maxRetry) {
        await this.set(key, value, ms, retry + 1)
      } else {
        throw e
      }
    }
  }

  async clear () {
    await redis.flushAll()
  }
}

export default RedisManager
