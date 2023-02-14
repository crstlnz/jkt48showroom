import { getMembers } from './members.get'
import { getRoomStatus, getAllFollows, getIsLive, getOnlives, getStreamingURL } from '~~/library/api/showroom'

import cache from '~~/library/utils/cache'
export default defineEventHandler(async (): Promise<IRoomLive[]> => {
  return await getNowLive()
})
export { getNowLive, getNowLiveDirect, getNowLiveIndirect, getNowLiveCookies }
const time = 10000
async function getNowLive (): Promise<IRoomLive[]> {
  return await cache
    .fetch<IRoomLive[]>('now_live', () => getNowLiveCookies(), time)
    .catch(() => [])
}

async function getNowLiveDirect (
  membersData: IMember[] | null = null
): Promise<IRoomLive[]> {
  const members: IMember[] = membersData ?? await getMembers()
  const promises: Promise<IRoomLive | null>[] = []
  for (const member of members) {
    promises.push(
      (async (): Promise<IRoomLive | null> => {
        try {
          const data = await getIsLive(member.room_id)
          if (!data.ok) { return null } // if 'ok',this room is on live
          const status = await getRoomStatus({ room_url_key: member.url.startsWith('/') ? member.url.slice(1) : member.url })
          const streamURLS = await getStreamingURL({ room_id: member.room_id })
          return {
            name: member.name,
            img: member.img,
            url: member.url,
            room_id: member.room_id,
            is_graduate: member.is_graduate,
            is_group: member.is_group,
            room_exists: member.room_exists,
            started_at: (status.started_at ?? 0) * 1000,
            streaming_url_list: streamURLS.streaming_url_list ?? []
          }
        } catch (e) {
          return null
        }
      })()
    )
  }
  const data = await Promise.all(promises)
  return data.filter(i => i) as IRoomLive[]
}

async function getNowLiveCookies (membersData: IMember[] | null = null): Promise<IRoomLive[]> {
  const members: IMember[] = membersData ?? await getMembers()
  const rooms = await getAllFollows().catch(_ => [])
  const roomMap = new Map<string, ShowroomAPI.RoomFollow>()
  const result : Promise<IRoomLive>[] = []
  const missing = []

  for (const room of rooms) {
    roomMap.set(room.room_id, room)
  }

  for (const member of members) {
    const room = roomMap.get(String(member.room_id))
    if (room) {
      if (room.is_online) {
        result.push((async () => {
          const streamURLS = await getStreamingURL({ room_id: room.room_id })
          const RoomStatus = await getRoomStatus({ room_url_key: room.room_url_key })
          return {
            name: room.room_name,
            img: room.image_l,
            url: room.room_url_key,
            room_id: Number(room.room_id),
            started_at: (RoomStatus.started_at ?? 0) * 1000,
            is_graduate: member.is_graduate,
            is_group: member.is_group,
            room_exists: member.room_exists,
            streaming_url_list: streamURLS.streaming_url_list ?? []
          }
        })())
      }
    } else if (member.room_exists) {
      missing.push(member)
    }
  }

  const lives = []
  lives.push(...await Promise.all(result))
  if (missing.length) {
    lives.push(...await getNowLiveDirect(missing))
  }
  return lives
}

async function getNowLiveIndirect (membersData: IMember[] | null = null): Promise<IRoomLive[]> {
  const members: IMember[] = membersData ?? await getMembers()
  const memberMap = new Map<string| number, IMember>()
  for (const member of members) {
    memberMap.set(member.room_id, member)
  }

  const res = await getOnlives()
  const all : ShowroomAPI.OnlivesRoom[] = res.onlives.reduce((a: any, b: any) => {
    a.push(...b.lives)
    return a
  }, [])

  const result : IRoomLive[] = []
  for (const room of all) {
    const member = memberMap.get(room.room_id)
    if (member) {
      result.push({
        name: room.main_name,
        img: room.image,
        url: room.room_url_key,
        room_id: room.room_id,
        started_at: (room.started_at ?? 0) * 1000,
        is_graduate: member.is_graduate,
        is_group: member.is_group,
        room_exists: member.room_exists,
        streaming_url_list: room.streaming_url_list ?? []
      })
    }
  }

  return result
}
