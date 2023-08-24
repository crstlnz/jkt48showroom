namespace Watch {

  interface TelopApi {
    telops : Telops[],
    telop : string | null,
    interval : number
  }
  
  interface Telops {
    color: {
      r : number,
      g : number,
      b : number,
    }
    live_id: string,
    text : string,
    type : string,
  }

  interface CommentRequest {
    live_id: number
    comment: string
    recommend_comment_id?: number
    comment_type?: number
    is_delay: number
    csrf_token: string
  }
  interface CommentResponse {
    aft: number
    comment: string
    ok: 0 | 1
    room_id: number
    ua: number
  }

  interface Comment {
    user_id: number
    name: string
    comment: string
    created_at: number
    avatar_id: number
  }

  interface APIComment {
    ua: number
    avatar_id: number
    aft: number
    avatar_url: string
    name: string
    created_at: number
    comment: string
    user_id: number
  }

  interface Comment {
    id: string
    user_id: number
    name: string
    comment: string
    created_at: number
    avatar_id: number
  }

  interface WatchData {
    name: string
    started_at: number
    live_id : number
    can_comment: boolean
    room_id: number
    room_url_key: string
    streaming_url_list: ShowroomAPI.StreamingURL[]
    socket_host: string
    socket_key: string
    socket_port: number
    is_live: boolean
    gift_list: ShowroomAPI.Gift[]
    gift_log: ShowroomAPI.GiftLogItem[]
    user : {
      id : number,
      name : string | null,
      avatar_id : number,
    },
    comments: Comment[]
    image: string
  }

  interface Gift {
    num: number
    name: string
    image: string
    id: number
    user_count: number
    free: boolean
    point: number
  }
}
