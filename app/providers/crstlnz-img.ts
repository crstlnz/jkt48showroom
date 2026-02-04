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

export default defineProvider<{ baseURL?: string }>({
  getImage(src, { modifiers, baseURL }) {
    if (!baseURL) {
      // also support runtime config
      baseURL = imgCDN
    }

    if (src.startsWith(baseURL)) {
      src = src.replace(baseURL, '')
    }
    else {
      return {
        url: src,
      }
    }
    const mergeModifiers = { ...defaultModifiers, ...modifiers } as any
    if (mergeModifiers.aspectRatio) {
      if (mergeModifiers.width) {
        mergeModifiers.height = mergeModifiers.width / mergeModifiers.aspectRatio
      }
      else if (mergeModifiers.height) {
        mergeModifiers.width = mergeModifiers.height * mergeModifiers.aspectRatio
      }
      mergeModifiers.aspectRatio = undefined
    }
    const operations = operationsGenerator(mergeModifiers as any)
    const url = operations ? joinURL(baseURL, 'cdn-cgi/image', operations, src) : src
    return {
      //   url: joinURL(baseURL, src + (operations ? `?${operations}` : '')),
      url,
    }
  },
})
