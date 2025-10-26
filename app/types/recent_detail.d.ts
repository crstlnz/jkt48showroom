interface IFansGift {
  name: string
  id: number
  avatar: string
  avatar_id: number
  total: number
  gifts: Database.IGifts[]
}

interface IFansCompact {
  id: number
  name: string
  avatar_id: number
}

interface IStageFans {
  id: number
  name: string
  avatar: string
}

interface IUIStageFans {
  id: number
  name: string
  avatar: string
  isCurrentUser: boolean
}

interface IStageList {
  date: string
  list: number[]
}

interface IScreenshotData {
  folder: string
  format: string
  list: number[]
}

interface ILiveDate {
  start: string
  end: string
}
