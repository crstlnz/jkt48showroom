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
  const { onFocus } = useUserFocus({
    time: 1000,
    idleTime: 30000,
  })

  const { start, stop } = useTimeoutFn(() => {
    console.log('START')
    start()
    onLives.tryRefresh()
    if (group === 'jkt48') {
      idnLives.tryRefresh()
    }
    fetchFirstDate()
  }, 10000, { immediate: true })

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

  onFocus(() => {
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
})
