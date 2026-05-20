const jkt48gen = 14
const hinatazaka46gen = 5
const generationGroupLabels: Record<string, string> = {
  jkt48v: 'JKT48V',
}

function parseGenerationKey(key: string) {
  const match = key.match(/^gen(\d+)(?:-(.+))?$/i)
  if (!match) return null

  const num = Number.parseInt(match[1] ?? '', 10)
  if (!Number.isInteger(num)) return null

  return {
    num,
    group: (match[2] ?? '').toLowerCase(),
  }
}

export function getGenerationNumber(key: string) {
  return parseGenerationKey(key)?.num ?? 0
}

export function compareGenerationKeys(a: string, b: string) {
  const parsedA = parseGenerationKey(a)
  const parsedB = parseGenerationKey(b)
  const groupRankA = parsedA?.group === 'jkt48v' ? 1 : 0
  const groupRankB = parsedB?.group === 'jkt48v' ? 1 : 0

  if (groupRankA !== groupRankB) return groupRankA - groupRankB

  const numA = parsedA?.num ?? 0
  const numB = parsedB?.num ?? 0
  if (numA !== numB) return numA - numB

  return a.localeCompare(b)
}

function getOrdinal(number: number): string {
  const lastDigit = number % 10
  const secondLastDigit = Math.floor((number / 10) % 10)
  if (secondLastDigit === 1 || lastDigit > 3) {
    return `${number}th`
  }
  switch (lastDigit) {
    case 1:
      return `${number}st`
    case 2:
      return `${number}nd`
    case 3:
      return `${number}rd`
    default:
      return `${number}th`
  }
}

export function generateGen(): {
  jkt48: Database.Generation[]
  hinatazaka46: Database.Generation[]
} {
  return {
    jkt48: Array.from(Array.from({ length: jkt48gen }).keys()).map((i) => {
      const gen = i + 1
      return {
        title: `${getOrdinal(gen)} Generation`,
        short_title: `Gen ${gen}`,
        num: gen,
        key: getGenerationKey(gen, 'jkt48'),
      }
    }),
    hinatazaka46: Array.from(Array.from({ length: hinatazaka46gen }).keys()).map((i) => {
      const gen = i + 1
      return {
        title: `${getOrdinal(gen)} Generation`,
        short_title: `Gen ${gen}`,
        num: gen,
        key: getGenerationKey(gen, 'hinatazaka46'),
      }
    }),
  }
}

const generation = generateGen()

export function parseGeneration(key: string, short = false) {
  const parsed = parseGenerationKey(key)
  if (!parsed) return null

  const groupLabel = generationGroupLabels[parsed.group]
  if (groupLabel) {
    return short ? `${groupLabel} Gen ${parsed.num}` : `${groupLabel} ${getOrdinal(parsed.num)} Generation`
  }

  return getGeneration(parsed.num, short)
}

export function getGenerationKey(genNumber: number, group: Group) {
  return `gen${genNumber}-${group}`
}

const group: { title: string, value: Group }[] = [
  {
    title: 'JKT48',
    value: 'jkt48',
  },
  {
    title: 'Hinatazaka46',
    value: 'hinatazaka46',
  },
]

export function getGeneration(gen?: number | null, short = false) {
  if (!gen) return null
  if (short) return `Gen ${gen}`
  return `${getOrdinal(gen)} Generation`
}

export function findGenerationNumber(str: string): number | null {
  const match = str.match(/\b\d+(?:st|nd|rd|th)?\s+Generation/i) // Matches the generation number followed by "Generation"
  if (match) {
    const generationText = match[0]
    const generationNumberMatch = generationText.match(/\d+/) // Matches the numeric portion of the generation text
    if (generationNumberMatch) {
      return Number.parseInt(generationNumberMatch[0])
    }
  }
  return null
}

export { generation, group }
