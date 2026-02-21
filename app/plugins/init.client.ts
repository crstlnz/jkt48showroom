import { useOnLives } from '~/store/onLives'
import { createGtagEvent } from '~/utils/gtag'

export default defineNuxtPlugin(() => {
  const route = useRoute()
  const { checkAuth, authenticated } = useAuth()
  watch(() => route.fullPath, (path) => {
    createGtagEvent('path_view', {
      path,
      authenticated: authenticated.value,
    })
  })

  const onLives = useOnLives()
  onLives.init()

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

  console.log('Checking auth...')
  checkAuth()
})
