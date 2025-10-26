import { useSettings } from '~/store/settings'
import pkg from '../package.json'

export default defineNuxtPlugin(async () => {
  const { checkAuth } = useAuth()
  await checkAuth()

  try {
    const { setVersion } = useSettings()
    setVersion(pkg.version)
  }
  catch (e) {
    console.error(e)
  }
})
