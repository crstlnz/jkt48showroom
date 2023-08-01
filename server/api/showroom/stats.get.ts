import { getMembers } from './members.get'
import { getDateRange } from '~~/library/utils'
import ShowroomLog from '~~/library/database/schema/showroom/ShowroomLog'
import cache from '~~/library/utils/cache'
import config from '~~/app.config'

const fansMaxSize = 50
const time = 43200000 // 12 hours
function isIDateRangeType(value: string): value is IDateRangeType {
  return ['weekly', 'monthly', 'quarterly'].includes(value)
}

function isIDateRangeMemberType(value: string): value is IDateRangeMemberType {
  return ['weekly', 'monthly', 'all'].includes(value)
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const group = config.getGroup(query.group as string)
  try {
    if (query.room_id) {
      const type = isIDateRangeMemberType(query.type as string) ? query.type : undefined
      return await getMemberStats(type as IDateRangeMemberType, query.room_id as number)
    }
    else {
      const type = isIDateRangeType(query.type as string) ? query.type : undefined
      return await getStats(type as IDateRangeType, group)
    }
  }
  catch (e) {
    console.log(e)
    throw e
  }
})

export { getDateRange }

export async function getMemberStats(type: IDateRangeMemberType = 'all', roomId: number): Promise<IShowroomMemberStats> {
  const dateRange = type === 'all' ? null : getDateRange(type)
  const cacheString = `${roomId}-${type}`
  const data = await cache.fetch<IShowroomMemberStats>(cacheString, () => fetchData(type, null, roomId), time)
  if (data?.date?.to === dateRange?.to) return data
  return await fetchData(type, null, roomId)
}

export async function getStats(type: IDateRangeType = 'quarterly', group: string | null = null): Promise<IShowroomStats> {
  const dateRange = getDateRange(type)
  const cacheString = (group == null) ? type : `${group}-${type}`
  const data = await cache.fetch<IShowroomStats>(cacheString, () => fetchData(type, group, null), time)
  if (data?.date?.to === dateRange.to) return data
  return await fetchData(type, group, null)
}

export async function fetchData(type: IDateRangeType, group: string | null, roomId: number | null): Promise<IShowroomStats>
export async function fetchData(type: IDateRangeMemberType, group: string | null, roomId: number | null): Promise<IShowroomMemberStats>
export async function fetchData(type: IDateRangeType | IDateRangeMemberType, group: string | null = null, roomId: number | null = null): Promise<IShowroomStats | IShowroomMemberStats> {
  const dateRange = (roomId)
    ? null
    : {
        from: getDateRange('quarterly').from,
        to: getDateRange('weekly').to,
      } // get all data and then convert it to monthly and weekly

  let members: IMember[] = []
  if (!roomId) {
    members = await getMembers(group)
    if (!members?.length) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch data!',
      })
    }
  }

  const select = {
    room_info: 1,
    total_point: 1,
    created_at: 1,
    users: 1,
    live_info: {
      stage_list: 1,
      start_date: 1,
      end_date: 1,
      viewers: {
        peak: 1,
      },
    },
    data_id: 1,
    room_id: 1,
  }

  const option: StatsOptions = {
    room_id: roomId || members.map(i => i.room_id),

  }

  if (dateRange) {
    option['live_info.end_date'] = {
      $gte: dateRange.from,
      $lte: dateRange.to,
    }
  }

  if (!process.env.IS_DEV) option.is_dev = false
  const logs = await ShowroomLog.find(option, select)
    .lean()
    .populate({
      path: 'room_info',
      select: '-_id name img url -room_id member_data',
      populate: {
        path: 'member_data',
        select: '-_id isGraduate img',
      },
    }) as unknown as Database.IShowroomLog[]

  if (roomId) {
    const weekly = generate(logs, 'weekly', 'member')
    const monthly = generate(logs, 'monthly', 'member')
    const all = generate(logs, 'all', 'member')
    cache.set(`${roomId}-${weekly.type}`, weekly)
    cache.set(`${roomId}-${monthly.type}`, monthly)
    cache.set(`${roomId}-${all.type}`, all)
    if (type === 'all') {
      return all
    }
    else if (type === 'monthly') {
      return monthly
    }
    else {
      return weekly
    }
  }
  else {
    const weekly = generate(logs, 'weekly', 'all')
    const monthly = generate(logs, 'monthly', 'all')
    const quarterly = generate(logs, 'quarterly', 'all')
    cache.set(group ? `${group}-${weekly.type}` : weekly.type, weekly)
    cache.set(group ? `${group}-${monthly.type}` : monthly.type, monthly)
    cache.set(group ? `${group}-${quarterly.type}` : quarterly.type, quarterly)
    if (type === 'quarterly') {
      return quarterly
    }
    else if (type === 'monthly') {
      return monthly
    }
    else {
      return weekly
    }
  }
}

