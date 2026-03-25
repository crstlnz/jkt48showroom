import { defu } from 'defu'
import { useSettings } from '~/store/settings'
import setRefreshToken from '~/utils/token'
import syncServerCookies from './syncServerCookies'

type UseApiFetchOptions<T> = NonNullable<Parameters<typeof useFetch<T>>[1]> & {
  useApiKey?: boolean
}

export function useApiFetch<T>(url: Parameters<typeof useFetch<T>>[0], options: UseApiFetchOptions<T> = {}) {
  const { getApiKey } = useSettings()
  const { useApiKey = false, ...fetchOptions } = options
  const { accessToken } = useSettings()

  const config = useRuntimeConfig()
  if (!config.public.api) throw new Error('Api url not defined!')
  const { getHeaders, setCookie } = syncServerCookies()
  const onResponse = fetchOptions?.onResponse
  const onRequest = fetchOptions?.onRequest
  const defaults: NonNullable<typeof fetchOptions> = {
    baseURL: config.public.api as string,
    key: typeof url === 'string' ? url : 'api-fetch',
    server: true,
    lazy: true,
    credentials: 'include',
    onResponse(ctx) {
      applyHeaderToken(ctx.response.headers)
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
      const headers = new Headers(ctx.options.headers)
      if (import.meta.server) {
        const serverHeaders = new Headers(getHeaders())
        serverHeaders.forEach((value, key) => headers.set(key, value))
      }
      if (useApiKey) {
        const apiKey = getApiKey()
        headers.set('x-api-key', apiKey)
      }
      ctx.options.headers = headers
    },
  }
  // for nice deep defaults, please use unjs/defu
  const params = defu(fetchOptions, defaults)

  params.headers = {
    ...params.headers,
    ...getHeadersToken(),
  }

  return useFetch(url, params)
}
