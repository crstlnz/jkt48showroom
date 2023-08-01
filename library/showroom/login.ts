import APIError from '~~/library/api'

const sr_url = 'https://www.showroom-live.com/user/login'

export default async function login(data: { csrf_token?: string; cookie: string | null }): Promise<ShowroomLogin.Data | ShowroomLogin.Error> {
  const res = await fetch(sr_url, { method: 'POST' })
  if (!res.ok) throw new APIError(res.statusText, res.status)
  return await res.json()
}
