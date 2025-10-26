// UI related types

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

interface IMemberProfileAPI extends Database.IMemberBasicData {
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
  jikosokai: string
  is_graduate: boolean
  is_group: boolean
  socials: SocialNetwork[]
  profile_video?: string
  generation?: string
  birthdate?: Date
  bloodType?: string
  height?: string
  recentTheater?: ITheaterAPI[]
  upcomingTheater?: ITheaterAPI[]
  sousenkyo?: SousenkyoMember
}

interface SousenkyoMember {
  name: string
  id: string
  url: string
  data?: SousenkyoMemberDetail | null
}

interface SousenkyoMemberDetail {
  id: number
  name: string
  img: string
  dob: string
  nickname: string
  url_video: string
  tagline: string
  bg: string
  mobileBg: string
  tag: string
  mTag: string
  nameImg: string
  count: number
  darkTheme: boolean
  ja: SousenkyoMemberDetailJa
}

interface SousenkyoMemberDetailJa {
  name: string
  dob: string
  nickname: string
  tagline: string
}

interface IDNLivesDetail extends Partial<INowLive> {
  is_live: boolean
  member_info?: {
    name?: string
    img?: string
    room_id?: number
    key?: string
  }
  sousenkyo?: SousenkyoMember
}

interface IStageListApi {
  stage_list: Database.IStage[]
  users: Database.IFansCompact[]
}
