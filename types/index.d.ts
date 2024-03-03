type OrderType = 1 | -1
type sortType = 'date' | 'gift' | 'views' | 'duration'
type LogType = 'showroom' | 'idn'
interface Id {
  _id: Types.ObjectId
}

interface Banner {
  title: string
  img: string
  url: string
}

interface QueryDateRange {
  start: number
  end: number
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
  type?: LogType | 'all'
}

interface ILiveInfo {
  penonton: {
    peak: number
  }
  start_date: string
  end_date: string
}
interface IShowroomRecents {
  // _id: string;
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
  streaming_url_list: ShowroomAPI.StreamingURL[]
  is_premium?: boolean
}

// _id: '6245e2fe1a8860fba4cdaccd',
// name: 'Lyn /リーン（JKT48）',
// img: 'https://image.showroom-cdn.com/showroom-prod/image/room/cover/261d835846ccd54052d7bede79f89171d1f79af054ada2fecf81086644ff6ea4_m.jpeg?v=1648711909',
// url: '/JKT48_Lyn',
// room_id: 400717,
// ok: 1,
// is_onlive: true,
// start_date: 1659195202,

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
type GroupType = 'jkt48' | 'hinatazaka46' | 'official' | 'others'
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
  type: Log.Type

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

type HistoryType = 'top100' | 'top50' | 'top13' | 'gifter'
interface IHistoryRecents {
  recents: (IRecent & { type: HistoryType, user?: Database.UserData & { giftSpent: number } })[]
  page: number
  perpage: number
  total_count: number
}

interface IApiNews {
  news: JKT48.News[]
  page: number
  perpage: number
  total_count: number
}

interface JKT48MemberExtend extends JKT48.Member {
  img?: string
  url_key?: string
}

interface IApiTheaterDetail {
  id: string
  title: string
  url: string
  setlist?: JKT48.Setlist
  members: JKT48MemberExtend[]
  seitansai: JKT48MemberExtend[]
  graduation: JKT48MemberExtend[]
  date: Date
  team: {
    id: string
    img: string
  }
}

interface IApiTheaterDetailList {
  shows: IApiTheaterDetail[]
  date: string
}

interface IApiGift<T, B> {
  gifts: T[]
  users: B[]
  search: string
  page: number
  perpage: number
  total_count: number
}

type IApiShowroomGift = IApiGift<LogDetail.GiftLog, LogDetail.ShowroomUser>
type IApiIDNGift = IApiGift<LogDetail.GiftLog, LogDetail.IDNUser>

interface IApiSchedule {
  schedules: JKT48.Schedule[]
  page: number
  perpage: number
  total_count: number
}

interface IHomeData {
  data: IShowroomStats
  recents: IRecent[]
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

interface CanvasWorker {
  type: 'canvas'
  canvas: HTMLCanvasElement
}

interface CommandWorker {
  type: 'setFans' | 'setFansAvatar'
  imageData?: {
    size: {
      width: number
      height: number
    }
    id: number
  }
  data: any
}

type WorkerMessage = CanvasWorker | CommandWorker

interface NotifData {
  id: number
  title?: string
  message: string
  type: 'danger' | 'warn' | 'success' | 'info'
  duration?: number
  remainingTime: number
  action?: () => any
}

interface Dialog {
  id: number
  title?: string
  message?: string
  positiveText?: string
  image?: string
}

type DialogVariants = AlertDialog | ConfirmDialog | LoadingDialog

interface AlertDialog extends Dialog {
  type: 'alert'
  autoClose?: boolean
  duration?: number
}

interface ConfirmDialog extends Dialog {
  type: 'confirm'
  negativeText?: string
  onCancel?: () => void
  onConfirm?: () => void
}

interface LoadingDialog extends Dialog {
  type: 'loading'
  onFinish?: () => void
}

interface MenuItem {
  title: string
  locale_id: string
  url: string
  mobile: boolean
  login?: boolean
  group?: Group
  icon: string
  admin?: true
  activeIcon: string
}

interface SortData {
  title: {
    asc: string
    desc: string
    btn: string
  }
  id: sortType
}

type Group = 'jkt48' | 'hinatazaka46' | 'all'

interface MissingJiko {
  name?: string
  img?: string
  img_alt?: string
  member_id: string
  room_id: number
  url: string
}

type ParseType = 'gift' | 'duration' | 'number' | 'date' | 'viewer'
interface ShowroomRecord {
  title: string
  data_id: string
  key: string // for i18n
  name: string
  img: string
  url: string
  room_id: number
  date: string
  value: string
  parser?: ParseType // for value parse
}

interface ISortMember {
  id: string
  name: string
  img: string
  generation?: string
  is_graduate: boolean
}

interface IMemberBirthDay {
  name: string
  birthdate: string
  img: string
  room_id?: string
  url_key?: string
}
interface BirthdayData {
  [x: string]: any
  data: IMemberBirthDay[]
  date: Date
}

interface IStageListApi {
  stage_list: Database.IStage[]
  users: Database.IFansCompact[]
}

interface IMiniRoomProfile {
  follower: number
  is_follow: boolean
  visit_count: number
  room_level: number
}

interface ITheaterAPI extends Database.ITheater {
  poster?: string
}

interface MemberStats {
  missing: {
    showroom: number
    idn: number
  }
  total_live: {
    idn: number
    showroom: number
  }
  most_gift?: {
    id: string
    gift: number
  }
  longest_live?: {
    id: string
    duration: number
  }
  last_live?: {
    id: string
    date: {
      start: string
      end: string
    }
  }
}

interface SocialNetwork {
  title: string
  url: string
}
interface IMemberProfileAPI extends IMemberBasicData {
  stats: MemberStats
  name: string
  nickname?: string
  fullname: string
  description: string
  img: string
  img_alt: string
  banner: string
  group: string
  url: string
  showroom_id: number
  showroom_exists: boolean
  jikosokai?: string
  is_graduate: boolean
  is_group: boolean
  socials: SocialNetwork[]
  generation?: string
  birthdate?: Date
  bloodType?: string
  height?: string
  recentTheater?: ITheaterAPI[]
  upcomingTheater?: ITheaterAPI[]
}

interface IDNUser {
  id: string
  name: string
  username: string
  avatar: string
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

interface IDNLivesDetail {
  user?: IDNUser
  image?: string
  title?: string
  slug?: string
  view_count?: number
  live_at?: string
  stream_url?: string
  is_live: boolean
  member_info?: {
    name?: string
    img?: string
    room_id?: number
    key?: string
  }
}

type IRoomLiveExtended = IRoomLive & { type: 'showroom' }
type IDNLivesExtended = IRoomLive & { type: 'idn' }
type LivesData = IRoomLiveExtended | IDNLivesExtended
interface LiveData {
  showroom: IRoomLive[]
  idn: IDNLives[]
}

interface ImageViewerOptions {
  src: string
  alt: string
}

declare module 'vue-virtual-scroller'
declare module 'cors'
declare module 'vue-twitter-timeline'
declare module 'hls.js/dist/hls.min.js'
declare module 'vue-gtag-next'
declare module 'cloudinary'
declare module 'horoscope'
declare module 'vue-dndrop';
declare let Hls: any
