// Showroom competition related types

interface CompetitionEvent {
  event_name: string
  event_type: string
  show_ranking: number
  started_at: number
  ended_at: number
  image: string
  event_url: string
}

interface CompetitionRoom {
  room_id: number
  image: string
  image_square: string
  image_alt?: string
  name: string
  nickname?: string
  slug?: string
  key?: string
}

interface CompetitionLiveStats {
  live_count: number
  active_days: number
  total_gift: number
  total_comments: number
  total_duration: number
  avg_duration: number
  avg_gift_per_live: number
  avg_comments_per_live: number
  avg_viewer_peak: number
  max_viewer_peak: number
  total_viewer_peak: number
  point_per_live: number
  point_per_hour: number
  first_live_at: string | Date | null
  last_live_at: string | Date | null
}

interface CompetitionTopFan {
  user_id: string
  name: string
  avatar_url: string
  point: number
  gold: number
  visit_count: number
  total_comments: number
  contribution_rank: number
  c_gift: number
}

interface CompetitionRankingDetail {
  rank: number
  point: number
  gap_above: number | null
  gap_below: number | null
  trend?: {
    rank_diff: number | null
    point_diff: number | null
  }
  room: CompetitionRoom
  live: CompetitionLiveStats
}

type CompetitionRanking = CompetitionRankingDetail

interface CompetitionSummary {
  ranked_members: number
  active_members: number
  total_points: number
  total_lives: number
  total_gift: number
  total_comments: number
  total_duration: number
  total_active_days: number
  total_viewer_peak: number
  max_viewer_peak: number
  avg_points_per_live: number
  avg_gift_per_live: number
  avg_comments_per_live: number
  avg_duration_per_live: number
  avg_peak_viewers: number
  total_live_hours: number
  active_ratio: number
  last_updated: string
}

interface CompetitionSnapshot {
  snapshot_hour: string | Date | null
  scraped_at: string | Date | null
  comparison_snapshot_hour?: string | Date | null
}

interface CompetitionDetailResponse {
  event: CompetitionEvent
  summary: CompetitionSummary
  date: string
  snapshot?: CompetitionSnapshot | null
  rankings: CompetitionRankingDetail[]
}

type ShowroomCompetitionAPI = CompetitionDetailResponse
