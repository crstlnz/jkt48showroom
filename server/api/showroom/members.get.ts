import cache from '~~/library/utils/cache'
import Showroom from '~~/library/database/schema/showroom/Showroom'
import IdolMember from '~~/library/database/schema/48group/IdolMember'
import config from '~~/app.config'
export default defineEventHandler(async (): Promise<IMember[]> => {
  return await getMembers()
})
export { getMembers }
const group = ['jkt48', 'hinatazaka46'].includes(config.group) ? config.group : undefined
const jkt48officialId = 332503
const time = 3600000 // 1 hour
const cacheKey = group ? `${group}-members` : 'members'
async function getMembers (): Promise<IMember[]> {
  return await cache.fetch<IMember[]>(cacheKey, fetchData, time).catch(() => [])
}

async function fetchData (): Promise<IMember[]> {
  try {
    // console.log('FETCHING')
    // const members = await IdolMember.find(group ? { group } : {})
    //   .select('name image image_alt showroom')
    //   .populate<{ image: HostedImage | null }>({
    //     path: 'image',
    //     select: '-_id'
    //   })
    //   .populate<{ image: HostedImage | null }>({
    //     path: 'image_alt',
    //     select: '-_id'
    //   })
    //   .lean()
    const members: IShowroomMember[] = await Showroom.find(group ? { group } : {})
      .select('name description img url room_id member_data room_exists')
      .populate({
        path: 'member_data',
        select: '-_id isGraduate img'
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
          is_group: jkt48officialId === member.room_id
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
    // return members
    //   .map((member): IMember => {
    //     return {
    //       name: member.name,
    //       img: member.image?.url ?? member.image_alt?.url ?? config.errorPicture,
    //       img_alt: member.image_alt?.url ?? config.errorPicture,
    //       url: member.showroom?.url ?? '',
    //       description: member.description?.replace(/(?:\r\n|\r)/g, '\n'),
    //       group: member.group,
    //       room_id: member.showroom?.room_id ?? 0,
    //       room_exists: member.showroom?.room_exists ?? false,
    //       is_graduate: member.isGraduate ?? jkt48officialId !== member.showroom?.room_id,
    //       is_group: jkt48officialId === member.showroom?.room_id
    //     }
    //   })
    //   .sort((a, b) => a.name.localeCompare(b.name))
  } catch (e) {
    console.log(e)
    return []
  }
}
