import fs from 'fs'
import formidable from 'formidable'
import { getJapanRate } from '../../jpn_rates.get'
import ShowroomLog from '../../../../library/database/schema/showroom/ShowroomLog'
import { getServerSession, getToken } from '#auth'

export default defineEventHandler(async (event): Promise<{ data_id: string; status: number }> => {
  const form = formidable()
  const config = useAppConfig()
  const session = await getServerSession(event)
  const token = await getToken({ event })

  if (!session || (!token || config.isAdmin(token.id as string))) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated!' })

  return await new Promise((resolve, reject) => {
    form.parse(event.node.req, async (err, fields, files) => {
      if (err) {
        return reject(createError({ statusCode: 500, statusMessage: String(err) }))
      }

      try {
        if (!fields.roomId || !fields.liveId || !fields.comments || !fields.commentsBy || !fields.penonton || !fields.dateStart || !fields.dateEnd) return reject(createError({ statusCode: 400, statusMessage: 'Some fields are empty!' }))
        if (!files.gifts || (files.gifts as any).size === 0) return reject(createError({ statusCode: 400, statusMessage: 'File not included!' }))
        if ((files.gifts as any).mimetype !== 'application/json') return reject(createError({ statusCode: 400, statusMessage: 'File must be JSON!' }))
        const filePath = (files.gifts as any).filepath
        const rawJSON = fs.readFileSync(filePath) as any
        fs.unlinkSync(filePath)
        const data = JSON.parse(rawJSON)
        if ('isFree' in data[0] && 'senders' in data[0]) {
          const paid = data.filter((i: { isFree: boolean }) => i.isFree === false)
          const free = data.filter((i: { isFree: boolean }) => i.isFree === true).map((i: any) => {
            return {
              gift_id: i.giftId,
              point: i.giftPoints,
              num: i.totalQty,
              users: i.senders.length,
            }
          })

          const userGifts = new Map()

          for (const gift of paid) {
            for (const user of gift.senders) {
              if (userGifts.has(user.userId)) {
                const userGift = userGifts.get(user.userId)
                userGift.total += gift.giftPoints * user.qty
                userGift.gifts.push({
                  gift_id: gift.giftId,
                  num: user.qty,
                  date: user.timestamp,
                })
              }
              else {
                userGifts.set(user.userId, {
                  total: gift.giftPoints * user.qty,
                  user_id: user.userId,
                  name: user.name,
                  avatar_id: user.avatarId,
                  gifts: [{
                    gift_id: gift.giftId,
                    num: user.qty,
                    date: user.timestamp,
                  }],
                })
              }
            }
          }

          const gift_id_map = new Map()
          for (const gg of data) gift_id_map.set(gg.giftId, gg.giftId)
          const startDate = new Date(fields.dateStart as string)
          const endDate = new Date(fields.dateEnd as string)
          const jpnRate = await getJapanRate()
          const dataId = `${Math.floor(startDate.getTime() / 1000)}${fields.roomId}`
          const result = {
            jpn_rate: jpnRate,
            created_at: endDate,
            live_id: fields.liveId,
            data_id: dataId,
            room_id: fields.roomId,
            total_point: Array.from(userGifts.values()).reduce((a, b) => a + b.total, 0),
            live_info: {
              duration: endDate.getTime() - startDate.getTime(),
              comments: {
                num: fields.comments,
                users: fields.commentsBy,
              },
              start_date: startDate.toISOString(),
              end_date: endDate.toISOString(),
              penonton: {
                peak: fields.penonton,
                history: [
                  {
                    num: fields.penonton,
                    waktu: endDate.toISOString(),
                  },
                ],
              },
            },
            record_dates: [
              {
                from: startDate.toISOString(),
                to: endDate.toISOString(),
              },
            ],
            gift_data: {
              free_gifts: free,
              gift_id_list: [...gift_id_map.values()],
              gift_log: Array.from(userGifts.values()).map((i) => {
                return {
                  total: i.total,
                  user_id: i.user_id,
                  gifts: i.gifts,
                }
              }),
            },
            users: Array.from(userGifts.values()).map((i) => {
              return {
                user_id: i.user_id,
                avatar_id: i.avatar_id,
                name: i.name,
              }
            }),
          }

          await ShowroomLog.updateOne(
            { data_id: dataId },
            {
              $set: {
                ...result,
                __v: 148,
              },
            },
            {
              upsert: true,
              new: true,
              setDefaultsOnInsert: true,
              runValidators: true,
            },
          )

          return resolve({
            data_id: dataId,
            status: 200,
          })
        }

        else {
          return reject(createError({ statusCode: 400, statusMessage: 'Data is wrong!' }))
        }
      }
      catch (e) {
        return reject(createError({ statusCode: 500, statusMessage: 'Something error!' }))
      }
    })
  })
})
