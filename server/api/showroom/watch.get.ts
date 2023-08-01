import { getCommentLog, getGiftList, getGiftLog, getRoomStatus, getStreamingURL } from '~~/library/api/showroom'
import cache from '~~/library/utils/cache'

const time = 10000 // 10 seconds
export default defineEventHandler(
  async (event): Promise<Watch.WatchData> => {
    const params = getQuery(event)
    return await cache
      .fetch<Watch.WatchData>(`watch-${params.room_url_key}`, () => getData(params, event.context.showroom_cookie), time)
  },
)

async function getData(params: any, cookies?: string | undefined): Promise<Watch.WatchData> {
  const data = await getRoomStatus(params, cookies)
  const streamUrl = data.is_live ? (await getStreamingURL({ room_id: data.room_id }, cookies)).streaming_url_list : []
  const comments = (data.is_live ? (await getCommentLog(data.room_id, cookies)).comment_log : []).filter(i => !(!Number.isNaN(i.comment) && Number.parseInt(i.comment) <= 50))
  const giftLog = (data.is_live ? (await getGiftLog(data.room_id, cookies)).gift_log : [])
  const giftList = (data.is_live ? (await getGiftList(data.room_id, cookies)).normal : [])
  return {
    name: data.room_name,
    started_at: data.started_at,
    can_comment: data.can_comment,
    live_id: data.live_id,
    room_id: data.room_id,
    streaming_url_list: streamUrl,
    socket_host: data.broadcast_host,
    socket_key: data.broadcast_key,
    socket_port: data.broadcast_port,
    room_url_key: data.room_url_key,
    image: data.image_s,
    is_live: data.is_live,
    gift_log: giftLog,
    gift_list: giftList,
    comments: comments.map((i) => {
      return <Watch.Comment>{
        id: i.user_id.toString() + i.created_at.toString(),
        user_id: i.user_id,
        name: i.name,
        comment: i.comment,
        created_at: i.created_at,
        avatar_id: i.avatar_id,
      }
    }),
  }
}
