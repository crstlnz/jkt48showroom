import { createOperationsGenerator, defineProvider } from '@nuxt/image/runtime'
import { encodeQueryItem, joinURL } from 'ufo'
import { imgCDN } from '~/app.config'

const operationsGenerator = createOperationsGenerator({
  keyMap: {
    width: 'w',
    height: 'h',
    dpr: 'dpr',
    fit: 'fit',
    gravity: 'g',
    quality: 'q',
    format: 'f',
    sharpen: 'sharpen',
  },
  valueMap: {
    fit: {
      cover: 'cover',
      contain: 'contain',
      fill: 'cover',
      outside: 'crop',
      inside: 'pad',
    },
    gravity: {
      auto: 'auto',
      side: 'side',
      faceCenter: 'face',
    },
  },
  joinWith: ',',
  formatter: (key, value) => encodeQueryItem(key, value),
})

const defaultModifiers = {
  width: 100,
  height: 100,
}

interface TransformInput {
  src: string
  modifiers?: Record<string, any>
  baseURL?: string
}

function parseAspectRatio(ratio: string | number): number {
  if (typeof ratio === 'number') return ratio
  const parts = ratio.split('/')
  if (parts.length === 2) {
    const a = Number(parts[0])
    const b = Number(parts[1])
    if (!Number.isNaN(a) && !Number.isNaN(b) && b !== 0) return a / b
  }
  const n = Number(ratio)
  return Number.isNaN(n) ? 0 : n
}

export function toCrstlnzImageOutput({ src, modifiers, baseURL }: TransformInput) {
  const resolvedBaseURL = baseURL || imgCDN
  if (!resolvedBaseURL) {
    return { url: src }
  }

  if (src.startsWith(resolvedBaseURL)) {
    src = src.replace(resolvedBaseURL, '')
  }
  else {
    return { url: src }
  }

  const mergeModifiers = { ...defaultModifiers, ...modifiers } as any

  if (mergeModifiers.aspectRatio) {
    const ratio = parseAspectRatio(mergeModifiers.aspectRatio)

    if (ratio > 0) {
      if (modifiers?.width) {
        // width explicitly passed — derive height
        mergeModifiers.height = Math.round(mergeModifiers.width / ratio)
      }
      else if (modifiers?.height) {
        // height explicitly passed — derive width
        mergeModifiers.width = Math.round(mergeModifiers.height * ratio)
      }
      else {
        // neither passed, use default width and derive height
        mergeModifiers.height = Math.round(defaultModifiers.width / ratio)
      }
    }

    delete mergeModifiers.aspectRatio
  }

  const operations = operationsGenerator(mergeModifiers as any)
  const url = operations ? joinURL(resolvedBaseURL, 'cdn-cgi/image', operations, src) : src

  return { url }
}

export default defineProvider<{ baseURL?: string }>({
  getImage(src, { modifiers, baseURL }) {
    return toCrstlnzImageOutput({ src, modifiers, baseURL })
  },
})
