declare namespace Live {
  interface Comments {
    num: number
    users: number
  }

  interface Screenshots {
    folder: string
    format: string
    list: number[]
  }

  interface Viewers {
    active: number
    peak: number
    last: number
  }

  interface RecordDate {
    from: Date
    to: Date
  }

  interface DiscordMessage {
    channelId: string
    messageId: string
  }
}
