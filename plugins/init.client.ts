import { useIDNLives } from '~/store/idnLives'
import { useSettings } from '~/store/settings'
import { createGtagEvent } from '~/utils/gtag'
import { useOnLives } from '~~/store/onLives'

export default defineNuxtPlugin(({ hook }) => {
  const route = useRoute()
  const { authenticated } = useAuth()
  const { group } = useSettings()
  watch(() => route.fullPath, (path) => {
    createGtagEvent('path_view', {
      path,
      authenticated: authenticated.value,
    })
  })

  const onLives = useOnLives()
  const idnLives = useIDNLives()
  const isOnline = useOnline()
  watch(isOnline, (online) => {
    if (!online) {
      if (route.path !== '/') {
        navigateTo('/')
      }
    }
  })

  const { onFocus, onUnfocus } = useUserFocus({
    time: 1000,
    idleTime: 30000,
  })

  const { start, stop: stopTimeout } = useTimeoutFn(() => {
    start()
    onLives.tryRefresh()
    if (group === 'jkt48') {
      idnLives.tryRefresh()
    }
  }, 15000, { immediate: true })

  onUnfocus(() => {
    stopTimeout()
  })

  onFocus(() => {
    start()
  })

  hook('app:created', () => {
    onLives.tryRefresh()
    if (group === 'jkt48') {
      idnLives.tryRefresh()
    }
  })

  hook('page:start', () => { // when the page is change try refresh the state
    onLives.tryRefresh()
    if (group === 'jkt48') {
      idnLives.tryRefresh()
    }
  })

  const { checkAuth } = useAuth()
  checkAuth()
})
