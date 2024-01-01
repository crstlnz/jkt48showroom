import { useSettings } from '~/store/settings'

export default function () {
  const { gtag } = useGtag()
  const { getWebTitle } = useSettings()
  function createEvent(eventName: string, value?: Record<string, any>) {
    gtag('event', eventName, {
      app_name: getWebTitle(),
      ...(value || {}),
    })
  }

  return { createEvent }
}
