import { useOnLives } from '~/store/onLives'
import { createGtagEvent } from '~/utils/gtag'

export default defineNuxtPlugin(() => {
  const route = useRoute()
  const { authenticated } = useAuth()
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

  // const { onFocus, onUnfocus } = useUserFocus({
  //   time: 1000,
  //   idleTime: 30000,
  // })

  // function tryRefreshLive() {
  //   onLives.tryRefresh()
  // }

  // const { resume, pause } = useIntervalFn(() => {
  //   tryRefreshLive()
  // }, 15000, { immediate: true, immediateCallback: true })

  // onUnfocus(() => {
  //   pause()
  // })

  // onFocus(() => {
  //   resume()
  // })

  // hook('app:created', () => {
  //   tryRefreshLive()
  // })

  // hook('page:start', () => { // when the page is change try refresh the state
  //   tryRefreshLive()
  // })
})
