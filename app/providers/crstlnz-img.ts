import { createOperationsGenerator, defineProvider } from '@nuxt/image/runtime'
import { encodeQueryItem, joinURL } from 'ufo'
import { imgCDN } from '~/app.config'

// const operationsGenerator = createOperationsGenerator()

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

export function toCrstlnzImageOutput({ src, modifiers, baseURL }: TransformInput) {
  const resolvedBaseURL = baseURL || imgCDN
  if (!resolvedBaseURL) {
    return {
      url: src,
    }
  }

  if (src.startsWith(resolvedBaseURL)) {
    src = src.replace(resolvedBaseURL, '')
  }
  else {
    return {
      url: src,
    }
  }

  const mergeModifiers = { ...defaultModifiers, ...modifiers } as any
  if (mergeModifiers.aspectRatio) {
    if (mergeModifiers.width) {
      mergeModifiers.height = Math.round(mergeModifiers.width / mergeModifiers.aspectRatio)
    }
    else if (mergeModifiers.height) {
      mergeModifiers.width = Math.round(mergeModifiers.height * mergeModifiers.aspectRatio)
    }
    mergeModifiers.aspectRatio = undefined
  }

  const operations = operationsGenerator(mergeModifiers as any)
  const url = operations ? joinURL(resolvedBaseURL, 'cdn-cgi/image', operations, src) : src
  return {
    url,
  }
}

export default defineProvider<{ baseURL?: string }>({
  getImage(src, { modifiers, baseURL }) {
    return toCrstlnzImageOutput({ src, modifiers, baseURL })
  },
})
