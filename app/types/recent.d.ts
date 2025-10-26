// Recent live data types

interface BaseRecent {
  data_id: string
  member: {
    name: string
    nickname?: string
    img: string
    img_alt?: string
    url: string
    is_graduate: boolean
    is_official: boolean
  }
  created_at: string
  live_info: {
    duration: number
    viewers?: {
      num: number
      is_excitement: boolean
    }
    date: {
      start: string
      end: string
    }
  }
  room_id: number
  points: number
  gift_rate: number
  type: 'showroom' | 'idn'
}

interface IDNRecent extends BaseRecent {
  idn: {
    id: string
    username: string
    slug: string
  }
  type: 'idn'
}

interface ShowroomRecent extends BaseRecent {
  type: 'showroom'
}

type IRecent = ShowroomRecent | IDNRecent

interface IApiRecents {
  recents: IRecent[]
  page: number
  perpage: number
  total_count: number
}

interface IBookmarks {
  bookmarks: IRecent[]
  page: number
  perpage: number
  total_count: number
}

interface IHistoryRecents {
  recents: (IRecent & { type: HistoryType, user?: Database.UserData & { giftSpent: number } })[]
  page: number
  perpage: number
  total_count: number
}

interface RecentsQuery {
  room_id?: number
  sort?: string
  order?: number
  search?: string
  page?: number
  perpage?: number
  filter?: 'graduated' | 'active' | 'all'
  date?: QueryDateRange
  group?: Group
  type?: LogType | 'all' | null
}

interface IShowroomRecents {
  data_id: string
  created_at: string
  live_info: ILiveInfo
  room_id: number
  total_point: number
  room_info: {
    name: string
    img: string
    url: string
    member_data: {
      isGraduate: boolean
      img: string
    }
  }
}

interface ApiShowroomLive {
  _id: string
  data_id: string
  created_at: string
  live_info: {
    penonton: {
      peak: number
    }
    start_date: string
    end_date: string
  }
  room_id: number
  total_point: number
  room_info: {
    img?: string
    url: string
    name: string
    member_data?: {
      isGraduate: boolean
      img: string
    }
  }
}

interface APILiveInfo {
  name: string
  room_id: number
  live_id?: number
  started_at?: string
  is_birthday?: boolean
  viewers?: number
  is_live?: boolean
  url?: string
  is_error: boolean
}
