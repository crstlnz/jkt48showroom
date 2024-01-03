declare namespace LogDetail {
  interface User {
    id: number
    name: string
    comments: number
  }

  interface ShowroomUser extends User {
    avatar_id: number
  }

  interface IDNUser extends User {
    avatar_url: string
  }

  interface RoomInfo {
    name: string
    nickname?: string
    fullname?: string
    img_alt?: string
    img: string
    url: string
    is_group: boolean
    is_graduate: boolean
    banner: string
    jikosokai: string
    generation?: string
    group: string
  }

  interface BaseGift {
    id: number | string
    name: string
    point: number
    img: string
    free: boolean
  }

  interface BaseGiftInfo extends BaseGift {
    user_count: number
    num: number
  }

  interface ShowroomGift extends BaseGiftInfo {
    id: number
    is_delete_from_stage: boolean
  }

  interface IDNGift extends BaseGiftInfo {
    id: string
  }

  interface GiftLog {
    total: number
    user_id: number
    gifts: {
      id: number | string
      num: number
      date: string
    }[]
  }

  interface GiftData {
    log: GiftLog[]
    next_page: boolean
    list: ShowroomGift[] | IDNGift[]
  }

  interface ShowroomGiftData extends GiftData {
    list: ShowroomGift[]
  }

  interface IDNGiftData extends GiftData {
    list: IDNGift[]
  }

  interface BaseLiveInfo {
    duration: number
    comments?: Live.Comments
    screenshot?: Live.Screenshots
    viewers: {
      num: number
      active: number
      is_excitement: boolean
    }
    date: {
      start: string
      end: string
    }
    gift: ShowroomGiftData | IDNGiftData
  }

  interface ShowroomLiveInfo extends BaseLiveInfo {
    background_image?: string
    stage_list: IStage[]
    gift: ShowroomGiftData
  }

  interface IDNLiveInfo extends BaseLiveInfo {
    gift: IDNGiftData
  }

  interface Base {
    data_id: string
    live_id?: number | string
    room_info: RoomInfo
    gift_rate?: number
    room_id: number
    total_gifts: number
    created_at: string
  }

  interface Showroom extends Base {
    live_info: ShowroomLiveInfo
    fans: IStatFans[]
    users: ShowroomUser[]
    type: 'showroom'
  }

  interface IDN extends Base {
    idn: {
      id: string
      username: string
      slug: string
      title: string
      image: string
    }
    live_info: IDNLiveInfo
    users: IDNUser[]
    type: 'idn'
  }

    type Live = Showroom | IDN
}
