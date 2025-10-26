// Gift related types

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

interface IHomeData {
  data: IShowroomStats
  recents: IRecent[]
}