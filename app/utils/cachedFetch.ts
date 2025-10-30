// utils/cache.ts
interface CacheItem<T> {
  value: T
  expiresAt: number
}

class Cache {
  private store = new Map<string, CacheItem<any>>()
  private flights = new Map<string, Promise<any>>() // untuk singleflight
  private defaultTTL: number

  constructor(ttlMs = 1000 * 60 * 60 * 3) {
    this.defaultTTL = ttlMs // default 3 jam
  }

  get<T>(key: string): T | null {
    const item = this.store.get(key)
    if (!item) return null
    if (Date.now() > item.expiresAt) {
      this.store.delete(key)
      return null
    }
    return item.value
  }

  set<T>(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl ?? this.defaultTTL)
    this.store.set(key, { value, expiresAt })
  }

  delete(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }

  /**
   * SingleFlight + caching fetch.
   * Jika ada request lain untuk key yang sama sedang berlangsung,
   * mereka akan menunggu Promise yang sama.
   */
  async fetch<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    // 1️⃣ cek cache dulu
    const cached = this.get<T>(key)
    if (cached) return cached

    // 2️⃣ jika sedang ada flight, tunggu yang sama
    if (this.flights.has(key)) {
      return this.flights.get(key)!
    }

    // 3️⃣ buat flight baru
    const promise = (async () => {
      try {
        const fresh = await fetcher()
        this.set(key, fresh, ttl)
        return fresh
      }
      finally {
        // hapus dari flights setelah selesai (berhasil/gagal)
        this.flights.delete(key)
      }
    })()

    // simpan ke flights agar yang lain menunggu
    this.flights.set(key, promise)

    // 4️⃣ tunggu hasil
    return promise
  }
}

// singleton global cache
export const cachedFetch = new Cache()

export default Cache
