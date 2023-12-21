import { useIDNLives } from '~/store/idnLives'
import { useSettings } from '~/store/settings'
import { useOnLives } from '~~/store/onLives'

export default defineNuxtPlugin(({ hook }) => {
  const route = useRoute()
  const { gtag } = useGtag()
  const { refresh: refreshCSRF } = useCSRF()
  const { authenticated } = useAuth()
  const { fetchFirstDate, group } = useSettings()
  watch(() => route.fullPath, (path) => {
    gtag('event', 'path_view', {
      app_name: 'JKT48 Showroom',
      path,
      authenticated: authenticated.value,
    })
  }, { immediate: true })

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
  }, 10000, { immediate: true })

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

  hook('app:mounted', () => {
    refreshCSRF()
  })

  hook('page:start', () => { // when the page is change try refresh the state
    onLives.tryRefresh()
    if (group === 'jkt48') {
      idnLives.tryRefresh()
    }
  })
})
