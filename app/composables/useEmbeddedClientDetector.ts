interface ClientCheckResponse {
  is_embedded?: boolean
}

export default async function () {
  const runtimeConfig = useRuntimeConfig()
  const requestHeaders = import.meta.server
    ? useRequestHeaders(['user-agent', 'x-requested-with'])
    : undefined

  const isEmbeddedClientState = useState<boolean>('client-detector:is-embedded', () => false)

  if (import.meta.server && runtimeConfig.public.api) {
    try {
      const response = await $fetch<ClientCheckResponse>('/api/client', {
        baseURL: String(runtimeConfig.public.api),
        headers: requestHeaders,
        retry: 0,
      })
      isEmbeddedClientState.value = Boolean(response.is_embedded)
    }
    catch {
      isEmbeddedClientState.value = false
    }
  }

  const isEmbeddedClient = computed(() => isEmbeddedClientState.value)

  return {
    isEmbeddedClient,
  }
}
