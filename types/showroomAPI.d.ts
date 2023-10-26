declare namespace ShowroomAPI {
  export interface CurrentUser {
    live_rank: number
    avatar_id: number
    gift_use_flg1: boolean
    next_level_point: number
    locale: string
    gift_list: UserGiftList
    next_fan_level: number
    is_confirm_gifting_use_gold: boolean
    add_free_gift: number
    badge_type: number
    gold: number
    is_login: boolean
    badge: number
    fan_level: number
    twitter_auth: boolean
    is_tutorial: boolean
    name: string
    own_room_url_key: any
    avatar_url: string
    current_level_point: number
    account_id: string
    image: string
    contribution_point: number
    user_id: number
  }

  export interface UserGiftList {
    enquete: any[]
    normal: UserFreeGift[]
  }

  export interface UserFreeGift {
    gift_id: number
    free_num: number
  }

  interface Follow {
    next_page: number | null
    rooms: RoomFollow[]
    previous_page: number | null
    total_entries: number
    last_page: number
    first_page: number
    current_page: number
  }

  interface Ranking {
    avatar_id: number
    avatar_url: string
    name: string
    point: number
    order: number
    visit_count: number
    user_id: number
    rank: number
  }
  interface SummaryRanking {
    ranking: Ranking[]
  }

  interface RoomFollow {
    is_official: boolean | 1 | 0
    image_l: string
    room_description: string
    room_url_key: string
    next_live: string
    image_m: string
    has_next_live: boolean | 1 | 0 | null
    is_online: boolean | 1 | 0
    room_id: string
    room_name: string
    open_fan_club: boolean | 1 | 0 | null
  }

  interface FollowOnlives {
    rooms: RoomFollow[]
  }

  interface FollowSchedules {
    rooms: RoomFollow[]
  }

  interface Onlives {
    corner_image_path: string
    onlives: GenreOnlives[]
    bcsrv_port: number
    bcsrv_host: string
  }

  interface GenreOnlives {
    genre_id: number
    banners: string[]
    has_upcoming: boolean
    genre_name: string
    lives: OnlivesRoom[]
  }

  interface OnlivesRoom {
    room_url_key: string
    official_lv: boolean | 1 | 0
    telop: string
    follower_num: number
    started_at: number
    live_id: number
    is_follow: false
    streaming_url_list: StreamingURL[]
    live_type: number
    tags: any[]
    image: string
    view_num: number
    genre_id: number
    main_name: string
    premium_room_type: number
    cell_type: number
    label: string
    bcsvr_key: string
    room_id: number
  }

  interface NextLive {
    epoch: number | null
    text: string
  }

  interface IsLive {
    ok: 1 | 0 | boolean
  }

  interface LiveInfo {
    room_id: number
    banner_image_url?: string
    banner_destination_url?: string
    enquete_gift_num: number
    is_enquete: boolean
    is_recording_prohibited: boolean
    live_id: number
    is_enquete_result: boolean
    room_name: string
    background_image_url: string
    age_verification_status: number
    video_type: number
    live_type: number
    is_free_gift_only: boolean
    premium_room_type: number
    live_status: number
    bcsvr_host: string
    bcsvr_key: string
    bcsvr_port: number
  }

  interface RoomStatus {
    did_send_live_bad_report: boolean
    is_enquete: boolean
    room_url_key: string
    is_owner: boolean
    share: {
      twitter: {
        text: string
        url: string
      }
    }
    can_comment: boolean
    started_at: number
    is_live: boolean
    live_id: number
    room_name: string
    background_image_url: string
    broadcast_key: string
    is_official: boolean
    video_type: number
    broadcast_port: number
    image_s: string
    live_type: number
    broadcast_host: string
    live_user_key: string
    genre_id: number
    is_fav: boolean
    youtube_id: string
    live_status: number
    room_id: number
    nsta_owner: boolean
  }

  interface Polling {
    active_fan: {
      can_boostable: true
      user: {
        before_level: number
        title_id: number
        current_level: number
      }
      room: {
        total_user_count: number
        fan_name: string
      }
    }
    is_login: boolean
    online_user_num: number
  }

  interface PollingLiveEnd {
    live_end: boolean | 1 | 0
    invalid: boolean | 1 | 0
  }

  interface Gift {
    icon: boolean | 1 | 0
    is_hidden: boolean
    order_no: number
    gift_type: number
    image: string
    gift_id: number
    image2: string
    free: boolean
    point: number
    is_delete_from_stage: boolean
    gift_name: string
    scale: number
    label: boolean | 1 | 0
    dialog_id: number
  }

  interface GiftLogItem {
    ua: number
    avatar_id: number
    aft: number
    num: number
    avatar_url: string
    name: string
    image: string
    gift_id: number
    created_at: number
    image2: string
    user_id: number
  }

  interface StreamingUrlList {
    streaming_url_list: StreamingURL[]
  }

  interface StreamingURL {
    is_default: boolean
    url: string
    type: string
    id: number
    label: string
    quality: number
  }

  interface Profile {
    prev_league_id?: any
    image_list: any[]
    banner_list: BannerList[]
    is_talk_online: boolean
    award_list?: any
    push_send_status: PushSendStatus
    performer_name: string
    follower_num: number
    live_continuous_days: number
    next_league_id?: any
    live_id: number
    league_id: number
    is_official: boolean
    is_follow: boolean
    voice_list: any[]
    show_rank_subdivided: string
    event?: any
    is_birthday: boolean
    description: string
    live_tags: any[]
    genre_id: number
    prev_score: number
    youtube_id: string
    visit_count: number
    recommend_comment_list: RecommendCommentList[]
    current_live_started_at: number
    next_show_rank_subdivided: string
    share_text_live: string
    sns_list: SnsList[]
    recommend_comments_url: string
    share_url: string
    room_url_key: string
    league_label: string
    is_live_tag_campaign_opened: boolean
    avatar?: any
    share_url_live: string
    prev_show_rank_subdivided: string
    is_talk_opened: boolean
    image_square: string
    recommend_comment_post_url: string
    genre_name: string
    room_name: string
    birthday: number
    room_level: number
    party_live_status: number
    party: Party
    ec_config: EcConfig
    image: string
    recommend_comment_open_status: number
    main_name: string
    view_num: number
    has_more_recommend_comment: boolean
    is_party_enabled: boolean
    premium_room_type: number
    next_score: number
    is_onlive: boolean
    room_id: number
  }

  interface UserSNS {
    icon: string
    url: string
  }

  interface UserProfile {
    sns_list: UserSNS[]
    avatar_id: number
    room_profile: RoomProfile
    active_fan_title_id: number
    is_blocked_post: boolean
    fan_level: number
    active_fan_level: number
    is_ng_nick_name: boolean
    name: string
    avatar_url: string
    description: string
    image: string
    account_id: string
    is_sms_authenticated: boolean
    can_report: boolean
    has_reported: boolean
  }
}
