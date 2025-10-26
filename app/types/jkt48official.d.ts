declare namespace JKT48 {
  interface Member {
    id: string
    name: string
    url?: string
  }

  interface MemberWithNickname {
    id: string
    name: string
    nicknames?: string[]
    url?: string
  }

  interface Schedule {
    id: string
    label: string
    title: string
    url: string
    date: Date | string
  }

  interface Theater {
    id: string
    title: string
    url: string
    setlistId: string
    memberIds: string[]
    seitansaiIds: string[]
    graduationIds?: string[]
    date: Date
    team: {
      id: string
      img: string
    }
    showroomTheater?: ShowroomPremiumLiveWithPrice
    idnTheater?: IDNPremiumLive
  }

  interface Event {
    id: string
    title: string
    url: string
    eventId: string
    memberIds?: string[]
    seitansaiIds?: string[]
    graduationIds?: string[]
    date: Date
    team: {
      id: string
      img: string
    }
    showroomTheater?: ShowroomPremiumLiveWithPrice
    idnTheater?: IDNPremiumLive
  }

  interface EventDetail {
    id: string
    title: string
    title_alt?: string
    description?: string
    poster?: string
    banner?: string
    gallery?: string[]
  }

  interface ShowroomPremiumLive {
    entrance_url: string
    room_url: string
    image: string
    premium_live_type: number
    is_onlive?: boolean
    title: string
    paid_live_id: number
    room_id: number
    room_name: string
    start_at: number
  }

  interface ShowroomPremiumLiveWithPrice extends ShowroomPremiumLive {
    price: number
  }

  interface IDNPremiumLive {
    title: string
    slug: string
    image: string
    start_at: number
    username: string
    uuid: string
    price: number
  }

  interface TheaterDetail {
    id: string
    title: string
    url: string
    setlistId: string
    members: Member[]
    seitansai: Member[]
    date: Date
    team: {
      id: string
      img: string
    }
    showroomTheater?: ShowroomPremiumLiveWithPrice
    idnTheater?: IDNPremiumLive
  }

  interface Song {
    id: string
    title: string
    title_jp?: string
    title_kanji?: string
    lyrics: string
  }

  interface News {
    id: string
    title: string
    label?: string
    url: string
    date: Date
    content?: string
  }

  interface Setlist {
    id: string
    title: string
    title_alt?: string
    description?: string
    poster?: string
    banner?: string
    gallery?: string[]
    songs?: Song[]
  }
}
