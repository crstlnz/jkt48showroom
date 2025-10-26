interface RecentGift {
  num: number
  name: string
  id: string | number
  free: boolean
  point: number
  img: string
  date: string
}

interface RecentUserGifts {
  name: string
  id: string | number
  avatar: string
  total: number
  gifts: RecentGift[]
}
