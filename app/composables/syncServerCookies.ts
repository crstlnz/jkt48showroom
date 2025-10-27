import type { EventHandlerRequest, H3Event } from 'h3'
import { appendResponseHeader } from 'h3'
import CookieParser from '@/library/cookieParser'

export default function () {
  const event = useRequestEvent()

  function setCookie(headers: Headers) {
    const app = tryUseNuxtApp()
    if (import.meta.server) {
      const setCookie = headers.get('set-cookie')
      const cookies = (setCookie) ? setCookie.split(',') : []
      if (app?.ssrContext && cookies?.length) {
        if (!app.ssrContext.newCookie) app.ssrContext.newCookie = new CookieParser()
        for (const cookie of cookies) {
          (app.ssrContext.newCookie as any).addCookies(cookie)
        }
      }

      for (const cookie of cookies) {
        if (event) {
          appendResponseHeader(event as unknown as H3Event<EventHandlerRequest>, 'set-cookie', cookie)
        }
      }
    }
  }

  function getHeaders(): HeadersInit {
    const app = tryUseNuxtApp()
    const headers = useRequestHeaders(['cookie'])
    if (app?.ssrContext?.newCookie) {
      const newCookie = app.ssrContext.newCookie
      const headerCookie = new CookieParser(headers?.cookie || '')
      headerCookie.addCookies(newCookie.toString())
      headers.cookie = headerCookie.toString()
    }
    return headers
  }

  function combineCookie(cookieString: string | null, cookieString2: string): string {
    const cookie = new CookieParser(cookieString || '')
    cookie.addCookies(cookieString2)
    return cookie.toString()
  }

  return {
    setCookie,
    getHeaders,
    combineCookie,
  }
}
