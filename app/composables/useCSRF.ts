import { useSettings } from '~/store/settings'

export default function () {
  const settings = useSettings()
  async function refresh() {
    const data = await $apiFetch<{ csrf_token: string }>('/api/csrf_token')
    settings.csrfToken = data?.csrf_token || ''
  }

  return { refresh }
}
