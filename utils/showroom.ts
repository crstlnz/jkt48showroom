const f = $fetch.create({})
async function ofetch<T>(url: string, params?: Record<string, string | number>) {
  const { user } = useAuth()
  const baseUrl = import.meta.server ? process.env.SHOWROOM_API : useRuntimeConfig().public.showroom_api
  const apiUrl = new URL(url, baseUrl)
  return await f<T>(apiUrl.href, {
    query: {
      ...params,
      sr_id: user.value?.sr_id,
    },
  })
}

export async function getCurrentUser(room_id: string | number): Promise<ShowroomAPI.CurrentUser> {
  return await ofetch<ShowroomAPI.CurrentUser>('/api/live/current_user', { room_id })
}

export async function getPolling(room_id: string | number): Promise<ShowroomAPI.Polling | ShowroomAPI.PollingLiveEnd> {
  return await ofetch<ShowroomAPI.Polling | ShowroomAPI.PollingLiveEnd>('/api/live/polling', { room_id })
}

export async function getTelops(room_id: string | number): Promise<Watch.TelopApi> {
  return await ofetch<Watch.TelopApi>('/api/live/telop', { room_id })
}
