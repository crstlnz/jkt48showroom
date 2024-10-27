const jkt48gen = 12
const hinatazaka46gen = 4

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
  try {
    return getGeneration(Number.parseInt(key.split('-')[0].replace('gen', '')), short)
  }
  catch {
    return null
  }
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
