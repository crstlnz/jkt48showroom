import type { FetchOptions } from 'ofetch'
import { ofetch } from 'ofetch'
import syncServerCookies from '~/composables/syncServerCookies'
import { useSettings } from '~/store/settings'
import setRefreshToken from './refreshToken'
// import { useSettings } from '~/store/settings'

const fetcher = ofetch.create({
  // credentials: 'include',
})

export async function $apiFetch<T>(request: RequestInfo, options?: FetchOptions<'json', any> & { includeApiKey?: boolean } | undefined): Promise<T> {
  const nuxtApp = tryUseNuxtApp()
  const { accessToken } = useSettings()
  const fetch = async () => {
    const config = useRuntimeConfig()
    const opts: FetchOptions<'json'> = {
      baseURL: config.public.api,
      ...options,
    }

    const { getHeaders, setCookie } = syncServerCookies()

    if (accessToken) {
      opts.headers = {
        ...opts.headers,
        Authorization: `Bearer ${accessToken}`,
      }
    }

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

    const refreshToken = res.headers.get('X-Refresh-Token')
    const token = res.headers.get('X-Access-Token')
    if (refreshToken) {
      setRefreshToken(refreshToken)
    }
    if (token) {
      setAccessToken(token)
    }
    return res._data as T
  }

  if (nuxtApp) {
    return nuxtApp.runWithContext(fetch)
  }
  else {
    return fetch()
  }
}
