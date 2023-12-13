import { useSettings } from '~/store/settings'

export default async function () {
  const settings = useSettings()
  onMounted(async () => {
    const data = await $apiFetch<{ csrf_token: string }>('/api/csrf_token')
    settings.csrfToken = data?.csrf_token || ''
  })
}
