import cache from '~~/library/utils/cache'
import Showroom from '~~/library/database/schema/showroom/Showroom'
import config from '~~/app.config'

export default defineEventHandler(async (event): Promise<IMember[]> => {
  const query = getQuery(event)
  const group = config.getGroup(query.group as string)
  return await getMembers(group)
})
// const group =
const jkt48officialId = 332503
const time = 3600000 // 1 hour
async function getMembers(group: string | null = null, roomId: number | null = null): Promise<IMember[]> {
  const cacheKey = roomId ? `${roomId}-members` : group ? `${group}-members` : 'members'
  return await cache.fetch<IMember[]>(cacheKey, () => fetchData(group, roomId), time).catch(() => [])
}

async function fetchData(group: string | null = null, roomId: number | null = null): Promise<IMember[]> {
  try {
    const options = {} as any
    if (group) options.group = group
    if (roomId) options.room_id = roomId
    const members: Database.IShowroomMember[] = await Showroom.find(options)
      .select('name description img url room_id member_data room_exists generation')
      .populate({
        path: 'member_data',
        select: '-_id isGraduate img nicknames bloodType height',
      })
      .lean()
    return members
      .map((member): IMember => {
        return {
          name: member.name,
          nicknames: member?.member_data?.nicknames || [],
          img: member.img ?? member.member_data?.img ?? config.errorPicture,
          img_alt: member.member_data?.img ?? member.img ?? config.errorPicture,
          url: member.url,
          description: member.description?.replace(/(?:\r\n|\r)/g, '\n'),
          group: member.group,
          room_id: member.room_id,
          room_exists: member.room_exists ?? false,
          is_graduate: member.member_data?.isGraduate ?? jkt48officialId !== member.room_id,
          is_group: jkt48officialId === member.room_id,
          generation: member.generation,
          bloodType: member.member_data?.bloodType,
          height: member.member_data?.height,
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }
  catch (e) {
    console.log(e)
    return []
  }
}

export { getMembers }
