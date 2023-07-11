import Showroom from '~~/library/database/schema/showroom/Showroom'
import cache from '~~/library/utils/cache'

export default defineEventHandler(async (event): Promise<IShowroomMemberCustom[]> => {
  const query = getQuery(event)
  const group = (query.group == null) ? 'jkt48' : ['jkt48', 'hinatazaka46'].includes(String(query.group)) ? String(query.group) : null
  return await getMembers(group)
})
// const group =
const time = 1000
async function getMembers(group: string | null = null): Promise<IShowroomMemberCustom[]> {
  return await cache.fetch<IShowroomMemberCustom[]>(group ? `${group}-members-raws` : 'members-raws', () => fetchData(group), time).catch(() => [])
}

async function fetchData(group: string | null = null): Promise<IShowroomMemberCustom[]> {
  try {
    const members: IShowroomMemberCustom[] = await Showroom.find(group ? { group } : {})
      .populate({
        path: 'member_data',
      })
      .lean()
    return members.map((i) => {
      if (!i.member_data) i.member_data = null
      return i
    })
      .sort((a, b) => a.name.localeCompare(b.name))
  }
  catch (e) {
    console.log(e)
    return []
  }
}
