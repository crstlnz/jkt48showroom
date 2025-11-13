import { useSettings } from '~/store/settings'
import { createJWT } from '~/utils/jwt'
// @ts-expect-error error
import pkg from '../package.json'

export default defineNuxtPlugin(async () => {
  const { checkAuth } = useAuth()
  await checkAuth()
  const app = useRuntimeConfig()
  try {
    const { setVersion, setApiKey } = useSettings()
    setVersion(pkg.version)
    setApiKey(createJWT({}, 60000, app.private.jwt_secret))
  }
  catch (e) {
    console.error(e)
  }
})
