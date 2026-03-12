import { useOnLives } from '~/store/onLives'
import { useSettings } from '~/store/settings'
import { createGtagEvent } from '~/utils/gtag'

export default defineNuxtPlugin(() => {
  const route = useRoute()
  const { checkAuth, authenticated } = useAuth()
  const { setApiKey, getApiKey } = useSettings()
  setApiKey(getApiKey())

  const onLives = useOnLives()

  function pathView(path: string) {
    onLives.requestPageView(route.path)
    createGtagEvent('path_view', {
      path,
      authenticated: authenticated.value,
    })
  }

  pathView(route.path)

  watch(() => route.fullPath, pathView)

  const isOnline = useOnline()
  watch(isOnline, (online) => {
    if (!online) {
      if (route.path !== '/offline') {
        navigateTo('/offline')
      }
      return
    }

    if (route.path === '/offline') {
      navigateTo('/')
    }
  }, {
    immediate: true,
  })

  checkAuth().finally(() => {
    onLives.init()
  })
})
