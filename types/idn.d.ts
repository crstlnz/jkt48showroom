declare namespace IDN {
  interface User {
    id: string
    name: string
    username: string
    avatar?: string
    avatar_url?: string
    color_code?: string
  }

  interface Comment {
    user: User
    chat: {
      pinned: boolean
      message: string
    }
    time: Date
  }

  interface PinnedMessage {
    pinned_message: string
    user: User
  }
}
