import { calculateFansPoints } from '../stats.get'
import { dbConnect } from '~/library/database'
import ShowroomGift from '~/library/database/schema/showroom/ShowroomGift'
import ShowroomLog from '~/library/database/schema/showroom/ShowroomLog'
import cache from '~~/library/utils/cache'

const time = 600000 // 10 minutes

// type RecentDetail = Omit<Database.IShowroomLogDetail, 'live_info'> & ExtendedDetails
// interface ExtendedDetails {
//   fans: IStatFans[]
//   live_info: Omit<Database.IDetailLiveInfo, 'gift'> & { gift: Omit<Database.IGiftsLogData, 'list' | 'free'> & { list: Database.GiftData[] } }
// }

export default defineEventHandler(async (event: any) => {
  const dataId = event.context.params?.id
  return await cache
    .fetch<API.IRecentDetail>(`recent-${dataId}`, () => getRecent(dataId), time)
})

export async function getRecent(id: string): Promise<API.IRecentDetail> {
  await dbConnect(2)
  const data = await ShowroomLog.getDetails(id)
  if (!data) throw createError({ statusMessage: 'Data not found!', statusCode: 404 })
  const fansRank = calculateFansPoints(data.users, data.live_info?.stage_list ?? [])
  const giftData = await ShowroomGift.find({ gift_id: data.live_info.gift.list.map(i => i.id) }).lean()
  const giftMap = new Map<number, Database.GiftData >()
  for (const gift of giftData) {
    giftMap.set(gift.gift_id, {
      name: gift.gift_name,
      point: gift.point,
      id: gift.gift_id,
      free: gift.free,
      img: gift.image,
      is_delete_from_stage: gift.is_delete_from_stage,
      user_count: 0,
      num: 0,
    })
  }

  for (const giftLog of data.live_info.gift.log ?? []) {
    for (const gift of giftLog.gifts) {
      const g = giftMap.get(gift.id)
      if (g) {
        g.num += gift.num
        g.user_count += 1
      }
    }
  }

  for (const freeGift of data.live_info.gift.free ?? []) {
    const g = giftMap.get(freeGift.gift_id)
    if (g) {
      g.num += freeGift.num
      g.user_count += freeGift.users
    }
  }

  const config = useAppConfig()
  const gifts = (data.live_info?.gift?.list ?? []).map<Database.GiftData>((g) => {
    const gift = giftMap.get(g.id)
    if (gift) {
      return {
        ...gift,
      }
    }
    else {
      return {
        name: '',
        point: 0,
        id: g.id,
        user_count: 0,
        free: false,
        img: config.giftUrl(g.id),
        is_delete_from_stage: true,
        num: 0,
      }
    }
  })

  return {
    ...data,
    fans: fansRank,
    live_info: {
      duration: data.live_info.duration,
      comments: data.live_info.comments,
      viewers: data.live_info.viewers,
      screenshot: data.live_info.screenshot,
      background_image: data.live_info.background_image,
      stage_list: data.live_info.stage_list,
      date: data.live_info.date,
      gift: {
        log: data.live_info.gift.log,
        next_page: data.live_info.gift.next_page,
        list: gifts.sort((a, b) => {
          if (a.point === b.point) {
            return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0)
          }
          else {
            return b.point - a.point
          }
        }),
      },
    },
  }
}
