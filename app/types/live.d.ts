// Live streaming related types

interface ILiveInfo {
  penonton: {
    peak: number
  }
  start_date: string
  end_date: string
}

interface StreamingURL {
  label: string
  quality: number
  url: string
}

interface INowLive {
  name: string
  img: string
  img_alt?: string
  url_key?: string
  slug?: string
  room_id: number
  is_graduate: boolean
  is_group: boolean
  started_at: string | number
  chat_room_id?: string
  streaming_url_list: StreamingURL[]
  is_premium?: boolean
  type: 'idn' | 'showroom'
}

interface YoutubeLive extends JKT48V.LiveResults {
  type: 'youtube'
}

type ExtINowLive = INowLive | YoutubeLive

interface INextLive {
  name: string
  img: string
  img_alt?: string
  url: string
  room_id: number
  is_graduate: boolean
  room_exists: boolean
  is_group: boolean
  date: string
}

interface IMember {
  name: string
  nicknames: string[]
  img: string
  img_alt?: string
  url: string
  description?: string
  group?: GroupType
  room_id?: number
  socials?: SocialNetwork[]
  is_graduate: boolean
  generation?: string
  idn_username?: string
}

interface ShowroomPremiumLive {
  entrance_url?: string
  room_url?: string
  image?: string
  premium_live_type?: number
  is_onlive?: boolean
  title?: string
  paid_live_id?: number
  room_id?: number
  room_name?: string
  start_at?: number
}

interface LiveData {
  showroom: IRoomLive[]
  idn: IDNLives[]
}

interface IRoomLive {
  name: string
  img: string
  img_alt?: string
  url: string
  room_id: number
  is_graduate: boolean
  is_group: boolean
  room_exists: boolean
  started_at: string | number
  streaming_url_list: StreamingURL[]
  is_premium?: boolean
}

interface IDNLives {
  user: IDNUser
  image: string
  title: string
  slug: string
  view_count: number
  live_at: string
  stream_url: string
}

interface IDNUser {
  id: string
  name: string
  username: string
  avatar: string
}
