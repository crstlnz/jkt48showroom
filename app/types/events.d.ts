// Events and theater related types

interface IApiTheaterInfo {
  id: string
  title: string
  poster?: string
  banner?: string
  member_count: number
  seitansai?: JKT48MemberExtend[]
  url: string
  date: Date
}

interface IApiTheater {
  theater: IApiTheaterInfo[]
  page: number
  perpage: number
  total_count: number
}

interface IApiJKT48Event {
  events: IApiJKT48EventInfo[]
  page: number
  perpage: number
  total_count: number
}

interface IApiJKT48EventInfo {
  id: string
  title: string
  poster?: string
  banner?: string
  member_count: number
  url: string
  date: Date
}

interface IApiEvent {
  theater: {
    upcoming: IApiTheaterInfo[]
    recent: IApiTheaterInfo[]
  }
  other_schedule: JKT48.Schedule[]
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
  showroomTheater?: ShowroomPremiumLive
  idnTheater?: JKT48.IDNPremiumLive
  date: Date
  team: {
    id: string
    img: string
  }
}

interface IApiJKT48EventDetail {
  id: string
  title: string
  url: string
  event?: JKT48.EventDetail
  members: JKT48MemberExtend[]
  showroomTheater?: ShowroomPremiumLive
  idnTheater?: JKT48.IDNPremiumLive
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

interface IApiSchedule {
  schedules: JKT48.Schedule[]
  page: number
  perpage: number
  total_count: number
}
