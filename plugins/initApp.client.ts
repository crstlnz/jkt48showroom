import { useSettings } from '~/store/settings'
import { useOnLives } from '~~/store/onLives'
import { useUser } from '~~/store/user'

export default defineNuxtPlugin(({ hook }) => {
  const route = useRoute()
  const { gtag } = useGtag()
  const { authenticated } = useUser()
  const {fetchFirstDate} = useSettings()
  watch(() => route.fullPath, (path) => {
    gtag('event', 'path_view', {
      app_name: 'JKT48 Showroom',
      path,
      authenticated,
    })
  }, { immediate: true })

  const onLives = useOnLives()
  const { onFocus } = useUserFocus({
    time: 1000,
    idleTime: 30000,
  })
  hook('app:created', () => {
    onLives.tryRefresh()
    fetchFirstDate()
  })

  onFocus(() => {
    onLives.tryRefresh()
  })

  hook('page:start', () => { // when the page is change try refresh the state
    onLives.tryRefresh()
  })
})
