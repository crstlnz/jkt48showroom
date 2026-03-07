<script lang="ts" setup>
interface CompetitionRoom {
  room_id: number
  image: string
  image_square: string
  image_alt: string
  name: string
  nickname: string
  slug?: string
}

interface CompetitionRanking {
  rank: number
  point: number
  gap_above: number | null
  gap_below: number | null
  trend?: {
    rank_diff: number | null
    point_diff: number | null
  }
  room: CompetitionRoom
  live: {
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
}

interface Event {
  event_name: string
  event_type: string
  show_ranking: number
  started_at: number
  ended_at: number
  image: string
  event_url: string
}

interface ShowroomCompetitionAPI {
  event: Event
  summary?: {
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
  date: string
  rankings: CompetitionRanking[]
}

const { data, pending, error } = useShowroomCompetitionDetail<ShowroomCompetitionAPI>()

const sortedRanking = computed(() => {
  return [...(data.value?.rankings ?? [])]
    .sort((a, b) => a.rank - b.rank)
})

const topThreeRanking = computed(() => sortedRanking.value.slice(0, 3))
</script>

<template>
  <div class="bg-container space-y-3 rounded-2xl p-3 md:p-4">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <span class="inline-flex size-8 items-center justify-center rounded-xl bg-yellow-500/15 text-yellow-500">
          <Icon name="hugeicons:ranking" class="size-4.5" />
        </span>
        <div class="min-w-0">
          <h2 class="truncate text-base font-bold md:text-lg">
            {{ $t('competition.title_full') }}
          </h2>
          <p class="text-[11px] opacity-60 md:text-xs">
            Top 3
          </p>
        </div>
      </div>
      <NuxtLink
        to="/jkt48showroom_competition"
        class="rounded-lg border border-color-2 px-2.5 py-1 text-xs font-semibold opacity-80 transition hover:opacity-100"
      >
        {{ $t('more') }}
      </NuxtLink>
    </div>

    <div v-if="pending && !data" class="grid grid-cols-3 gap-2">
      <div
        v-for="num in 3"
        :key="num"
        class="bg-container-2 border border-color-2 rounded-xl p-3"
      >
        <div class="flex animate-pulse flex-col items-center gap-2">
          <div class="pulse-color size-14 rounded-full" />
          <div class="pulse-color h-3 w-4/5 rounded-[3px]" />
          <div class="pulse-color h-3 w-2/3 rounded-[3px]" />
        </div>
      </div>
    </div>

    <div v-else-if="error" class="flex flex-col items-center py-2">
      <Image :src="`${$imgCDN}/assets/svg/web/error.svg`" sizes="320px" fit="fill" class="w-45 max-w-[80%]" />
      {{ $t("error.unknown") }}
    </div>

    <div v-else-if="!topThreeRanking.length" class="flex flex-col items-center py-2">
      <Image :src="`${$imgCDN}/assets/img/web/empty-box.png`" alt="" class="w-45 h-34 mb-2 object-contain" />
      {{ $t("data.nodata") }}
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-2">
      <HomeJKT48ShowroomCompetitionTopCard
        v-for="entry in topThreeRanking"
        :key="`top-${entry.room.room_id}-${entry.rank}`"
        :entry="entry"
      />
    </div>
  </div>
</template>
