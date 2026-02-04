import { createOperationsGenerator, defineProvider } from '@nuxt/image/runtime'
import { joinURL } from 'ufo'
import { imgCDN } from '~/app.config'

// const operationsGenerator = createOperationsGenerator()

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
    // const operations = operationsGenerator(modifiers)
    return {
    //   url: joinURL(baseURL, src + (operations ? `?${operations}` : '')),
      url: joinURL(baseURL, src),
    }
  },
})
