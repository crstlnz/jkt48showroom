import { defu } from 'defu'
import syncServerCookies from './syncServerCookies'

export function useApiFetch<T>(...args: Parameters<typeof useFetch<T>>) {
  const [url, options = {}] = args

  const config = useRuntimeConfig()
  if (!config.public.api) throw new Error('Api url not defined!')
  const { getHeaders, setCookie } = syncServerCookies()
  const onResponse = options?.onResponse
  const onRequest = options?.onRequest
  const defaults: NonNullable<typeof options> = {
    baseURL: config.public.api as string,
    key: typeof url === 'string' ? url : 'api-fetch',
    server: true,
    lazy: true,
    credentials: 'include',
    onResponse(ctx) {
      if (typeof onResponse === 'function') onResponse(ctx)
      if (import.meta.server) {
        setCookie(ctx.response.headers)
        if (ctx.response.status !== 200) {
          const event = useRequestEvent()
          if (event) {
            setResponseStatus(event, ctx.response.status, ctx.response.statusText)
          }
        }
      }
    },
    onRequest(ctx) {
      if (typeof onRequest === 'function') onRequest(ctx)
      if (import.meta.server) {
        ctx.options.headers = new Headers(getHeaders())
      }
    },
  }
  // for nice deep defaults, please use unjs/defu
  const params = defu(options, defaults)
  return useFetch(url, params)
}
