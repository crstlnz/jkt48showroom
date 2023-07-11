import LocalCacheManager from './LocalCacheManager'
import RedisManager from './RedisManager'

type cacheType = 'redis' | 'local' | 'auto'

interface CacheOptions {
  cacheType?: cacheType
  key?: string
}

class CacheManager {
  private cacheType: cacheType
  private cache: LocalCacheManager
  private redis: RedisManager
  private key?: string
  initType: cacheType
  /**
   * @param {CacheOptions} [opts.cacheType] - cacheType is type of the cache
   * @param {CacheOptions} [opts.key] - key is additional string before the given key (for multiple cache purpose)
   */
  constructor(opts?: CacheOptions) {
    this.cache = new LocalCacheManager()
    this.redis = new RedisManager()
    this.cacheType = opts?.cacheType ?? 'auto'
    this.initType = opts?.cacheType ?? 'auto'
    this.key = opts?.key
  }

  disableRedis(ms = 1800000) {
    this.cacheType = 'local'
    setTimeout(() => {
      this.cacheType = this.initType
    }, ms)
  }

  async set(key: string | number, value: string | object, ms = 3600000) {
    if (!key) throw new Error('No Key')
    key = this.getKey(key)
    if (this.cacheType === 'redis') {
      try {
        return await this.redis.set(key, value, ms)
      }
      catch (e) {
        return
      }
    }
    else if (this.cacheType === 'auto') {
      await this.redis.set(key, value, ms).catch()
      this.cache.set(key, value, ms)
    }
    this.cache.set(key, value, ms)
  }

  async get<T>(key: number | string) {
    if (!key) throw new Error('No Key')
    key = this.getKey(key)
    if (this.cacheType === 'redis') {
      try {
        return await this.redis.get<T>(key, false).catch(() => null)
      }
      catch (e) {
        return null
      }
    }
    else if (this.cacheType === 'auto') {
      if (!this.cache.valid(key)) {
        const cache = await this.redis.get<T>(key, true).catch(() => null)
        if (!cache) return null
        this.cache.set(key, cache.data, cache.expireIn)
        return cache.data
      }
      return this.cache.get(key)
    }
    if (!this.cache.valid(key)) {
      return null
    }
    return this.cache.get(key)
  }

  async clear() {
    this.cache.clear()
    await this.redis.clear()
  }

  async delete(key: number | string) {
    if (!key) throw new Error('No Key')
    key = this.getKey(key)
    if (this.cacheType === 'redis' || this.cacheType === 'auto') {
      await this.redis.delete(key).catch(_ => null)
    }
    if (this.cacheType !== 'redis') this.cache.delete(key)
  }

  async fetch<T>(
    key: string | number,
    fetchData: (...args: unknown[]) => Promise<string | object | []>,
    ms = 3600000,
  ): Promise<T> {
    if (!key) throw new Error('No Key')
    const data = await this.get(key)
    if (data) {
      return data as T
    }
    else {
      const data = await fetchData()
      this.set(key, data, ms)
      return data as T
    }
  }

  getKey(key: string | number) {
    return this.key ? `${this.key}-${key}` : key
  }
}

export default new CacheManager({ key: 'GROUP', cacheType: 'redis' })
