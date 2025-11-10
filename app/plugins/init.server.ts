import { useSettings } from '~/store/settings'
// @ts-expect-error error
import pkg from '../package.json'

export default defineNuxtPlugin(async () => {
  const { checkAuth } = useAuth()
  await checkAuth()

  try {
    const { setVersion, setApiKey } = useSettings()
    setVersion(pkg.version)
    setApiKey(String(Math.random() * 10000))
  }
  catch (e) {
    console.error(e)
  }
})
