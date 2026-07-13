import crypto from 'crypto'
import { useSettings } from '~/store/settings'
import { createJWT } from '~/utils/jwt'
import pkg from '../../package.json'

export default defineNuxtPlugin(async () => {
  try {
    const signature = crypto
      .createHmac('sha256', process.env.JWT_SECRET!)
      .update(process.env.SECRET!)
      .digest('hex')
    const { setVersion, setRawApiKey, setSignatureSecret } = useSettings()
    setVersion(pkg.version)
    setSignatureSecret(signature)
    setRawApiKey(await createJWT({}, 86400000, process.env.JWT_SECRET!))
  }
  catch (e) {
    console.error(e)
  }
})
