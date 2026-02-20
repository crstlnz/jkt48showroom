interface ClientCheckResponse {
  is_embedded?: boolean
}

export default async function () {
  const runtimeConfig = useRuntimeConfig()
  const isEmbeddedClientState = useState<boolean>('isembed', () => false)
  if (!import.meta.server) {
    try {
      const response = await $fetch<ClientCheckResponse>('/api/client', {
        baseURL: String(runtimeConfig.public.api),
        retry: 0,
      })
      isEmbeddedClientState.value = Boolean(response.is_embedded)
    }
    catch {
      isEmbeddedClientState.value = false
    }
  }

  const isEmbed = computed(() => isEmbeddedClientState.value)

  return {
    isEmbed,
  }
}
