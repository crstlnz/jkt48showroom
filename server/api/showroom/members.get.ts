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
async function getMembers(group: string | null = null): Promise<IMember[]> {
  return await cache.fetch<IMember[]>(group ? `${group}-members` : 'members', () => fetchData(group), time).catch(() => [])
}

async function fetchData(group: string | null = null): Promise<IMember[]> {
  try {
    const members: IShowroomMember[] = await Showroom.find(group ? { group } : {})
      .select('name description img url room_id member_data room_exists')
      .populate({
        path: 'member_data',
        select: '-_id isGraduate img',
      })
      .lean()
    return members
      .map((member): IMember => {
        return {
          name: member.name,
          img: member.img ?? member.member_data?.img ?? config.errorPicture,
          img_alt: member.member_data?.img ?? member.img ?? config.errorPicture,
          url: member.url,
          description: member.description?.replace(/(?:\r\n|\r)/g, '\n'),
          group: member.group,
          room_id: member.room_id,
          room_exists: member.room_exists ?? false,
          is_graduate: member.member_data?.isGraduate ?? jkt48officialId !== member.room_id,
          is_group: jkt48officialId === member.room_id,
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
