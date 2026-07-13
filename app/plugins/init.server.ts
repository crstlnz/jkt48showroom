import { useSettings } from '~/store/settings'
import { createJWT } from '~/utils/jwt'
import { sign } from '~/utils/secret'
import pkg from '../../package.json'

export default defineNuxtPlugin(async () => {
  try {
    const config = useRuntimeConfig()
    const secret = String(config.secret || '')
    const jwtSecret = String(config.jwtSecret || '')
    if (!secret || !jwtSecret) throw new Error('SECRET and JWT_SECRET must be set')

    const signature = await sign(secret, jwtSecret)
    const { setVersion, setRawApiKey, setSignatureSecret } = useSettings()
    setVersion(pkg.version)
    setSignatureSecret(signature)
    setRawApiKey(await createJWT({}, 86400000, jwtSecret))
  }
  catch (e) {
    console.error(e)
  }
})
