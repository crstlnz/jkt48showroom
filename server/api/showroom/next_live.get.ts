// import { parse } from "node-html-parser";
import { getMembers } from './members.get'
import cache from '~~/library/utils/cache'
import { getAllFollows, getNextLive as fetchNextLive } from '~/library/api/showroom'
export default defineEventHandler(async () => {
  return await getNextLive()
})

export { getNextLive }

const time = 3600000 // 1 hours
async function getNextLive (): Promise<INextLive[]> {
  await cache.delete('next_live')
  return await cache.fetch<INextLive[]>('next_live', () => getFromCookies(), time).catch(() => [])
}

async function getFromCookies (membersData: IMember[] | null = null) : Promise<INextLive[]> {
  const members: IMember[] = membersData ?? await getMembers()
  const rooms = await getAllFollows().catch(_ => [])
  const roomMap = new Map<string, ShowroomAPI.RoomFollow>()
  const result : INextLive[] = []
  const missing = []

  for (const room of rooms) {
    roomMap.set(room.room_id, room)
  }

  for (const member of members) {
    const room = roomMap.get(String(member.room_id))
    const now = new Date()
    if (room) {
      if (room.has_next_live) {
        const raw = new Date(room.next_live)
        const date = new Date(`${room.next_live} ${now.getFullYear() + (now.getMonth() < raw.getMonth() || now.getDate() <= raw.getDate() ? 0 : 1)}`)
        result.push({
          name: room.room_name,
          img: room.image_l,
          url: room.room_url_key,
          room_id: Number(room.room_id),
          is_graduate: member.is_graduate,
          is_group: member.is_group,
          room_exists: member.room_exists,
          date: date.toISOString()
        })
      }
    } else if (member.room_exists) {
      missing.push(member)
    }
  }

  const lives = []
  lives.push(...result)
  if (missing.length) {
    lives.push(...await getDirectNextLive(missing))
  }
  return lives
}

async function getDirectNextLive (membersData: IMember[] | null = null): Promise<INextLive[]> {
  try {
    const members: IMember[] = (membersData ?? (await getMembers())).filter(i => i.room_exists)
    const promises: Promise<INextLive | null>[] = []
    for (const member of members) {
      promises.push(
        (async (): Promise<INextLive | null> => {
          try {
            const data = await fetchNextLive(member.room_id)
            if (!data.epoch) { return null }
            return {
              img: member.img,
              url: member.url,
              name: member.name,
              room_id: member.room_id,
              is_graduate: member.is_graduate,
              is_group: member.is_group,
              room_exists: member.room_exists,
              date: new Date(data.epoch * 1000).toISOString()
            }
          } catch (e) {
            return null
          }
        })()
      )
    }
    let data: INextLive[] = (await Promise.all(promises)).filter(i => i) as INextLive[]
    data = data.filter(i => new Date(i.date).getTime() - new Date().getTime() > 0)
    return data
  } catch (e) {
    return []
  }
}