function generate(logs: Database.IShowroomLog[], type: IDateRangeType, typeStats: 'member' | 'all'): IShowroomStats | IShowroomMemberStats
function generate(logs: Database.IShowroomLog[], type: IDateRangeMemberType, typeStats: 'member' | 'all'): IShowroomMemberStats
function generate(logs: Database.IShowroomLog[], type: IDateRangeType | IDateRangeMemberType, typeStats: 'member' | 'all'): IShowroomStats | IShowroomMemberStats {
  const dateRange = type === 'all' ? null : getDateRange(type)
  let log = logs
  if (dateRange) {
    log = logs.filter(i => new Date(i.live_info.start_date).getTime() >= new Date(dateRange.from).getTime() && new Date(i.live_info.start_date).getTime() <= new Date(dateRange.to).getTime())
  }
  const all = calculateRanks(log)
  const memberList = all.member.map((i) => {
    return {
      ...i,
      live_point: i.total_viewer / i.live_count + i.point / 100,
      avg_viewer: Math.floor(i.total_viewer / i.live_count),
    }
  })
  const statsLive: IStats[] = [
    {
      title: 'Live Count',
      key: 'livecount',
      value: all.member.reduce((a, b) => a + b?.live_count ?? 0, 0),
    },
  ]
  if (memberList.length) {
    if (typeStats === 'all') {
      const mostViews = memberList.sort((a, b) => b.most_viewer - a.most_viewer)[0]
      const mostLive = memberList.sort((a, b) => b.live_count - a.live_count)[0]
      const topMember = memberList.sort((a, b) => b.live_point - a.live_point)[0]
      statsLive.push(
        ...[
          {
            title: 'Most Live',
            key: 'mostlive',
            img: {
              title: mostLive.name,
              src: mostLive.img,
            },
            value: `${mostLive.live_count} ${mostLive.live_count > 1 ? 'Lives' : 'Live'}`,
          },
          {
            title: 'Top Member',
            key: 'topmember',
            img: {
              title: topMember.name,
              src: topMember.img,
            },
            value: topMember.name,
          },
        ],
      )

      statsLive.push({
        title: 'Most Viewer',
        key: 'mostviewer',
        img: {
          title: mostViews.name,
          src: mostViews.img,
        },
        value: mostViews.most_viewer,
        parseType: 'viewer',
      })
    }
    else {
      statsLive.push({
        title: 'Most Gifts',
        key: 'mostgifts',
        value: memberList[0].most_point,
        parseType: 'gift',
      })

      statsLive.push({
        title: 'Most Viewer',
        key: 'mostviewer',
        value:
          memberList[0].most_viewer > 1000
            ? `${(memberList[0].most_viewer / 1000).toFixed(2)}K Viewers`
            : `${memberList[0].most_viewer} ${memberList[0].most_viewer > 1 ? 'Viewers' : 'Viewer'}`,
      })
      statsLive.push({
        title: 'Longest Live',
        key: 'longestlive',
        value: memberList[0].duration,
        parseType: 'duration',
      })
    }
  }

  return {
    type,
    ranks: all,
    stats: statsLive,
    date: !dateRange
      ? undefined
      : {
          from: dateRange?.from ?? '',
          to: dateRange?.to ?? '',
        }
    ,
  }
}

