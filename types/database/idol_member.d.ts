type GroupType = 'jkt48' | 'hinatazaka46' | 'official' | 'others'

interface SocialNetwork {
  title: string
  url: string
}

interface IdolMember {
  name: string
  info: {
    img: string
    description?: string
    nicknames?: string[]
    kanji?: string
    is_graduate?: boolean
    socials?: SocialNetwork[]
    birthdate?: Date
    height?: string
    jikosokai?: string
    generation?: string
    blood_type?: string
    banner?: string
    graduation_info?: {
      announcement_date?: Date
      last_show?: string
      date: Date
    }
  }
  group: GroupType
  idn?: {
    id?: string
    username?: string
  }
  jkt48id?: string[]
  showroom_id?: number
  stage48: string
  live_data?: {
    missing: {
      showroom: number
      idn: number
    }
  }
  slug: string
}
