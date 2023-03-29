import { getCommentLog, getRoomStatus, getStreamingURL } from '~~/library/api/showroom'

export default defineEventHandler(
  async (event): Promise<Watch.WatchData> => {
    const params = getQuery(event)
    const data = await getRoomStatus(params)
    const streamUrl = data.is_live ? (await getStreamingURL({ room_id: data.room_id })).streaming_url_list : []
    const comments = (data.is_live ? (await getCommentLog(data.room_id)).comment_log : []).filter(i => !(!Number.isNaN(i.comment) && parseInt(i.comment) <= 50))
    return {
      name: data.room_name,
      started_at: data.started_at,
      room_id: data.room_id,
      streaming_url_list: streamUrl,
      socket_host: data.broadcast_host,
      socket_key: data.broadcast_key,
      socket_port: data.broadcast_port,
      room_url_key: data.room_url_key,
      image: data.image_s,
      is_live: data.is_live,
      comments: comments.map((i) => {
        return <Watch.Comment>{
          id: i.user_id.toString() + i.created_at.toString(),
          user_id: i.user_id,
          name: i.name,
          comment: i.comment,
          created_at: i.created_at,
          avatar_id: i.avatar_id
        }
      })
    }
  }
)
