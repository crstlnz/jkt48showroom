import { useSettings } from '~~/store/settings'

export default defineNuxtPlugin(() => {
  const settings = useSettings()
  const url = useRequestURL()
  settings.setDomain(url.host)
})
