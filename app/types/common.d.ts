// Common types used across the application

type OrderType = 1 | -1
type SortType = 'date' | 'gift' | 'views' | 'duration'
type LogType = 'showroom' | 'idn'
type GroupType = 'jkt48' | 'hinatazaka46' | 'official' | 'others'
type Group = 'jkt48' | 'hinatazaka46' | 'all'
type ParseType = 'gift' | 'duration' | 'number' | 'date' | 'viewer'
type HistoryType = 'top100' | 'top50' | 'top13' | 'gifter'

interface Id {
  _id: string
}

interface Banner {
  title: string
  img: string
  url: string
}

export interface BannerWithId extends Banner {
  id: string
}

interface QueryDateRange {
  start: number
  end: number
}

interface SocialNetwork {
  title: string
  url: string
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
  id: SortType
}

interface MissingJiko {
  name?: string
  img?: string
  img_alt?: string
  member_id: string
  room_id: number
  url: string
}

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

interface ImageViewerOptions {
  src: string
  alt: string
}

// Module declarations
declare module 'vue-virtual-scroller'
declare module 'cors'
declare module 'vue-twitter-timeline'
declare module 'hls.js/dist/hls.min.js'
declare module 'vue-gtag-next'
declare module 'horoscope'
declare module 'vue-dndrop'
declare module 'vue-virtual-sortable';

declare let Hls: any
declare let Plyr: any

interface Window {
  hls: any
}
