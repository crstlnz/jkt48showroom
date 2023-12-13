import type { FetchOptions } from 'ofetch'
import { ofetch } from 'ofetch'

const fetcher = ofetch.create({})

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  return {
    provide: {
      apiFetch: async <T>(request: RequestInfo, options?: FetchOptions<'json'> | undefined): Promise<T> => {
        const res = await fetcher.raw<T>(request, {
          baseURL: config.public.api,
          credentials: 'include',
          ...options,
        })
        return res._data as T
      },
    },
  }
})
