import { useIDNLives } from '~/store/idnLives'
import { useSettings } from '~/store/settings'
import { createGtagEvent } from '~/utils/gtag'
import { useOnLives } from '~~/store/onLives'

export default defineNuxtPlugin(({ hook }) => {
  const route = useRoute()
  // const { refresh: refreshCSRF } = useCSRF()
  const { authenticated } = useAuth()
  const { fetchFirstDate, group } = useSettings()
  watch(() => route.fullPath, (path) => {
    createGtagEvent('path_view', {
      path,
      authenticated: authenticated.value,
    })
  })

  const onLives = useOnLives()
  const idnLives = useIDNLives()
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
    fetchFirstDate()
  }, 15000, { immediate: true })

  onUnfocus(() => {
    stopTimeout()
  })

  onFocus(() => {
    onLives.tryRefresh()
    if (group === 'jkt48') {
      idnLives.tryRefresh()
    }
  })

  hook('app:created', () => {
    onLives.tryRefresh()
    if (group === 'jkt48') {
      idnLives.tryRefresh()
    }
    fetchFirstDate()
  })

  // hook('app:mounted', () => {
  //   refreshCSRF()
  // })

  hook('page:start', () => { // when the page is change try refresh the state
    onLives.tryRefresh()
    if (group === 'jkt48') {
      idnLives.tryRefresh()
    }
  })

  const { checkAuth } = useAuth()
  checkAuth()
})