interface CalculatedRanks {
  member: IStatMember[]
  fans: IStatFans[]
}

function calculateRanks(logs: Database.IShowroomLog[]): CalculatedRanks {
  const memberRanks: Map<string | number, IStatMember> = new Map()

  for (const log of logs) {
    if (memberRanks.has(log.room_id)) {
      const member = memberRanks.get(log.room_id)
      if (member) {
        const viewer = log.live_info?.viewers?.peak ?? 0
        const duration = new Date(log?.live_info?.end_date).getTime() - new Date(log?.live_info?.start_date).getTime()
        member.live_count += 1
        member.total_viewer += log?.live_info?.viewers?.peak ?? 0
        member.point += log.total_point
        member.most_viewer = viewer > member.most_viewer ? viewer : member.most_viewer
        member.duration = duration > member.duration ? duration : member.duration
        member.most_point = log?.total_point > member.most_point ? log?.total_point : member.most_point
      }
    }
    else {
      memberRanks.set(log.room_id, {
        room_id: log.room_id,
        name: log.room_info?.name ?? 'Member not Found!',
        img:
          log.room_info?.member_data?.img
          || log.room_info?.img
          || 'https://image.showroom-cdn.com/showroom-prod/assets/img/v3/img-err-404.jpg?t=1602821561',
        url: log.room_info?.url ?? '',
        live_count: 1,
        total_viewer: log?.live_info?.viewers?.peak ?? 0,
        duration: new Date(log?.live_info?.end_date).getTime() - new Date(log?.live_info?.start_date).getTime(),
        point: log.total_point,
        most_viewer: log.live_info?.viewers?.peak ?? 0,
        most_point: log.total_point,
      })
    }
  }

  const users = logs.reduce<IFansCompact[]>((a, b) => {
    for (const user of b.users) {
      a.push({
        name: user.name,
        avatar_id: user.avatar_id,
        id: user.user_id,
      })
    }
    return a
  }, [] as IFansCompact[])

  const stageList = logs.reduce<Database.IStage[]>((a, b) => {
    a.push(...(b.live_info?.stage_list ?? []))
    return a
  }, [] as IStageList[])

  return {
    member: Array.from(memberRanks.values()).sort((a, b) => b.point - a.point),
    fans: calculateFansPoints(users, stageList),
  }
}

export function calculateFansPoints(usersData: IFansCompact[], stageList: Database.IStage[]) {
  const fansRanks: Map<string | number, number> = new Map()
  const users: Map<string | number, IFans> = new Map()
  for (const user of usersData) {
    users.set(user.id, {
      name: user.name,
      avatar_id: user.avatar_id,
      id: user.id,
    })
  }

  for (const stage of stageList ?? []) {
    for (const [i, id] of stage.list.entries()) {
      const point = getRankPoints(i)
      if (fansRanks.has(id)) {
        fansRanks.set(id, (fansRanks.get(id) ?? 0) + point)
      }
      else {
        fansRanks.set(id, point)
      }
    }
  }

  return Array.from(fansRanks, ([user_id, fans_point]): IStatFans => {
    const user = users.get(user_id) ?? {
      name: 'User not found!',
      avatar_id: 1,
    }
    return {
      id: Number(user_id),
      name: user.name,
      avatar_id: user.avatar_id,
      fans_point,
    }
  })
    .sort((a, b) => b.fans_point - a.fans_point)
    .slice(0, fansMaxSize)
}

function getRankPoints(rank: number) {
  return 100 - rank + 1
}
// function getRankPoints(rank: number) {
//   if (rank < 4) {
//     return 165 + (4 - rank) * 15
//   }
//   else if (rank < 14) {
//     return 125 + (14 - rank) * 4
//   }
//   else if (rank < 51) {
//     return 51 + (51 - rank) * 2
//   }
//   else {
//     return 100 - rank + 1
//   }
// }
