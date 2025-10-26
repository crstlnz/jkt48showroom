import { defineNuxtPlugin } from '#app'
import VWave from 'v-wave'

const directiveName = 'ripple'

export default defineNuxtPlugin((app) => {
  const { vWave, vWaveTrigger } = VWave.createLocalWaveDirective({}, app.vueApp)

  app.vueApp.directive(directiveName, {
    ...vWave,
    getSSRProps(_binding, _vnode) {
      return {}
    },
  })
  app.vueApp.directive(`${directiveName}-trigger`, {
    ...vWaveTrigger,
    getSSRProps(_binding, _vnode) {
      return {}
    },
  })
})
