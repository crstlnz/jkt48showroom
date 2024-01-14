declare namespace JKT48 {
  interface Member {
    id: string
    name: string
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
    graduationIds: string[]
    date: Date
    team: {
      id: string
      img: string
    }
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
