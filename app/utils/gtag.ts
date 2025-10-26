import { useSettings } from '~/store/settings'

export function gtag(...args: any[]) {
  if ((window as any).gtag) {
    (window as any).gtag(...args)
  }
  else {
    console.error(new Error('Gtag not provided!'))
  }
}

export function createClickEvent(linkname: string, category: string) {
  const { getWebTitle } = useSettings()
  gtag('event', 'click', {
    app_name: getWebTitle(),
    event_category: category,
    event_label: linkname,
  })
}

export function createGtagEvent(eventName: string, value?: Record<string, any>) {
  const { getWebTitle } = useSettings()
  gtag('event', eventName, {
    app_name: getWebTitle(),
    ...(value || {}),
  })
}
