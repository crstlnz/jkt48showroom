import pkg from '../package.json'
import { useSettings } from '~/store/settings'

export default defineNuxtPlugin(async () => {
  const { checkAuth } = useAuth()
  await checkAuth()
  
  try{
    const { setVersion } = useSettings()
    setVersion(pkg.version)
  }catch(e){
    console.error(e)
  }
})
