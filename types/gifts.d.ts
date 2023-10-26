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
}
