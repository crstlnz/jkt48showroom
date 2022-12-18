interface IsLiveSR {
  ok: number;
}

///////////////ONLIVES////////////////////////

interface OnlivesSR {
  corner_image_path: string;
  onlives: OnliveGenre[];
  bcsvr_port: number;
  bcsvr_host: string;
}

interface OnliveGenre {
  genre_id: number;
  banners: any[];
  has_upcoming: boolean;
  genre_name: string;
  lives: OnliveLive[];
}

interface OnliveLive {
  room_url_key: string;
  official_lv: number;
  follower_num: number;
  started_at: number;
  live_id: number;
  image_square: string;
  is_follow: boolean;
  streaming_url_list: StreamingUrlList[];
  live_type: number;
  tags: string[];
  image: string;
  view_num: number;
  genre_id: number;
  main_name: string;
  premium_room_type: number;
  cell_type: number;
  label: string;
  bcsvr_key: string;
  room_id: number;
  telop: string;
  is_karaoke?: boolean;
}

interface StreamingUrlList {
  is_default: boolean;
  url: string;
  label: string;
  id: number;
  type: string;
  quality: number;
}

///////////////////////////////////////

interface NextLiveSR {
  epoch: number | null;
  text: string;
}

///////////////////////////////////////
interface BannerList {
  url: string;
  image: string;
}

interface PushSendStatus {
  fan_room: boolean;
  on_live: boolean;
}

interface User {
  name: string;
  image: string;
}

interface RecommendCommentList {
  created_at: number;
  comment: string;
  user: User;
}

interface SnsList {
  icon: string;
  url: string;
  name: string;
}

interface Party {}

interface EcConfig {
  sales_available: number;
  is_external_ec: number;
  links: any[];
}

interface ProfileSR {
  prev_league_id?: any;
  image_list: any[];
  banner_list: BannerList[];
  is_talk_online: boolean;
  award_list?: any;
  push_send_status: PushSendStatus;
  performer_name: string;
  follower_num: number;
  live_continuous_days: number;
  next_league_id?: any;
  live_id: number;
  league_id: number;
  is_official: boolean;
  is_follow: boolean;
  voice_list: any[];
  show_rank_subdivided: string;
  event?: any;
  is_birthday: boolean;
  description: string;
  live_tags: any[];
  genre_id: number;
  prev_score: number;
  youtube_id: string;
  visit_count: number;
  recommend_comment_list: RecommendCommentList[];
  current_live_started_at: number;
  next_show_rank_subdivided: string;
  share_text_live: string;
  sns_list: SnsList[];
  recommend_comments_url: string;
  share_url: string;
  room_url_key: string;
  league_label: string;
  is_live_tag_campaign_opened: boolean;
  avatar?: any;
  share_url_live: string;
  prev_show_rank_subdivided: string;
  is_talk_opened: boolean;
  image_square: string;
  recommend_comment_post_url: string;
  genre_name: string;
  room_name: string;
  birthday: number;
  room_level: number;
  party_live_status: number;
  party: Party;
  ec_config: EcConfig;
  image: string;
  recommend_comment_open_status: number;
  main_name: string;
  view_num: number;
  has_more_recommend_comment: boolean;
  is_party_enabled: boolean;
  premium_room_type: number;
  next_score: number;
  is_onlive: boolean;
  room_id: number;
}
