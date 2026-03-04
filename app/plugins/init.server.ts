import { useSettings } from '~/store/settings'
import { createJWT } from '~/utils/jwt'
import pkg from '../../package.json'

export default defineNuxtPlugin(async () => {
  try {
    const { setVersion, setApiKey } = useSettings()
    setVersion(pkg.version)
    setApiKey(createJWT({}, 86400000, process.env.JWT_SECRET!))
  }
  catch (e) {
    console.error(e)
  }
})
