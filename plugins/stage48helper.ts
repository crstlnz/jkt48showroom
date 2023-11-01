import * as stage48helper from '~~/library/utils/stage48'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      ...stage48helper,
    },
  }
})
