import { acceptHMRUpdate, defineStore, skipHydrate } from 'pinia'
import ExpiredSerializer from '~/library/serializer/expired'

export const useSettings = defineStore('settings', () => {
  const MIN_SPLIT_PARTS = 4
  const MAX_SPLIT_PARTS = 10

  // const { status } = useAuth()
  const rK1 = ref<string[]>([])
  const version = ref('')
  const apiKey = ref('')
  const splitCount = ref(MIN_SPLIT_PARTS)
  const accessToken = ref<string | null>(null)
  const rK2 = ref<string[]>([])
  const seed = ref<number | null>(null)
  const rK3 = ref<string[]>([])

  function applyAccessToken(token: string | null) {
    accessToken.value = token
  }

  function setVersion(ver: string) {
    version.value = ver
  }

  function setApiKey(key: string) {
    apiKey.value = key
  }

  function createSeededRandom(seed: number) {
    let state = seed >>> 0
    return () => {
      state = (Math.imul(1664525, state) + 1013904223) >>> 0
      return state / 4294967296
    }
  }

  function createPermutation(size: number, seed: number): number[] {
    const permutation = Array.from({ length: size }, (_, index) => index)
    const random = createSeededRandom(seed)
    for (let i = permutation.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      const current = permutation[i]!
      permutation[i] = permutation[j]!
      permutation[j] = current
    }
    return permutation
  }

  function applyPermutation(items: string[], permutation: number[]): string[] {
    return permutation.map(index => items[index]!)
  }

  function invertPermutation(items: string[], permutation: number[]): string[] {
    const restored = Array.from({ length: items.length }, () => '')
    for (let i = 0; i < items.length; i++) {
      restored[permutation[i]!] = items[i]!
    }
    return restored
  }

  function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  function createBucketPlan(parts: number, seedValue: number): number[] {
    const random = createSeededRandom(seedValue)
    return Array.from({ length: parts }, () => Math.floor(random() * 3))
  }

  function distributeShuffledChunks(chunks: string[], seedValue: number) {
    const plan = createBucketPlan(chunks.length, seedValue)
    const buckets = [[], [], []] as string[][]
    for (let i = 0; i < chunks.length; i++) {
      buckets[plan[i]!]!.push(chunks[i]!)
    }
    rK1.value = buckets[0]!
    rK2.value = buckets[1]!
    rK3.value = buckets[2]!
  }

  function collectShuffledChunks(parts: number, seedValue: number): string[] {
    const plan = createBucketPlan(parts, seedValue)
    const bucketIndexes = [0, 0, 0]
    const buckets = [rK1.value, rK2.value, rK3.value]
    const chunks: string[] = []

    for (let i = 0; i < parts; i++) {
      const bucket = plan[i]!
      const chunk = buckets[bucket]![bucketIndexes[bucket]!]
      if (typeof chunk !== 'string') return []
      chunks.push(chunk)
      bucketIndexes[bucket]! += 1
    }

    return chunks
  }

  function getApiKey() {
    const parts = Number(splitCount.value)
    if (!Number.isFinite(parts) || parts <= 0) return ''

    if (!Number.isFinite(seed.value)) {
      return atob([...rK1.value, ...rK2.value, ...rK3.value].join(''))
    }

    const currentSeed = seed.value as number
    const shuffledChunks = collectShuffledChunks(parts, currentSeed)
    if (shuffledChunks.length !== parts) return ''
    const permutation = createPermutation(parts, currentSeed)
    const orderedChunks = invertPermutation(shuffledChunks, permutation)

    return atob(orderedChunks.join(''))
  }

  function splitString(str: string, parts: number = 3): string[] {
    const len = str.length
    const size = Math.ceil(len / parts)
    const result: string[] = []
    for (let i = 0; i < parts; i++) {
      result.push(str.slice(i * size, (i + 1) * size))
    }
    return result
  }

  function setRawApiKey(key: string) {
    splitCount.value = randomInt(MIN_SPLIT_PARTS, MAX_SPLIT_PARTS)
    const chunks = splitString(btoa(key), splitCount.value)
    const _seed = Math.floor(Math.random() * 0xFFFFFFFF)
    seed.value = _seed
    const permutation = createPermutation(chunks.length, _seed)
    const shuffledChunks = applyPermutation(chunks, permutation)
    distributeShuffledChunks(shuffledChunks, _seed)
  }

  const status = ref(null)
  const domain = ref('')
  const csrfToken = ref('')
  const authenticated = computed(() => {
    return status.value === 'authenticated'
  })

  const session = useSessionStorage<{ csrf_token: string, cookie: string } | null>('showroom_session', null, {
    serializer: new ExpiredSerializer<{ csrf_token: string, cookie: string } | null>(null, authenticated.value ? 1000 * 60 * 15 : 1000 * 60 * 5),
  })

  const subDomain = ref('')

  const firstDate = ref('2020-11-01T09:59:57.810Z')

  const group = computed(() => {
    switch (subDomain.value) {
      case '46' :{
        return 'hinatazaka46'
      }
      default : {
        return 'jkt48'
      }
    }
  })

  function setDomain(d: string) {
    domain.value = d
    subDomain.value = getSubdomain(d) ?? ''
  }

  const host = ref('')
  const path = ref('')
  function getSubdomain(domain: string): string {
    host.value = domain
    const parts = domain.split('.')
    return parts?.[0] || ''
  }

  const { getTitle } = useAppConfig()

  function getWebTitle() {
    return getTitle(group.value)
  }

  const currentURL = computed(() => `https://${host.value}${path.value}`)

  const route = useRoute()

  watch(() => route.fullPath, (p) => {
    path.value = p
  })
  return { setApiKey, accessToken, applyAccessToken, apiKey, setRawApiKey, getApiKey, seed, splitCount, rK1, rK2, rK3, domain, version, setVersion, setDomain, currentURL, getWebTitle, group, csrfToken, firstDate, session: skipHydrate(session) }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettings, import.meta.hot))
}
