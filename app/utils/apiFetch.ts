import type { FetchOptions } from 'ofetch'
import { ofetch } from 'ofetch'
import syncServerCookies from '~/composables/syncServerCookies'
// import { useSettings } from '~/store/settings'

const fetcher = ofetch.create({
  credentials: 'include',
})

export async function $apiFetch<T>(request: RequestInfo, options?: FetchOptions<'json', any> | undefined): Promise<T> {
  const nuxtApp = tryUseNuxtApp()

  const fetch = async () => {
    const config = useRuntimeConfig()
    const opts: FetchOptions<'json'> = {
      baseURL: config.public.api,
      ...options,
      credentials: 'include',
    }

    const { getHeaders, setCookie } = syncServerCookies()

    const onResponse = options?.onResponse
    const onRequest = options?.onRequest
    const res = await fetcher.raw<T>(request, {
      ...opts,
      onResponse(ctx) {
        if (Array.isArray(onResponse)) {
          for (const r of onResponse) {
            r(ctx)
          }
        }
        else if (onResponse) {
          onResponse(ctx)
        }

        if (import.meta.server) {
          setCookie(ctx.response.headers)
        }
      },
      onRequest(ctx) {
        if (Array.isArray(onRequest)) {
          for (const r of onRequest) {
            r(ctx)
          }
        }
        else if (onRequest) {
          onRequest(ctx)
        }
        if (import.meta.server) {
          ctx.options.headers = new Headers(getHeaders())
        }
      },
    })
    return res._data as T
  }

  if (nuxtApp) {
    return nuxtApp.runWithContext(fetch)
  }
  else {
    return fetch()
  }
}
