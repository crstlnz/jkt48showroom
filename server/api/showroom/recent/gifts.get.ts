import Fuse from 'fuse.js'
import ShowroomLog from '~/library/database/schema/showroom/ShowroomLog'
import cache from '~~/library/utils/cache'
import config from '~~/app.config'

const time = 600000

export default defineEventHandler(async (event: any) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const search = String(query.s || '') || ''
  const dataId = String(query.data_id)
  return await cache
    .fetch<IApiGifts>(`giftlist-${dataId}-${page}`, () => getGifts(dataId, search, page), time)
})

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined
}

export async function getGifts(data_id: string, search = '', page = 1, perpage = config.gift_perpage): Promise<IApiGifts> {
  const data = await ShowroomLog.findOne({ data_id }).select({ gift_data: 1, users: 1 }).lean()
  let total_count = data?.gift_data?.gift_log?.length ?? 0
  const raw = data?.gift_data?.gift_log ?? []
  let giftLogs = []
  if (search !== '') {
    const fuse = new Fuse(data?.users ?? [], {
      keys: ['name'],
      threshold: 0.45,
    })
    const searched = fuse.search(search)
    const giftLogsSearch = searched.map((i) => {
      const giftData = raw.find(g => g.user_id === i.item.user_id)
      if (!giftData) return null
      return {
        ...giftData,
      }
    }).filter(notEmpty)
    total_count = giftLogsSearch.length
    giftLogs.push(...giftLogsSearch.slice(perpage * (page - 1), perpage * page))
  }
  else {
    giftLogs = raw.slice(perpage * (page - 1), perpage * page)
  }
  const users = []
  for (const usr of giftLogs) {
    const u = data?.users.find(i => i.user_id === usr.user_id)
    if (u) {
      users.push({
        id: u.user_id,
        name: u.name,
        avatar_id: u.avatar_id,
      })
    }
  }

  if (page < 1) page = 1
  return {
    gifts: giftLogs.map((i) => {
      return {
        ...i,
        gifts: i.gifts.map((g) => {
          return {
            id: g.gift_id,
            date: g.date,
            num: g.num,
          }
        }),
      }
    }),
    users,
    perpage,
    search,
    page,
    total_count,
  }
}
