import pkg from '../package.json'
import { useSettings } from '~/store/settings'

export default defineNuxtPlugin(async () => {
  const { setVersion } = useSettings()
  setVersion(pkg.version)
  const { checkAuth } = useAuth()
  await checkAuth()
})
