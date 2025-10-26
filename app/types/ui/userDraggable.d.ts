declare namespace UserDraggable {
  interface SNS {
    icon: string
    url: string
  }

  interface User {
    id: string
    name: string
    image: string
    description: string
    avatar_url?: string
    sns_list?: SNS[]
    type: 'showroom' | 'idn'
  }

  interface IDNUserApi {
    data: {
      getPublicProfile: {
        uuid: string
        username: string
        name: string
        avatar: string
        bio_description: string
        following_count: number
        follower_count: number
        is_follow: false
      }
    }
  }
}
