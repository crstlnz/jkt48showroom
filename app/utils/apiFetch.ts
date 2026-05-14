import type { FetchOptions } from 'ofetch'
import { ofetch } from 'ofetch'
import { useApiFetchShared } from '~/utils/apiFetchShared'

const fetcher = ofetch.create({
  // credentials: 'include',
})

export async function $apiFetch<T>(request: RequestInfo, options?: FetchOptions<'json', any> & { includeApiKey?: boolean, useSignature?: boolean } | undefined): Promise<T> {
  const nuxtApp = tryUseNuxtApp()
  const fetch = async () => {
    const { includeApiKey = false, useSignature = false, ...fetchOptions } = options ?? {}
    const { applyRequestHeaders, baseURL, getRequestHeaders, handleResponse } = useApiFetchShared({ includeApiKey, useSignature })
    const opts: FetchOptions<'json'> = {
      baseURL,
      ...fetchOptions,
    }

    opts.headers = getRequestHeaders(opts.headers)

    const onResponse = fetchOptions.onResponse
    const onRequest = fetchOptions.onRequest
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

        handleResponse(ctx.response)
      },
      async onRequest(ctx) {
        if (Array.isArray(onRequest)) {
          for (const r of onRequest) {
            r(ctx)
          }
        }
        else if (onRequest) {
          onRequest(ctx)
        }
        await applyRequestHeaders(ctx.options)
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
