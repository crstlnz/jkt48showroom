import { useSettings } from '~/store/settings'
import { createJWT } from '~/utils/jwt'
import pkg from '../../package.json'

export default defineNuxtPlugin(async () => {
  try {
    const { setVersion, setRawApiKey } = useSettings()
    setVersion(pkg.version)
    setRawApiKey(createJWT({}, 86400000, process.env.JWT_SECRET!))
  }
  catch (e) {
    console.error(e)
  }
})
