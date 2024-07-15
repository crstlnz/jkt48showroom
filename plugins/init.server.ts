import pkg from '../package.json'
import { useSettings } from '~/store/settings'

export default defineNuxtPlugin(async () => {
  const { checkAuth } = useAuth()
  await checkAuth()
  
  const { setVersion } = useSettings()
  setVersion(pkg.version)
})
