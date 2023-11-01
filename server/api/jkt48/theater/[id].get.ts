import { dbConnect } from '~/library/database'
import Member from '~/library/database/schema/48group/Member'
import Theater from '~/library/database/showroomDB/jkt48/Theater'
import cache from '~~/library/utils/cache'

// const time = 600000 // 10 minutes
const time = 1

export default defineEventHandler(async (event: any) => {
  const id = event.context.params?.id
  return await cache
    .fetch<IApiTheaterDetailList>(`theater-${id}`, () => getTheaterDetail(id), time)
})

export async function getTheaterDetail(id: string): Promise<IApiTheaterDetailList> {
  await dbConnect(1)
  const data = await Theater.find({ id: new RegExp(`^${id}`) }).populate<{ members: JKT48.Member[] }>('members').populate<{ setlist: JKT48.Setlist }>('setlist').populate<{ seitansai: JKT48.Member[] }>('seitansai').lean()
  const memberList = data.reduce<JKT48.Member[]>((a, b) => {
    a.push(...b.members)
    return a
  }, [])

  const memberDetails = await Member.find({ jkt48id: memberList.map(i => i.id) }).select({
    name: 1,
    img: 1,
    showroom_id: 1,
    jkt48id: 1,
  }).populate('showroom')
    .lean()

  const memberMap = new Map<string, Database.I48Member>()
  for (const member of memberDetails) {
    memberMap.set(member.jkt48id ?? '0', member)
  }
  if (!data?.length) throw createError({ statusMessage: 'Data not found!', statusCode: 404 })
  return {
    shows: data.map((i) => {
      return {
        id: i.id,
        title: i.title,
        url: i.url,
        setlist: i.setlist,
        members: i.members.map((i) => {
          const detailedMember = memberMap.get(i.id)
          return {
            id: i.id,
            name: i.name,
            img: detailedMember?.img ?? undefined,
            url_key: (detailedMember as any)?.showroom?.url,
          }
        }),
        seitansai: i.seitansai,
        date: i.date,
        team: i.team,
      }
    }),
    date: new Date(data[0]?.date).toISOString(),
  }
}
