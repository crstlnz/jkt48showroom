import type { UseFetchOptions } from 'nuxt/app'
import { defu } from 'defu'
import syncServerCookies from './syncServerCookies'

export function useApiFetch<T>(url: string | (() => string), options: UseFetchOptions<T> = {}) {
  const config = useRuntimeConfig()
  if (!config.public.api) throw new Error('Api url not defined!')
  const { getHeaders, setCookie } = syncServerCookies()
  const onResponse = options?.onResponse
  const onRequest = options?.onRequest
  const defaults: UseFetchOptions<T> = {
    baseURL: config.public.api,
    key: typeof url === 'string' ? url : url(),
    server: true,
    lazy: true,
    credentials: 'include',
    onResponse(ctx) {
      if (typeof onResponse === 'function') onResponse(ctx)
      if (process.server) {
        setCookie(ctx.response.headers)
      }
    },
    onRequest(ctx) {
      if (typeof onRequest === 'function') onRequest(ctx)
      if (process.server) {
        ctx.options.headers = getHeaders()
      }
    },
  }
  // for nice deep defaults, please use unjs/defu
  const params = defu(options, defaults)
  return useFetch(url, params)
}
