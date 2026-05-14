import { defu } from 'defu'
import { useApiFetchShared } from '~/utils/apiFetchShared'

type UseApiFetchOptions<T> = NonNullable<Parameters<typeof useFetch<T>>[1]> & {
  useApiKey?: boolean
  useSignature?: boolean
}

export function useApiFetch<T>(url: Parameters<typeof useFetch<T>>[0], options: UseApiFetchOptions<T> = {}) {
  const { useApiKey = false, useSignature = false, ...fetchOptions } = options
  const { applyRequestHeaders, baseURL, getRequestHeaders, handleResponse } = useApiFetchShared({ includeApiKey: useApiKey, useSignature })

  const onResponse = fetchOptions?.onResponse
  const onRequest = fetchOptions?.onRequest
  const defaults: NonNullable<typeof fetchOptions> = {
    baseURL,
    key: typeof url === 'string' ? url : 'api-fetch',
    server: true,
    lazy: true,
    credentials: 'include',
    onResponse(ctx) {
      handleResponse(ctx.response, true)
      if (typeof onResponse === 'function') onResponse(ctx)
    },
    async onRequest(ctx) {
      if (typeof onRequest === 'function') onRequest(ctx)
      await applyRequestHeaders(ctx.options)
    },
  }

  // for nice deep defaults, please use unjs/defu
  const params = defu(fetchOptions, defaults)

  params.headers = getRequestHeaders(params.headers)
  return useFetch(url, params)
}
