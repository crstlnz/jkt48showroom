declare namespace JKT48V {
  interface YoutubeThumbnail {
    url: string
    width: number
    height: number
  }

  interface LiveResults {
    channelTitle: string
    channelId: string
    title: string
    description: string
    thumbnails: {
      default: YoutubeThumbnail
      medium: YoutubeThumbnail
      high: YoutubeThumbnail
    }
    url: string
    etag: string
  }
}
