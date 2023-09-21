declare namespace Database {
  interface ILiked {
    user_id: string
    type: 1 | 2
    liked_id: string
  }

  interface LikeDetail {
    room: Database.IShowroomMember[]
    live: Database.IRecent[]
  }

  interface SocialNetwork {
    title: string
    url: string
  }

  interface Generation {
    title: string
    short_title: string
    num: number
    key: string
  }

  interface I48Member {
    nicknames: string[];
    name: string;
    kanji?: string;
    isGraduate: boolean;
    group: string;
    description: string;
    img: string;
    stage48: string;
    banner: string;
    jikosokai?: string;
    socials: SocialNetwork[];
    generation?: string;
    birthdate? : Date;
    bloodType?: string
    height?: string
    showroom_id?: number;
  }

  interface IShowroomGift {
    gift_id: number
    gift_name: string
    is_delete_from_stage: boolean
    free: boolean
    image: string
    point: number
  }

  interface IShowroomUser {
    name: string
    image: string
    avatar_url: string
    avatar_id: number
    user_id: number
    point: number
    last_seen: string
  }

  interface IShowroomMember {
    name: string
    img: string
    img_square?: string
    description?: string
    group?: string
    url: string
    room_id: number
    room_exists: boolean
    is_active: boolean
    is_group: boolean
    generation? : string;
    member_data?: I48Member
  }

  interface IMemberProfile {
    name : string
    nickname? : string
    fullname : string
    description : string
    img : string
    img_alt : string
    banner : string
    group : string
    url : string
    room_id : number
    jikosokai? : string
    is_graduate : boolean
    is_group : boolean
    socials : SocialNetwork[],
    generation? : string
    birthdate? : Date;
    bloodType? : string
    height? : string
  }

  interface FreeGift {
    gift_id: number
    point: number
    num: number
    users: number
  }

  
  interface Viewers  {
    active: number
    peak: number
    last: number
    is_excitement : boolean
  }

  interface IShowroomLog {
    live_type?: number
    is_dev: boolean
    live_id: number
    jpn_rate: number
    data_id: string
    record_dates: Watcher.RecordDate[]
    live_info: {
      comments: IComments
      screenshot?: IScreenshot
      background_image?: string
      // stage_list?: IStage[]
      viewers : Viewers
      penonton?: {
        history: {
          num: number
          waktu: Date
        }[]
        peak: number
      }
      duration: number
      start_date: Date
      end_date: Date
    }
    room_id: number
    gift_data: {
      free_gifts: FreeGift[]
      gift_id_list: number[]
      gift_list?: IShowroomGift[]
      gift_log: IUserGift[]
    }
    total_point: number
    created_at: Date
    users: {
      user_id: number
      avatar_url?: string
      avatar_id: number
      name: string
    }[]
    room_info?: IShowroomMember
  }

  interface IUserGift {
    total: number
    user_id: number
    gifts: [
      {
        gift_id: number
        num: number
        date: Date
      }
    ]
  }

  interface IGift {
    id: number
    free: boolean
    point: number
  }

  interface IGiftImg extends IGift {
    img: string
  }

  interface IGifts extends IGiftImg {
    num: number
    date: string
  }

  interface GiftData extends IGiftImg {
    name: string
    is_delete_from_stage: boolean
    num: number
    user_count: number
  }

  interface IPodiumGift extends IGiftImg {
    date: number
  }

  interface IGiftsLogData {
    log: {
      total: number
      user_id: number
      gifts: {
        id: number
        num: number
        date: string
      }[]
    }[]
    list: IGift[]
    free: FreeGift[]
  }

  interface IFansGift {
    name: string
    id: number
    avatar: string
    avatar_id: number
    total: number
    gifts: IGifts[]
  }

  interface IFansCompact {
    id: number
    name: string
    avatar_id: number
  }

  interface IStage {
    date: string | Date
    list: number[]
  }

  interface IScreenshot {
    folder: string
    format: string
    list: number[]
  }

  interface ILiveDate {
    start: string
    end: string
  }

  interface IComments {
    num: number
    users: number
  }

  interface ViewersInfo {
    num : number
    active: number
    is_excitement : boolean
  }


  interface IDetailLiveInfo {
    duration : number
    screenshot?: IScreenshot
    comments?: IComments
    viewers : ViewersInfo
    background_image?: string
    stage_list: IStage[]
    date: ILiveDate
    gift: IGiftsLogData
  }

  interface IShowroomLogDetail {
    data_id: string
    live_id?: number
    room_info: {
      name: string
      img_alt?: string
      img: string
      url: string
      is_group: boolean
      is_graduate: boolean
      banner : string
      jikosokai : string
      generation : string
      group : string
    }
    live_info: IDetailLiveInfo
    jpn_rate?: number
    room_id: number
    total_point: number
    users: IFansCompact[]
    created_at: string
  }
  interface IShowrooMessage {
    data_id: string
    message_id: string
    channel_id: string
    bot_id: string
  }

  interface IShowroomTemp extends Watcher.Data {
    botId: string
  }

  interface IShowroomFans {
    avatar_url : string
    point : number
    user_id : number
    name : string 
    last_seen? : string
    image : string
    avatar_id : number
  }

  interface IStageListItem {
    data_id : string
    stage_list : IStage[]
  }
}
