declare namespace API {

  interface Status {
    code: number
    message: string
  }

  interface ILiveInfo {
    duration: number
    comments?: Database.IComments
    screenshot?: Database.IScreenshot
    background_image?: string
    stage_list: IStage[]
    viewers: {
      num: number
      active: number
      is_excitement: boolean
    }
    date: {
      start: string
      end: string
    }
    gift: {
      log: {
        total: number
        user_id: number
        gifts: {
          id: number
          num: number
          date: string
        }[]
      }[]
      next_page: boolean
      list: Database.GiftData[]
    }
  }

  interface IRecentDetail {
    data_id: string
    live_id?: number
    room_info: Database.IMemberBasicData
    live_info: API.ILiveInfo
    jpn_rate?: number
    room_id: number
    total_point: number
    users: IFansCompact[]
    created_at: string
    fans: IStatFans[]
  }

  interface YoutubeThumbnail {
    url: string
    width: number
    height: number
  }
  interface Statistics {
    viewCount: string
    likeCount: string
    favoriteCount: string
    commentCount: string
  }

  interface JKT48Video {
    id: string
    profilePict: {
      default: YoutubeThumbnail
      medium: YoutubeThumbnail
      high: YoutubeThumbnail
    }
    channelTitle: string
    channelId: string
    channelUrl: string
    title: string
    description: string
    thumbnails: {
      default: YoutubeThumbnail
      medium: YoutubeThumbnail
      high: YoutubeThumbnail
    }
    url: string
    etag: string
    date: string
    statistics?: Statistics
  }
}
