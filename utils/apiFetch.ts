import type { FetchOptions } from 'ofetch'
import { ofetch } from 'ofetch'
import syncServerCookies from '~/composables/syncServerCookies'
// import { useSettings } from '~/store/settings'

const fetcher = ofetch.create({
  credentials: 'include',
})

export async function $apiFetch<T>(request: RequestInfo, options?: FetchOptions<'json'> | undefined): Promise<T> {
  const nuxtApp = tryUseNuxtApp()

  const fetch = async () => {
    const config = useRuntimeConfig()
    const opts: FetchOptions<'json'> = {
      baseURL: config.public.api,
      ...options,
    }

    const { getHeaders, setCookie } = syncServerCookies()

    const onResponse = options?.onResponse
    const onRequest = options?.onRequest
    const res = await fetcher.raw<T>(request, {
      ...opts,
      onResponse(ctx) {
        if (onResponse) onResponse(ctx)
        if (import.meta.server) {
          setCookie(ctx.response.headers)
        }
      },
      onRequest(ctx) {
        if (onRequest) onRequest(ctx)
        if (import.meta.server) {
          ctx.options.headers = getHeaders()
        }
        // else {
        //   if (['post', 'delete', 'put'].includes(ctx.options.method?.toLowerCase() || '')) {
        //     const settings = useSettings()
        //     ctx.options.headers = {
        //       ...ctx.options.headers,
        //       'X-CSRF-TOKEN': settings.csrfToken,
        //     }
        //   }
        // }
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
