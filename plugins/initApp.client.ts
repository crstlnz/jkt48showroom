import { useOnLives } from '~~/store/onLives'
import { useMembers } from '~/store/members'
export default defineNuxtPlugin(({ hook }) => {
  const members = useMembers()
  const onLives = useOnLives()
  const { onFocus } = useUserFocus({
    time: 1000,
    idleTime: 30000
  })
  hook('app:created', () => {
    members.load()
    onLives.tryRefresh()
  })

  onFocus(() => {
    onLives.tryRefresh()
  })

  hook('page:start', () => { // when the page is change try refresh the state
    onLives.tryRefresh()
  })
})
