type SorterResultRankIds = string | string[]
type SorterResultPayloadV2 = [version: 2, ranks: SorterResultRankIds[], shareName?: string, ownerToken?: string]
type SorterResultPayloadV3 = [version: 3, ranks: SorterResultRankIds[], shareName?: string, ownerToken?: string, filterList?: string[]]
type SorterSourceMember = IMember & { _id: string, jkt48_id?: string | number }

export const SORTER_RESULT_SCHEMA_VERSION = 3 as const
let sorterOwnerTokenPromise: Promise<string> | null = null

function toBase64Url(value: string) {
  return btoa(value)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function fromBase64Url(value: string) {
  const normalized = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4))
  return atob(`${normalized}${padding}`)
}

function isValidRankIds(value: unknown): value is SorterResultRankIds {
  if (typeof value === 'string') return value.length > 0
  if (!Array.isArray(value) || !value.length) return false
  return value.every(item => typeof item === 'string' && item.length > 0)
}

export function sanitizeSorterShareName(value: unknown) {
  return Array.from(String(value ?? '')
    .normalize('NFKC')
    .replace(/[<>`]/g, '')
    .replace(/\s+/g, ' '))
    .filter((char) => {
      const code = char.charCodeAt(0)
      return code >= 32 && code !== 127
    })
    .join('')
    .trim()
    .slice(0, 40)
}

export function sanitizeSorterOwnerToken(value: unknown) {
  return String(value ?? '')
    .trim()
    .replace(/[^a-z0-9]/gi, '')
    .slice(0, 64)
}

export function sanitizeSorterFilterList(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map(item => sanitizeSorterShareName(item))
    .filter(Boolean)
    .slice(0, 20)
}

export async function getSorterOwnerToken() {
  if (!import.meta.client) return ''

  if (!sorterOwnerTokenPromise) {
    sorterOwnerTokenPromise = import('@fingerprintjs/fingerprintjs')
      .then(module => module.default.load())
      .then(fp => fp.get())
      .then(result => sanitizeSorterOwnerToken(result.visitorId))
      .catch(() => '')
  }

  return sorterOwnerTokenPromise
}

export function getSorterMemberId(member: SorterSourceMember) {
  return String(member.jkt48_id ?? member._id)
}

export function toSortMember(member: SorterSourceMember): ISortMember {
  return {
    id: getSorterMemberId(member),
    img: member.img_alt || member.img,
    name: member.nicknames?.[0] || member.name,
    generation: member.generation,
    is_graduate: member.is_graduate,
  }
}

function toSorterRankIds(result: (ISortMember | ISortMember[])[]) {
  return result.map((item) => {
    if (Array.isArray(item)) {
      return item.map(member => member.id)
    }
    return item.id
  })
}

export function encodeSorterResult(
  result: (ISortMember | ISortMember[])[],
  options?: {
    shareName?: string
    ownerToken?: string
    filterList?: string[]
  },
) {
  const shareName = sanitizeSorterShareName(options?.shareName)
  const ownerToken = sanitizeSorterOwnerToken(options?.ownerToken)
  const filterList = sanitizeSorterFilterList(options?.filterList)
  const payload: SorterResultPayloadV3 = [
    SORTER_RESULT_SCHEMA_VERSION,
    toSorterRankIds(result),
  ]

  if (shareName || ownerToken || filterList.length) {
    payload.push(shareName)
    if (ownerToken || shareName) payload.push(ownerToken)
    if (filterList.length || ownerToken || shareName) payload.push(filterList)
  }

  return toBase64Url(JSON.stringify(payload))
}

export function decodeSorterResult(value: string) {
  try {
    const parsed = JSON.parse(fromBase64Url(value)) as unknown
    if (!Array.isArray(parsed) || parsed.length < 2) return null

    const [version, ranks] = parsed
    if (!Array.isArray(ranks) || !ranks.every(isValidRankIds)) return null

    if (version === 1) {
      return {
        ranks: ranks as SorterResultRankIds[],
        shareName: '',
        ownerToken: '',
        filterList: [],
      }
    }

    if (version === 2) {
      const shareName = sanitizeSorterShareName(parsed[2])
      const ownerToken = sanitizeSorterOwnerToken(parsed[3])

      return {
        ranks: ranks as SorterResultRankIds[],
        shareName,
        ownerToken,
        filterList: [],
      }
    }

    if (version !== SORTER_RESULT_SCHEMA_VERSION) return null

    const shareName = sanitizeSorterShareName(parsed[2])
    const ownerToken = sanitizeSorterOwnerToken(parsed[3])
    const filterList = sanitizeSorterFilterList(parsed[4])

    return {
      ranks: ranks as SorterResultRankIds[],
      shareName,
      ownerToken,
      filterList,
    }
  }
  catch {
    return null
  }
}

export function hydrateSorterResult(
  ranks: SorterResultRankIds[],
  memberMap: Map<string, ISortMember>,
) {
  const hydrated: (ISortMember | ISortMember[])[] = []

  for (const rank of ranks) {
    if (Array.isArray(rank)) {
      const members = rank
        .map(id => memberMap.get(id))
        .filter((member): member is ISortMember => Boolean(member))

      if (members.length > 1) {
        hydrated.push(members)
      }
      else if (members[0]) {
        hydrated.push(members[0])
      }
      continue
    }

    const member = memberMap.get(rank)
    if (member) hydrated.push(member)
  }

  return hydrated
}
