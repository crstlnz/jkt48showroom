import calculationTime from '../utils/calculationTime'
import { fetchAPI } from '.'
const cookies = `sr_id=${process.env.SR_TOKEN};`
type GiftSize = 'small' | 'medium';

export function liveURL (key: string): string {
  return `https://www.showroom-live.com/r${key?.startsWith('/') ? '' : '/'}${key}`
}

export function avatarURL (id: number | string): string {
  return `https://image.showroom-cdn.com/showroom-prod/image/avatar/${id}.png`
}

export function giftUrl (id: string | number, type: GiftSize = 'small'): string {
  return `https://image.showroom-cdn.com/showroom-prod/assets/img/gift/${id}_${type === 'small' ? 's' : 'm'}.png`
}

export function profileURL (roomId: number | string): string {
  return `https://www.showroom-live.com/room/profile?room_id=${roomId}`
}

export function getProfile (roomId: number | string): Promise<ShowroomAPI.Profile> {
  return fetchAPI(`https://www.showroom-live.com/api/room/profile?room_id=${roomId}`)
}

export function getNextLive (roomId: number | string): Promise<ShowroomAPI.NextLive> {
  return fetchAPI(`https://www.showroom-live.com/api/room/next_live?room_id=${roomId}`)
}

export function getIsLive (roomId: number | string): Promise<ShowroomAPI.IsLive> {
  return fetchAPI(`https://www.showroom-live.com/room/is_live?room_id=${roomId}&_=${new Date().getTime()}`)
}

export function getOnlives (params?: object): Promise<ShowroomAPI.Onlives> {
  return $fetch('https://www.showroom-live.com/api/live/onlives', { params })
}

export function getRoomStatus (params: object): Promise<ShowroomAPI.RoomStatus> {
  return $fetch('https://www.showroom-live.com/api/room/status', { params })
}

export function getStreamingURL (params: object): Promise<ShowroomAPI.StreamingUrlList> {
  return $fetch('https://www.showroom-live.com/api/live/streaming_url', { params })
}

export async function getFollows (page = 1): Promise<ShowroomAPI.Follow> {
  const count = 100
  const url = `https://www.showroom-live.com/api/follow/rooms?page=${page}&count=${count}&_=${new Date().getTime()}`
  const res = await fetch(url, { headers: { cookie: cookies } })
  if (!res.ok) { throw new Error('Fetch failed!') }
  const data = await res.json()
  if (!('rooms' in data && 'next_page' in data && 'total_entries' in data && 'last_page' in data)) { console.warn('Follow Api changes in some fields') }
  if (!Array.isArray(data.rooms)) { console.warn('Follow Api changes in some fields') }
  return data
}

export async function getAllFollows (result: ShowroomAPI.RoomFollow[] = [], page = 1): Promise<ShowroomAPI.RoomFollow[]> {
  const data = await getFollows(page)
  result.push(...data.rooms)
  if (data.current_page !== page) { return result }
  if (data.next_page !== null) {
    return await getAllFollows(result, data.next_page)
  } else {
    return result
  }
}
