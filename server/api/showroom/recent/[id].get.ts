import { calculateFansPoints } from '../stats.get'
import ShowroomGift from '~/library/database/schema/showroom/ShowroomGift'
import ShowroomLog from '~/library/database/schema/showroom/ShowroomLog'
import Liked from '~/library/database/schema/user/Liked'
import cache from '~~/library/utils/cache'
import { getToken } from '#auth'

const time = 86400000 * 15 // 15 day

interface ExtendedDetails {
  fans: IStatFans[]
  colorBg: string
  liked: boolean
  live_info: Omit<Database.IDetailLiveInfo, 'gift'> & { gift: Omit<Database.IGiftsLogData, 'list' | 'free'> & { list: Database.GiftData[] } }
}

export default defineEventHandler(async (event: any) => {
  cache.clear()
  const dataId = event.context.params?.id
  const token = await getToken({ event })
  return await cache
    .fetch<Database.IShowroomLogDetail & ExtendedDetails>(`recent-${dataId}`, () => getRecent(dataId, token), time)
})

export async function getRecent(id: string, token: any): Promise<Omit<Database.IShowroomLogDetail, 'live_info'> & ExtendedDetails> {
  const data = await ShowroomLog.getDetails(id)
  if (!data) throw createError({ statusMessage: 'Data not found!', statusCode: 404 })
  const fansRank = calculateFansPoints(data.users, data.live_info?.stage_list ?? [])
  // const color = await getDominantColorServer(data.room_info.img_alt ?? data.room_info.img).catch((e) => {
  //   console.log(e)
  //   return null
  // })
  // const colorHex = color ? convertRGBtoHex(...flattenAndSoftenColor(...color)) : '#cfd9de'
  const liked = (token?.id ? await Liked.findOne({ user_id: token.id, liked_id: data.data_id, type: 2 }) : null) != null
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
    // colorBg: colorHex,
    colorBg: '',
    liked,
    live_info: {
      ...data.live_info,
      gift: {
        log: data.live_info.gift.log,
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
